/** Hand a generated PDF to the viewer through the artifact's download capability. */
import { tx } from "../i18n";
import { UI } from "../../data/strings";
import { runtime } from "../runtime";
import type { Builder } from "./sections";

export async function savePdf(build: Builder, filename: string): Promise<{ msg: string; err?: boolean }> {
  if (!runtime.downloads) return { msg: tx(UI.pdf_unavail), err: true };
  let JS;
  try {
    JS = (await import("jspdf")).jsPDF;
  } catch {
    return { msg: tx(UI.pdf_lib), err: true };
  }
  let buf: ArrayBuffer;
  try {
    buf = build(JS);
  } catch {
    return { msg: tx(UI.e_other), err: true };
  }
  try {
    await runtime.downloads.save({ filename, data: new Blob([buf], { type: "application/pdf" }) });
    return { msg: tx(UI.pdf_saved) };
  } catch (e) {
    const c = (e as { code?: string })?.code;
    if (c === "declined") return { msg: "" };
    if (c === "rate_limited") return { msg: tx(UI.pdf_busy), err: true };
    return { msg: tx(UI.pdf_unavail), err: true };
  }
}
