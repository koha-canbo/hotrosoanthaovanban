# Decree 30 Document Generator

Ứng dụng tự động soạn thảo văn bản hành chính theo chuẩn **Nghị định 30/2020/NĐ-CP**, tích hợp AI NotebookLM.

## Screenshot

Split-pane layout: Left = Command Center | Right = A4 Editor Canvas

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4, TipTap |
| Backend | Python, FastAPI |
| AI | Google NotebookLM via [notebooklm-py](https://github.com/teng-lin/notebooklm-py) |
| Export | html-to-docx (frontend-side DOCX generation) |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- A Google account authenticated with NotebookLM

### 1. Frontend (Next.js)

```bash
cd decree30-app
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

### 2. Backend (FastAPI)

**Option A: Using the batch script (Windows)**

```bash
cd decree30-app/backend
start_api.bat
```

**Option B: Manual setup**

```bash
cd decree30-app/backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: **http://localhost:8000**

### 3. NotebookLM Authentication (First Time Only)

```bash
cd decree30-app/backend
venv\Scripts\activate
notebooklm login              # Opens browser for Google sign-in
notebooklm auth check --test  # Verify: expect "status": "ok"
```

---

## Features

### Left Pane — Command Center
- 📂 **File Upload**: Drag & drop PDF/TXT/DOCX as reference sources
- 📋 **Document Type**: Select from 6 types (Công văn, Tờ trình, Quyết định, Báo cáo, Thông báo, Kế hoạch)
- ✍️ **Prompt**: Describe what document you need
- 📊 **Status Stream**: Real-time processing log

### Right Pane — A4 Canvas
- 📄 **WYSIWYG Editor**: TipTap-powered rich text editor
- 🏛️ **Decree 30 Styling**: Times New Roman, 14pt, 1.5 spacing, proper margins
- 📝 **Template Pre-fill**: Standard headers auto-loaded per document type
- ✏️ **Fully Editable**: Click and edit any part of the generated document
- 📥 **Export to DOCX**: One-click Word export with formatting preserved

### Theme
- 🌙 Dark / ☀️ Light mode toggle

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |
| POST | `/api/upload` | Upload reference file to NotebookLM |
| POST | `/api/generate` | Generate Decree 30 document via AI |

### POST /api/generate

```json
{
  "prompt": "Viết công văn xin cấp thêm ngân sách...",
  "document_type": "cong_van",
  "notebook_id": "optional-notebook-id"
}
```

Response:
```json
{
  "generated_text": "Thực hiện theo chỉ đạo...",
  "notebook_id": "abc123"
}
```

---

## Document Types

| ID | Vietnamese | Number Prefix |
|----|-----------|---------------|
| `cong_van` | Công văn | CV |
| `to_trinh` | Tờ trình | TTr |
| `quyet_dinh` | Quyết định | QĐ |
| `bao_cao` | Báo cáo | BC |
| `thong_bao` | Thông báo | TB |
| `ke_hoach` | Kế hoạch | KH |

---

## Decree 30 Formatting Standards

Per Nghị định 30/2020/NĐ-CP:

- **Font**: Times New Roman
- **Size**: 13-14pt
- **Line Spacing**: 1.5
- **Margins**: Top 20mm, Bottom 20mm, Left 30mm, Right 20mm
- **Header**: Two-column (Agency name | National emblem + motto)

---

## Demo Mode

If the backend is not running, the app operates in **demo mode** — generating placeholder Vietnamese administrative text to showcase the UI and template system. Connect the backend for real AI-powered generation.
