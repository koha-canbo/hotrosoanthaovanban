"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Wand2 } from "lucide-react";

interface RefineChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface RefineChatProps {
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  messages: RefineChatMessage[];
  disabled?: boolean;
  hasContent: boolean; // Whether the editor has content to refine
}

export type { RefineChatMessage };

export default function RefineChat({
  onRefine,
  isRefining,
  messages,
  disabled,
  hasContent,
}: RefineChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isRefining || disabled) return;
    const instruction = input.trim();
    setInput("");
    await onRefine(instruction);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!hasContent) return null;

  const quickActions = [
    "Chỉnh văn phong trang trọng hơn",
    "Thêm căn cứ pháp lý",
    "Rút gọn nội dung",
    "Bổ sung dự toán kinh phí",
  ];

  return (
    <div>
      <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Wand2 size={11} />
        Hoàn thiện văn bản
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div
          style={{
            maxHeight: "120px",
            overflowY: "auto",
            marginBottom: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                lineHeight: "1.4",
                background:
                  msg.role === "user"
                    ? "var(--accent-primary-light)"
                    : "var(--bg-tertiary)",
                color: "var(--text-primary)",
                borderLeft:
                  msg.role === "user"
                    ? "3px solid var(--accent-primary)"
                    : "3px solid var(--success)",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-tertiary)",
                  display: "block",
                  marginBottom: "2px",
                }}
              >
                {msg.role === "user" ? "Yêu cầu" : "AI đã cập nhật"}
                {" • "}
                {msg.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick actions */}
      {messages.length === 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            marginBottom: "8px",
          }}
        >
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => {
                setInput(action);
                inputRef.current?.focus();
              }}
              disabled={disabled || isRefining}
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-primary)";
                e.currentTarget.style.color = "var(--accent-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-primary)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
        <textarea
          ref={inputRef}
          className="form-textarea"
          placeholder="VD: Thêm phần về ngân sách, chỉnh lại đoạn mở đầu..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isRefining}
          rows={2}
          style={{
            flex: 1,
            minHeight: "40px",
            maxHeight: "80px",
            fontSize: "13px",
            resize: "none",
          }}
        />
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={disabled || isRefining || !input.trim()}
          style={{
            padding: "10px",
            minWidth: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
          }}
          title="Gửi yêu cầu chỉnh sửa"
        >
          {isRefining ? (
            <div className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
