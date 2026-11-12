import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";

/** "Check" / "Try again" toggle used under every auto-marked exercise. */
export function CheckButton({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div className="player">
      <button type="button" className="btn primary" onClick={onToggle}>
        {checked ? tx(UI.reset) : tx(UI.check)}
      </button>
      {children}
    </div>
  );
}

export function Score({ value }: { value: number | null | undefined }) {
  if (value == null) return null;
  return <span className={"score " + (value >= 60 ? "pass" : "fail")}>{value} %</span>;
}
