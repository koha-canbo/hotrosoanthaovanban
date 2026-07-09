"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ExportButton from "./ExportButton";
import PrintButton from "./PrintButton";
import EditorToolbar from "./EditorToolbar";
import EditorStatusBar from "./EditorStatusBar";
import FindReplace from "./FindReplace";
import { GlowHeroDemo } from "../GlowHeroDemo";
import type { A4EditorHandle } from "./A4Editor";

import Ruler from "./Ruler";
import PageLayoutModal, { PageLayoutConfig } from "./PageLayoutModal";

// Dynamic import to avoid SSR issues with TipTap
const A4Editor = dynamic(() => import("./A4Editor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "297mm",
        color: "var(--text-tertiary)",
      }}
    >
      Đang tải trình soạn thảo...
    </div>
  ),
});

interface RightPaneProps {
  editorContent: string;
  exportFilename?: string;
}

const DEFAULT_LAYOUT: PageLayoutConfig = {
  orientation: "portrait",
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 30,
  marginRight: 20,
};

export default function RightPane({ editorContent, exportFilename }: RightPaneProps) {
  const editorRef = useRef<A4EditorHandle>(null);
  const [editor, setEditor] = useState<any>(null);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<PageLayoutConfig>(DEFAULT_LAYOUT);

  const getHtml = useCallback(() => {
    return editorRef.current?.getHTML() || "";
  }, []);

  // Global keyboard shortcut for Find & Replace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
      if (e.key === "Escape") {
        if (findReplaceOpen) setFindReplaceOpen(false);
        if (layoutModalOpen) setLayoutModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [findReplaceOpen, layoutModalOpen]);

  // Derived styles based on layout config
  const isLandscape = layoutConfig.orientation === "landscape";
  const paperWidth = isLandscape ? "297mm" : "210mm";
  const paperMinHeight = isLandscape ? "210mm" : "297mm";
  const padding = `${layoutConfig.marginTop}mm ${layoutConfig.marginRight}mm ${layoutConfig.marginBottom}mm ${layoutConfig.marginLeft}mm`;

  return (
    <div className="right-pane">
      {/* Ribbon Toolbar */}
      <div className="right-pane-toolbar">
        <EditorToolbar
          editor={editor}
          onFindReplace={() => setFindReplaceOpen(true)}
          onPageLayout={() => setLayoutModalOpen(true)}
        />
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <PrintButton />
          <ExportButton getHtml={getHtml} filename={exportFilename} />
        </div>
      </div>

      {/* Find & Replace Panel */}
      <FindReplace
        editor={editor}
        isOpen={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
      />
      
      {/* Page Layout Modal */}
      <PageLayoutModal
        isOpen={layoutModalOpen}
        onClose={() => setLayoutModalOpen(false)}
        config={layoutConfig}
        onSave={setLayoutConfig}
      />

      {/* A4 Canvas or Glow Hero Demo */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-10 flex justify-center items-start print:p-0 print:block">
        {!editorContent ? (
          <div className="w-full h-full flex items-center justify-center">
            <GlowHeroDemo />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="a4-container" style={{ width: paperWidth }}>
              <Ruler config={layoutConfig} />
              <div 
                className="a4-paper" 
                style={{ 
                  width: paperWidth, 
                  minHeight: paperMinHeight, 
                  padding: padding 
                }}
              >
                <A4Editor ref={editorRef} initialContent={editorContent} onEditorReady={setEditor} />
              </div>
            </div>
            {/* Status Bar - below A4 paper */}
            <EditorStatusBar editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
