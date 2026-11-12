/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId } from "react";
import { tx, pickLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { norm } from "../../lib/text";
import { SpeakButton } from "../ui/SpeakButton";
import { CheckButton, Score } from "../ui/CheckButton";

const isRight = (x: any, a?: string) => [x.answer, ...(x.alt || [])].some((v: string) => norm(v) === norm(a));

/** Explanation, summary table, examples with audio and self-checking gap exercises. */
export function GrammarLesson({ G, st, onChange, onSave }: { G: any; st: any; onChange: () => void; onSave: () => void }) {
  const uid = useId();
  st.ans = st.ans || {};
  const ex: any[] = G.exercises || [];
  const score = st.checked ? Math.round((100 * ex.filter((x, i) => isRight(x, st.ans[i])).length) / (ex.length || 1)) : null;
  return (
    <div className="stack">
      {G.title && <h4 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: 22 }}>{G.title}</h4>}
      <div className="explain">{pickLang(G.explain_de || G.explain_en, G.explain_en || G.explain_de)}</div>
      {G.table?.head && (
        <div style={{ overflowX: "auto" }}>
          <table className="gtable">
            <thead>
              <tr>
                {G.table.head.map((h: string, i: number) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(G.table.rows || []).map((r: string[], i: number) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {G.examples && (
        <>
          <div className="eyebrow">{tx(UI.examples)}</div>
          <div className="stack" style={{ gap: 6 }}>
            {G.examples.map((e: any, i: number) => (
              <div key={i}>
                <SpeakButton text={e.de} /> <b>{e.de}</b>
                <span className="note">{"  " + e.en}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {G.tips?.length > 0 && (
        <div className="callout">
          {tx(UI.tips)}: {G.tips.join(" · ")}
        </div>
      )}
      <div className="eyebrow">{tx(UI.exercises)}</div>
      {ex.map((x, i) => {
        const id = `${uid}-${i}`,
          ok = st.checked && isRight(x, st.ans[i]),
          full = x.q.replace(/_{2,}/, x.answer);
        return (
          <div key={i} className={"ex-item" + (st.checked ? (ok ? " ok" : " no") : "")}>
            <label htmlFor={id}>
              {i + 1}. {x.q}
            </label>
            <div className="line">
              <input
                type="text"
                id={id}
                aria-label={x.q}
                defaultValue={st.ans[i] || ""}
                key={String(st.checked) + i}
                onChange={(e) => {
                  st.ans[i] = e.target.value;
                  onSave();
                }}
              />
              <span className="note">{x.hint ? `(${x.hint})` : ""}</span>
            </div>
            {st.checked && !ok && <div className="why">→ {x.answer}</div>}
            {st.checked && (
              <div className="note">
                <SpeakButton text={full} /> {full}
              </div>
            )}
          </div>
        );
      })}
      <CheckButton
        checked={!!st.checked}
        onToggle={() => {
          if (st.checked) {
            st.checked = false;
            st.ans = {};
          } else st.checked = true;
          onChange();
        }}
      >
        <Score value={score} />
      </CheckButton>
    </div>
  );
}
