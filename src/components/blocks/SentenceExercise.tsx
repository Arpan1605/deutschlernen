/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId } from "react";
import { tx, getLang, pickLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { roleOf } from "../../data/roles";
import { capFirst, range, sameOrder, seededShuffle } from "../../lib/text";
import { SpeakButton } from "../ui/SpeakButton";
import { RoleLegend } from "./SentenceRules";

interface Chunk {
  t: string;
  r: string;
}
const de = () => getLang() === "de";
const LABEL_OPTS = ["S", "V", "V2", "AKK", "DAT", "PO", "TE", "KA", "MO", "LO", "NEG", "KONJ", "W", "REST"];

/** A sentence drawn as colour-coded parts with role names underneath. */
export function ParseView({ chunks, full }: { chunks: Chunk[]; full?: string }) {
  return (
    <div className="parse">
      {chunks.map((c, i) => {
        const R = roleOf(c.r);
        return (
          <div className="pc" key={i} style={{ "--rc": R.c } as React.CSSProperties}>
            <span className="pt">{i === 0 ? capFirst(c.t) : c.t}</span>
            <span className="pr">{tx(R.n)}</span>
          </div>
        );
      })}
      {full && <SpeakButton text={full} />}
    </div>
  );
}

/** Part A: tap shuffled blocks into order. Part B: label each block's role. */
export function SentenceExercise({ S, st, day, onChange }: { S: any; st: any; day: number; onChange: () => void }) {
  const uid = useId();
  st.b = st.b || {};
  st.l = st.l || {};
  let ok = 0,
    done = 0,
    lr = 0,
    lt = 0;
  return (
    <>
      <h4 style={{ margin: "6px 0 0", fontFamily: "var(--f-display)", fontSize: 20 }}>
        {de() ? "A · Sätze bauen" : "A · Build the sentences"}
      </h4>
      <p className="note" style={{ margin: 0 }}>
        {de()
          ? "Tippe die Bausteine in der richtigen Reihenfolge an. Der englische Satz hilft dir."
          : "Tap the blocks in the right order. The English sentence helps you."}
      </p>
      {(S.build || []).map((item: any, i: number) => {
        const n = item.chunks.length,
          bs = (st.b[i] = st.b[i] || { order: [] as number[] });
        const shuffle = seededShuffle(n, day * 31 + i + 1);
        const correct =
          bs.checked &&
          (sameOrder(bs.order, range(0, n)) || (item.alts || []).some((a: any) => Array.isArray(a) && sameOrder(bs.order, a)));
        if (bs.checked) {
          done++;
          if (correct) ok++;
        }
        return (
          <div key={i} className={"syn-card" + (bs.checked ? (correct ? " ok" : " no") : "")}>
            <div className="note">
              {i + 1}. {item.en}
            </div>
            <div className="built">
              {bs.order.length ? (
                bs.order.map((ci: number, pos: number) => (
                  <span key={pos} className="chunk placed">
                    {pos === 0 ? capFirst(item.chunks[ci].t) : item.chunks[ci].t}
                  </span>
                ))
              ) : (
                <span className="note">…</span>
              )}
            </div>
            {!bs.checked ? (
              <>
                <div className="chunks">
                  {shuffle.map((ci) => (
                    <button
                      key={ci}
                      type="button"
                      className={"chunk" + (bs.order.includes(ci) ? " used" : "")}
                      onClick={() => {
                        if (!bs.order.includes(ci)) {
                          bs.order.push(ci);
                          onChange();
                        }
                      }}
                    >
                      {item.chunks[ci].t}
                    </button>
                  ))}
                </div>
                <div className="player">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      bs.order = [];
                      onChange();
                    }}
                  >
                    ⟲ {de() ? "Zurücksetzen" : "Reset"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      bs.order.pop();
                      onChange();
                    }}
                  >
                    ← {de() ? "Letzten entfernen" : "Undo"}
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => {
                      if (bs.order.length >= n) {
                        bs.checked = true;
                        onChange();
                      }
                    }}
                  >
                    {tx(UI.check)}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="note" style={{ fontWeight: 600, color: correct ? "var(--ok)" : "var(--warn)" }}>
                  {correct ? (de() ? "✓ Richtig" : "✓ Correct") : de() ? "✗ So ist es richtig:" : "✗ The correct order:"}
                </div>
                <ParseView chunks={item.chunks} full={item.full} />
                <div className="why">{item.full}</div>
                <div className="why">{pickLang(item.rule_de, item.rule_en)}</div>
                <div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      st.b[i] = { order: [] };
                      onChange();
                    }}
                  >
                    {tx(UI.reset)}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
      {done > 0 && (
        <div className={"score " + (ok / done >= 0.6 ? "pass" : "fail")}>
          {ok} / {done}
        </div>
      )}

      {S.label?.length > 0 && (
        <>
          <h4 style={{ margin: "10px 0 0", fontFamily: "var(--f-display)", fontSize: 20 }}>
            {de() ? "B · Satzglieder bestimmen" : "B · Label the parts of the sentence"}
          </h4>
          <p className="note" style={{ margin: 0 }}>
            {de()
              ? "Wähle für jeden Baustein die Rolle: Subjekt, Verb, Objekt, Zeit …"
              : "Choose the role of each block: subject, verb, object, time …"}
          </p>
          {S.label.map((item: any, i: number) => {
            const ls = (st.l[i] = st.l[i] || {});
            return (
              <div key={i} className="syn-card">
                <div className="player">
                  <SpeakButton text={item.full} />
                  <b>{item.full}</b>
                </div>
                <div className="note">{item.en}</div>
                <div className="labrow">
                  {item.chunks.map((c: Chunk, ci: number) => {
                    const id = `${uid}-${i}-${ci}`,
                      R = roleOf(c.r);
                    let cls = "labcell";
                    if (st.lchecked) {
                      lt++;
                      if (ls[ci] === c.r) {
                        lr++;
                        cls += " ok";
                      } else cls += " no";
                    }
                    return (
                      <div key={ci} className={cls}>
                        <label htmlFor={id} className="pt" style={st.lchecked ? ({ "--rc": R.c } as React.CSSProperties) : undefined}>
                          {ci === 0 ? capFirst(c.t) : c.t}
                        </label>
                        <select
                          id={id}
                          aria-label={c.t}
                          value={ls[ci] || ""}
                          disabled={!!st.lchecked}
                          onChange={(e) => {
                            ls[ci] = e.target.value;
                            onChange();
                          }}
                        >
                          <option value="">—</option>
                          {LABEL_OPTS.map((k) => (
                            <option key={k} value={k}>
                              {tx(roleOf(k).n)}
                            </option>
                          ))}
                        </select>
                        {st.lchecked && ls[ci] !== c.r && (
                          <span className="pr" style={{ "--rc": R.c } as React.CSSProperties}>
                            → {tx(R.n)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="player">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                if (st.lchecked) {
                  st.lchecked = false;
                  st.l = {};
                } else st.lchecked = true;
                onChange();
              }}
            >
              {st.lchecked ? tx(UI.reset) : tx(UI.check)}
            </button>
            {st.lchecked && lt > 0 && (
              <span className={"score " + (lr / lt >= 0.6 ? "pass" : "fail")}>{Math.round((100 * lr) / lt)} %</span>
            )}
          </div>
          <RoleLegend />
        </>
      )}
    </>
  );
}
