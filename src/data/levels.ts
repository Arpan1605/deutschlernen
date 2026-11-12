/** CEFR level ladder, level descriptions for prompts, exam formats and planning constants. */

export interface Level {
  code: string;
  de: string;
  words: number;
  wmin: number;
  speak: number;
}

export const LADDER: string[] = ["A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1"];
export const START_MAP: Record<string, string> = { A0: "A1", A1: "A1+", A2: "A2", B1: "B1", B2: "B2" };
export const TARGETS: string[] = ["A2", "B1", "B2", "C1"];
export const CUR_LEVELS: string[] = ["A0", "A1", "A2", "B1", "B2"];
// rough cumulative guided-learning hours (midpoints of Goethe-Institut ranges; C1 is an estimate)
export const HOURS: Record<string, number> = { A0: 0, A1: 120, A2: 200, B1: 375, B2: 525, C1: 750 };
export const WORDS_KNOWN: Record<string, number> = { A0: 0, A1: 500, A2: 1000, B1: 2000, B2: 3000 };
export const WORDS_GOAL: Record<string, number> = { A2: 1200, B1: 2000, B2: 3000, C1: 4000 };
// grammar block (WEEKS index) that suits each ladder level
export const BLOCK_AT: Record<string, number> = { A1: 0, "A1+": 0, A2: 0, "A2+": 2, B1: 4, "B1+": 6, B2: 8, "B2+": 10, C1: 12 };
export const EXAM: Record<string, { name: string; mods: [string, string][] }> = {
  A2: {
    name: "Goethe-Zertifikat A2",
    mods: [
      ["Lesen", "30 min"],
      ["Hören", "30 min"],
      ["Schreiben", "30 min"],
      ["Sprechen", "15 min"],
    ],
  },
  B1: {
    name: "Goethe-Zertifikat B1",
    mods: [
      ["Lesen", "65 min"],
      ["Hören", "40 min"],
      ["Schreiben", "60 min"],
      ["Sprechen", "15 min"],
    ],
  },
  B2: {
    name: "Goethe-Zertifikat B2",
    mods: [
      ["Lesen", "65 min"],
      ["Hören", "40 min"],
      ["Schreiben", "75 min"],
      ["Sprechen", "15 min"],
    ],
  },
  C1: {
    name: "Goethe-Zertifikat C1",
    mods: [
      ["Lesen", "65 min"],
      ["Hören", "40 min"],
      ["Schreiben", "75 min"],
      ["Sprechen", "20 min"],
    ],
  },
};
export const TARGET_BLOCK: Record<string, number> = { A2: 3, B1: 6, B2: 11, C1: 12 };

export const LEVELS: Record<string, Level> = {
  A1: {
    code: "A1",
    de: "A1: sehr kurze Hauptsätze, Präsens, sein/haben, Zahlen, Familie, Alltag; nur häufigste Wörter",
    words: 70,
    wmin: 30,
    speak: 1,
  },
  "A1+": {
    code: "A1+",
    de: "oberes A1: einfache Hauptsätze, Modalverben, trennbare Verben, Akkusativ, erste Perfekt-Formen",
    words: 90,
    wmin: 40,
    speak: 1,
  },
  A2: {
    code: "A2",
    de: "Mitte A2: Präsens, Perfekt, Modalverben, Akkusativ/Dativ, einfache Nebensätze mit weil/dass/wenn; kurze klare Sätze, häufigster Alltagswortschatz",
    words: 110,
    wmin: 50,
    speak: 2,
  },
  "A2+": {
    code: "A2+",
    de: "oberes A2 mit ersten B1-Strukturen: Nebensätze, Präteritum von sein/haben, Adjektivendungen, Alltags- und Berufsthemen",
    words: 150,
    wmin: 70,
    speak: 2,
  },
  B1: {
    code: "B1",
    de: "Goethe-Zertifikat B1: Relativsätze, Passiv, Konjunktiv II, Alltags- und Berufsthemen",
    words: 230,
    wmin: 100,
    speak: 3,
  },
  "B1+": { code: "B1+", de: "oberes B1 bis B2: längere Sätze, Konnektoren, Meinungen und Argumente", words: 280, wmin: 130, speak: 3 },
  B2: {
    code: "B2",
    de: "Goethe-Zertifikat B2: authentische Zeitungs- und Forumstexte, komplexe Satzstrukturen, Argumentation",
    words: 320,
    wmin: 150,
    speak: 4,
  },
  "B2+": {
    code: "B2+",
    de: "oberes B2 bis C1: anspruchsvolle Sachtexte, Nominalstil, differenzierte Argumentation",
    words: 360,
    wmin: 180,
    speak: 4,
  },
  C1: {
    code: "C1",
    de: "Goethe-Zertifikat C1: komplexe authentische Texte, Fachsprache, idiomatische Wendungen, präzise Argumentation",
    words: 400,
    wmin: 200,
    speak: 5,
  },
};
