"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

/* ── Google "G" Logo (official colors) ─────────────────────────────── */
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

/* ── Animated background particles ─────────────────────────────────── */
function FloatingParticles() {
  return (
    <div className="login-particles" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`login-particle login-particle-${i + 1}`} />
      ))}
    </div>
  );
}

/* ── Login Page Component ──────────────────────────────────────────── */
export default function LoginPage() {
  const { signInWithGoogle, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <FloatingParticles />

      {/* Theme toggle */}
      <button
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label="Chuyển đổi giao diện"
        title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      >
        {theme === "dark" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Main card */}
      <div className="login-card">
        {/* Brand header */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#loginGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="loginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1 className="login-title">Soạn Thảo Văn Bản</h1>
          <p className="login-subtitle">
            Hỗ trợ soạn thảo văn bản hành chính theo chuẩn Nghị định 30/2020/NĐ-CP, tích hợp AI thông minh.
          </p>
        </div>

        {/* Divider */}
        <div className="login-divider" />

        {/* Sign-in area */}
        <div className="login-actions">
          <button
            className="login-google-btn"
            onClick={handleSignIn}
            disabled={isSigningIn}
            id="google-sign-in-button"
          >
            {isSigningIn ? (
              <div className="login-spinner" />
            ) : (
              <GoogleLogo />
            )}
            <span>{isSigningIn ? "Đang đăng nhập..." : "Đăng nhập bằng Google"}</span>
          </button>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <p className="login-hint">
            Sử dụng tài khoản Google để truy cập ứng dụng
          </p>
        </div>

        {/* Features preview */}
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
              </svg>
            </div>
            <span>Soạn thảo theo mẫu chuẩn</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span>AI hỗ trợ thông minh</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span>Xuất file DOCX</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="login-footer">
        © {new Date().getFullYear()} Phần mềm hỗ trợ soạn thảo văn bản
      </p>
    </div>
  );
}
