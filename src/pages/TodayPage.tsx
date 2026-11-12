import { useId, useState } from "react";
import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { TIPS } from "../data/tips";
import { LADDER, LEVELS } from "../data/levels";
import { state, dayData, saveDay, saveDoc, saveState, bump } from "../lib/store";
import {
  plan,
  buildDay,
  dateOf,
  todayIdx,
  phaseOf,
  weekOf,
  weekTheme,
  levelFor,
  planLevelKey,
  startIdx,
  targetIdx,
  wordGoal,
} from "../lib/plan";
import { totals } from "../lib/progress";
import { fmt } from "../lib/dates";
import { nf } from "../lib/text";
import { useApp } from "../lib/appContext";
import { dayBuilder } from "../lib/pdf/sections";
import { TaskCard } from "../components/tasks/TaskCard";
import { PdfButton } from "../components/ui/PdfButton";

export function DayNav({ d, setD }: { d: number; setD: (d: number) => void }) {
  return (
    <div className="daynav">
      <button className="btn" disabled={d <= 1} onClick={() => setD(d - 1)}>
        {tx(UI.prev)}
      </button>
      <button className="btn" onClick={() => setD(todayIdx())}>
        {tx(UI.today)}
      </button>
      <button className="btn" disabled={d >= plan.total} onClick={() => setD(d + 1)}>
        {tx(UI.next)}
      </button>
    </div>
  );
}

function Sidebar({ d }: { d: number }) {
  const ids = { lvl: useId(), note: useId() };
  const { full, words, streak } = totals();
  const tasks = buildDay(d),
    x = dayData(d),
    n = tasks.filter((q) => x.done?.[q.id]).length;
  const path = LADDER.slice(startIdx(), Math.max(startIdx(), targetIdx()) + 1),
    on = path.indexOf(levelFor(d).code);
  return (
    <aside className="stack">
      <div className="panel stack">
        <div className="eyebrow">{tx(UI.progress)}</div>
        <div className="stat-row">
          <div className="stat">
            <div className="n">{full}</div>
            <div className="l">{tx(UI.s_days)}</div>
          </div>
          <div className="stat">
            <div className="n">{streak}</div>
            <div className="l">{tx(UI.s_streak)}</div>
          </div>
          <div className="stat">
            <div className="n">{nf(words)}</div>
            <div className="l">{tx(UI.s_words)}</div>
          </div>
        </div>
        <div>
          <div className="note">{tx(UI.todayOf).replace("{n}", String(n)).replace("{t}", String(tasks.length))}</div>
          <div className="meter">
            <i style={{ width: (100 * n) / tasks.length + "%" }} />
          </div>
        </div>
        <div>
          <div className="note">{tx(UI.goal3000)}</div>
          <div className="meter">
            <i style={{ width: Math.min(100, (100 * words) / Math.max(1, wordGoal())) + "%" }} />
          </div>
        </div>
        <div>
          <div className="note">{tx(UI.levelpath)}</div>
          <div className="lvl-strip" style={{ gridTemplateColumns: `repeat(${path.length},minmax(0,1fr))` }}>
            {path.map((l, i) => (
              <span key={l} className={i <= on ? "on" : ""}>
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="lvlpick">
          <label className="f" htmlFor={ids.lvl}>
            {tx(UI.lvl_label)}
          </label>
          <select
            id={ids.lvl}
            value={state.settings.level || "auto"}
            onChange={(e) => {
              state.settings.level = e.target.value;
              saveDoc("meta/settings", state.settings);
              bump();
            }}
          >
            <option value="auto">
              {tx(UI.lvl_auto)} ({LEVELS[planLevelKey(d)].code})
            </option>
            {LADDER.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <div className="note">{tx(UI.lvl_hint)}</div>
        </div>
      </div>
      <div className="panel stack">
        <label className="f" htmlFor={ids.note}>
          {tx(UI.notesLabel)}
        </label>
        <textarea
          id={ids.note}
          key={"note" + d}
          defaultValue={x.note || ""}
          placeholder={tx(UI.notesPh)}
          onChange={(e) => {
            x.note = e.target.value;
            saveDay(d);
          }}
        />
        <div className="save-state">{tx(UI[saveState.status])}</div>
      </div>
      <div className="callout">{tx(TIPS[(d - 1) % TIPS.length])}</div>
    </aside>
  );
}

export function TodayPage() {
  const { day: d, setDay } = useApp();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const W = weekTheme(d),
    ph = plan.phases[phaseOf(d)],
    tasks = buildDay(d);
  const total = tasks.reduce((a, q) => a + q.min, 0);
  const toggle = (id: string) => {
    const s = new Set(open);
    const k = d + ":" + id;
    if (s.has(k)) s.delete(k);
    else s.add(k);
    setOpen(s);
  };
  return (
    <section className="view">
      <div className="dayhead">
        <div>
          <div className="eyebrow">
            {ph ? tx(ph.name) : ""} · {tx(UI.week)} {weekOf(d) + 1} · {tx(W.t)}
          </div>
          <h1>
            {tx(UI.day)} {d}
          </h1>
          <div className="sub">
            {fmt(dateOf(d))}
            {d === todayIdx() ? " · " + tx(UI.today_lc) : ""}
          </div>
        </div>
        <DayNav d={d} setD={setDay} />
      </div>
      <div className="pdfbar" style={{ margin: "-8px 0 14px" }}>
        <PdfButton label={tx(UI.pdf_day)} make={() => dayBuilder(d)} />
      </div>
      <div className="focusbar">
        {[
          [UI.theme, tx(W.t)],
          [UI.grammar, tx(W.g)],
          [UI.level, levelFor(d).code],
        ].map(([k, v], i) => (
          <span key={i} className="chip">
            <span className="k">{tx(k as never)}</span>
            {v as string}
          </span>
        ))}
      </div>
      <div className="grid2">
        <ul className="tasks">
          {tasks.map((q) => (
            <TaskCard key={d + q.id} d={d} q={q} open={open.has(d + ":" + q.id)} onToggle={() => toggle(q.id)} />
          ))}
          <li className="task" style={{ gridTemplateColumns: "1fr auto" }}>
            <div className="note">{tx(UI.planned)}</div>
            <div className="mono">
              {Math.floor(total / 60)} h {total % 60} min
            </div>
          </li>
        </ul>
        <Sidebar d={d} />
      </div>
    </section>
  );
}
