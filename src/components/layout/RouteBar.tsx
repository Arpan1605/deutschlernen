import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { plan, todayIdx } from "../../lib/plan";
import { dayStatus } from "../../lib/progress";

/** The whole plan as a railway line: one stop per day, coloured by progress, with stage boundaries. */
export function RouteBar({ current }: { current: number }) {
  const x0 = 8,
    x1 = 992,
    y = 22,
    T = plan.total,
    t = todayIdx();
  const sx = (d: number) => x0 + ((d - 1) * (x1 - x0)) / Math.max(1, T - 1);
  const dots = [];
  for (let d = 1; d <= T; d++) {
    const st = dayStatus(d),
      cur = d === current,
      chk = d === plan.check;
    const r = cur ? 6 : chk ? 4.5 : d % 7 === 1 ? 3.5 : T > 120 ? 1.4 : 2.2;
    dots.push(
      <circle
        key={d}
        cx={sx(d)}
        cy={y}
        r={r}
        fill={cur ? "var(--signal)" : st === 2 ? "var(--ok)" : st === 1 ? "var(--signal)" : "var(--surface)"}
        stroke={cur ? "var(--ink)" : st ? "none" : chk ? "var(--ink)" : "var(--muted)"}
        strokeWidth={cur ? 2 : chk ? 1.5 : 0.8}
      />,
    );
  }
  return (
    <div className="route">
      <div className="wrap">
        <svg className="route-svg" viewBox="0 0 1000 46" preserveAspectRatio="none" aria-label={"Progress over " + T + " days"}>
          <line x1={x0} x2={x1} y1={y} y2={y} stroke="var(--line)" strokeWidth={4} strokeLinecap="round" />
          <line x1={x0} x2={sx(t)} y1={y} y2={y} stroke="var(--ink)" strokeWidth={4} strokeLinecap="round" />
          {plan.phases
            .filter((p) => p.from > 1)
            .map((p) => (
              <line
                key={p.from}
                x1={sx(p.from) - 5}
                x2={sx(p.from) - 5}
                y1={8}
                y2={36}
                stroke="var(--muted)"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            ))}
          {dots}
        </svg>
        <div className="route-legend">
          {plan.phases.map((p) => (
            <span key={p.from}>
              {tx(p.name)} · {tx(UI.day)} {p.from}–{p.to}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
