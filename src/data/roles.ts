import { B } from "../lib/i18n";

/** Sentence-part roles used by the sentence-building exercises. */
export const ROLES: Record<string, { c: string; n: { de: string; en: string }; q: { de: string; en: string } }> = {
  S: { c: "var(--c-lesen)", n: B("Subjekt", "Subject"), q: B("Wer? Was?", "Who? What?") },
  V: { c: "var(--c-sprechen)", n: B("Verb", "Verb"), q: B("konjugiert", "conjugated") },
  V2: { c: "var(--c-sprechen)", n: B("Verb-Teil 2", "Verb part 2"), q: B("Infinitiv, Partizip, Präfix", "infinitive, participle, prefix") },
  AKK: { c: "var(--c-schreiben)", n: B("Akk.-Objekt", "Acc. object"), q: B("Wen? Was?", "Whom? What?") },
  DAT: { c: "var(--c-hoeren)", n: B("Dat.-Objekt", "Dat. object"), q: B("Wem?", "To whom?") },
  PO: { c: "var(--c-gram)", n: B("Präp.-Objekt", "Prep. object"), q: B("Worauf? Mit wem?", "On what? With whom?") },
  TE: { c: "var(--c-wort)", n: B("Zeit", "Time"), q: B("Wann?", "When?") },
  KA: { c: "var(--c-gram)", n: B("Grund", "Reason"), q: B("Warum?", "Why?") },
  MO: { c: "var(--c-musik)", n: B("Art & Weise", "Manner"), q: B("Wie? Womit?", "How?") },
  LO: { c: "var(--c-sehen)", n: B("Ort", "Place"), q: B("Wo? Wohin? Woher?", "Where?") },
  KONJ: { c: "var(--muted)", n: B("Konnektor", "Connector"), q: B("und, weil, dass …", "and, because, that …") },
  NEG: { c: "var(--warn)", n: B("Negation", "Negation"), q: B("nicht, nie", "not, never") },
  W: { c: "var(--ink)", n: B("Fragewort", "Question word"), q: B("wann, wo, warum …", "when, where, why …") },
  REST: { c: "var(--muted)", n: B("Sonstiges", "Other"), q: B("Partikel, Adverb", "particle, adverb") },
};
export const ROLE_KEYS = Object.keys(ROLES);
export const roleOf = (r: string) => ROLES[r] || ROLES.REST;
