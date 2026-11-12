/** Worksheet sections for each kind of material, plus whole-task, day and test exports. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tx, pickLang, getLang } from "../i18n";
import { UI } from "../../data/strings";
import { SK } from "../../data/skills";
import { PATTERNS } from "../../data/patterns";
import { roleOf } from "../../data/roles";
import { state, cget } from "../store";
import { buildDay, levelFor, weekTheme, weekOf, dateOf, type Task } from "../plan";
import { dueCards } from "../srs";
import { capFirst, pad3, seededShuffle } from "../text";
import { fmt } from "../dates";
import { makePdf, pdfSafe, pt, type Pdf } from "./document";
import type { jsPDF } from "jspdf";

const letter = (i: number) => String.fromCharCode(97 + i);
const why = (q: any) => pickLang(q.why_de, q.why_en);
const tfLabel = (v: boolean) => (v ? tx(UI.true_) : tx(UI.false_));

export const sections = {
  vocab(P: Pdf, C: any, title: string) {
    P.h2(title || pt("words"));
    const ws = C?.data?.words || [];
    if (!ws.length) return P.small(pt("notYet"));
    P.table(
      ["#", "Deutsch", pt("pl"), pt("meaning"), pt("example")],
      ws.map((w: any, i: number) => [
        String(i + 1),
        w.de + (w.pos ? "\n(" + w.pos + ")" : ""),
        w.pl || "",
        w.en || "",
        (w.ex || "") + (w.ex_en ? "\n" + w.ex_en : ""),
      ]),
      [0.05, 0.2, 0.14, 0.18, 0.43],
    );
  },
  grammar(P: Pdf, C: any, title: string) {
    P.h2(title);
    if (!C) return P.small(pt("notYet"));
    const G = C.data;
    if (G.title) P.h3(G.title);
    P.p(pickLang(G.explain_de || G.explain_en, G.explain_en || G.explain_de));
    if (G.table?.head?.length) {
      const n = G.table.head.length;
      P.table(G.table.head, G.table.rows || [], new Array(n).fill(1 / n));
    }
    if (G.examples?.length) {
      P.label(pt("examples"));
      P.list(G.examples.map((e: any) => e.de + "  (" + e.en + ")"));
    }
    if (G.tips?.length) {
      P.label(pt("tips"));
      P.list(G.tips);
    }
    if (G.exercises?.length) {
      P.label(pt("exercises"));
      P.list(
        G.exercises.map((x: any) => x.q.replace(/_{2,}/g, "____________") + (x.hint ? "  (" + x.hint + ")" : "")),
        { num: true },
      );
      P.key(
        title,
        G.exercises.map((x: any, i: number) => i + 1 + ". " + x.answer + (x.alt?.length ? " / " + x.alt.join(" / ") : "")),
      );
    }
  },
  syntax(P: Pdf, C: any, title: string, d: number) {
    P.h2(title);
    if (!C) return P.small(pt("notYet"));
    const S = C.data;
    if (S.build?.length) {
      P.p(pt("build"), { style: "bold" });
      S.build.forEach((it: any, i: number) => {
        const sh = seededShuffle(it.chunks.length, (C.day || d || 1) * 31 + i + 1);
        P.p(i + 1 + ". " + it.en, { col: [88, 97, 116], gap: 0.5 });
        P.p("[ " + sh.map((ci) => it.chunks[ci].t).join(" ]   [ ") + " ]", { indent: 4, gap: 0.5 });
        P.write(1);
      });
      P.key(
        title + " – A",
        S.build.map((it: any, i: number) => i + 1 + ". " + it.full + "  – " + pickLang(it.rule_de, it.rule_en)),
      );
    }
    if (S.label?.length) {
      P.p(pt("label"), { style: "bold" });
      S.label.forEach((it: any, i: number) => {
        P.p(i + 1 + ". " + it.chunks.map((c: any, ci: number) => "[" + (ci === 0 ? capFirst(c.t) : c.t) + "]").join("  ") + ".", {
          gap: 0.5,
        });
        P.small(it.en, 4);
        P.write(1);
      });
      P.key(
        title + " – B",
        S.label.map(
          (it: any, i: number) =>
            i + 1 + ". " + it.chunks.map((c: any, ci: number) => (ci === 0 ? capFirst(c.t) : c.t) + " = " + tx(roleOf(c.r).n)).join("; "),
        ),
      );
    }
  },
  reading(P: Pdf, R: any, title: string) {
    P.h2(title);
    if (!R) return P.small(pt("notYet"));
    if (R.title) P.h3(R.title);
    if (R.texttype) P.label(R.texttype);
    P.p(R.text || "");
    if (R.glossary?.length) {
      P.label(pt("glossary"));
      P.p(R.glossary.map((g: any) => g.de + " = " + g.en).join("  ·  "), { size: 9.5 });
    }
    if (R.questions?.length) {
      P.label(pt("questions"));
      R.questions.forEach((q: any, i: number) => {
        P.p(i + 1 + ". " + q.q, { style: "bold", gap: 0.5 });
        P.list(
          (q.options || []).map((o: string, oi: number) => letter(oi) + ") " + o),
          { indent: 5 },
        );
      });
      P.key(
        title,
        R.questions.map(
          (q: any, i: number) =>
            i + 1 + ". " + letter(q.answer) + ") " + ((q.options || [])[q.answer] || "") + (why(q) ? " – " + why(q) : ""),
        ),
      );
    }
  },
  listening(P: Pdf, H: any, title: string) {
    P.h2(title);
    if (!H) return P.small(pt("notYet"));
    if (H.title) P.h3(H.title);
    if (H.situation) P.p(H.situation, { style: "italic" });
    if (H.questions?.length) {
      P.label(pt("tf"));
      P.list(
        H.questions.map((q: any) => q.statement + "     [ " + tx(UI.true_) + " ]  [ " + tx(UI.false_) + " ]"),
        { num: true },
      );
      P.key(
        title,
        H.questions.map((q: any, i: number) => i + 1 + ". " + tfLabel(q.answer) + (why(q) ? " – " + why(q) : "")),
      );
    }
    if (H.lines?.length)
      P.key(
        title + " – " + pt("transcript"),
        H.lines.map((l: any) => l.speaker + ": " + l.text),
      );
  },
  production(P: Pdf, task: any, st: any, title: string, o: { speak?: boolean; lines?: number } = {}) {
    P.h2(title);
    if (task.task_de) {
      P.label(pt("task"));
      P.box(task.task_de + (task.task_en && getLang() === "en" ? "\n" + task.task_en : ""));
    }
    if (task.points?.length) {
      P.label(pt("points"));
      P.list(task.points);
    }
    if (task.min_words) P.small(pt("minWords").replace("{n}", task.min_words));
    if (o.speak && task.minutes) P.small(pt("speakMin").replace("{n}", task.minutes));
    if (task.phrases?.length) {
      P.label(pt("phrases"));
      P.p(task.phrases.join("  ·  "), { size: 9.5 });
    }
    if (task.followups?.length) {
      P.label(pt("followups"));
      P.list(task.followups);
    }
    P.label(pt("yourText"));
    if (st?.text?.trim()) P.box(st.text);
    else P.write(o.lines || 10);
    const F = st?.feedback;
    if (F) {
      P.label(pt("feedback") + (st.score != null ? " · " + st.score + " %" : ""));
      if (F.summary_de || F.summary_en) P.p(pickLang(F.summary_de, F.summary_en));
      if (F.criteria) P.list(F.criteria.map((c: any) => c.name + ": " + c.score + "/5 – " + pickLang(c.comment_de, c.comment_en)));
      if (F.errors?.length) {
        P.label(pt("errors"));
        P.list(F.errors.map((e: any) => e.wrong + " -> " + e.right + " (" + pickLang(e.rule_de, e.rule_en) + ")"));
      }
      if (F.corrected) {
        P.label(pt("corrected"));
        P.box(F.corrected);
      }
    }
  },
  song(P: Pdf, C: any, title: string) {
    P.h2(title);
    if (!C) return P.small(pt("notYet"));
    const S = C.data;
    if (S.title) P.h3(S.title);
    P.small(pt("gaps"));
    const byLine: Record<number, string[]> = {};
    (S.gaps || []).forEach((g: any) => (byLine[g.l] = byLine[g.l] || []).push(g.w));
    (S.lines || []).forEach((l: string, li: number) => {
      let t = l;
      (byLine[li] || []).forEach((w) => (t = t.replace(w, "__________")));
      P.p(t, { gap: 0.3 });
    });
    P.blank(2);
    if (S.words?.length) {
      P.label(pt("glossary"));
      P.p(S.words.map((w: any) => w.de + " = " + w.en).join("  ·  "), { size: 9.5 });
    }
    P.key(
      title,
      (S.gaps || []).map((g: any, i: number) => i + 1 + ". " + g.w),
    );
  },
  patterns(P: Pdf, ids: number[], title: string) {
    P.h2(title);
    ids.forEach((i) => {
      const pa = PATTERNS[i];
      const mine = (state.pmine[i]?.s || []).filter((x) => x?.trim());
      P.h3("#" + String(i + 1).padStart(2, "0") + "  " + pa[0]);
      P.p(pa[1], { gap: 0.3 });
      P.small(pa[2]);
      P.label(pt("mySent"));
      if (mine.length) P.list(mine, { num: true });
      else P.write(3);
    });
  },
};

export const songKey = (d: number) => "song-w" + String(weekOf(d) + 1).padStart(2, "0");

/** Write one task's material into a PDF. */
export function taskPdf(P: Pdf, d: number, q: Task) {
  const title = tx(q.title),
    k = pad3(d);
  const titled = (C: any, label: string) => C && { ...C.data, title: label + " " + (C.data.no || "") + ": " + (C.data.title || "") };
  switch (q.mod) {
    case "vocab":
      return sections.vocab(P, cget("vocab-d" + k), title);
    case "review":
      return sections.vocab(P, { data: { words: dueCards().map((c) => c.w) } }, title);
    case "grammar":
      return sections.grammar(P, cget("gram-d" + k), title);
    case "syntax":
      return sections.syntax(P, cget("syn-d" + k), title, d);
    case "reading":
      return sections.reading(P, cget("read-d" + k)?.data, title);
    case "story":
      return sections.reading(P, titled(cget("story-d" + k), tx(UI.chapter)), title);
    case "episode":
      return sections.listening(P, titled(cget("ep-d" + k), tx(UI.ep)), title);
    case "song":
      return sections.song(P, cget(songKey(d)), title);
    case "write":
      return sections.production(P, { task_de: q.task || tx(q.body) }, cget("write-d" + k)?.st, title, { lines: 12 });
    case "talk":
      return sections.production(P, { task_de: q.task, minutes: levelFor(d).speak }, cget("talk-d" + k)?.st, title, {
        speak: true,
        lines: 8,
      });
    case "gramtest": {
      const W = weekTheme(d);
      return sections.production(
        P,
        { task_de: "10 eigene Sätze mit: " + W.g.de + " (" + W.sub.map((s) => s.de).join("; ") + ")" },
        cget("gt-d" + k)?.st,
        title,
        { lines: 12 },
      );
    }
    case "patterns":
      return sections.patterns(P, q.pats || [], title);
    default:
      P.h2(title);
      P.p(tx(q.body));
  }
}

export function testPdf(P: Pdf, G: any, T: any, weekly: boolean) {
  const arr = (x: any) => (Array.isArray(x) ? x : x ? [x] : []);
  const st = (k: string, i: number) => (weekly ? (T[k] || [])[i] || {} : T[k] || {});
  const n = (i: number) => (weekly ? " " + (i + 1) : "");
  arr(G.lesen).forEach((R: any, i: number) => sections.reading(P, R, tx(UI.lesen) + n(i)));
  arr(G.hoeren).forEach((H: any, i: number) => sections.listening(P, H, tx(UI.hoeren) + n(i)));
  arr(G.schreiben).forEach((S: any, i: number) => sections.production(P, S, st("schreiben", i), tx(UI.schreiben) + n(i), { lines: 14 }));
  if (G.sprechen) sections.production(P, G.sprechen, T.sprechen || {}, tx(UI.sprechen), { speak: true, lines: 8 });
}

/* ---------- ready-made builders used by the PDF buttons ---------- */
export type Builder = (JS: typeof jsPDF) => ArrayBuffer;
const fnSafe = (s: string) =>
  pdfSafe(s)
    .replace(/[^A-Za-z0-9äöüÄÖÜß\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
const sub = (d: number) => tx(UI.day) + " " + d + " · " + fmt(dateOf(d)) + " · " + tx(UI.level) + " " + levelFor(d).code;

export const taskBuilder = (d: number, q: Task): [Builder, string] => [
  (JS) => {
    const P = makePdf(JS, tx(q.title), sub(d));
    taskPdf(P, d, q);
    return P.finish();
  },
  "Fahrplan_Tag-" + pad3(d) + "_" + fnSafe(tx(SK[q.s])) + ".pdf",
];

export const dayBuilder = (d: number): [Builder, string] => [
  (JS) => {
    const P = makePdf(
      JS,
      tx(UI.day) + " " + d + " – " + tx(weekTheme(d).t),
      fmt(dateOf(d)) + " · " + tx(UI.level) + " " + levelFor(d).code,
    );
    const tasks = buildDay(d);
    P.h2(pt("plan"));
    P.list(tasks.map((q) => "[  ]  " + tx(SK[q.s]) + ": " + tx(q.title) + " (" + q.min + " min)"));
    tasks.filter((q) => q.mod).forEach((q) => taskPdf(P, d, q));
    const T = state.tests["d" + pad3(d)];
    if (T?.gen) {
      P.newPage();
      P.h1(tx(UI.u_title));
      testPdf(P, T.gen, T, false);
    }
    return P.finish();
  },
  "Fahrplan_Tag-" + pad3(d) + ".pdf",
];
