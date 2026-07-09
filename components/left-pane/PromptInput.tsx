"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export default function PromptInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
  disabled,
}: PromptInputProps) {
  return (
    <div>
      <label className="form-label" htmlFor="prompt-input">
        Yêu cầu soạn thảo
      </label>
      <textarea
        id="prompt-input"
        className="form-textarea"
        placeholder="VD: Viết công văn xin cấp thêm ngân sách mua 50 máy tính cho phòng Công nghệ thông tin, trình bày lý do cấp bách và dự toán chi phí..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isGenerating}
        rows={5}
      />
      <button
        className="btn-primary"
        onClick={onGenerate}
        disabled={disabled || isGenerating || !value.trim()}
        style={{ width: "100%", marginTop: "10px", padding: "12px 20px" }}
      >
        {isGenerating ? (
          <>
            <div className="spinner" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Tạo văn bản
          </>
        )}
      </button>
    </div>
  );
}
