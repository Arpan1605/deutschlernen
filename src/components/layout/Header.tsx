import { tx, getLang, setLangValue, type Lang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { plan, phaseOf, todayIdx, weekOf, prof } from "../../lib/plan";
import { state, bump } from "../../lib/store";
import { ROUTES, type Route } from "../../lib/router";
import { useApp } from "../../lib/appContext";

export function LangSwitch({ className = "langsw" }: { className?: string }) {
  const set = (l: Lang) => {
    if (l !== getLang()) {
      setLangValue(l);
      bump();
    }
  };
  return (
    <div className={className} role="group" aria-label="Sprache / Language">
      <button type="button" aria-pressed={getLang() === "de"} onClick={() => set("de")}>
        DE
      </button>
      <button type="button" aria-pressed={getLang() === "en"} onClick={() => set("en")}>
        EN
      </button>
    </div>
  );
}

function UserChip() {
  const { openProfile } = useApp();
  const p = state.profile;
  if (!p?.name) return null;
  return (
    <button type="button" className="userchip" title={tx(UI.ob_title_edit)} onClick={openProfile}>
      <span className="av">{p.name.trim().charAt(0).toUpperCase()}</span>
      <span>{p.name}</span>
    </button>
  );
}

/** Dark departure-board header: target level, day/week/stage counters, tabs, user and language. */
export function Header({ route }: { route: Route }) {
  const t = todayIdx(),
    p = plan.phases[phaseOf(t)];
  const meta: [string, string][] = [
    [tx(UI.day), t + "/" + plan.total],
    [tx(UI.week), weekOf(t) + 1 + "/" + plan.nweeks],
    [tx(UI.stage), p ? tx(p.name) : "—"],
    [tx(UI.left), plan.total - t + " " + tx(UI.days)],
  ];
  return (
    <header className="board">
      <div className="wrap">
        <div className="brand">
          <span className="sign">{prof().target}</span>Fahrplan
        </div>
        <div className="board-meta">
          {meta.map(([k, v]) => (
            <span key={k}>
              {k} <b>{v}</b>
            </span>
          ))}
        </div>
        <nav className="tabs" aria-label="Sections">
          {ROUTES.map(([r, k]) => (
            <a key={r} href={"#" + r} aria-current={r === route ? "page" : undefined}>
              {tx(UI[k])}
            </a>
          ))}
        </nav>
        <UserChip />
        <LangSwitch />
      </div>
    </header>
  );
}
