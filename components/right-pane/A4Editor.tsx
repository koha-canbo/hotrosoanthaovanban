"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import SuperscriptExt from "@tiptap/extension-superscript";
import SubscriptExt from "@tiptap/extension-subscript";
import CharacterCount from "@tiptap/extension-character-count";
import { FontSize } from "./FontSize";
import { LineHeight } from "./extensions/LineHeight";
import { Indent } from "./extensions/Indent";
import { Extension } from "@tiptap/core";

const TextIndent = Extension.create({
  name: "textIndent",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textIndent: {
            default: null,
            parseHTML: element => element.style.textIndent || null,
            renderHTML: attributes => {
              if (!attributes.textIndent) return {};
              return { style: `text-indent: ${attributes.textIndent}` };
            },
          },
        },
      },
    ];
  },
});

export interface A4EditorHandle {
  getHTML: () => string;
  setContent: (html: string) => void;
  insertContent: (html: string) => void;
}

interface A4EditorProps {
  initialContent?: string;
  onEditorReady?: (editor: any) => void;
}

const A4Editor = forwardRef<A4EditorHandle, A4EditorProps>(
  ({ initialContent, onEditorReady }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          underline: false,
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right", "justify"],
        }),
        TextStyle,
        FontFamily,
        Placeholder.configure({
          placeholder: "Chọn loại văn bản và nhấn 'Tạo văn bản' để bắt đầu...",
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "decree-table",
          },
        }),
        TableRow,
        TableCell,
        TableHeader,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        FontSize,
        // New extensions
        Image.configure({
          inline: false,
          allowBase64: true,
          HTMLAttributes: {
            class: "editor-image",
          },
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: "editor-link",
          },
        }),
        SuperscriptExt,
        SubscriptExt,
        CharacterCount,
        LineHeight,
        Indent,
        TextIndent,
      ],
      content: initialContent || "",
      editorProps: {
        attributes: {
          class: "tiptap-editor",
          spellcheck: "false",
        },
        // Handle image paste & drop
        handlePaste: (view, event) => {
          const items = event.clipboardData?.items;
          if (!items) return false;

          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const url = ev.target?.result as string;
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: url })
                    )
                  );
                };
                reader.readAsDataURL(file);
              }
              return true;
            }
          }
          return false;
        },
        handleDrop: (view, event) => {
          const files = event.dataTransfer?.files;
          if (!files || files.length === 0) return false;

          for (const file of Array.from(files)) {
            if (file.type.startsWith("image/")) {
              event.preventDefault();
              const reader = new FileReader();
              reader.onload = (ev) => {
                const url = ev.target?.result as string;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                if (coordinates) {
                  view.dispatch(
                    view.state.tr.insert(
                      coordinates.pos,
                      view.state.schema.nodes.image.create({ src: url })
                    )
                  );
                }
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
          return false;
        },
      },
      immediatelyRender: false,
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      setContent: (html: string) => {
        editor?.commands.setContent(html, { emitUpdate: false });
      },
      insertContent: (html: string) => {
        // Insert at the end of the document
        if (editor) {
          editor.commands.focus("end");
          editor.commands.insertContent(html);
        }
      },
    }));

    // Update content when initialContent changes
    useEffect(() => {
      if (editor && initialContent !== undefined) {
        const currentContent = editor.getHTML();
        if (currentContent !== initialContent) {
          editor.commands.setContent(initialContent, { emitUpdate: false });
        }
      }
    }, [editor, initialContent]);

    // Expose editor to parent if needed via window for debugging
    useEffect(() => {
      if (editor) {
        (window as any).editor = editor;
        if (onEditorReady) {
          onEditorReady(editor);
        }
      }
      return () => {
        if (onEditorReady) {
          onEditorReady(null);
        }
      };
    }, [editor, onEditorReady]);

    if (!editor) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            color: "var(--text-tertiary)",
            fontSize: "14px",
          }}
        >
          Đang tải trình soạn thảo...
        </div>
      );
    }

    return <EditorContent editor={editor} />;
  }
);

A4Editor.displayName = "A4Editor";
export default A4Editor;
