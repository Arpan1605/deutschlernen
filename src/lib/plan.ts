/** The learner's plan: dates, level progression, grammar blocks and the
 *  tasks for every day. Everything is derived from the saved profile. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { B, type BiText } from "./i18n";
import { parseDate, DAY_MS } from "./dates";
import { range } from "./text";
import { LADDER, START_MAP, HOURS, WORDS_KNOWN, WORDS_GOAL, BLOCK_AT, TARGET_BLOCK, LEVELS, type Level } from "../data/levels";
import { WEEKS } from "../data/weeks";
import type { SkillKey } from "../data/skills";
import type { Profile } from "../types";
import { state } from "./store";

export type ModKey =
  | "vocab"
  | "review"
  | "grammar"
  | "syntax"
  | "reading"
  | "story"
  | "episode"
  | "song"
  | "write"
  | "talk"
  | "gramtest"
  | "patterns";
export interface Task {
  id: string;
  s: SkillKey;
  min: number;
  title: BiText;
  body: BiText;
  mod?: ModKey;
  link?: string;
  task?: string;
  pats?: number[];
}
export interface Phase {
  name: BiText;
  from: number;
  to: number;
  desc: BiText;
}

export const DEFAULT_PROFILE: Profile = { name: "", cur: "A2", target: "B2", days: 90, start: "2026-10-29" };

/** The active plan. Mutated by applyProfile(); read everywhere. */
export const plan = {
  start: new Date(2026, 9, 29),
  total: 90,
  nweeks: 13,
  check: 45,
  phases: [] as Phase[],
  profile: null as Profile | null,
};

export const prof = (): Profile => plan.profile || DEFAULT_PROFILE;
export function dateOf(d: number) {
  const x = new Date(plan.start);
  x.setDate(plan.start.getDate() + d - 1);
  return x;
}
export function todayIdx() {
  const n = new Date();
  const t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.min(plan.total, Math.max(1, Math.round((t.getTime() - plan.start.getTime()) / DAY_MS) + 1));
}
export const phaseOf = (d: number) => plan.phases.findIndex((p) => d >= p.from && d <= p.to);
export const weekOf = (d: number) => Math.min(plan.nweeks - 1, Math.floor((d - 1) / 7));
export const startIdx = () => LADDER.indexOf(START_MAP[prof().cur] || "A2");
export const targetIdx = () => LADDER.indexOf(prof().target);
const frac = (d: number) => (plan.total <= 1 ? 1 : (d - 1) / (plan.total - 1));
export function planLevelKey(d: number) {
  const a = startIdx(),
    z = Math.max(a, targetIdx());
  const f = Math.min(1, frac(d) / 0.8);
  return LADDER[Math.min(z, a + Math.floor((z - a + 1) * f))];
}
/** Which grammar/topic block (WEEKS index) a day belongs to. */
export function blockOf(d: number) {
  const a = BLOCK_AT[LADDER[startIdx()]],
    z = Math.max(a, TARGET_BLOCK[prof().target] ?? 12);
  return Math.min(12, a + Math.floor((z - a + 1) * Math.min(0.999, frac(d))));
}
export const weekTheme = (d: number) => WEEKS[blockOf(d)];
export function levelFor(d: number): Level {
  const o = state.settings && state.settings.level;
  return LEVELS[o && o !== "auto" && LEVELS[o] ? o : planLevelKey(d)];
}
export const lvIdx = (d: number) => LADDER.indexOf(levelFor(d).code);
export function wordsPerDay() {
  const need = Math.max(300, (WORDS_GOAL[prof().target] || 3000) - (WORDS_KNOWN[prof().cur] || 0));
  let study = 0;
  for (let i = 1; i <= plan.total; i++) if (dateOf(i).getDay() !== 0) study++;
  return Math.max(10, Math.min(60, Math.round(need / Math.max(1, study) / 5) * 5));
}
export function wordTarget(d: number) {
  let n = 0;
  const w = wordsPerDay();
  for (let i = 1; i <= d; i++) if (dateOf(i).getDay() !== 0) n += w;
  return n;
}
export const wordGoal = () => wordTarget(plan.total);
export const hoursNeeded = () => Math.max(0, (HOURS[prof().target] || 0) - (HOURS[prof().cur] || 0));
export const hoursPlanned = () => Math.round(plan.total * 2.6);
export const midLevel = () => LADDER[Math.max(startIdx(), Math.min(targetIdx(), Math.round((startIdx() + targetIdx()) / 2)))];
export const timedFrom = () => Math.max(2, Math.round(plan.total * 0.7));

/** Index of a weekday within its grammar block (0–4), used to pick the day's sub-topic. */
export function weekdayOrdinal(d: number) {
  const bl = blockOf(d);
  let k = -1;
  for (let i = 1; i <= d; i++) {
    const g = dateOf(i).getDay();
    if (g !== 0 && g !== 6 && blockOf(i) === bl) k++;
  }
  return Math.max(0, k) % 5;
}
function wdOrd(d: number) {
  let n = 0;
  for (let i = 1; i <= d; i++) {
    const g = dateOf(i).getDay();
    if (g !== 0 && g !== 6) n++;
  }
  return n;
}
/** Workbook patterns due on a day: 5 a weekday for the first 4 weekdays, then 3. */
export function patternsFor(d: number) {
  const g = dateOf(d).getDay();
  if (g === 0 || g === 6) return [];
  const o = wdOrd(d);
  if (o <= 4) return range((o - 1) * 5, o * 5);
  const s = 20 + (o - 5) * 3;
  if (s >= 100) return [];
  return range(s, Math.min(100, s + 3));
}

export function applyProfile(p: Profile | null) {
  plan.profile = p && p.start ? p : null;
  const P = prof();
  plan.start = parseDate(P.start);
  plan.total = Math.max(14, Math.min(365, +P.days || 90));
  plan.nweeks = Math.ceil(plan.total / 7);
  plan.check = (() => {
    const d = Math.max(2, Math.round(plan.total / 2));
    for (let i = d; i <= Math.min(plan.total, d + 6); i++) if (dateOf(i).getDay() === 6) return i;
    return d;
  })();
  const cut = [0, 0.3, 0.55, 0.85, 1].map((f) => Math.max(1, Math.round(f * plan.total)));
  const lvAt = (d: number) => LEVELS[planLevelKey(d)].code;
  plan.phases = [
    {
      name: B("Fundament", "Foundation"),
      from: 1,
      to: cut[1],
      desc: B(
        "Grundlagen sicher machen (" + lvAt(1) + "): Satzbau, Kernwortschatz, Sprechmuster.",
        "Make the basics solid (" + lvAt(1) + "): sentence structure, core vocabulary, speaking patterns.",
      ),
    },
    {
      name: B("Aufbau", "Build-up"),
      from: cut[1] + 1,
      to: cut[2],
      desc: B(
        "Neue Grammatik und mehr Wörter. Zwischen-Check an Tag " + plan.check + ".",
        "New grammar and more words. Checkpoint on day " + plan.check + ".",
      ),
    },
    {
      name: B("Prüfungstraining", "Exam training"),
      from: cut[2] + 1,
      to: cut[3],
      desc: B(
        "Prüfungsformat " + P.target + ", ab Tag " + timedFrom() + " mit Zeit.",
        "Exam format " + P.target + ", timed from day " + timedFrom() + ".",
      ),
    },
    {
      name: B("Generalprobe", "Dress rehearsal"),
      from: cut[3] + 1,
      to: plan.total,
      desc: B(
        "Wochentests im vollen Prüfungsformat, Fehlerliste, Sprechen polieren.",
        "Weekly mocks in full exam format, error log, polish speaking.",
      ),
    },
  ].filter((x) => x.from <= x.to);
}

/** Run fn as if the given profile were active (used for the onboarding preview). */
export function withProfile<T>(p: Profile, fn: () => T): T {
  const saved = plan.profile;
  applyProfile(p);
  try {
    return fn();
  } finally {
    applyProfile(saved);
  }
}

export function buildDay(d: number): Task[] {
  const dt = dateOf(d),
    dow = dt.getDay(),
    W = weekTheme(d),
    k = weekdayOrdinal(d),
    li = lvIdx(d),
    B1I = LADDER.indexOf("B1");
  const T: Task[] = [],
    pats = patternsFor(d),
    firstOfWeek = (d - 1) % 7 === 0,
    lv = levelFor(d);
  const episode: Task = {
    id: "hoeren",
    s: "hoeren",
    min: 20,
    mod: "episode",
    title: B("Hörspiel: „Die WG am Main“", 'Audio drama: "Die WG am Main"'),
    body: B(
      "Die Folge von heute anhören (höchstens zweimal), dann die Richtig/Falsch-Aufgaben lösen. Danach 3 Sätze laut nachsprechen.",
      "Listen to today's episode (twice at most), then answer the true/false items. Afterwards repeat 3 lines out loud.",
    ),
  };
  if (dow === 0) {
    T.push({
      id: "review",
      s: "wort",
      min: 25,
      mod: "review",
      title: B("Karteikarten: alle fälligen Wörter", "Flashcards: all due words"),
      body: B("Heute keine neuen Wörter. Wiederhole alle fälligen Karten.", "No new words today. Review every due card."),
    });
    T.push({
      id: "wtest",
      s: "test",
      min: 120,
      link: "wochentest",
      title:
        d === plan.check + 1
          ? B("Wochentest (Zwischen-Check, falls gestern nicht gemacht)", "Weekly mock (checkpoint, if not done yesterday)")
          : B("Wochentest: alle vier Module", "Weekly mock: all four modules"),
      body: B(
        "Den Wochentest dieser Woche erstellen und durcharbeiten. Das Ergebnis ins Log übernehmen.",
        "Create and work through this week's mock. Add the result to the log.",
      ),
    });
    T.push({
      id: "song",
      s: "musik",
      min: 15,
      mod: "song",
      title: B("Lied der Woche nochmal", "Song of the week again"),
      body: B("Lückentext ohne Hilfe lösen und laut mitlesen.", "Fill the gaps without help and read along out loud."),
    });
    T.push({
      id: "reflect",
      s: "schreiben",
      min: 10,
      title: B("Wochenrückblick", "Weekly review"),
      body: B(
        "Im Notizfeld: 3 Dinge, die gut liefen, 3 wiederkehrende Fehler, 1 Ziel für nächste Woche. Auf Deutsch.",
        "In the notes field: 3 things that went well, 3 recurring mistakes, 1 goal for next week. In German.",
      ),
    });
    return T;
  }
  T.push({
    id: "wort",
    s: "wort",
    min: 25,
    mod: "vocab",
    title: B(wordsPerDay() + " neue Wörter + Wiederholung", wordsPerDay() + " new words + review"),
    body: B(
      "Wörter des Tages erstellen, Liste mit Aussprache durchgehen, dann Karteikarten lernen.",
      "Create today's words, go through the list with pronunciation, then study the flashcards.",
    ),
  });
  if (d === 1)
    T.push({
      id: "place",
      s: "test",
      min: 30,
      link: "pruefung",
      title: B("Einstufungstest machen", "Take the placement test"),
      body: B(
        "30 Fragen von A1 bis B2 auf der Prüfungsseite. Dein Ergebnis ist der Startpunkt für den Vergleich an Tag " + plan.check + ".",
        "30 questions from A1 to B2 on the Exam page. Your result is the baseline to compare against on day " + plan.check + ".",
      ),
    });
  if (dow === 6) {
    if (d === plan.check) {
      const ml = midLevel();
      T.push({
        id: "mock",
        s: "test",
        min: 120,
        link: "wochentest",
        title: B("Zwischen-Check: Wochentest (" + ml + ")", "Checkpoint: weekly mock (" + ml + ")"),
        body: B(
          "Den Wochentest dieser Woche machen und ins Log übernehmen. Alle Module ab 70 %? Dann bist du im Plan für " +
            prof().target +
            " – buch den Prüfungstermin. Sonst: Plan um ein paar Wochen verlängern (oben rechts beim Namen). Mach auch den Einstufungstest nochmal.",
          "Do this week's mock and add it to the log. All modules at 70% or more? You're on track for " +
            prof().target +
            " – book the exam. If not, extend the plan by a few weeks (top right, under your name). Retake the placement test too.",
        ),
      });
      T.push(episode);
      return T;
    }
    T.push({
      id: "chat",
      s: "sprechen",
      min: 40,
      link: "gespraech",
      title: B("Gesprächspartner: „" + W.talk + "“", 'Conversation partner: "' + W.talk + '"'),
      body:
        li < B1I
          ? B(
              "20 Nachrichten mit Claude zum Thema. Benutze 5 Muster aus dem Heft bewusst.",
              "20 messages with Claude on the topic. Use 5 workbook patterns on purpose.",
            )
          : B(
              "Erst einen kurzen Vortrag schreiben/diktieren, dann mit Claude diskutieren. Benutze Redemittel für Meinung und Gegenargument.",
              "First write/dictate a short talk, then discuss it with Claude. Use phrases for opinion and counter-argument.",
            ),
    });
    T.push({
      id: "gramtest",
      s: "gram",
      min: 20,
      mod: "gramtest",
      title: B("Grammatik-Selbsttest: " + W.g.de, "Grammar self-test: " + W.g.en),
      body: B(
        "10 eigene Sätze mit der Grammatik der Woche schreiben und von Claude korrigieren lassen.",
        "Write 10 sentences with this week's grammar and get Claude to correct them.",
      ),
    });
    T.push(episode);
    return T;
  }
  const sub = W.sub[k];
  T.push({
    id: "gram",
    s: "gram",
    min: 20,
    mod: "grammar",
    title: B(W.g.de + ": " + sub.de, W.g.en + ": " + sub.en),
    body: B(
      "Lektion lesen, Beispiele anhören und nachsprechen, Übungen lösen.",
      "Read the lesson, listen to and repeat the examples, do the exercises.",
    ),
  });
  T.push({
    id: "satzbau",
    s: "gram",
    min: 15,
    mod: "syntax",
    title: B("Satzbau: Subjekt, Verb, Objekt", "Sentence building: subject, verb, object"),
    body: B(
      "8 Sätze aus Bausteinen bauen, dann bei 5 Sätzen Subjekt, Verb, Objekt usw. bestimmen. Jeder Satz zum Anhören.",
      "Build 8 sentences from blocks, then label subject, verb, object etc. in 5 more. Every sentence has audio.",
    ),
  });
  if (k % 2 === 0)
    T.push({
      id: "lesen",
      s: "lesen",
      min: 25,
      mod: "reading",
      title: B("Lesetext zum Thema „" + W.t.de + "“", 'Reading text on "' + W.t.en + '"'),
      body: B("Text lesen, Glossar nutzen, 5 Fragen beantworten.", "Read the text, use the glossary, answer 5 questions."),
    });
  else
    T.push({
      id: "lesen",
      s: "lesen",
      min: 25,
      mod: "story",
      title: B("Roman: nächstes Kapitel", "Novel: next chapter"),
      body: B(
        "Das nächste Kapitel von „Neuanfang in Frankfurt“ lesen und die Fragen beantworten.",
        'Read the next chapter of "Neuanfang in Frankfurt" and answer the questions.',
      ),
    });
  T.push(episode);
  let wr: any,
    timed = d >= timedFrom() && li >= B1I;
  if (k === 0) {
    if (li < B1I)
      wr = {
        title: B("E-Mail an eine Freundin", "Email to a friend"),
        body: B(
          "Ca. " +
            (li <= LADDER.indexOf("A2") ? 60 : 80) +
            " Wörter zum Thema „" +
            W.t.de +
            "“: erzähle etwas, frag etwas, mach einen Vorschlag.",
          "About " +
            (li <= LADDER.indexOf("A2") ? 60 : 80) +
            ' words on "' +
            W.t.en +
            '": tell her something, ask something, suggest something.',
        ),
        task:
          "Schreiben Sie eine E-Mail (ca. " +
          (li <= LADDER.indexOf("A2") ? 60 : 80) +
          " Wörter) an eine Freundin zum Thema „" +
          W.t.de +
          "“: erzählen Sie etwas, stellen Sie eine Frage, machen Sie einen Vorschlag.",
      };
    else
      wr = {
        title: B("Forumsbeitrag: „" + W.forum + "“", 'Forum post: "' + W.forum + '"'),
        body: timed
          ? B(
              "Prüfungsbedingungen: 50 Minuten, mindestens 150 Wörter. Meinung, Gründe, Beispiel, Gegenargument, Schluss.",
              "Exam conditions: 50 minutes, at least 150 words. Opinion, reasons, example, counter-argument, conclusion.",
            )
          : B(
              "Ca. " + (li < LADDER.indexOf("B1+") ? 120 : 150) + " Wörter: Meinung, zwei Gründe, ein Beispiel aus deinem Land.",
              "About " + (li < LADDER.indexOf("B1+") ? 120 : 150) + " words: your opinion, two reasons, an example from your country.",
            ),
        task:
          "Forumsbeitrag (mind. " +
          (li < LADDER.indexOf("B1+") ? 120 : 150) +
          " Wörter) zur Frage: „" +
          W.forum +
          "“ – Meinung, Gründe, Beispiel, Gegenargument, Schluss.",
      };
  } else if (k === 2)
    wr = {
      title: B("Formelle Nachricht", "Formal message"),
      body: B(
        W.formal + (timed ? " 25 Minuten, mindestens 100 Wörter." : " Ca. 80–100 Wörter."),
        W.formal + (timed ? " 25 minutes, at least 100 words." : " About 80–100 words."),
      ),
      task: W.formal + " (ca. 100 Wörter, Anrede, Grund, Bitte, Gruß)",
    };
  else if (k === 4)
    wr = {
      title: B("Text überarbeiten", "Revise your text"),
      body: B(
        "Den Text vom ersten Tag dieser Woche neu und fehlerfrei schreiben – nutze die Korrekturen von Claude.",
        "Rewrite this week's first text cleanly – use Claude's corrections.",
      ),
      task: "Überarbeitete Version eines Textes zum Thema „" + W.t.de + "“.",
    };
  else
    wr = {
      title: B("Tagebuch: 6 Sätze", "Journal: 6 sentences"),
      body: B("Sechs Sätze über deinen Tag mit „" + sub.de + "“.", 'Six sentences about your day using "' + sub.en + '".'),
      task: "Sechs Tagebuchsätze über den eigenen Tag mit der Struktur: " + sub.de + ".",
    };
  T.push({ id: "schreiben", s: "schreiben", min: k === 0 && timed ? 50 : 20, mod: "write", ...wr });
  if (pats.length)
    T.push({
      id: "sprechen",
      s: "sprechen",
      min: 20,
      mod: "patterns",
      pats,
      title: B(
        "Sprechmuster " + (pats[0] + 1) + "–" + (pats[pats.length - 1] + 1),
        "Patterns " + (pats[0] + 1) + "–" + (pats[pats.length - 1] + 1),
      ),
      body: B(
        "Ankerbeispiel anhören und nachsprechen, 3 eigene Sätze schreiben, prüfen lassen, 5-mal laut sagen.",
        "Listen to and repeat the anchor, write 3 sentences of your own, get them checked, say each 5 times out loud.",
      ),
    });
  else
    T.push({
      id: "sprechen",
      s: "sprechen",
      min: 20,
      mod: "talk",
      title: B("Vortrag: „" + W.talk + "“", 'Talk: "' + W.talk + '"'),
      body: B(
        lv.speak + " Minuten sprechen und aufnehmen, dann diktieren/abschreiben und bewerten lassen.",
        "Speak for " + lv.speak + " minutes and record it, then dictate/type it and get it marked.",
      ),
      task:
        "Kurzer Vortrag (" +
        lv.speak +
        " Minuten) zum Thema „" +
        W.talk +
        "“: eigene Erfahrung, Situation im eigenen Land, Vor- und Nachteile, eigene Meinung.",
    });
  T.push({
    id: "dtest",
    s: "test",
    min: 30,
    link: "uebung",
    title: B("Tagestest: alle vier Module", "Daily test: all four modules"),
    body: B("Kurzer Test zum Wochenthema auf deinem Niveau.", "A short test on the week's topic at your level."),
  });
  if (firstOfWeek)
    T.push({
      id: "song",
      s: "musik",
      min: 15,
      mod: "song",
      title: B("Neues Lied der Woche", "New song of the week"),
      body: B("Liedtext anhören, Lücken füllen, laut mitlesen.", "Listen to the lyrics, fill the gaps, read along out loud."),
    });
  return T;
}
