/** Bilingual text helpers. The current language lives here; React re-renders
 *  through the store when it changes. */
export type Lang = "de" | "en";
export interface BiText {
  de: string;
  en: string;
}
export type Bi = BiText | string | (() => Bi);

export const B = (de: string, en: string): BiText => ({ de, en });

let current: Lang = (() => {
  try {
    const s = localStorage.getItem("fahrplan-lang");
    if (s === "de" || s === "en") return s;
  } catch {
    /* storage blocked */
  }
  return "de";
})();

export const getLang = (): Lang => current;
export function setLangValue(l: Lang) {
  current = l;
  try {
    localStorage.setItem("fahrplan-lang", l);
  } catch {
    /* storage blocked */
  }
  try {
    document.documentElement.lang = l;
  } catch {
    /* no DOM */
  }
}

/** Resolve a bilingual value (or a function returning one) to a string. */
export function tx(o: Bi | null | undefined): string {
  if (typeof o === "function") return tx(o());
  if (o == null) return "";
  if (typeof o === "string") return o;
  return o[current] ?? o.de;
}

/** Pick the German or English variant of a generated field (e.g. why_de / why_en). */
export const pickLang = (de?: string, en?: string) => (current === "de" ? de || "" : en || de || "");
