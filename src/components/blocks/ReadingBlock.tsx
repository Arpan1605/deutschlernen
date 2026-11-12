/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId } from "react";
import { tx, pickLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { say, stopSpeech } from "../../lib/speech";
import { SpeakButton } from "../ui/SpeakButton";

export interface McState {
  answers?: number[];
  checked?: boolean;
}

/** Score in % once checked, else null. Works for multiple choice and true/false. */
export function mcScore(
  Qs: { answer: number | boolean }[] | undefined,
  st: { answers?: (number | boolean)[]; checked?: boolean } | undefined,
) {
  if (!st?.checked || !Qs?.length) return null;
  return Math.round((100 * Qs.filter((q, i) => st.answers?.[i] === q.answer).length) / Qs.length);
}

/** A text with read-aloud, glossary and multiple-choice questions. */
export function ReadingBlock({ R, st, onChange, showTitle = true }: { R: any; st: McState; onChange: () => void; showTitle?: boolean }) {
  const uid = useId();
  return (
    <div className="stack">
      {R.text && (
        <>
          <div className="player">
            <button type="button" className="btn" onClick={() => say(R.text, 0.9)}>
              {tx(UI.play)}
            </button>
            <button type="button" className="btn" onClick={stopSpeech}>
              {tx(UI.stop)}
            </button>
          </div>
          <div className="readtext">
            {showTitle && R.title && <h4>{R.title}</h4>}
            {R.texttype && (
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                {R.texttype}
              </div>
            )}
            {R.text}
          </div>
        </>
      )}
      {R.glossary?.length > 0 && (
        <>
          <div className="eyebrow">{tx(UI.glossary)}</div>
          <div className="gloss">
            {R.glossary.map((g: any, i: number) => (
              <span key={i}>
                {g.de} – {g.en}
                <SpeakButton text={g.de} />
              </span>
            ))}
          </div>
        </>
      )}
      {R.questions?.length > 0 && (
        <div className="qs">
          {R.questions.map((q: any, qi: number) => (
            <div className="q" key={qi}>
              <div className="qt">
                {qi + 1}. {q.q}
              </div>
              {(q.options || []).map((o: string, oi: number) => {
                const id = `${uid}-${qi}-${oi}`;
                const cls = st.checked ? (oi === q.answer ? " right" : st.answers?.[qi] === oi ? " wrong" : "") : "";
                return (
                  <label key={oi} className={"opt" + cls} htmlFor={id}>
                    <input
                      type="radio"
                      id={id}
                      name={`${uid}-${qi}`}
                      checked={st.answers?.[qi] === oi}
                      disabled={!!st.checked}
                      onChange={() => {
                        st.answers = st.answers || [];
                        st.answers[qi] = oi;
                        onChange();
                      }}
                    />
                    <span>
                      {String.fromCharCode(97 + oi)}) {o}
                    </span>
                  </label>
                );
              })}
              {st.checked && <div className="why">{pickLang(q.why_de, q.why_en)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
