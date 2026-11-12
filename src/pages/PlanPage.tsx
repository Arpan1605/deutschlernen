import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { plan, dateOf, todayIdx, phaseOf, weekTheme } from "../lib/plan";
import { dayStatus } from "../lib/progress";
import { fmt, short } from "../lib/dates";
import { range } from "../lib/text";
import { useApp } from "../lib/appContext";
import { go } from "../lib/router";

const PHASE_COLORS = ["var(--c-lesen)", "var(--c-sprechen)", "var(--c-schreiben)", "var(--signal)"];

/** Stages and every week with its topic, grammar, tasks and clickable days. */
export function PlanPage() {
  const { setDay } = useApp();
  const t = todayIdx();
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{tx(UI.plan_h)}</h2>
          <p className="lead">{tx(UI.plan_lead)}</p>
        </div>
      </div>
      <div className="phases">
        {plan.phases.map((p, i) => (
          <div key={i} className="phase" style={{ borderTopColor: PHASE_COLORS[i] }}>
            <div className="eyebrow">
              {tx(UI.day)} {p.from}–{p.to}
            </div>
            <h3>{tx(p.name)}</h3>
            <p>{tx(p.desc)}</p>
          </div>
        ))}
      </div>
      <div className="weeks">
        {range(0, plan.nweeks).map((i) => {
          const from = i * 7 + 1,
            to = Math.min(plan.total, i * 7 + 7),
            W = weekTheme(from),
            ph = plan.phases[phaseOf(from)];
          return (
            <div key={i} className="week">
              <div>
                <div className="eyebrow">
                  {tx(UI.week)} {i + 1}
                </div>
                <div className="mono note">
                  {short(dateOf(from))} – {short(dateOf(to))}
                </div>
              </div>
              <div>
                <span className="phase-tag">{ph ? tx(ph.name) : ""}</span>
                <h3>{tx(W.t)}</h3>
                <div className="daydots">
                  {range(from, to + 1).map((d) => {
                    const st = dayStatus(d);
                    return (
                      <button
                        key={d}
                        className={"daydot" + (st === 2 ? " full" : st === 1 ? " part" : "") + (d === t ? " today" : "")}
                        style={d === plan.check ? { borderStyle: "double" } : undefined}
                        title={fmt(dateOf(d)) + (d === plan.check ? " · Check" : "")}
                        aria-label={tx(UI.open_day) + " " + d}
                        onClick={() => {
                          setDay(d);
                          go("heute");
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="note">
                <div>
                  <b>{tx(UI.grammar)}: </b>
                  {tx(W.g)}
                </div>
                <div>
                  <b>{tx(UI.forum)}: </b>
                  {W.forum}
                </div>
                <div>
                  <b>{tx(UI.talk)}: </b>
                  {W.talk}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
