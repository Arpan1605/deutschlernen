import { useEffect, useState } from "react";
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { rateCard, type Card } from "../../lib/srs";
import { say } from "../../lib/speech";
import { SpeakButton } from "../ui/SpeakButton";

/** Leitner drill: show the German word, flip, rate. "Again" puts the card back at the end. */
export function Flashcards({ cards, onDone }: { cards: Card[]; onDone: () => void }) {
  const [list, setList] = useState(cards);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = list[idx];
  useEffect(() => {
    if (c) say(c.w.de);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!c)
    return (
      <div className="fc">
        <div className="front">{tx(UI.fc_done)}</div>
        <button type="button" className="btn" onClick={onDone}>
          {tx(UI.close_task)}
        </button>
      </div>
    );
  const rate = (v: 0 | 1 | 2) => {
    rateCard(c, v);
    if (v === 0) setList([...list, c]);
    setIdx(idx + 1);
    setFlipped(false);
  };
  return (
    <div className="fc">
      <div className="eyebrow">{tx(UI.fc_left).replace("{n}", String(list.length - idx))}</div>
      <div className="front">{c.w.de}</div>
      <div className="note">{(c.w.pl ? c.w.pl + " · " : "") + (c.w.pos || "")}</div>
      <div>
        <SpeakButton text={c.w.de} />
      </div>
      {!flipped ? (
        <button type="button" className="btn primary" onClick={() => setFlipped(true)}>
          {tx(UI.fc_show)}
        </button>
      ) : (
        <>
          <div className="back">
            <div style={{ fontSize: 18, fontWeight: 600 }}>{c.w.en}</div>
            <div>{c.w.ex}</div>
            <div className="note">{c.w.ex_en || ""}</div>
            <div>
              <SpeakButton text={c.w.ex} />
            </div>
          </div>
          <div className="row">
            <button type="button" className="btn" onClick={() => rate(0)}>
              {tx(UI.fc_again)}
            </button>
            <button type="button" className="btn primary" onClick={() => rate(1)}>
              {tx(UI.fc_good)}
            </button>
            <button type="button" className="btn" onClick={() => rate(2)}>
              {tx(UI.fc_easy)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
