/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId, useState } from "react";
import { tx, getLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { countWords } from "../../lib/text";
import { gradeText, errCopy } from "../../lib/ai";
import type { Level } from "../../data/levels";
import { Timer } from "../ui/Timer";
import { SpeakButton } from "../ui/SpeakButton";
import { StatusLine } from "../ui/StatusLine";
import { Feedback } from "./Feedback";

export interface ProdState {
  text?: string;
  feedback?: any;
  score?: number;
}
interface Props {
  kind: "schreiben" | "sprechen";
  P: any;
  st: ProdState;
  onChange: () => void;
  onSave: () => void;
  lv: Level;
  taskText: string;
  noMeta?: boolean;
  noTimer?: boolean;
}

/** A writing or speaking task: brief, timer, the learner's text and Claude's marking. */
export function ProductionBlock({ kind, P, st, onChange, onSave, lv, taskText, noMeta, noTimer }: Props) {
  const id = useId();
  const [words, setWords] = useState(countWords(st.text));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({ msg: "" });
  const speak = kind === "sprechen";
  const mins = speak ? P.minutes || lv.speak : P.minutes || Math.max(15, Math.round((P.min_words || lv.wmin) / 6));
  const grade = async () => {
    if (countWords(st.text) < 5) return;
    setBusy(true);
    setStatus({ msg: tx(UI.grading) });
    try {
      const r = await gradeText(kind, taskText, st.text || "", lv);
      st.feedback = r.feedback;
      st.score = r.score;
      setStatus({ msg: "" });
      onChange();
    } catch (e) {
      setStatus({ msg: errCopy(e), err: true });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="stack">
      {P.task_de && (
        <div className={"taskbox" + (speak ? " sp" : "")}>
          <div style={{ fontWeight: 600 }}>{P.task_de}</div>
          {getLang() === "en" && P.task_en && <div className="why">{P.task_en}</div>}
          {P.points?.length > 0 && (
            <ul>
              {P.points.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!speak && !noMeta && (
        <div className="note">
          {tx(UI.minwords)
            .replace("{n}", String(P.min_words || lv.wmin))
            .replace("{m}", String(mins))}
        </div>
      )}
      {speak && (
        <>
          <div className="note">{tx(UI.prep).replace("{m}", String(mins))}</div>
          {P.phrases?.length > 0 && (
            <>
              <div className="eyebrow">{tx(UI.phrases)}</div>
              <div className="phr">
                {P.phrases.map((p: string, i: number) => (
                  <span key={i}>{p}</span>
                ))}
              </div>
            </>
          )}
          {P.followups?.length > 0 && (
            <>
              <div className="note">{tx(UI.partner_q)}</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {P.followups.map((q: string, i: number) => (
                  <li key={i}>
                    {q} <SpeakButton text={q} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {!noTimer && <Timer minutes={mins} prep={speak} />}
      <label htmlFor={id} className="f">
        {speak ? tx(UI.say_box) : tx(UI.your_text)}
      </label>
      <textarea
        id={id}
        defaultValue={st.text || ""}
        placeholder={speak ? tx(UI.say_box) : tx(UI.text_ph)}
        onChange={(e) => {
          st.text = e.target.value;
          setWords(countWords(st.text));
          onSave();
        }}
      />
      <div className="wc">
        <span>
          {words} {tx(UI.words_unit)}
        </span>
      </div>
      <div className="player">
        <button type="button" className="btn primary" disabled={busy} onClick={grade}>
          {tx(UI.grade)}
        </button>
        <StatusLine {...status} />
      </div>
      {st.feedback && <Feedback F={st.feedback} />}
    </div>
  );
}
