"use client";

import React, { useEffect, useRef } from "react";

export interface StatusMessage {
  id: string;
  text: string;
  type: "processing" | "done" | "error";
  timestamp: Date;
}

interface StatusStreamProps {
  messages: StatusMessage[];
}

export default function StatusStream({ messages }: StatusStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div>
      <div className="section-title">Nhật ký xử lý</div>
      <div className="status-stream" ref={containerRef}>
        {messages.map((msg) => (
          <div key={msg.id} className="status-line">
            <span className={`status-dot ${msg.type}`} />
            <span>
              <span style={{ color: "var(--text-tertiary)", marginRight: "6px" }}>
                {msg.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
