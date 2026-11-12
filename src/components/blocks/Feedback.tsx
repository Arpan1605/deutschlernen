import { tx, pickLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import type { Feedback as F } from "../../lib/ai";
import { SpeakButton } from "../ui/SpeakButton";

/** Examiner-style feedback: summary, four criteria, mistakes with rules, corrected text. */
export function Feedback({ F }: { F: F }) {
  return (
    <div className="fb">
      {(F.summary_de || F.summary_en) && <p style={{ margin: 0 }}>{pickLang(F.summary_de, F.summary_en)}</p>}
      {F.criteria?.length ? (
        <div className="crit">
          {F.criteria.map((c, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div className="cn">{c.name}</div>
              <div className="cs">{c.score} / 5</div>
              <div className="cc">{pickLang(c.comment_de, c.comment_en)}</div>
            </div>
          ))}
        </div>
      ) : null}
      {F.errors?.length ? (
        <>
          <div className="eyebrow">{tx(UI.errors)}</div>
          <ul className="errs">
            {F.errors.map((e, i) => (
              <li key={i}>
                <s>{e.wrong}</s>
                {"  →  "}
                <ins>{e.right}</ins>
                <div className="why">{pickLang(e.rule_de, e.rule_en)}</div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {F.corrected && (
        <>
          <div className="eyebrow">{tx(UI.corrected)}</div>
          <div className="corrected">{F.corrected}</div>
          <div>
            <SpeakButton text={F.corrected} />
          </div>
        </>
      )}
    </div>
  );
}
