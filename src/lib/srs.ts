/** Leitner flashcards over every vocabulary list the learner has created. */
import { state, saveC } from "./store";
import { todayIdx } from "./plan";

export interface Word {
  de: string;
  pl?: string;
  pos?: string;
  en: string;
  ex: string;
  ex_en?: string;
}
export interface Card {
  key: string;
  i: number;
  w: Word;
}
const INTERVALS = [0, 1, 2, 4, 8, 16];

export function dueCards(): Card[] {
  const t = todayIdx(),
    out: Card[] = [];
  for (const [k, c] of Object.entries(state.content)) {
    if (c?.kind !== "vocab" || !c.data?.words) continue;
    const cards = c.st?.cards || {};
    c.data.words.forEach((w: Word, i: number) => {
      const s = cards[i];
      if (!s || s.due <= t) out.push({ key: k, i, w });
    });
  }
  const seen = (c: Card) => (state.content[c.key].st?.cards || {})[c.i];
  return out.sort((a, b) => (seen(a) ? 0 : 1) - (seen(b) ? 0 : 1)).slice(0, 80);
}

export function learnedCount() {
  let n = 0;
  for (const c of Object.values(state.content)) if (c?.kind === "vocab" && c.st?.cards) n += Object.keys(c.st.cards).length;
  return n;
}

/** Rate a card: 0 = again, 1 = knew it, 2 = easy. */
export function rateCard(c: Card, v: 0 | 1 | 2) {
  const C = state.content[c.key];
  C.st = C.st || {};
  C.st.cards = C.st.cards || {};
  const s = C.st.cards[c.i] || { box: 0 };
  const box = v === 0 ? 1 : Math.min(5, (s.box || 0) + v);
  C.st.cards[c.i] = { box, due: todayIdx() + (v === 0 ? 0 : INTERVALS[box]) };
  saveC(c.key);
}
