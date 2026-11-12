import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { Score } from "./CheckButton";

const COLORS: Record<string, string> = {
  lesen: "var(--c-lesen)",
  hoeren: "var(--c-hoeren)",
  schreiben: "var(--c-schreiben)",
  sprechen: "var(--c-sprechen)",
};

/** Card frame for one exam module (Lesen, Hören, Schreiben, Sprechen) with its score. */
export function ModShell({
  kind,
  score,
  label,
  children,
}: {
  kind: "lesen" | "hoeren" | "schreiben" | "sprechen";
  score?: number | null;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mod">
      <div className="mod-h">
        <h3 style={{ color: COLORS[kind] }}>
          <span style={{ color: "var(--ink)" }}>{tx(UI[kind])}</span>
        </h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {label && <span className="eyebrow">{label}</span>}
          <Score value={score} />
        </div>
      </div>
      <div className="mod-b">{children}</div>
    </div>
  );
}
