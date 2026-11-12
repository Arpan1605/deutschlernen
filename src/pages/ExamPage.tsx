/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId, useState } from "react";
import { B, tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { EXAM } from "../data/levels";
import { state, cget, cset, saveC, saveDoc, binder, bump } from "../lib/store";
import { plan, prof, hoursNeeded, hoursPlanned } from "../lib/plan";
import { generateJson } from "../lib/ai";
import { placementPrompt } from "../lib/prompts";
import { isoDate } from "../lib/dates";
import { GenerateButton } from "../components/ui/GenerateButton";
import { CheckButton } from "../components/ui/CheckButton";
import { ReadingBlock } from "../components/blocks/ReadingBlock";

const INFO: Record<string, [ReturnType<typeof B>, ReturnType<typeof B>]> = {
  Lesen: [
    B("Texte aus Alltag, Presse und Beruf", "Texts from daily life, press and work"),
    B("Lesetexte, Roman, Tages- und Wochentest", "Reading texts, novel, daily and weekly tests"),
  ],
  Hören: [
    B("Gespräche, Durchsagen, Interviews, Radiobeiträge", "Conversations, announcements, interviews, radio clips"),
    B("Hörspiel, Hörtexte im Test", "Audio drama, listening in tests"),
  ],
  Schreiben: [
    B("Nachrichten, Forumsbeiträge, formelle Texte", "Messages, forum posts, formal texts"),
    B("Tägliche Schreibaufgabe mit Bewertung", "Daily writing task with marking"),
  ],
  Sprechen: [
    B("Sich vorstellen, planen, präsentieren, diskutieren", "Introduce yourself, plan, present, discuss"),
    B("Muster, Vorträge, Gesprächspartner", "Patterns, talks, conversation partner"),
  ],
};

function Placement() {
  const C = cget("place"),
    bind = binder(() => saveC("place"));
  const make = async () => {
    const R = await generateJson(placementPrompt(), (R) => R.questions?.length >= 10);
    cset("place", { kind: "place", day: 0, data: R, st: {} });
  };
  if (!C) return <GenerateButton label={tx(UI.place_start)} onGenerate={make} />;
  const st = (C.st = C.st || {});
  let est = "",
    detail = "";
  if (st.checked) {
    const by: Record<string, [number, number]> = {};
    C.data.questions.forEach((q: any, i: number) => {
      by[q.level] = by[q.level] || [0, 0];
      by[q.level][1]++;
      if (st.answers?.[i] === q.answer) by[q.level][0]++;
    });
    est = "A1";
    ["A1", "A2", "B1", "B2"].forEach((l) => {
      if (by[l] && by[l][0] / by[l][1] >= 0.6) est = l;
    });
    detail = ["A1", "A2", "B1", "B2"]
      .filter((l) => by[l])
      .map((l) => l + " " + by[l][0] + "/" + by[l][1])
      .join(" · ");
  }
  return (
    <>
      <ReadingBlock R={{ questions: C.data.questions }} st={st} onChange={bind.onChange} />
      <CheckButton
        checked={!!st.checked}
        onToggle={() => {
          if (st.checked) C.st = {};
          else st.checked = true;
          bind.onChange();
        }}
      >
        {st.checked && (
          <>
            <span className="score" style={{ marginLeft: 12 }}>
              {tx(UI.place_result)}
              {est}
            </span>
            <span className="note" style={{ marginLeft: 12 }}>
              {detail}
            </span>
          </>
        )}
      </CheckButton>
      <GenerateButton variant="regen" label={tx(UI.regen)} onGenerate={make} />
    </>
  );
}

function ResultsLog() {
  const ids = { d: useId(), l: useId(), h: useId(), s: useId(), sp: useId() };
  const [f, setF] = useState({ date: isoDate(new Date()), l: "", h: "", s: "", sp: "" });
  const num = (v: string) => (v === "" ? null : Math.max(0, Math.min(100, +v)));
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.date) return;
    const m = { id: "m" + Date.now(), date: f.date, level: "Extern", l: num(f.l), h: num(f.h), s: num(f.s), sp: num(f.sp) };
    state.mocks.push(m);
    saveDoc("mocks/" + m.id, m);
    setF({ ...f, l: "", h: "", s: "", sp: "" });
    bump();
  };
  const cell = (v: number | null) =>
    v == null ? <td className="num note">—</td> : <td className={"num " + (v >= 60 ? "pass" : "fail")}>{v} %</td>;
  const rows = [...state.mocks].sort((a, b) => (a.date < b.date ? -1 : 1));
  const field = (k: "l" | "h" | "s" | "sp", label: string) => (
    <label className="f" htmlFor={ids[k]}>
      <span>{label}</span>
      <input type="number" id={ids[k]} min={0} max={100} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </label>
  );
  return (
    <div className="panel stack">
      <form className="formrow" onSubmit={add}>
        <label className="f" htmlFor={ids.d}>
          <span>{tx(UI.date)}</span>
          <input type="date" id={ids.d} required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </label>
        {field("l", tx(UI.m_l))}
        {field("h", tx(UI.m_h))}
        {field("s", tx(UI.m_s))}
        {field("sp", tx(UI.m_sp))}
        <button className="btn primary" type="submit">
          {tx(UI.m_add)}
        </button>
      </form>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>{tx(UI.date)}</th>
              <th>{tx(UI.th_level)}</th>
              <th>Lesen</th>
              <th>Hören</th>
              <th>Schreiben</th>
              <th>Sprechen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((m) => (
                <tr key={m.id}>
                  <td className="num">{m.date}</td>
                  <td className="mono">{m.level || "—"}</td>
                  {cell(m.l)}
                  {cell(m.h)}
                  {cell(m.s)}
                  {cell(m.sp)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="note">
                  {tx(UI.m_none)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Target exam format, placement test, results log and an honest time estimate. */
export function ExamPage() {
  const E = EXAM[prof().target] || EXAM.B2,
    need = hoursNeeded(),
    have = hoursPlanned(),
    ok = have >= need * 0.85;
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{tx(UI.ex_h)}</h2>
          <p className="lead">{tx(UI.ex_lead)}</p>
        </div>
      </div>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>{tx(UI.th_mod)}</th>
              <th>{tx(UI.th_dur)}</th>
              <th>{tx(UI.th_what)}</th>
              <th>{tx(UI.th_train)}</th>
            </tr>
          </thead>
          <tbody>
            {E.mods.map(([m, dur]) => (
              <tr key={m}>
                <td>
                  <b>{m}</b>
                </td>
                <td className="num">{dur}</td>
                <td>{tx(INFO[m][0])}</td>
                <td>{tx(INFO[m][1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sec-title">
        <div>
          <h2>{tx(UI.place_h)}</h2>
          <p className="lead">{tx(UI.place_lead)}</p>
        </div>
      </div>
      <div className="stack">
        <Placement />
      </div>
      <div className="sec-title">
        <div>
          <h2>{tx(UI.mock_h)}</h2>
          <p className="lead">{tx(UI.mock_lead)}</p>
        </div>
      </div>
      <ResultsLog />
      <div className="sec-title">
        <h2>{tx(UI.real_h)}</h2>
      </div>
      <div className="grid2">
        <div className="panel stack">
          <p style={{ margin: 0 }}>
            {tx(
              B(
                "Grobe Schätzung nach Richtwerten des Goethe-Instituts: von " +
                  prof().cur +
                  " bis " +
                  prof().target +
                  " brauchst du etwa " +
                  need +
                  " Lernstunden. Dein Plan (ca. 2½–3 Stunden täglich, " +
                  plan.total +
                  " Tage) bringt rund " +
                  have +
                  " Stunden.",
                "Rough estimate based on Goethe-Institut guidance: from " +
                  prof().cur +
                  " to " +
                  prof().target +
                  " takes about " +
                  need +
                  " study hours. Your plan (about 2½–3 hours a day, " +
                  plan.total +
                  " days) gives around " +
                  have +
                  " hours.",
              ),
            )}
          </p>
          <p style={{ margin: 0 }}>
            {tx(
              ok
                ? B(
                    "Das passt. Bleib dran und nutze den Zwischen-Check an Tag " + plan.check + ", um zu sehen, ob du im Plan bist.",
                    "That fits. Stay consistent and use the checkpoint on day " + plan.check + " to see if you're on track.",
                  )
                : B(
                    "Das ist sehr sportlich. Mehr Tage oder mehr Lernzeit am Wochenende machen das Ziel realistischer – du kannst den Plan oben rechts bei deinem Namen anpassen.",
                    "That's very ambitious. More days or more study time at weekends make the goal more realistic – you can change the plan at the top right, under your name.",
                  ),
            )}
          </p>
        </div>
        <div className="callout">{tx(UI.book_slot)}</div>
      </div>
    </section>
  );
}
