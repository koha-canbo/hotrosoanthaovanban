"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface PageLayoutConfig {
  orientation: "portrait" | "landscape";
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

interface PageLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PageLayoutConfig;
  onSave: (newConfig: PageLayoutConfig) => void;
}

export default function PageLayoutModal({
  isOpen,
  onClose,
  config,
  onSave,
}: PageLayoutModalProps) {
  const [localConfig, setLocalConfig] = useState<PageLayoutConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl w-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">
            Thiết lập bố cục trang
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Orientation */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              Hướng giấy (Khổ A4)
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orientation"
                  value="portrait"
                  checked={localConfig.orientation === "portrait"}
                  onChange={() =>
                    setLocalConfig({ ...localConfig, orientation: "portrait" })
                  }
                  className="accent-[var(--accent-primary)]"
                />
                <span className="text-sm text-[var(--text-primary)]">Khổ dọc</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orientation"
                  value="landscape"
                  checked={localConfig.orientation === "landscape"}
                  onChange={() =>
                    setLocalConfig({ ...localConfig, orientation: "landscape" })
                  }
                  className="accent-[var(--accent-primary)]"
                />
                <span className="text-sm text-[var(--text-primary)]">Khổ ngang</span>
              </label>
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              Căn lề (mm)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--text-tertiary)]">Lề trên</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localConfig.marginTop}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      marginTop: parseInt(e.target.value) || 0,
                    })
                  }
                  className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--text-tertiary)]">Lề dưới</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localConfig.marginBottom}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      marginBottom: parseInt(e.target.value) || 0,
                    })
                  }
                  className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--text-tertiary)]">Lề trái</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localConfig.marginLeft}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      marginLeft: parseInt(e.target.value) || 0,
                    })
                  }
                  className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--text-tertiary)]">Lề phải</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localConfig.marginRight}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      marginRight: parseInt(e.target.value) || 0,
                    })
                  }
                  className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-[var(--text-tertiary)] italic">
              * Theo Nghị định 30: Trái 30mm, Phải 20mm, Trên 20mm, Dưới 20mm.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-medium bg-[var(--accent-primary)] text-white rounded hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
