/**
 * Post-processing cleanup for AI-generated HTML.
 * Forces compliance with Decree 30 terminology and formatting,
 * regardless of what the AI actually outputs.
 */

/**
 * Clean and normalize AI-generated HTML before inserting into the editor.
 * This is the LAST LINE OF DEFENSE — it runs on the frontend after all
 * backend processing, ensuring 100% compliance.
 */
export function cleanGeneratedHtml(html: string): string {
  if (!html || html.trim().length < 10) return html;

  let text = html.trim();

  // 1. Strip markdown code blocks (```html ... ```)
  const codeBlockMatch = text.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
  } else {
    // Strip conversational preamble before first HTML tag
    const firstTag = text.indexOf("<");
    const lastTag = text.lastIndexOf(">");
    if (firstTag > 0 && lastTag > firstTag) {
      text = text.substring(firstTag, lastTag + 1).trim();
    }
  }

  // 2. Force replace forbidden terms — normal case globally
  const termReplacements: [RegExp, string][] = [
    // Công an huyện → Công an tỉnh Đắk Lắk (with trailing district name)
    [/Công an huyện\s*[^<;,.\)"]*/gi, "Công an tỉnh Đắk Lắk"],
    // Công an cấp trên (chủ quản)
    [/[Cc]ông an cấp trên(?:\s+chủ quản)?/gi, "Công an tỉnh Đắk Lắk"],
    [/TÊN CƠ QUAN CHỦ QUẢN/gi, "Công an tỉnh Đắk Lắk"],
    [/[Cc]ơ quan chủ quản/gi, "Công an tỉnh Đắk Lắk"],
    // Normalize case first
    [/CÔNG AN TỈNH ĐẮK LẮK/g, "Công an tỉnh Đắk Lắk"],
    // Công an viên → Cán bộ
    [/Công an viên/g, "Cán bộ"],
    [/công an viên/g, "cán bộ"],
    [/CÔNG AN VIÊN/g, "CÁN BỘ"],
    // Remove citation brackets [1], [2], etc.
    [/\s*\[\d+\]/g, ""],
  ];

  for (const [pattern, replacement] of termReplacements) {
    text = text.replace(pattern, replacement);
  }

  // 3. Force 1.27cm text-indent + justify on <p> tags NOT inside tables
  // Strategy: First, extract table blocks, process non-table <p> tags, then reassemble
  const tableBlocks: string[] = [];
  const TABLE_PLACEHOLDER = "___TABLE_BLOCK___";

  // Temporarily replace all <table>...</table> blocks
  let tableIndex = 0;
  text = text.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    let block = match;
    // Capitalize "Công an tỉnh Đắk Lắk" ONLY in the very first table
    if (tableIndex === 0) {
      block = block.replace(/Công an tỉnh Đắk Lắk/gi, "CÔNG AN TỈNH ĐẮK LẮK");
    }
    tableBlocks.push(block);
    tableIndex++;
    return TABLE_PLACEHOLDER;
  });

  // Now process only <p> tags that are NOT inside tables
  text = text.replace(/<p(\s[^>]*)?>|<p>/g, (match) => {
    // Skip if already has text-indent
    if (match.includes("text-indent")) {
      // But ensure justify is there
      if (!match.includes("text-align")) {
        return match.replace('style="', 'style="text-align:justify;');
      }
      return match;
    }

    const indentAndJustify = "text-indent:1.27cm;text-align:justify;";

    if (match.includes('style="')) {
      // Has style with text-align already? Only add indent
      if (match.includes("text-align")) {
        return match.replace('style="', 'style="text-indent:1.27cm;');
      }
      return match.replace('style="', `style="${indentAndJustify}`);
    }
    if (match.includes("style='")) {
      if (match.includes("text-align")) {
        return match.replace("style='", "style='text-indent:1.27cm;");
      }
      return match.replace("style='", `style='${indentAndJustify}`);
    }
    // No style attribute
    if (match === "<p>") {
      return `<p style="${indentAndJustify}">`;
    }
    return match.replace("<p ", `<p style="${indentAndJustify}" `);
  });

  // Restore table blocks (untouched — no indent added inside tables)
  tableBlocks.forEach((block) => {
    text = text.replace(TABLE_PLACEHOLDER, block);
  });

  return text;
}
