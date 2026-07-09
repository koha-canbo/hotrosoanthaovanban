import os
import shutil
import uuid
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

# Import notebooklm-py
from notebooklm.client import NotebookLMClient

# Import prompts
from prompts import build_generation_prompt, build_refinement_prompt, EXTRACTION_PROMPT
import re

def clean_ai_html_output(text: str) -> str:
    """
    Strip markdown backticks, conversational preamble, and enforce
    mandatory term replacements that the AI may ignore from prompts.
    """
    text = text.strip()

    # 1. Strip markdown code blocks (```html ... ```)
    match = re.search(r"```(?:html)?\s*(.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
    if match:
        text = match.group(1).strip()
    else:
        # Strip conversational text before/after the HTML
        start_idx = text.find("<")
        end_idx = text.rfind(">")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            text = text[start_idx:end_idx+1].strip()

    # 2. FORCE replace forbidden terms — normal case globally
    replacements = [
        (r"[Cc]ông an huyện\s*[^<;,\.\)\"]*", "Công an tỉnh Đắk Lắk"),
        (r"CÔNG AN HUYỆN\s*[^<;,\.\)\"]*", "Công an tỉnh Đắk Lắk"),
        (r"[Cc]ông an cấp trên(?:\s+chủ quản)?", "Công an tỉnh Đắk Lắk"),
        (r"CÔNG AN CẤP TRÊN(?:\s+CHỦ QUẢN)?", "Công an tỉnh Đắk Lắk"),
        (r"CÔNG AN TỈNH ĐẮK LẮK", "Công an tỉnh Đắk Lắk"),
        (r"[Cc]ơ quan chủ quản", "Công an tỉnh Đắk Lắk"),
        (r"[Cc]ông an viên", "Cán bộ"),
        (r"CÔNG AN VIÊN", "CÁN BỘ"),
        (r"công an viên", "cán bộ"),
        (r"\s*\[\d+\]", ""),
    ]

    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)

    # 3. FORCE 1.27cm indent + justify on <p> tags OUTSIDE tables
    # Extract table blocks first, process <p> tags, then reassemble
    table_blocks = []
    TABLE_PH = "___TABLE_BLOCK___"

    def stash_table(m):
        block = m.group(0)
        # Capitalize "Công an tỉnh Đắk Lắk" ONLY in the very first table
        if len(table_blocks) == 0:
            block = re.sub(r"Công an tỉnh Đắk Lắk", "CÔNG AN TỈNH ĐẮK LẮK", block, flags=re.IGNORECASE)
        table_blocks.append(block)
        return TABLE_PH

    text = re.sub(r"<table[\s\S]*?</table>", stash_table, text, flags=re.IGNORECASE)

    def add_indent_justify(m):
        tag = m.group(0)
        indent_justify = "text-indent:1.27cm;text-align:justify;"
        if "text-indent" in tag:
            if "text-align" not in tag and 'style="' in tag:
                return tag.replace('style="', 'style="text-align:justify;')
            return tag
        if 'style="' in tag:
            if "text-align" in tag:
                return tag.replace('style="', 'style="text-indent:1.27cm;')
            return tag.replace('style="', f'style="{indent_justify}')
        if "style='" in tag:
            if "text-align" in tag:
                return tag.replace("style='", "style='text-indent:1.27cm;")
            return tag.replace("style='", f"style='{indent_justify}")
        if tag == "<p>":
            return f'<p style="{indent_justify}">'
        return tag.replace("<p", f'<p style="{indent_justify}"', 1)

    text = re.sub(r"<p(?:\s[^>]*)?>", add_indent_justify, text)

    # Restore table blocks (untouched)
    for block in table_blocks:
        text = text.replace(TABLE_PH, block, 1)

    return text

app = FastAPI(
    title="Decree 30 Document Generator API",
    description="API sinh văn bản hành chính theo Nghị định 30/2020/NĐ-CP, tích hợp Google NotebookLM.",
    version="3.0.0",
)

# CORS - allow frontend at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Session State ─────────────────────────────────────────────────────────────

class SessionState:
    """In-memory session state for active notebook and conversation."""
    def __init__(self):
        self.notebook_id: Optional[str] = None
        self.conversation_id: Optional[str] = None
        self.sources: List[dict] = []  # Track added sources [{id, type, name, preview}]

    async def ensure_notebook(self, client) -> str:
        """Create or return the active notebook."""
        if not self.notebook_id:
            notebook_name = f"Decree30-{uuid.uuid4().hex[:8]}"
            nb = await client.notebooks.create(notebook_name)
            self.notebook_id = nb.id
        return self.notebook_id

    def add_source(self, source_id: str, source_type: str, name: str, preview: str = ""):
        self.sources.append({
            "id": source_id,
            "type": source_type,
            "name": name,
            "preview": preview[:200] if preview else "",
        })

    def reset(self):
        self.notebook_id = None
        self.conversation_id = None
        self.sources = []


session = SessionState()


# ─── Models ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    message: str
    filename: str
    notebook_id: str
    source_id: str


class AddTextRequest(BaseModel):
    text: str
    title: Optional[str] = None


class AddTextResponse(BaseModel):
    message: str
    source_id: str
    notebook_id: str
    title: str


class AddUrlRequest(BaseModel):
    url: str


class AddUrlResponse(BaseModel):
    message: str
    source_id: str
    notebook_id: str
    url: str


class SourceInfo(BaseModel):
    id: str
    type: str
    name: str
    preview: str


class SourceListResponse(BaseModel):
    notebook_id: Optional[str]
    sources: List[SourceInfo]


class GenerateRequest(BaseModel):
    prompt: str
    document_type: str
    notebook_id: Optional[str] = None


class GenerateResponse(BaseModel):
    generated_text: str
    notebook_id: str
    conversation_id: Optional[str] = None


class RefineRequest(BaseModel):
    instruction: str
    current_text: str
    document_type: str
    notebook_id: Optional[str] = None
    conversation_id: Optional[str] = None


class RefineResponse(BaseModel):
    refined_text: str
    notebook_id: str
    conversation_id: Optional[str] = None


class ResetResponse(BaseModel):
    message: str


# ─── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Decree30 API",
        "notebook_id": session.notebook_id,
        "sources_count": len(session.sources),
    }


# ─── Upload File Endpoint ─────────────────────────────────────────────────────

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a reference file (PDF, TXT, DOCX) to NotebookLM.
    Creates a new notebook if none exists, or reuses the active one.
    """
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        async with await NotebookLMClient.from_storage() as client:
            nb_id = await session.ensure_notebook(client)

            print(f"Uploading {file.filename} to notebook {nb_id}...")
            source = await client.sources.add_file(nb_id, file_path, wait=True)
            source_id = getattr(source, 'id', str(source))

            session.add_source(source_id, "file", file.filename)

            return UploadResponse(
                message=f"File '{file.filename}' uploaded successfully",
                filename=file.filename,
                notebook_id=nb_id,
                source_id=source_id,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)


# ─── Add Text Source ───────────────────────────────────────────────────────────

@app.post("/api/add-text", response_model=AddTextResponse)
async def add_text_source(request: AddTextRequest):
    """
    Feed raw text as a source to NotebookLM (like pasting text into NotebookLM).
    The text is saved as a temporary .txt file and uploaded.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    title = request.title or f"Text-{uuid.uuid4().hex[:6]}"
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, f"{title}.txt")

    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(request.text)

        async with await NotebookLMClient.from_storage() as client:
            nb_id = await session.ensure_notebook(client)

            print(f"Adding text source '{title}' to notebook {nb_id}...")
            source = await client.sources.add_file(nb_id, file_path, wait=True)
            source_id = getattr(source, 'id', str(source))

            preview = request.text[:200].replace("\n", " ")
            session.add_source(source_id, "text", title, preview)

            return AddTextResponse(
                message=f"Text source '{title}' added successfully",
                source_id=source_id,
                notebook_id=nb_id,
                title=title,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)


# ─── Add URL Source ────────────────────────────────────────────────────────────

@app.post("/api/add-url", response_model=AddUrlResponse)
async def add_url_source(request: AddUrlRequest):
    """
    Add a URL as a source to NotebookLM (webpage, article, etc.).
    """
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    try:
        async with await NotebookLMClient.from_storage() as client:
            nb_id = await session.ensure_notebook(client)

            print(f"Adding URL source '{request.url}' to notebook {nb_id}...")
            source = await client.sources.add_url(nb_id, request.url, wait=True)
            source_id = getattr(source, 'id', str(source))

            session.add_source(source_id, "url", request.url, request.url)

            return AddUrlResponse(
                message=f"URL source added successfully",
                source_id=source_id,
                notebook_id=nb_id,
                url=request.url,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── List Sources ─────────────────────────────────────────────────────────────

@app.get("/api/sources", response_model=SourceListResponse)
async def list_sources():
    """List all sources that have been added to the current notebook."""
    return SourceListResponse(
        notebook_id=session.notebook_id,
        sources=[SourceInfo(**s) for s in session.sources],
    )


# ─── Generate Document ────────────────────────────────────────────────────────

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_document(request: GenerateRequest):
    """
    Generate a Decree 30 compliant document using NotebookLM.
    
    Flow:
    1. If sources were uploaded, first extract key data (Stage 1).
    2. Use extracted data + user prompt to generate the document body (Stage 2).
    """
    nb_id = request.notebook_id or session.notebook_id

    try:
        async with await NotebookLMClient.from_storage() as client:
            if not nb_id:
                nb_id = await session.ensure_notebook(client)

            stage1_data = ""
            conv_id = None

            # Stage 1: Extract data from sources (if any were uploaded)
            if len(session.sources) > 0:
                try:
                    print("Running Stage 1: Data extraction from sources...")
                    stage1_result = await client.chat.ask(nb_id, EXTRACTION_PROMPT)
                    stage1_data = stage1_result.answer
                    conv_id = stage1_result.conversation_id
                    print(f"Stage 1 complete. Extracted {len(stage1_data)} chars.")
                except Exception as e:
                    print(f"Stage 1 skipped (error): {e}")

            # Stage 2: Generate document body
            print("Running Stage 2: Document generation...")
            generation_prompt = build_generation_prompt(
                user_prompt=request.prompt,
                document_type=request.document_type,
                stage1_data=stage1_data,
            )

            if conv_id:
                stage2_result = await client.chat.ask(
                    nb_id, generation_prompt, conversation_id=conv_id,
                )
            else:
                stage2_result = await client.chat.ask(nb_id, generation_prompt)

            generated_text = clean_ai_html_output(stage2_result.answer)
            session.conversation_id = stage2_result.conversation_id
            print(f"Stage 2 complete. Generated {len(generated_text)} chars.")

            return GenerateResponse(
                generated_text=generated_text,
                notebook_id=nb_id,
                conversation_id=stage2_result.conversation_id,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Refine Document (Chat-based) ─────────────────────────────────────────────

@app.post("/api/refine", response_model=RefineResponse)
async def refine_document(request: RefineRequest):
    """
    Refine/improve the generated document with a follow-up instruction.
    This maintains conversation context with NotebookLM for iterative improvement,
    similar to how you'd chat with NotebookLM to polish a result.
    
    Examples:
    - "Thêm phần về dự toán ngân sách"
    - "Chỉnh lại đoạn mở đầu cho trang trọng hơn"
    - "Bổ sung căn cứ pháp lý Luật Ngân sách 2015"
    - "Rút gọn phần II, chỉ giữ ý chính"
    """
    nb_id = request.notebook_id or session.notebook_id
    conv_id = request.conversation_id or session.conversation_id

    try:
        async with await NotebookLMClient.from_storage() as client:
            if not nb_id:
                nb_id = await session.ensure_notebook(client)

            refinement_prompt = build_refinement_prompt(
                instruction=request.instruction,
                current_text=request.current_text,
                document_type=request.document_type,
            )

            print(f"Refining document: '{request.instruction[:80]}...'")

            if conv_id:
                result = await client.chat.ask(
                    nb_id, refinement_prompt, conversation_id=conv_id,
                )
            else:
                result = await client.chat.ask(nb_id, refinement_prompt)

            session.conversation_id = result.conversation_id
            refined_text = clean_ai_html_output(result.answer)

            return RefineResponse(
                refined_text=refined_text,
                notebook_id=nb_id,
                conversation_id=result.conversation_id,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Reset Session ─────────────────────────────────────────────────────────────

@app.post("/api/reset", response_model=ResetResponse)
async def reset_session():
    """Reset the current session (clears notebook, sources, and conversation)."""
    session.reset()
    return ResetResponse(message="Session reset successfully")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
