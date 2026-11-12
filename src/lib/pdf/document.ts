/** A small A4 worksheet builder on top of jsPDF: headings, paragraphs, lists,
 *  writing lines, boxes, tables, an answer-key appendix and page footers. */
import type { jsPDF } from "jspdf";
import { tx } from "../i18n";
import { PDF_T } from "./strings";
import { prof } from "../plan";

export const pt = (k: keyof typeof PDF_T) => tx(PDF_T[k]);
type RGB = [number, number, number];

/** The standard PDF fonts cover Latin-1 only; map everything else to something printable. */
export function pdfSafe(input: unknown) {
  if (input == null) return "";
  const s = String(input)
    .replace(/[„“”«»]/g, '"')
    .replace(/[‚‘’‹›]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/✓/g, "OK")
    .replace(/✗/g, "X")
    .replace(/✎ ?/g, "")
    .replace(/♪ ?/g, "")
    .replace(/🔊/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/•/g, "·")
    .replace(/×/g, "x")
    .replace(/ /g, " ");
  let out = "";
  for (const ch of s) {
    if ((ch.codePointAt(0) ?? 0) <= 0xff) out += ch;
    else {
      const b = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
      out += [...b].every((x) => (x.codePointAt(0) ?? 0) <= 0xff) ? b : "";
    }
  }
  return out;
}

export interface POpts {
  size?: number;
  style?: string;
  col?: RGB;
  indent?: number;
  gap?: number;
  num?: boolean;
}
export type Pdf = ReturnType<typeof makePdf>;

export function makePdf(JS: typeof jsPDF, title: string, sub?: string) {
  const doc = new JS({ unit: "mm", format: "a4" });
  const W = 210,
    M = 16,
    CW = W - 2 * M,
    BOT = 282;
  let y = M;
  const keys: { section: string; items: string[] }[] = [];
  const ink: RGB = [18, 24, 35],
    mut: RGB = [88, 97, 116],
    acc: RGB = [164, 87, 10],
    line: RGB = [207, 213, 222];
  const set = (size: number, style?: string, col?: RGB) => {
    doc.setFont("helvetica", style || "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(col || ink));
  };
  const need = (h: number) => {
    if (y + h > BOT) {
      doc.addPage();
      y = M;
    }
  };
  const text = (s: string, size: number, style?: string, col?: RGB, indent = 0, gap = 1.5) => {
    set(size, style, col);
    const lines: string[] = doc.splitTextToSize(pdfSafe(s), CW - indent);
    const lh = size * 0.42;
    lines.forEach((l) => {
      need(lh);
      doc.text(l, M + indent, y + lh * 0.8);
      y += lh;
    });
    y += gap;
  };

  const P = {
    doc,
    h1(s: string) {
      need(14);
      text(s, 18, "bold", ink, 0, 1);
    },
    h2(s: string) {
      need(16);
      y += 2;
      text(s, 13, "bold", ink, 0, 1.5);
      doc.setDrawColor(...line);
      doc.line(M, y - 1, M + CW, y - 1);
      y += 1.5;
    },
    h3(s: string) {
      need(10);
      y += 1;
      text(s, 11, "bold", ink, 0, 1);
    },
    p(s: string, o: POpts = {}) {
      const paras = String(s || "").split(/\n/);
      paras.forEach((para, i) =>
        text(para === "" ? " " : para, o.size || 10.5, o.style, o.col || ink, o.indent, i === paras.length - 1 ? (o.gap ?? 2) : 0.5),
      );
    },
    small(s: string, indent = 0) {
      text(s, 9, "normal", mut, indent, 1.5);
    },
    label(s: string) {
      text(String(s).toUpperCase(), 8, "bold", mut, 0, 1);
    },
    list(items: string[], o: POpts = {}) {
      items.forEach((it, i) => text((o.num ? i + 1 + ". " : "- ") + it, o.size || 10.5, o.style, o.col, o.indent || 0, 1));
      y += 1;
    },
    /** n ruled writing lines */
    write(n: number) {
      doc.setDrawColor(...line);
      for (let i = 0; i < n; i++) {
        need(8);
        y += 7.5;
        doc.line(M, y, M + CW, y);
      }
      y += 4;
    },
    blank(h = 3) {
      y += h;
    },
    box(s: string) {
      set(10.5, "normal");
      const lines: string[] = doc.splitTextToSize(pdfSafe(s), CW - 8);
      const h = lines.length * 4.4 + 6;
      need(h);
      doc.setFillColor(242, 244, 247);
      doc.setDrawColor(...line);
      doc.rect(M, y, CW, h, "FD");
      set(10.5, "normal", ink);
      lines.forEach((l, i) => doc.text(l, M + 4, y + 5.5 + i * 4.4));
      y += h + 3;
    },
    table(head: string[], rows: string[][], widths: number[]) {
      const ws = widths.map((f) => f * CW),
        pad = 1.6,
        fs = 9.5,
        lh = fs * 0.42;
      const drawRow = (cells: string[], bold: boolean, fill: boolean) => {
        set(fs, bold ? "bold" : "normal", bold ? mut : ink);
        const wrapped: string[][] = cells.map((c, i) => doc.splitTextToSize(pdfSafe(c), ws[i] - 2 * pad));
        const h = Math.max(...wrapped.map((w) => w.length)) * lh + 2 * pad;
        if (y + h > BOT) {
          doc.addPage();
          y = M;
          if (!bold) drawRow(head, true, true);
          set(fs, bold ? "bold" : "normal", bold ? mut : ink);
        }
        if (fill) {
          doc.setFillColor(242, 244, 247);
          doc.rect(M, y, CW, h, "F");
        }
        let x = M;
        wrapped.forEach((w, i) => {
          w.forEach((l, j) => doc.text(l, x + pad, y + pad + lh * (j + 0.8)));
          x += ws[i];
        });
        doc.setDrawColor(...line);
        doc.line(M, y + h, M + CW, y + h);
        y += h;
      };
      drawRow(head, true, true);
      rows.forEach((r) => drawRow(r, false, false));
      y += 4;
    },
    newPage() {
      doc.addPage();
      y = M;
    },
    /** Add answers to the key printed on the last page(s). */
    key(section: string, items: string[]) {
      if (items?.length) keys.push({ section, items });
    },
    finish(): ArrayBuffer {
      if (keys.length) {
        doc.addPage();
        y = M;
        P.h1(pt("key"));
        keys.forEach((k) => {
          P.h3(k.section);
          k.items.forEach((it) => text(it, 9.5, "normal", ink, 2, 0.8));
          y += 2;
        });
      }
      const n = doc.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        doc.setPage(i);
        set(8, "normal", mut);
        doc.text(pdfSafe("Fahrplan " + prof().target + " · " + title), M, 292);
        doc.text(pt("page") + " " + i + " / " + n, W - M, 292, { align: "right" });
      }
      return doc.output("arraybuffer");
    },
  };

  // Title block with name and date lines
  set(8, "bold", acc);
  doc.text("FAHRPLAN " + prof().target, M, y + 3);
  y += 6;
  P.h1(title);
  if (sub) P.small(sub);
  set(9, "normal", mut);
  doc.text(pt("name") + ": ______________________", M, y + 4);
  doc.text(pt("date") + ": ______________", M + CW - 55, y + 4);
  y += 10;
  return P;
}
