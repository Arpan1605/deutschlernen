import { getLang } from "./i18n";

export const countWords = (s?: string) => (s || "").trim().match(/\S+/g)?.length ?? 0;
export const norm = (s?: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[.!?,;:„“"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const capFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const nf = (n: number) => n.toLocaleString(getLang() === "de" ? "de-DE" : "en-IN");
export const range = (a: number, b: number) => {
  const r: number[] = [];
  for (let i = a; i < b; i++) r.push(i);
  return r;
};
export const pad3 = (n: number) => String(n).padStart(3, "0");
export const sameOrder = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/** Deterministic shuffle so a sentence's blocks appear in the same order on screen and in the PDF. */
export function seededShuffle(n: number, seed: number) {
  const a = range(0, n);
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.every((v, i) => v === i) && n > 1) [a[0], a[1]] = [a[1], a[0]];
  return a;
}
