"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, FileUp } from "lucide-react";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".docx", ".doc"];

export default function FileUpload({
  files,
  onFilesChange,
  disabled,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const validFiles = Array.from(newFiles).filter(
        (f) =>
          ACCEPTED_TYPES.includes(f.type) ||
          ACCEPTED_EXTENSIONS.some((ext) =>
            f.name.toLowerCase().endsWith(ext)
          )
      );
      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const handleRemove = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  return (
    <div>
      <div className="section-title">Tài liệu tham khảo</div>

      <div
        className={`upload-zone ${isDragOver ? "dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.docx,.doc"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
          disabled={disabled}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isDragOver ? (
            <FileUp
              size={28}
              style={{ color: "var(--accent-primary)" }}
            />
          ) : (
            <Upload size={28} style={{ color: "var(--text-tertiary)" }} />
          )}
          <p
            style={{
              fontSize: "13px",
              color: isDragOver
                ? "var(--accent-primary)"
                : "var(--text-secondary)",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {isDragOver
              ? "Thả file vào đây"
              : "Kéo thả hoặc nhấp để tải lên"}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              margin: 0,
            }}
          >
            PDF, TXT, DOCX — tối đa 20MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginTop: "10px",
          }}
        >
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="file-tag">
              <FileText size={12} />
              <span style={{ maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </span>
              <button onClick={(e) => { e.stopPropagation(); handleRemove(i); }} title="Xóa">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
