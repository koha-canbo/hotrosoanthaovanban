"use client";

import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import FileUpload from "./FileUpload";
import DocumentTypeSelect from "./DocumentTypeSelect";
import PromptInput from "./PromptInput";
import StatusStream, { type StatusMessage } from "./StatusStream";
import SourceManager, { type SourceItem } from "./SourceManager";
import RefineChat, { type RefineChatMessage } from "./RefineChat";
import { ThemeToggle } from "@/components/ui/curtain-theme-toggle";
import { FileCode2, RotateCcw } from "lucide-react";

interface LeftPaneProps {
  // File upload
  files: File[];
  onFilesChange: (files: File[]) => void;
  // Source manager
  sources: SourceItem[];
  onAddText: (text: string, title: string) => Promise<void>;
  onAddUrl: (url: string) => Promise<void>;
  onRemoveSource: (id: string) => void;
  // Document type
  documentType: string;
  onDocumentTypeChange: (value: string) => void;
  // Prompt
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  // Refinement
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  refineMessages: RefineChatMessage[];
  hasEditorContent: boolean;
  // Status
  statusMessages: StatusMessage[];
  // Backend status
  backendConnected: boolean;
  // Reset
  onReset: () => void;
}

export default function LeftPane({
  files,
  onFilesChange,
  sources,
  onAddText,
  onAddUrl,
  onRemoveSource,
  documentType,
  onDocumentTypeChange,
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  onRefine,
  isRefining,
  refineMessages,
  hasEditorContent,
  statusMessages,
  backendConnected,
  onReset,
}: LeftPaneProps) {


  return (
    <div className="left-pane">
      {/* Header */}
      <div className="left-pane-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <FileCode2 size={18} />
          </div>
          <div>
            <div className="app-logo-text">Decree 30</div>
            <div className="app-logo-sub">Soạn thảo văn bản HC</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Backend status indicator */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: backendConnected ? "var(--success)" : "var(--error)",
              boxShadow: backendConnected
                ? "0 0 6px var(--success)"
                : "0 0 6px var(--error)",
            }}
            title={backendConnected ? "Backend đang kết nối" : "Backend chưa kết nối"}
          />
          {/* Reset button */}
          <button
            className="theme-toggle"
            onClick={onReset}
            title="Đặt lại phiên làm việc"
            style={{ width: 30, height: 30 }}
          >
            <RotateCcw size={13} />
          </button>
          {/* Theme toggle (Curtain) */}
          <div style={{ position: "relative", width: 30, height: 30 }}>
            <ThemeToggle variant="icon" buttonSize={30} duration={600} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="left-pane-content">
        {/* Section 1: Sources */}
        <FileUpload
          files={files}
          onFilesChange={onFilesChange}
          disabled={isGenerating || isRefining}
        />

        <SourceManager
          sources={sources}
          onAddText={onAddText}
          onAddUrl={onAddUrl}
          onRemoveSource={onRemoveSource}
          disabled={isGenerating || isRefining}
        />

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-primary)", margin: "4px 0" }} />

        {/* Section 2: Generation */}
        <DocumentTypeSelect
          value={documentType}
          onChange={onDocumentTypeChange}
          disabled={isGenerating || isRefining}
        />

        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          disabled={!documentType}
        />

        {/* Section 3: Refinement Chat */}
        <RefineChat
          onRefine={onRefine}
          isRefining={isRefining}
          messages={refineMessages}
          disabled={isGenerating}
          hasContent={hasEditorContent}
        />

        {/* Status log */}
        <StatusStream messages={statusMessages} />
      </div>
    </div>
  );
}
