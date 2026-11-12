import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { state, saveWeek, saveDoc, binder } from "../lib/store";
import { plan, dateOf, levelFor, weekTheme, todayIdx, weekOf } from "../lib/plan";
import { generateJson } from "../lib/ai";
import { weeklyTestPrompt } from "../lib/prompts";
import { isoDate, short } from "../lib/dates";
import { useApp } from "../lib/appContext";
import { makePdf } from "../lib/pdf/document";
import { testPdf } from "../lib/pdf/sections";
import { GenerateButton } from "../components/ui/GenerateButton";
import { PdfButton } from "../components/ui/PdfButton";
import { TestModules, ScoreGrid, testScores } from "../components/blocks/TestModules";

/** A bigger exam-format mock for each plan week; results go into the log. */
export function WeeklyTestPage() {
  const { week: w, setWeek } = useApp();
  const lastDay = Math.min(plan.total, w * 7 + 7),
    lv = levelFor(lastDay),
    W = weekTheme(lastDay);
  const k = "w" + String(w + 1).padStart(2, "0"),
    T = state.wtests[k],
    bind = binder(() => saveWeek(w));
  const make = async (again = false) => {
    const R = await generateJson(
      weeklyTestPrompt(w) + (again ? "\nErstelle eine NEUE Variante mit anderen Texten." : ""),
      (R) => R.lesen && R.hoeren,
    );
    state.wtests[k] = { week: w + 1, gen: R, lesen: [{}, {}], hoeren: [{}, {}], schreiben: [{}, {}], sprechen: {} };
    bind.onChange();
  };
  const sc = T?.gen ? testScores(T.gen, T) : null;
  const complete = sc && [sc.l, sc.h, sc.s, sc.sp].every((v) => v != null);
  const log = () => {
    if (!sc) return;
    const m = {
      id: "wt" + (w + 1) + "-" + Date.now(),
      date: isoDate(new Date()),
      level: "W" + (w + 1) + " · " + lv.code,
      l: sc.l,
      h: sc.h,
      s: sc.s,
      sp: sc.sp,
    };
    state.mocks.push(m);
    saveDoc("mocks/" + m.id, m);
    T.logged = true;
    bind.onChange();
  };
  return (
    <section className="view">
      <div className="dayhead">
        <div>
          <div className="eyebrow">
            {tx(UI.level)} {lv.code} · {tx(W.t)} · {tx(W.g)}
          </div>
          <h1>
            {tx(UI.w_title)} · {tx(UI.week)} {w + 1}
          </h1>
          <div className="sub">
            {short(dateOf(w * 7 + 1))} – {short(dateOf(lastDay))}
          </div>
        </div>
        <div className="daynav">
          <button className="btn" disabled={w <= 0} onClick={() => setWeek(w - 1)}>
            {tx(UI.prevWeek)}
          </button>
          <button className="btn" onClick={() => setWeek(weekOf(todayIdx()))}>
            {tx(UI.thisWeekBtn)}
          </button>
          <button className="btn" disabled={w >= plan.nweeks - 1} onClick={() => setWeek(w + 1)}>
            {tx(UI.nextWeek)}
          </button>
        </div>
      </div>
      <p className="lead" style={{ margin: "-6px 0 18px" }}>
        {tx(UI.w_lead)}
      </p>
      <div className="stack">
        {!T?.gen ? (
          <GenerateButton label={tx(UI.gen_week)} note={tx(UI.includes_w)} onGenerate={() => make()} />
        ) : (
          <>
            <div className="panel stack">
              <ScoreGrid sc={sc!} />
              <div className="note">{tx(UI.passmark)}</div>
              {complete ? (
                <div>
                  <button className="btn primary" disabled={!!T.logged} onClick={log}>
                    {T.logged ? tx(UI.logged) : tx(UI.to_log)}
                  </button>
                </div>
              ) : (
                <div className="note">{tx(UI.need_all)}</div>
              )}
              <div className="pdfbar">
                <PdfButton
                  label={tx(UI.pdf_test)}
                  make={() => [
                    (JS) => {
                      const P = makePdf(
                        JS,
                        tx(UI.w_title) + " · " + tx(UI.week) + " " + (w + 1),
                        short(dateOf(w * 7 + 1)) + " – " + short(dateOf(lastDay)) + " · " + tx(UI.level) + " " + lv.code + " · " + tx(W.t),
                      );
                      testPdf(P, T.gen, T, true);
                      return P.finish();
                    },
                    "Fahrplan_Wochentest-" + String(w + 1).padStart(2, "0") + ".pdf",
                  ]}
                />
              </div>
            </div>
            <TestModules G={T.gen} T={T} lv={lv} {...bind} />
            <GenerateButton variant="regen" label={tx(UI.regen)} onGenerate={() => make(true)} />
          </>
        )}
      </div>
    </section>
  );
}
