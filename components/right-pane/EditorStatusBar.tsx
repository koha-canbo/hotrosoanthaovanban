"use client";

import React, { useEffect, useState } from "react";

interface EditorStatusBarProps {
  editor?: any;
}

export default function EditorStatusBar({ editor }: EditorStatusBarProps) {
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    pages: 1,
    cursorLine: 1,
    cursorCol: 1,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const update = () => {
      if (!editor || editor.isDestroyed) return;
      const text = editor.state.doc.textContent || "";
      const words = text
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0).length;
      const characters = text.length;
      // Rough page estimate: ~250 words per page for Times New Roman 14pt
      const pages = Math.max(1, Math.ceil(words / 250));

      // Cursor position
      const { from } = editor.state.selection;
      const resolved = editor.state.doc.resolve(from);
      // Count line by iterating block nodes before cursor
      let lineCount = 0;
      editor.state.doc.nodesBetween(0, from, (node: any) => {
        if (node.isBlock) lineCount++;
      });
      const cursorLine = Math.max(1, lineCount);
      const cursorCol = resolved.parentOffset + 1;

      setStats({ words, characters, pages, cursorLine, cursorCol });
    };

    update();
    editor.on("update", update);
    editor.on("selectionUpdate", update);

    return () => {
      if (editor && !editor.isDestroyed) {
        editor.off("update", update);
        editor.off("selectionUpdate", update);
      }
    };
  }, [editor]);

  return (
    <div className="editor-status-bar">
      <div className="status-bar-group">
        <span className="status-bar-item">
          <span className="status-bar-label">Từ:</span>
          <span className="status-bar-value">{stats.words.toLocaleString()}</span>
        </span>
        <span className="status-bar-divider">|</span>
        <span className="status-bar-item">
          <span className="status-bar-label">Ký tự:</span>
          <span className="status-bar-value">{stats.characters.toLocaleString()}</span>
        </span>
        <span className="status-bar-divider">|</span>
        <span className="status-bar-item">
          <span className="status-bar-label">Trang:</span>
          <span className="status-bar-value">~{stats.pages}</span>
        </span>
      </div>
      <div className="status-bar-group">
        <span className="status-bar-item">
          <span className="status-bar-label">Dòng</span>
          <span className="status-bar-value">{stats.cursorLine}</span>
          <span className="status-bar-label">, Cột</span>
          <span className="status-bar-value">{stats.cursorCol}</span>
        </span>
      </div>
    </div>
  );
}
