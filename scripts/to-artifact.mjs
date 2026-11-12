// Turn the single-file Vite build (dist/index.html) into the body-only page the
// Claude artifact host expects: it supplies <!doctype>, <html>, <head> and <body>.
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? "";
const keep = head
  .replace(/<meta charset[^>]*>/i, "")
  .replace(/<meta name="viewport"[^>]*>/i, "")
  .trim();
writeFileSync("dist/artifact.html", keep + "\n" + body.trim() + "\n");
console.log("dist/artifact.html", (keep.length + body.length) / 1024 | 0, "KB");
