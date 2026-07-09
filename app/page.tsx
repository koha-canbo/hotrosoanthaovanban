"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import LeftPane from "@/components/left-pane/LeftPane";
import RightPane from "@/components/right-pane/RightPane";
import LoginPage from "@/components/LoginPage";
import { useAuth } from "@/components/AuthProvider";
import { type StatusMessage } from "@/components/left-pane/StatusStream";
import { type SourceItem } from "@/components/left-pane/SourceManager";
import { type RefineChatMessage } from "@/components/left-pane/RefineChat";
import { DOCUMENT_TYPES } from "@/lib/decree30-templates";
import { cleanGeneratedHtml } from "@/lib/html-cleanup";
import {
  uploadFile,
  generateDocument,
  refineDocument,
  addTextSource,
  addUrlSource,
  resetSession,
  checkHealth,
} from "@/lib/api";

let statusIdCounter = 0;
function createStatus(text: string, type: StatusMessage["type"]): StatusMessage {
  return {
    id: `status-${++statusIdCounter}`,
    text,
    type,
    timestamp: new Date(),
  };
}

let refineIdCounter = 0;
function createRefineMsg(role: "user" | "assistant", text: string): RefineChatMessage {
  return {
    id: `refine-${++refineIdCounter}`,
    role,
    text,
    timestamp: new Date(),
  };
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth();

  // ─── State ──────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<File[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [refineMessages, setRefineMessages] = useState<RefineChatMessage[]>([]);
  const [editorContent, setEditorContent] = useState("");
  const [backendConnected, setBackendConnected] = useState(false);
  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const prevDocType = useRef("");

  // ─── Health Check ───────────────────────────────────────────────────────
  useEffect(() => {
    checkHealth().then(setBackendConnected);
    const interval = setInterval(() => {
      checkHealth().then(setBackendConnected);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Helpers ────────────────────────────────────────────────────────────
  const addStatus = useCallback((text: string, type: StatusMessage["type"]) => {
    setStatusMessages((prev) => [...prev, createStatus(text, type)]);
  }, []);

  // ─── Document Type Change → Load Template ──────────────────────────────
  const handleDocumentTypeChange = useCallback((value: string) => {
    setDocumentType(value);
    if (value && value !== prevDocType.current) {
      const docType = DOCUMENT_TYPES.find((dt) => dt.id === value);
      if (docType) {
        setEditorContent(docType.template);
        addStatus(`Đã tải mẫu: ${docType.labelVi}`, "done");
      }
    } else if (!value) {
      setEditorContent("");
    }
    prevDocType.current = value;
  }, [addStatus]);

  // ─── Source Management ──────────────────────────────────────────────────
  const handleAddText = useCallback(async (text: string, title: string) => {
    addStatus(`Đang thêm nguồn văn bản: "${title}"...`, "processing");
    try {
      const result = await addTextSource({ text, title });
      setSources((prev) => [
        ...prev,
        { id: result.source_id, type: "text", name: title, preview: text.slice(0, 200) },
      ]);
      setNotebookId(result.notebook_id);
      addStatus(`✓ Đã thêm nguồn: "${title}"`, "done");
    } catch (err) {
      addStatus(
        `✗ Lỗi thêm văn bản: ${err instanceof Error ? err.message : "Unknown"}`,
        "error"
      );
      // Demo mode fallback
      if (!backendConnected) {
        setSources((prev) => [
          ...prev,
          {
            id: `demo-text-${Date.now()}`,
            type: "text",
            name: title,
            preview: text.slice(0, 200),
          },
        ]);
        addStatus("⚠ Demo: Nguồn được lưu cục bộ (chưa gửi tới NotebookLM)", "done");
      }
    }
  }, [addStatus, backendConnected]);

  const handleAddUrl = useCallback(async (url: string) => {
    addStatus(`Đang thêm nguồn URL: ${url}...`, "processing");
    try {
      const result = await addUrlSource({ url });
      setSources((prev) => [
        ...prev,
        { id: result.source_id, type: "url", name: url, preview: url },
      ]);
      setNotebookId(result.notebook_id);
      addStatus(`✓ Đã thêm nguồn URL`, "done");
    } catch (err) {
      addStatus(
        `✗ Lỗi thêm URL: ${err instanceof Error ? err.message : "Unknown"}`,
        "error"
      );
      if (!backendConnected) {
        setSources((prev) => [
          ...prev,
          { id: `demo-url-${Date.now()}`, type: "url", name: url, preview: url },
        ]);
        addStatus("⚠ Demo: URL được lưu cục bộ", "done");
      }
    }
  }, [addStatus, backendConnected]);

  const handleRemoveSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ─── Upload Files ───────────────────────────────────────────────────────
  const handleUploadFiles = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.size > 0);
    if (pendingFiles.length === 0) return null;

    let lastNotebookId: string | null = null;

    for (const file of pendingFiles) {
      addStatus(`Đang tải lên: ${file.name}...`, "processing");
      try {
        const result = await uploadFile(file);
        lastNotebookId = result.notebook_id;
        setSources((prev) => [
          ...prev,
          {
            id: result.source_id,
            type: "file",
            name: file.name,
            preview: `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          },
        ]);
        addStatus(`✓ Đã tải lên: ${file.name}`, "done");
      } catch (err) {
        addStatus(
          `✗ Lỗi tải lên ${file.name}: ${err instanceof Error ? err.message : "Unknown"}`,
          "error"
        );
      }
    }

    return lastNotebookId;
  }, [files, addStatus]);

  // ─── Generate Document ──────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !documentType) return;

    setIsGenerating(true);
    setRefineMessages([]); // Clear previous refinement history
    addStatus("Bắt đầu quy trình tạo văn bản...", "processing");

    try {
      // Step 1: Upload files if any
      let currentNotebookId = notebookId;
      if (files.length > 0) {
        addStatus("Đang tải tài liệu tham khảo lên NotebookLM...", "processing");
        const uploadedNbId = await handleUploadFiles();
        if (uploadedNbId) {
          currentNotebookId = uploadedNbId;
          setNotebookId(uploadedNbId);
        }
      }

      // Step 2: Generate
      const sourceCount = sources.length + files.length;
      if (sourceCount > 0) {
        addStatus(`Đang phân tích ${sourceCount} nguồn tham khảo...`, "processing");
      }
      addStatus("NotebookLM đang soạn thảo văn bản...", "processing");

      const result = await generateDocument({
        prompt: prompt.trim(),
        document_type: documentType,
        notebook_id: currentNotebookId || undefined,
      });

      addStatus("✓ Đã nhận kết quả từ AI", "done");

      // Step 3: Clean AI output + Inject into template
      const cleanedText = cleanGeneratedHtml(result.generated_text);
      if (documentType === "custom") {
        setEditorContent(cleanedText);
      } else {
        const docType = DOCUMENT_TYPES.find((dt) => dt.id === documentType);
        if (docType) {
          let templateHtml = docType.template;
          const placeholders = [
            "[Nội dung công văn được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung tờ trình được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung báo cáo được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung thông báo được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung kế hoạch được tạo tự động sẽ xuất hiện ở đây]",
          ];
          for (const placeholder of placeholders) {
            templateHtml = templateHtml.replace(placeholder, cleanedText);
          }
          setEditorContent(templateHtml);
        }
      }

      if (result.notebook_id) setNotebookId(result.notebook_id);
      if (result.conversation_id) setConversationId(result.conversation_id);

      addStatus("✓ Văn bản đã được tạo thành công! Sử dụng 'Hoàn thiện văn bản' để chỉnh sửa.", "done");
    } catch (err) {
      addStatus(
        `✗ Lỗi: ${err instanceof Error ? err.message : "Không thể kết nối backend"}`,
        "error"
      );

      // Demo mode fallback
      if (!backendConnected) {
        addStatus("⚠ Chế độ demo: Hiển thị mẫu văn bản...", "processing");
        const docType = DOCUMENT_TYPES.find((dt) => dt.id === documentType);
        if (docType) {
          const demoContent = generateDemoContent(prompt, documentType, sources);
          let templateHtml = docType.template;
          const placeholders = [
            "[Nội dung công văn được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung tờ trình được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung báo cáo được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung thông báo được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung kế hoạch được tạo tự động sẽ xuất hiện ở đây]",
          ];
          for (const placeholder of placeholders) {
            templateHtml = templateHtml.replace(placeholder, demoContent);
          }
          setEditorContent(templateHtml);
          addStatus("✓ Đã tạo mẫu demo. Kết nối backend để dùng AI.", "done");
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, documentType, files, sources, notebookId, backendConnected, addStatus, handleUploadFiles]);

  // ─── Refine Document ────────────────────────────────────────────────────
  const handleRefine = useCallback(async (instruction: string) => {
    setIsRefining(true);
    setRefineMessages((prev) => [...prev, createRefineMsg("user", instruction)]);
    addStatus(`Đang chỉnh sửa: "${instruction.slice(0, 60)}..."`, "processing");

    try {
      const result = await refineDocument({
        instruction,
        current_text: editorContent,
        document_type: documentType,
        notebook_id: notebookId || undefined,
        conversation_id: conversationId || undefined,
      });

      // Clean AI output + Replace the body content in the template
      const cleanedRefined = cleanGeneratedHtml(result.refined_text);
      if (documentType === "custom") {
        setEditorContent(cleanedRefined);
      } else {
        const docType = DOCUMENT_TYPES.find((dt) => dt.id === documentType);
        if (docType) {
          let templateHtml = docType.template;
          const placeholders = [
            "[Nội dung công văn được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung tờ trình được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung báo cáo được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung thông báo được tạo tự động sẽ xuất hiện ở đây]",
            "[Nội dung kế hoạch được tạo tự động sẽ xuất hiện ở đây]",
          ];
          for (const placeholder of placeholders) {
            templateHtml = templateHtml.replace(placeholder, cleanedRefined);
          }
          setEditorContent(templateHtml);
        }
      }

      if (result.conversation_id) setConversationId(result.conversation_id);

      setRefineMessages((prev) => [
        ...prev,
        createRefineMsg("assistant", `Đã cập nhật văn bản theo yêu cầu: "${instruction}"`),
      ]);
      addStatus("✓ Văn bản đã được chỉnh sửa", "done");
    } catch (err) {
      addStatus(
        `✗ Lỗi chỉnh sửa: ${err instanceof Error ? err.message : "Unknown"}`,
        "error"
      );
      setRefineMessages((prev) => [
        ...prev,
        createRefineMsg("assistant", `Lỗi: ${err instanceof Error ? err.message : "Không thể chỉnh sửa"}`),
      ]);

      // Demo mode
      if (!backendConnected) {
        setRefineMessages((prev) => [
          ...prev,
          createRefineMsg("assistant", `[Demo] Đã ghi nhận yêu cầu. Kết nối backend để AI chỉnh sửa thực tế.`),
        ]);
      }
    } finally {
      setIsRefining(false);
    }
  }, [editorContent, documentType, notebookId, conversationId, backendConnected, addStatus]);

  // ─── Reset Session ──────────────────────────────────────────────────────
  const handleReset = useCallback(async () => {
    try {
      await resetSession();
    } catch {
      // Ignore backend errors on reset
    }
    setFiles([]);
    setSources([]);
    setDocumentType("");
    setPrompt("");
    setEditorContent("");
    setStatusMessages([]);
    setRefineMessages([]);
    setNotebookId(null);
    setConversationId(null);
    prevDocType.current = "";
    addStatus("Đã đặt lại phiên làm việc", "done");
  }, [addStatus]);

  const sourceName = sources.length > 0 ? sources[0].name.replace(/\.[^/.]+$/, "") : "van_ban";
  const exportFilename = `XuanLanh_${sourceName}.docx`;

  // ─── Auth Gate ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="login-loading">
        <div className="login-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <main className="split-layout">
      {/* User bar */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50 }}>
        <div className="user-bar">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="user-name">{user.displayName || user.email}</span>
          <button className="user-signout" onClick={signOut}>
            Đăng xuất
          </button>
        </div>
      </div>

      <LeftPane
        files={files}
        onFilesChange={setFiles}
        sources={sources}
        onAddText={handleAddText}
        onAddUrl={handleAddUrl}
        onRemoveSource={handleRemoveSource}
        documentType={documentType}
        onDocumentTypeChange={handleDocumentTypeChange}
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        onRefine={handleRefine}
        isRefining={isRefining}
        refineMessages={refineMessages}
        hasEditorContent={editorContent.length > 100}
        statusMessages={statusMessages}
        backendConnected={backendConnected}
        onReset={handleReset}
      />
      <RightPane editorContent={editorContent} exportFilename={exportFilename} />
    </main>
  );
}

/**
 * Generate demo content when backend is not available.
 */
function generateDemoContent(prompt: string, docType: string, sources: SourceItem[]): string {
  const typeLabels: Record<string, string> = {
    cong_van: "Công văn",
    to_trinh: "Tờ trình",
    quyet_dinh: "Quyết định",
    bao_cao: "Báo cáo",
    thong_bao: "Thông báo",
    ke_hoach: "Kế hoạch",
  };
  const label = typeLabels[docType] || "Văn bản";

  const sourceInfo = sources.length > 0
    ? `</p><p style="text-indent:1cm;">Dựa trên ${sources.length} nguồn tham khảo đã cung cấp (${sources.map(s => s.name).join(", ")}), `
    : `</p><p style="text-indent:1cm;">`;

  return `</p>
<p style="text-indent:1cm;">Thực hiện theo chỉ đạo của lãnh đạo cơ quan, trên cơ sở đề xuất của các phòng ban chức năng, căn cứ vào tình hình thực tế và yêu cầu công việc, chúng tôi kính trình ${label.toLowerCase()} với nội dung như sau:</p>
<p style="text-indent:1cm;">Về nội dung yêu cầu: <em>"${prompt}"</em>${sourceInfo}qua nghiên cứu, đánh giá toàn diện các yếu tố liên quan, nhận thấy việc triển khai nội dung trên là cần thiết và phù hợp với quy định hiện hành. Cụ thể:</p>
<p style="text-indent:1cm;">1. Về cơ sở pháp lý: Căn cứ các văn bản quy phạm pháp luật hiện hành, việc thực hiện hoàn toàn phù hợp với chức năng, nhiệm vụ được giao.</p>
<p style="text-indent:1cm;">2. Về tính cấp thiết: Xuất phát từ yêu cầu thực tiễn công việc, việc triển khai sớm sẽ đảm bảo tiến độ và chất lượng công tác.</p>
<p style="text-indent:1cm;">3. Về phương án thực hiện: Đề xuất phương án tối ưu, đảm bảo tiết kiệm ngân sách và hiệu quả cao nhất.</p>
<p style="text-indent:1cm;"><strong>[Đây là nội dung mẫu demo. Vui lòng kết nối FastAPI backend và NotebookLM để tạo nội dung thực tế bằng AI.]</strong></p>
<p style="text-indent:1cm;">Kính đề nghị lãnh đạo xem xét, phê duyệt.`;
}
