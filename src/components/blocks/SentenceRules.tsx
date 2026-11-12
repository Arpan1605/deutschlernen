import { tx, getLang } from "../../lib/i18n";
import { ROLES, ROLE_KEYS } from "../../data/roles";
import { RULES_INTRO, RULES_MORE, RULES_EXAMPLES, SLOT_ROWS, SLOT_HEAD } from "../../data/sentenceRules";
import { SpeakButton } from "../ui/SpeakButton";

/** Colour key for sentence-part roles. */
export function RoleLegend({ only }: { only?: string[] }) {
  return (
    <div className="legend">
      {(only || ROLE_KEYS).map((k) => {
        const R = ROLES[k];
        return R ? (
          <span key={k} style={{ "--rc": R.c } as React.CSSProperties}>
            {tx(R.n)} · {tx(R.q)}
          </span>
        ) : null;
      })}
    </div>
  );
}

/** Collapsible explainer: verb in position 2, the slot table, subordinate clauses, TeKaMoLo, object order, "nicht". */
export function SentenceRules({ open = false }: { open?: boolean }) {
  return (
    <details className="rules" open={open}>
      <summary>{getLang() === "de" ? "So ist ein deutscher Satz gebaut" : "How a German sentence is built"}</summary>
      <div className="stack" style={{ marginTop: 10 }}>
        <div className="explain">{tx(RULES_INTRO)}</div>
        <div style={{ overflowX: "auto" }}>
          <table className="gtable slots">
            <thead>
              <tr>
                {SLOT_HEAD.map((h, i) => (
                  <th key={i}>{tx(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOT_ROWS.map((r, i) => {
                const full = ((r[1] === "—" ? "" : r[1] + " ") + r[2] + " " + r[3] + (r[4] === "?" ? "?" : " " + r[4] + "."))
                  .replace(/\s+/g, " ")
                  .trim();
                return (
                  <tr key={i}>
                    <td>
                      <span className="note">{tx(r[0])} </span>
                      <SpeakButton text={full} />
                    </td>
                    <td>{r[1]}</td>
                    <td style={{ fontWeight: 700, color: "var(--c-sprechen)" }}>{r[2]}</td>
                    <td>{r[3]}</td>
                    <td style={{ fontWeight: 700, color: "var(--c-sprechen)" }}>{r[4]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="explain">{tx(RULES_MORE)}</div>
        <div className="player">
          {RULES_EXAMPLES.map((s) => (
            <span key={s} className="note">
              <SpeakButton text={s} /> {s.split(" ").slice(0, 3).join(" ")} …
            </span>
          ))}
        </div>
        <RoleLegend only={["S", "V", "V2", "AKK", "DAT", "PO", "TE", "KA", "MO", "LO", "NEG", "KONJ", "W"]} />
      </div>
    </details>
  );
}
