/**
 * API client helpers for communicating with the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadResponse {
  message: string;
  filename: string;
  notebook_id: string;
  source_id: string;
}

export interface AddTextRequest {
  text: string;
  title?: string;
}

export interface AddTextResponse {
  message: string;
  source_id: string;
  notebook_id: string;
  title: string;
}

export interface AddUrlRequest {
  url: string;
}

export interface AddUrlResponse {
  message: string;
  source_id: string;
  notebook_id: string;
  url: string;
}

export interface SourceInfo {
  id: string;
  type: string;  // "file" | "text" | "url"
  name: string;
  preview: string;
}

export interface SourceListResponse {
  notebook_id: string | null;
  sources: SourceInfo[];
}

export interface GenerateRequest {
  prompt: string;
  document_type: string;
  notebook_id?: string;
}

export interface GenerateResponse {
  generated_text: string;
  notebook_id: string;
  conversation_id?: string;
}

export interface RefineRequest {
  instruction: string;
  current_text: string;
  document_type: string;
  notebook_id?: string;
  conversation_id?: string;
}

export interface RefineResponse {
  refined_text: string;
  notebook_id: string;
  conversation_id?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Upload a file to the backend, which pushes it to NotebookLM.
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Upload failed");
  }

  return res.json();
}

/**
 * Add raw text as a source to NotebookLM (cho ăn văn bản).
 */
export async function addTextSource(data: AddTextRequest): Promise<AddTextResponse> {
  const res = await fetch(`${API_BASE}/api/add-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Add text failed");
  }

  return res.json();
}

/**
 * Add a URL as a source to NotebookLM.
 */
export async function addUrlSource(data: AddUrlRequest): Promise<AddUrlResponse> {
  const res = await fetch(`${API_BASE}/api/add-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Add URL failed");
  }

  return res.json();
}

/**
 * List all sources in the current notebook.
 */
export async function listSources(): Promise<SourceListResponse> {
  const res = await fetch(`${API_BASE}/api/sources`, { method: "GET" });

  if (!res.ok) {
    throw new Error("Failed to list sources");
  }

  return res.json();
}

/**
 * Generate a document via the backend AI pipeline.
 */
export async function generateDocument(
  data: GenerateRequest
): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Generation failed");
  }

  return res.json();
}

/**
 * Refine/improve an existing document with a follow-up instruction.
 * This is the "cho ăn văn bản" iterative refinement feature.
 */
export async function refineDocument(
  data: RefineRequest
): Promise<RefineResponse> {
  const res = await fetch(`${API_BASE}/api/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || "Refinement failed");
  }

  return res.json();
}

/**
 * Reset the current session.
 */
export async function resetSession(): Promise<void> {
  await fetch(`${API_BASE}/api/reset`, { method: "POST" });
}

/**
 * Health check for the backend.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
