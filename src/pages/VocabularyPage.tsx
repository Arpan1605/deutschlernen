import { useId, useState } from "react";
import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { state } from "../lib/store";
import { plan, todayIdx, weekOf, weekTheme, wordGoal, wordTarget } from "../lib/plan";
import { dueCards, learnedCount, type Word } from "../lib/srs";
import { nf, norm, range } from "../lib/text";
import { getLang } from "../lib/i18n";
import { makePdf } from "../lib/pdf/document";
import { sections } from "../lib/pdf/sections";
import { Flashcards } from "../components/blocks/Flashcards";
import { VocabTable } from "../components/blocks/VocabTable";
import { PdfButton } from "../components/ui/PdfButton";

/** Words learned per week against the plan's target line. */
function VocabChart() {
  const W = 640,
    H = 220,
    l = 44,
    r = 12,
    tp = 12,
    b = 28,
    N = plan.nweeks,
    goal = wordGoal();
  const maxY = Math.max(500, Math.ceil((goal * 1.07) / 500) * 500),
    step = maxY > 2000 ? 1000 : 500;
  const sx = (wk: number) => l + (wk * (W - l - r)) / N,
    sy = (v: number) => tp + (H - tp - b) * (1 - v / maxY);
  const target = [[0, 0], ...range(1, N + 1).map((i) => [i, wordTarget(Math.min(plan.total, i * 7))])];
  const perWeek = new Array(N).fill(0);
  for (const c of Object.values(state.content))
    if (c?.kind === "vocab" && c.st?.cards) perWeek[weekOf(c.day)] += Object.keys(c.st.cards).length;
  let cum = 0;
  const act = [
    [0, 0],
    ...range(0, weekOf(todayIdx()) + 1).map((i) => {
      cum += perWeek[i];
      return [i + 1, cum];
    }),
  ];
  const pts = (a: number[][]) => a.map((p) => sx(p[0]) + "," + sy(p[1])).join(" ");
  const last = act[act.length - 1],
    wl = getLang() === "de" ? "W" : "Wk";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block", marginTop: 8 }}
      role="img"
      aria-label="Vocabulary progress"
    >
      {range(0, Math.floor(maxY / step) + 1)
        .map((i) => i * step)
        .map((v) => (
          <g key={v}>
            <line x1={l} x2={W - r} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={l - 6} y={sy(v) + 4} textAnchor="end" fontSize={10}>
              {nf(v)}
            </text>
          </g>
        ))}
      {range(1, N + 1)
        .filter((i) => (i - 1) % Math.max(1, Math.ceil(N / 7)) === 0)
        .map((i) => (
          <text key={i} x={sx(i)} y={H - 8} textAnchor="middle" fontSize={10}>
            {wl + i}
          </text>
        ))}
      <polyline points={pts(target)} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={sx(N) - 4} y={sy(goal) - 8} textAnchor="end" fontSize={10}>
        {getLang() === "de" ? "Ziel" : "Target"}
      </text>
      <polygon points={pts(act) + " " + sx(last[0]) + "," + sy(0)} fill="var(--signal)" fillOpacity={0.22} />
      <polyline points={pts(act)} fill="none" stroke="var(--signal)" strokeWidth={2.5} />
      <circle cx={sx(last[0])} cy={sy(last[1])} r={4} fill="var(--signal)" stroke="var(--ink)" strokeWidth={1.5} />
    </svg>
  );
}

export function VocabularyPage() {
  const searchId = useId();
  const [drill, setDrill] = useState(false);
  const [q, setQ] = useState("");
  const due = dueCards();
  const all: (Word & { day: number })[] = [];
  Object.keys(state.content)
    .filter((k) => state.content[k]?.kind === "vocab")
    .sort()
    .forEach((k) => {
      const c = state.content[k];
      (c.data?.words || []).forEach((w: Word) => all.push({ ...w, day: c.day }));
    });
  const shown = all.filter((w) => !q || norm(w.de + " " + w.en).includes(norm(q))).slice(0, 600);
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{tx(UI.vocab_h)}</h2>
          <p className="lead">{tx(UI.vocab_lead)}</p>
        </div>
      </div>
      <div className="grid2">
        <div className="stack">
          <div className="panel stack">
            <div className="pdfbar">
              <PdfButton
                label={tx(UI.pdf_all_words)}
                make={() => [
                  (JS) => {
                    const P = makePdf(JS, tx(UI.vocab_h), nf(learnedCount()) + " " + tx(UI.learned));
                    Object.keys(state.content)
                      .filter((k) => state.content[k]?.kind === "vocab")
                      .sort()
                      .forEach((k) => {
                        const c = state.content[k];
                        sections.vocab(P, c, tx(UI.day) + " " + c.day + " · " + tx(weekTheme(c.day).t));
                      });
                    return P.finish();
                  },
                  "Fahrplan_Wortschatz.pdf",
                ]}
              />
            </div>
            {drill ? (
              <Flashcards cards={due} onDone={() => setDrill(false)} />
            ) : (
              <>
                <h3 style={{ fontSize: 22 }}>{tx(UI.fc_due).replace("{n}", String(due.length))}</h3>
                {due.length ? (
                  <div>
                    <button className="btn primary" onClick={() => setDrill(true)}>
                      {tx(UI.fc_learn)}
                    </button>
                  </div>
                ) : (
                  <p className="note" style={{ margin: 0 }}>
                    {tx(UI.fc_none)}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="panel">
            <div className="eyebrow">{tx(UI.vocab_chart)}</div>
            <VocabChart />
          </div>
          <div className="panel stack">
            <label className="f" htmlFor={searchId}>
              {tx(UI.v_search)}
            </label>
            <input type="text" id={searchId} value={q} onChange={(e) => setQ(e.target.value)} />
            {shown.length ? (
              <VocabTable words={shown} dayLabel={(w) => tx(UI.day) + " " + (w as Word & { day: number }).day} />
            ) : (
              <p className="note">{tx(UI.fc_none)}</p>
            )}
          </div>
        </div>
        <aside className="stack">
          <div className="panel stack">
            <div className="eyebrow">{tx(UI.status)}</div>
            <div className="stat-row" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
              <div className="stat">
                <div className="n">{nf(learnedCount())}</div>
                <div className="l">{tx(UI.learned)}</div>
              </div>
              <div className="stat">
                <div className="n">{nf(wordTarget(todayIdx()))}</div>
                <div className="l">{tx(UI.targetToday)}</div>
              </div>
            </div>
          </div>
          <div className="callout">{tx(UI.vocab_claim)}</div>
        </aside>
      </div>
    </section>
  );
}
