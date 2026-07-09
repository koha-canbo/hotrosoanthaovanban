"use client";

import React from "react";
import { DOCUMENT_TYPES } from "@/lib/decree30-templates";

interface DocumentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function DocumentTypeSelect({
  value,
  onChange,
  disabled,
}: DocumentTypeSelectProps) {
  return (
    <div>
      <label className="form-label" htmlFor="doc-type-select">
        Loại văn bản
      </label>
      <select
        id="doc-type-select"
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">— Chọn loại văn bản —</option>
        {DOCUMENT_TYPES.map((dt) => (
          <option key={dt.id} value={dt.id}>
            {dt.labelVi}
          </option>
        ))}
      </select>
    </div>
  );
}
