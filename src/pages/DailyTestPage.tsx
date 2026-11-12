import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { state, saveTest, binder } from "../lib/store";
import { dateOf, levelFor, todayIdx, weekOf, weekTheme } from "../lib/plan";
import { generateJson } from "../lib/ai";
import { dailyTestPrompt } from "../lib/prompts";
import { fmt } from "../lib/dates";
import { pad3 } from "../lib/text";
import { useApp } from "../lib/appContext";
import { makePdf } from "../lib/pdf/document";
import { testPdf } from "../lib/pdf/sections";
import { GenerateButton } from "../components/ui/GenerateButton";
import { PdfButton } from "../components/ui/PdfButton";
import { TestModules, ScoreGrid, testScores } from "../components/blocks/TestModules";
import { DayNav } from "./TodayPage";

/** A short four-module test for the selected day. */
export function DailyTestPage() {
  const { day: d, setDay } = useApp();
  const lv = levelFor(d),
    W = weekTheme(d),
    k = "d" + pad3(d),
    T = state.tests[k],
    bind = binder(() => saveTest(d));
  const make = async (again = false) => {
    const R = await generateJson(
      dailyTestPrompt(d) + (again ? "\nErstelle eine NEUE Variante mit anderer Situation." : ""),
      (R) => R.lesen && R.hoeren,
    );
    state.tests[k] = { day: d, gen: R, lesen: {}, hoeren: {}, schreiben: {}, sprechen: {} };
    bind.onChange();
  };
  return (
    <section className="view">
      <div className="dayhead">
        <div>
          <div className="eyebrow">
            {tx(UI.level)} {lv.code} · {tx(UI.week)} {weekOf(d) + 1} · {tx(W.t)}
          </div>
          <h1>
            {tx(UI.u_title)} · {tx(UI.day)} {d}
          </h1>
          <div className="sub">
            {fmt(dateOf(d))}
            {d === todayIdx() ? " · " + tx(UI.today_lc) : ""}
          </div>
        </div>
        <DayNav d={d} setD={setDay} />
      </div>
      <p className="lead" style={{ margin: "-6px 0 18px" }}>
        {tx(UI.u_lead)}
      </p>
      <div className="stack">
        {!T?.gen ? (
          <GenerateButton label={tx(UI.gen_daily)} note={tx(UI.includes_d)} onGenerate={() => make()} />
        ) : (
          <>
            <ScoreGrid sc={testScores(T.gen, T)} />
            <div className="pdfbar">
              <PdfButton
                label={tx(UI.pdf_test)}
                make={() => [
                  (JS) => {
                    const P = makePdf(
                      JS,
                      tx(UI.u_title) + " · " + tx(UI.day) + " " + d,
                      fmt(dateOf(d)) + " · " + tx(UI.level) + " " + lv.code + " · " + tx(W.t),
                    );
                    testPdf(P, T.gen, T, false);
                    return P.finish();
                  },
                  "Fahrplan_Tagestest-" + pad3(d) + ".pdf",
                ]}
              />
            </div>
            <TestModules G={T.gen} T={T} lv={lv} {...bind} />
            <GenerateButton variant="regen" label={tx(UI.regen)} onGenerate={() => make(true)} />
          </>
        )}
      </div>
    </section>
  );
}
