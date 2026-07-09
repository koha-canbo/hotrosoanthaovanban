"use client";

import React, { useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Palette,
  List,
  ListOrdered,
  Table as TableIcon,
  Trash2,
  Rows,
  Columns,
  Undo2,
  Redo2,
  Superscript,
  Subscript,
  RemoveFormatting,
  IndentIncrease,
  IndentDecrease,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Quote,
  Code2,
  TableCellsMerge,
  TableCellsSplit,
  ToggleRight,
  RowsIcon,
  ColumnsIcon,
  Search,
} from "lucide-react";

type TabId = "home" | "insert" | "table";

interface EditorToolbarProps {
  editor?: any;
  onFindReplace?: () => void;
  onPageLayout?: () => void;
}

export default function EditorToolbar({ editor, onFindReplace, onPageLayout }: EditorToolbarProps) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const handleUpdate = () => forceUpdate();
    editor.on("transaction", handleUpdate);

    return () => {
      if (editor && !editor.isDestroyed) {
        editor.off("transaction", handleUpdate);
      }
    };
  }, [editor]);

  // Auto-switch to table tab when cursor is inside a table
  React.useEffect(() => {
    if (!editor) return;
    const isInTable = editor.isActive("table");
    if (isInTable && activeTab !== "table") {
      // Don't force switch, but mark it available
    }
  }, [editor, activeTab]);

  if (!editor || editor.isDestroyed) {
    return <div className="editor-toolbar">Đang tải công cụ...</div>;
  }

  const isInTable = editor.isActive("table");

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = ev.target?.result as string;
          editor.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
    }
  };

  return (
    <div className="ribbon-toolbar">
      {/* Tab headers */}
      <div className="ribbon-tabs">
        <button
          className={`ribbon-tab ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
        >
          Trang chủ
        </button>
        <button
          className={`ribbon-tab ${activeTab === "insert" ? "active" : ""}`}
          onClick={() => setActiveTab("insert")}
        >
          Chèn
        </button>
        {isInTable && (
          <button
            className={`ribbon-tab ribbon-tab-context ${activeTab === "table" ? "active" : ""}`}
            onClick={() => setActiveTab("table")}
          >
            Bảng
          </button>
        )}

        {/* Right side: Undo/Redo + Search + Layout */}
        <div className="ribbon-right-actions">
          <button
            onClick={onPageLayout}
            className="btn-icon"
            title="Bố cục trang"
            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          >
            <RowsIcon size={14} />
          </button>
          <button
            onClick={onFindReplace}
            className="btn-icon"
            title="Tìm & Thay thế (Ctrl+F)"
            style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)" }}
          >
            <Search size={14} />
          </button>
          <div className="toolbar-divider" style={{ height: 16 }} />
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            className="btn-icon"
            disabled={!editor || typeof editor.can !== "function" || !editor.can().undo()}
            title="Hoàn tác (Ctrl+Z)"
            style={{ width: 28, height: 28 }}
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            className="btn-icon"
            disabled={!editor || typeof editor.can !== "function" || !editor.can().redo()}
            title="Làm lại (Ctrl+Y)"
            style={{ width: 28, height: 28 }}
          >
            <Redo2 size={13} />
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="ribbon-content">
        {activeTab === "home" && <HomeTab editor={editor} />}
        {activeTab === "insert" && <InsertTab editor={editor} onImageUpload={handleImageUpload} onInsertLink={handleInsertLink} />}
        {activeTab === "table" && isInTable && <TableTab editor={editor} />}
      </div>
    </div>
  );
}

/* ─── HOME TAB ─────────────────────────────────────────────────────── */
function HomeTab({ editor }: { editor: any }) {
  return (
    <div className="ribbon-groups">
      {/* Font Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-content">
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <select
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              className="toolbar-select"
              style={{ width: "130px", fontSize: "12px" }}
              value={editor.getAttributes("textStyle").fontFamily || ""}
            >
              <option value="">Font mặc định</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
            </select>

            <select
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              className="toolbar-select"
              style={{ width: "58px", fontSize: "12px" }}
              value={editor.getAttributes("textStyle").fontSize || ""}
            >
              <option value="">Cỡ</option>
              <option value="10px">10</option>
              <option value="11px">11</option>
              <option value="12px">12</option>
              <option value="13px">13</option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="20px">20</option>
              <option value="24px">24</option>
              <option value="28px">28</option>
              <option value="36px">36</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "1px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`btn-icon-sm ${editor.isActive("bold") ? "active" : ""}`} title="In đậm (Ctrl+B)">
              <Bold size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn-icon-sm ${editor.isActive("italic") ? "active" : ""}`} title="In nghiêng (Ctrl+I)">
              <Italic size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`btn-icon-sm ${editor.isActive("underline") ? "active" : ""}`} title="Gạch chân (Ctrl+U)">
              <UnderlineIcon size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`btn-icon-sm ${editor.isActive("strike") ? "active" : ""}`} title="Gạch ngang">
              <Strikethrough size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`btn-icon-sm ${editor.isActive("superscript") ? "active" : ""}`} title="Chỉ số trên">
              <Superscript size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`btn-icon-sm ${editor.isActive("subscript") ? "active" : ""}`} title="Chỉ số dưới">
              <Subscript size={13} />
            </button>

            {/* Colors */}
            <div className="color-picker-container-sm" title="Màu chữ">
              <input
                type="color"
                onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                value={editor.getAttributes("textStyle").color || "#000000"}
                className="color-picker"
              />
              <Palette size={12} className="color-icon" />
            </div>
            <div className="color-picker-container-sm" title="Màu nền">
              <input
                type="color"
                onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()}
                value={editor.getAttributes("highlight").color || "#ffffff"}
                className="color-picker"
              />
              <Highlighter size={12} className="color-icon" />
            </div>

            <button
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="btn-icon-sm"
              title="Xóa định dạng"
            >
              <RemoveFormatting size={13} />
            </button>
          </div>
        </div>
        <span className="ribbon-group-label">Phông chữ</span>
      </div>

      <div className="ribbon-group-divider" />

      {/* Heading Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-content">
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "p") {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(val) as 1 | 2 | 3 }).run();
              }
            }}
            className="toolbar-select"
            style={{ width: "120px", fontSize: "12px" }}
            value={
              editor.isActive("heading", { level: 1 })
                ? "1"
                : editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                ? "3"
                : "p"
            }
          >
            <option value="p">Đoạn văn</option>
            <option value="1">Tiêu đề 1</option>
            <option value="2">Tiêu đề 2</option>
            <option value="3">Tiêu đề 3</option>
          </select>

          <select
            onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
            className="toolbar-select"
            style={{ width: "80px", fontSize: "12px" }}
            title="Giãn cách dòng"
            value={editor.getAttributes("paragraph").lineHeight || editor.getAttributes("heading").lineHeight || "1.5"}
          >
            <option value="1">1.0</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="2">2.0</option>
            <option value="2.5">2.5</option>
            <option value="3">3.0</option>
          </select>
        </div>
        <span className="ribbon-group-label">Kiểu</span>
      </div>

      <div className="ribbon-group-divider" />

      {/* Paragraph Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-content">
          <div style={{ display: "flex", gap: "1px" }}>
            <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`btn-icon-sm ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`} title="Căn trái">
              <AlignLeft size={13} />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`btn-icon-sm ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`} title="Căn giữa">
              <AlignCenter size={13} />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`btn-icon-sm ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`} title="Căn phải">
              <AlignRight size={13} />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={`btn-icon-sm ${editor.isActive({ textAlign: "justify" }) ? "active" : ""}`} title="Căn đều">
              <AlignJustify size={13} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "1px" }}>
            <button onClick={() => editor.chain().focus().indent().run()} className="btn-icon-sm" title="Thụt lề phải (Tab)">
              <IndentIncrease size={13} />
            </button>
            <button onClick={() => editor.chain().focus().outdent().run()} className="btn-icon-sm" title="Thụt lề trái (Shift+Tab)">
              <IndentDecrease size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn-icon-sm ${editor.isActive("bulletList") ? "active" : ""}`} title="Danh sách dấu chấm">
              <List size={13} />
            </button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`btn-icon-sm ${editor.isActive("orderedList") ? "active" : ""}`} title="Danh sách số">
              <ListOrdered size={13} />
            </button>
          </div>
        </div>
        <span className="ribbon-group-label">Đoạn văn</span>
      </div>
    </div>
  );
}

/* ─── INSERT TAB ───────────────────────────────────────────────────── */
function InsertTab({
  editor,
  onImageUpload,
  onInsertLink,
}: {
  editor: any;
  onImageUpload: () => void;
  onInsertLink: () => void;
}) {
  return (
    <div className="ribbon-groups">
      {/* Media Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-content" style={{ flexDirection: "row", gap: "4px" }}>
          <button onClick={onImageUpload} className="ribbon-big-btn" title="Chèn hình ảnh">
            <ImageIcon size={20} />
            <span>Hình ảnh</span>
          </button>
          <button onClick={onInsertLink} className="ribbon-big-btn" title="Chèn liên kết">
            <LinkIcon size={20} />
            <span>Liên kết</span>
          </button>
        </div>
        <span className="ribbon-group-label">Phương tiện</span>
      </div>

      <div className="ribbon-group-divider" />

      {/* Elements Group */}
      <div className="ribbon-group">
        <div className="ribbon-group-content" style={{ flexDirection: "row", gap: "4px" }}>
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="ribbon-big-btn"
            title="Chèn bảng 3x3"
          >
            <TableIcon size={20} />
            <span>Bảng</span>
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="ribbon-big-btn"
            title="Chèn đường kẻ ngang"
          >
            <Minus size={20} />
            <span>Đường kẻ</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`ribbon-big-btn ${editor.isActive("blockquote") ? "active" : ""}`}
            title="Trích dẫn"
          >
            <Quote size={20} />
            <span>Trích dẫn</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`ribbon-big-btn ${editor.isActive("codeBlock") ? "active" : ""}`}
            title="Khối mã"
          >
            <Code2 size={20} />
            <span>Mã</span>
          </button>
        </div>
        <span className="ribbon-group-label">Thành phần</span>
      </div>
    </div>
  );
}

/* ─── TABLE TAB ────────────────────────────────────────────────────── */
function TableTab({ editor }: { editor: any }) {
  return (
    <div className="ribbon-groups">
      {/* Rows & Columns */}
      <div className="ribbon-group">
        <div className="ribbon-group-content" style={{ flexDirection: "row", gap: "4px" }}>
          <button onClick={() => editor.chain().focus().addRowBefore().run()} className="ribbon-big-btn" title="Thêm dòng phía trên" disabled={!editor.can().addRowBefore()}>
            <RowsIcon size={20} />
            <span>+ Trên</span>
          </button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="ribbon-big-btn" title="Thêm dòng phía dưới" disabled={!editor.can().addRowAfter()}>
            <Rows size={20} />
            <span>+ Dưới</span>
          </button>
          <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="ribbon-big-btn" title="Thêm cột bên trái" disabled={!editor.can().addColumnBefore()}>
            <ColumnsIcon size={20} />
            <span>+ Trái</span>
          </button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="ribbon-big-btn" title="Thêm cột bên phải" disabled={!editor.can().addColumnAfter()}>
            <Columns size={20} />
            <span>+ Phải</span>
          </button>
        </div>
        <span className="ribbon-group-label">Thêm</span>
      </div>

      <div className="ribbon-group-divider" />

      {/* Delete */}
      <div className="ribbon-group">
        <div className="ribbon-group-content" style={{ flexDirection: "row", gap: "4px" }}>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="ribbon-big-btn ribbon-btn-danger"
            title="Xóa dòng"
            disabled={!editor.can().deleteRow()}
          >
            <Rows size={20} />
            <span>Xóa dòng</span>
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="ribbon-big-btn ribbon-btn-danger"
            title="Xóa cột"
            disabled={!editor.can().deleteColumn()}
          >
            <Columns size={20} />
            <span>Xóa cột</span>
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="ribbon-big-btn ribbon-btn-danger"
            title="Xóa bảng"
            disabled={!editor.can().deleteTable()}
          >
            <Trash2 size={20} />
            <span>Xóa bảng</span>
          </button>
        </div>
        <span className="ribbon-group-label">Xóa</span>
      </div>

      <div className="ribbon-group-divider" />

      {/* Merge/Split */}
      <div className="ribbon-group">
        <div className="ribbon-group-content" style={{ flexDirection: "row", gap: "4px" }}>
          <button
            onClick={() => editor.chain().focus().mergeCells().run()}
            className="ribbon-big-btn"
            title="Gộp ô"
            disabled={!editor.can().mergeCells()}
          >
            <TableCellsMerge size={20} />
            <span>Gộp ô</span>
          </button>
          <button
            onClick={() => editor.chain().focus().splitCell().run()}
            className="ribbon-big-btn"
            title="Tách ô"
            disabled={!editor.can().splitCell()}
          >
            <TableCellsSplit size={20} />
            <span>Tách ô</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="ribbon-big-btn"
            title="Đổi dòng tiêu đề"
            disabled={!editor.can().toggleHeaderRow()}
          >
            <ToggleRight size={20} />
            <span>Header</span>
          </button>
        </div>
        <span className="ribbon-group-label">Gộp & Tách</span>
      </div>
    </div>
  );
}
