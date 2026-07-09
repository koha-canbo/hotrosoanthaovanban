"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search, X, ChevronDown, ChevronUp, Replace } from "lucide-react";

interface FindReplaceProps {
  editor?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function FindReplace({ editor, isOpen, onClose }: FindReplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [results, setResults] = useState<{ from: number; to: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const decorationsRef = useRef<any>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  // Perform search whenever searchTerm changes
  const performSearch = useCallback(() => {
    if (!editor || editor.isDestroyed || !searchTerm) {
      setResults([]);
      setCurrentIndex(-1);
      // Clear decorations
      clearHighlights();
      return;
    }

    const doc = editor.state.doc;
    const text = doc.textContent;
    const term = searchTerm.toLowerCase();
    const found: { from: number; to: number }[] = [];

    // We need to map text positions to doc positions
    // Walk through the doc content to find matches
    doc.descendants((node: any, pos: number) => {
      if (node.isText) {
        const nodeText = node.text!.toLowerCase();
        let startIndex = 0;
        while (true) {
          const idx = nodeText.indexOf(term, startIndex);
          if (idx === -1) break;
          found.push({
            from: pos + idx,
            to: pos + idx + searchTerm.length,
          });
          startIndex = idx + 1;
        }
      }
    });

    setResults(found);
    if (found.length > 0) {
      setCurrentIndex(0);
      highlightResults(found, 0);
      scrollToResult(found[0]);
    } else {
      setCurrentIndex(-1);
      clearHighlights();
    }
  }, [editor, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(performSearch, 200);
    return () => clearTimeout(debounce);
  }, [performSearch]);

  const clearHighlights = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    // Remove search highlight marks
    const { tr } = editor.state;
    const docSize = editor.state.doc.content.size;
    if (docSize > 0) {
      const markType = editor.schema.marks.highlight;
      if (markType) {
        // We'll use a different approach: just unset any search-specific highlights
        // For now we leave this simple
      }
    }
  }, [editor]);

  const highlightResults = useCallback(
    (found: { from: number; to: number }[], activeIndex: number) => {
      // Scroll to active result
      if (found[activeIndex]) {
        scrollToResult(found[activeIndex]);
      }
    },
    [editor]
  );

  const scrollToResult = useCallback(
    (result: { from: number; to: number }) => {
      if (!editor || editor.isDestroyed) return;
      editor
        .chain()
        .setTextSelection({ from: result.from, to: result.to })
        .scrollIntoView()
        .run();
    },
    [editor]
  );

  const goToNext = useCallback(() => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    scrollToResult(results[nextIndex]);
  }, [results, currentIndex, scrollToResult]);

  const goToPrev = useCallback(() => {
    if (results.length === 0) return;
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIndex);
    scrollToResult(results[prevIndex]);
  }, [results, currentIndex, scrollToResult]);

  const handleReplace = useCallback(() => {
    if (!editor || editor.isDestroyed || currentIndex < 0 || currentIndex >= results.length) return;
    const result = results[currentIndex];
    editor
      .chain()
      .setTextSelection({ from: result.from, to: result.to })
      .insertContent(replaceTerm)
      .run();
    // Re-search after replacement
    setTimeout(performSearch, 50);
  }, [editor, currentIndex, results, replaceTerm, performSearch]);

  const handleReplaceAll = useCallback(() => {
    if (!editor || editor.isDestroyed || results.length === 0) return;
    // Replace from end to start so positions don't shift
    const sorted = [...results].sort((a, b) => b.from - a.from);
    const chain = editor.chain();
    for (const result of sorted) {
      chain.setTextSelection({ from: result.from, to: result.to }).insertContent(replaceTerm);
    }
    chain.run();
    setResults([]);
    setCurrentIndex(-1);
  }, [editor, results, replaceTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (e.shiftKey) {
        goToPrev();
      } else {
        goToNext();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="find-replace-panel" onKeyDown={handleKeyDown}>
      <div className="find-replace-row">
        <div className="find-replace-input-group">
          <Search size={14} className="find-replace-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="find-replace-input"
          />
          {searchTerm && (
            <span className="find-replace-count">
              {results.length > 0 ? `${currentIndex + 1}/${results.length}` : "0 kết quả"}
            </span>
          )}
        </div>
        <div className="find-replace-actions">
          <button onClick={goToPrev} className="find-replace-btn" title="Trước (Shift+Enter)" disabled={results.length === 0}>
            <ChevronUp size={14} />
          </button>
          <button onClick={goToNext} className="find-replace-btn" title="Sau (Enter)" disabled={results.length === 0}>
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`find-replace-btn ${showReplace ? "active" : ""}`}
            title="Thay thế"
          >
            <Replace size={14} />
          </button>
          <button onClick={onClose} className="find-replace-btn" title="Đóng (Esc)">
            <X size={14} />
          </button>
        </div>
      </div>

      {showReplace && (
        <div className="find-replace-row">
          <div className="find-replace-input-group">
            <Replace size={14} className="find-replace-icon" />
            <input
              type="text"
              placeholder="Thay thế bằng..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="find-replace-input"
            />
          </div>
          <div className="find-replace-actions">
            <button
              onClick={handleReplace}
              className="find-replace-btn-text"
              disabled={results.length === 0}
              title="Thay thế"
            >
              Thay thế
            </button>
            <button
              onClick={handleReplaceAll}
              className="find-replace-btn-text"
              disabled={results.length === 0}
              title="Thay thế tất cả"
            >
              Tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
