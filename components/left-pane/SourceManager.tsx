"use client";

import React, { useState, useCallback } from "react";
import { Globe, FileText, Type, X, Plus, Link2, ChevronDown, ChevronUp } from "lucide-react";

export interface SourceItem {
  id: string;
  type: "file" | "text" | "url";
  name: string;
  preview: string;
}

interface SourceManagerProps {
  sources: SourceItem[];
  onAddText: (text: string, title: string) => Promise<void>;
  onAddUrl: (url: string) => Promise<void>;
  onRemoveSource: (id: string) => void;
  disabled?: boolean;
}

export default function SourceManager({
  sources,
  onAddText,
  onAddUrl,
  onRemoveSource,
  disabled,
}: SourceManagerProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleAddText = useCallback(async () => {
    if (!textValue.trim()) return;
    setIsAdding(true);
    try {
      await onAddText(textValue.trim(), textTitle.trim() || `Văn bản ${sources.length + 1}`);
      setTextValue("");
      setTextTitle("");
      setShowTextInput(false);
    } finally {
      setIsAdding(false);
    }
  }, [textValue, textTitle, sources.length, onAddText]);

  const handleAddUrl = useCallback(async () => {
    if (!urlValue.trim()) return;
    setIsAdding(true);
    try {
      await onAddUrl(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    } finally {
      setIsAdding(false);
    }
  }, [urlValue, onAddUrl]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "url": return <Globe size={12} />;
      case "text": return <Type size={12} />;
      default: return <FileText size={12} />;
    }
  };

  return (
    <div>
      <button
        className="section-title"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: 0,
          width: "100%",
          textAlign: "left",
          color: "var(--text-tertiary)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "8px",
        }}
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        Nguồn tham khảo ({sources.length})
      </button>

      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Add source buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn-secondary"
              onClick={() => { setShowTextInput(!showTextInput); setShowUrlInput(false); }}
              disabled={disabled || isAdding}
              style={{ flex: 1, fontSize: "12px", padding: "6px 10px" }}
            >
              <Type size={12} />
              Thêm văn bản
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setShowUrlInput(!showUrlInput); setShowTextInput(false); }}
              disabled={disabled || isAdding}
              style={{ flex: 1, fontSize: "12px", padding: "6px 10px" }}
            >
              <Link2 size={12} />
              Thêm URL
            </button>
          </div>

          {/* Text input form */}
          {showTextInput && (
            <div className="glass-card" style={{ padding: "12px" }}>
              <input
                type="text"
                className="form-select"
                placeholder="Tiêu đề (tùy chọn)"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                disabled={isAdding}
                style={{ marginBottom: "8px", fontSize: "13px" }}
              />
              <textarea
                className="form-textarea"
                placeholder="Dán nội dung văn bản tham khảo vào đây...&#10;&#10;VD: Nội dung luật, nghị định, báo cáo, số liệu thống kê..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                disabled={isAdding}
                rows={4}
                style={{ fontSize: "13px", minHeight: "80px" }}
              />
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <button
                  className="btn-primary"
                  onClick={handleAddText}
                  disabled={isAdding || !textValue.trim()}
                  style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                >
                  {isAdding ? (
                    <>
                      <div className="spinner" style={{ width: 12, height: 12 }} />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      Cho ăn văn bản
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => { setShowTextInput(false); setTextValue(""); setTextTitle(""); }}
                  style={{ padding: "8px 12px", fontSize: "12px" }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* URL input form */}
          {showUrlInput && (
            <div className="glass-card" style={{ padding: "12px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="url"
                  className="form-select"
                  placeholder="https://..."
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  disabled={isAdding}
                  style={{ flex: 1, fontSize: "13px" }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                />
                <button
                  className="btn-primary"
                  onClick={handleAddUrl}
                  disabled={isAdding || !urlValue.trim()}
                  style={{ padding: "8px 12px", fontSize: "12px" }}
                >
                  {isAdding ? (
                    <div className="spinner" style={{ width: 12, height: 12 }} />
                  ) : (
                    <Plus size={12} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Source list */}
          {sources.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="file-tag"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    width: "100%",
                  }}
                  title={source.preview || source.name}
                >
                  {getSourceIcon(source.type)}
                  <span
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {source.name}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                    }}
                  >
                    {source.type}
                  </span>
                  <button
                    onClick={() => onRemoveSource(source.id)}
                    title="Xóa nguồn"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-tertiary)",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {sources.length === 0 && !showTextInput && !showUrlInput && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
                textAlign: "center",
                margin: "4px 0",
                fontStyle: "italic",
              }}
            >
              Chưa có nguồn. Thêm văn bản, URL, hoặc tải file để AI tham khảo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
