"use client";

import React from "react";
import { FileDown } from "lucide-react";
import { exportToDocx } from "@/lib/export-docx";

interface ExportButtonProps {
  getHtml: () => string;
  disabled?: boolean;
  filename?: string;
}

export default function ExportButton({ getHtml, disabled, filename }: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const html = getHtml();
      if (!html || html.trim().length < 20) {
        alert("Nội dung trống. Vui lòng tạo hoặc nhập nội dung trước khi xuất.");
        return;
      }
      await exportToDocx(html, filename);
    } catch (err) {
      console.error("Export error:", err);
      alert("Lỗi khi xuất file. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="btn-secondary"
      onClick={handleExport}
      disabled={disabled || isExporting}
      title="Xuất ra file Word (.docx)"
    >
      {isExporting ? (
        <>
          <div className="spinner" style={{ width: 14, height: 14, borderColor: "var(--text-tertiary)", borderTopColor: "var(--accent-primary)" }} />
          Đang xuất...
        </>
      ) : (
        <>
          <FileDown size={14} />
          Xuất DOCX
        </>
      )}
    </button>
  );
}
