/**
 * Export the TipTap editor content to a .docx file with Decree 30 formatting.
 * Uses the 'docx' library which runs purely in the browser.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertMillimetersToTwip,
  SectionType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

/**
 * Parse simple HTML from TipTap and convert to docx paragraphs.
 * This is a lightweight parser — handles the common elements TipTap produces.
 */
function htmlToDocxElements(html: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text, font: "Times New Roman", size: 28 })],
            spacing: { line: 360 },
          })
        );
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    // Skip processing tables with decree-header-table class
    if (tag === "table") {
      // For tables, create a simple representation
      const rows = el.querySelectorAll("tr");
      if (rows.length > 0) {
        try {
          const tableRows = Array.from(rows).map((tr) => {
            const cells = Array.from(tr.querySelectorAll("td, th"));
            return new TableRow({
              children: cells.map((cell) => {
                const cellAlignment = getAlignment(cell as HTMLElement);
                const pElements = Array.from(cell.querySelectorAll("p"));
                let childrenElements: Paragraph[] = [];

                if (pElements.length > 0) {
                  childrenElements = pElements.map((pEl) => {
                    const pStyle = pEl.getAttribute("style") || "";
                    let size = 26; // Default to 13pt for table cell text
                    const sizeMatch = pStyle.match(/font-size:\s*(\d+)pt/);
                    if (sizeMatch) size = parseInt(sizeMatch[1], 10) * 2;

                    return new Paragraph({
                      children: extractTextRuns(pEl, { size }),
                      alignment: getAlignment(pEl) || cellAlignment,
                      spacing: { line: 240 }, // tight spacing for headers
                    });
                  });
                } else {
                  childrenElements = [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell.textContent?.trim() || "",
                          font: "Times New Roman",
                          size: 26,
                        }),
                      ],
                      alignment: cellAlignment,
                      spacing: { line: 240 },
                    }),
                  ];
                }

                return new TableCell({
                  children: childrenElements,
                  width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                });
              }),
            });
          });
          elements.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        } catch {
          // Fallback: just add text
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: el.textContent?.trim() || "",
                  font: "Times New Roman",
                  size: 28,
                }),
              ],
            })
          );
        }
      }
      return;
    }

    if (tag === "h1") {
      elements.push(
        new Paragraph({
          children: extractTextRuns(el, { bold: true, size: 32 }),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120, line: 360 },
        })
      );
    } else if (tag === "h2") {
      elements.push(
        new Paragraph({
          children: extractTextRuns(el, { bold: true, size: 30 }),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100, line: 360 },
        })
      );
    } else if (tag === "h3") {
      elements.push(
        new Paragraph({
          children: extractTextRuns(el, { bold: true, size: 28 }),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80, line: 360 },
        })
      );
    } else if (tag === "p") {
      const style = el.getAttribute("style") || "";
      const alignment = getAlignment(el);
      
      let firstLineIndent = undefined;
      if (style.includes("text-indent")) {
        if (style.includes("1.27cm")) firstLineIndent = convertMillimetersToTwip(12.7);
        else firstLineIndent = convertMillimetersToTwip(10);
      }
      const indent = firstLineIndent ? { firstLine: firstLineIndent } : undefined;

      elements.push(
        new Paragraph({
          children: extractTextRuns(el),
          alignment,
          indent,
          spacing: { after: 60, line: 360 },
        })
      );
    } else if (tag === "ul" || tag === "ol") {
      const items = el.querySelectorAll(":scope > li");
      items.forEach((li, index) => {
        const bullet = tag === "ul" ? "• " : `${index + 1}. `;
        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: bullet, font: "Times New Roman", size: 28 }),
              ...extractTextRuns(li as HTMLElement),
            ],
            indent: { left: convertMillimetersToTwip(10) },
            spacing: { after: 40, line: 360 },
          })
        );
      });
    } else if (tag === "br") {
      elements.push(new Paragraph({ children: [] }));
    } else {
      // Generic: process children
      Array.from(el.childNodes).forEach(processNode);
    }
  }

  Array.from(body.childNodes).forEach(processNode);

  return elements;
}

function getAlignment(el: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const style = el.getAttribute("style") || "";
  if (style.includes("text-align:center") || style.includes("text-align: center"))
    return AlignmentType.CENTER;
  if (style.includes("text-align:right") || style.includes("text-align: right"))
    return AlignmentType.RIGHT;
  if (style.includes("text-align:justify") || style.includes("text-align: justify"))
    return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
}

function extractTextRuns(
  el: HTMLElement,
  defaults: { bold?: boolean; italic?: boolean; size?: number } = {}
): TextRun[] {
  const runs: TextRun[] = [];

  function walk(node: Node, inherited: { bold: boolean; italic: boolean; underline: boolean; size?: number }) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text) {
        runs.push(
          new TextRun({
            text,
            font: "Times New Roman",
            size: inherited.size || defaults.size || 28,
            bold: inherited.bold || defaults.bold,
            italics: inherited.italic || defaults.italic,
            underline: inherited.underline ? {} : undefined,
          })
        );
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as HTMLElement;
    const tag = child.tagName.toLowerCase();
    const style = child.getAttribute("style") || "";

    const next = { ...inherited };
    if (tag === "strong" || tag === "b" || style.includes("font-weight:bold") || style.includes("font-weight: bold"))
      next.bold = true;
    if (tag === "em" || tag === "i" || style.includes("font-style:italic") || style.includes("font-style: italic"))
      next.italic = true;
    if (tag === "u" || style.includes("text-decoration:underline") || style.includes("text-decoration: underline"))
      next.underline = true;
      
    // Extract font size if present
    const sizeMatch = style.match(/font-size:\s*(\d+)pt/);
    if (sizeMatch) {
      next.size = parseInt(sizeMatch[1], 10) * 2;
    }

    Array.from(child.childNodes).forEach((n) => walk(n, next));
  }

  walk(el, { bold: false, italic: false, underline: false });
  return runs;
}

/**
 * Convert editor HTML to a Word document and trigger download.
 */
export async function exportToDocx(
  htmlContent: string,
  filename: string = "van_ban_hanh_chinh.docx"
): Promise<void> {
  const docElements = htmlToDocxElements(htmlContent);

  const doc = new Document({
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: {
              top: convertMillimetersToTwip(20),
              bottom: convertMillimetersToTwip(20),
              left: convertMillimetersToTwip(30),
              right: convertMillimetersToTwip(20),
            },
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
          },
        },
        children: docElements,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 28,
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
      },
    },
  });

  // Generate blob from docx library
  const rawBlob = await Packer.toBlob(doc);

  // Ensure the blob has the correct MIME type
  const blob = new Blob([rawBlob], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  // Create an object URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a hidden anchor element
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  
  // Append to body (required for some browsers like Firefox)
  document.body.appendChild(link);
  
  // Programmatically click to trigger the download
  link.click();

  // Clean up resources
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}
