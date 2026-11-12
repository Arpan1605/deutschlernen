/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId } from "react";
import { tx, pickLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { hasSpeech, playLines, stopSpeech } from "../../lib/speech";
import { SpeakButton } from "../ui/SpeakButton";

export interface ListenState {
  answers?: boolean[];
  checked?: boolean;
  rate?: string;
  plays?: number;
  showTr?: boolean;
  noVoice?: boolean;
}

/** A dialogue read with two voices, a play counter, transcript toggle and true/false items. */
export function ListeningBlock({ H, st, onChange }: { H: any; st: ListenState; onChange: () => void }) {
  const uid = useId();
  const tts = hasSpeech();
  const showTr = st.checked || st.showTr || !tts;
  const play = () => {
    st.plays = (st.plays || 0) + 1;
    onChange();
    playLines(H, parseFloat(st.rate || "0.9"), (ok) => {
      if (!ok) {
        st.noVoice = true;
        st.showTr = true;
        onChange();
      }
    });
  };
  return (
    <div className="stack">
      {H.title && <h4 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: 20 }}>{H.title}</h4>}
      <div className="note">{H.situation}</div>
      {tts && (
        <div className="player">
          <button type="button" className="btn primary" onClick={play}>
            {tx(UI.play)}
          </button>
          <button type="button" className="btn" onClick={stopSpeech}>
            {tx(UI.stop)}
          </button>
          <label className="note">
            {tx(UI.speed)}{" "}
            <select
              value={st.rate || "0.9"}
              onChange={(e) => {
                st.rate = e.target.value;
                onChange();
              }}
            >
              <option value="0.8">0.8×</option>
              <option value="0.9">0.9×</option>
              <option value="1">1.0×</option>
            </select>
          </label>
          <span className="note">
            {tx(UI.plays)}
            {st.plays || 0} · {tx(UI.hint2)}
          </span>
        </div>
      )}
      {(!tts || st.noVoice) && <div className="callout">{tx(UI.no_voice)}</div>}
      <div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            st.showTr = !showTr;
            onChange();
          }}
        >
          {showTr ? tx(UI.hide_tr) : tx(UI.transcript)}
        </button>
      </div>
      {showTr && (
        <div className="script readtext">
          {(H.lines || []).map((l: any, i: number) => (
            <div className="ln" key={i}>
              <b>{l.speaker}:</b>
              {l.text} <SpeakButton text={l.text} />
            </div>
          ))}
        </div>
      )}
      <div className="qs">
        {(H.questions || []).map((q: any, qi: number) => (
          <div className="q" key={qi}>
            <div className="qt">
              {qi + 1}. {q.statement}
            </div>
            <div className="tf">
              {([true, false] as const).map((v) => {
                const id = `${uid}-${qi}-${v}`;
                const cls = st.checked ? (v === q.answer ? "right" : st.answers?.[qi] === v ? "wrong" : "") : "";
                return (
                  <label key={String(v)} htmlFor={id} className={cls}>
                    <input
                      type="radio"
                      id={id}
                      name={`${uid}-${qi}`}
                      checked={st.answers?.[qi] === v}
                      disabled={!!st.checked}
                      onChange={() => {
                        st.answers = st.answers || [];
                        st.answers[qi] = v;
                        onChange();
                      }}
                    />
                    {v ? tx(UI.true_) : tx(UI.false_)}
                  </label>
                );
              })}
            </div>
            {st.checked && <div className="why">{pickLang(q.why_de, q.why_en)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
