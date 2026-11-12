import { useEffect, useRef, useState } from "react";
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";

/** Countdown for writing/speaking. With prep, runs 1 minute of preparation first. Goes negative (+m:ss) when over time. */
export function Timer({ minutes, prep = false }: { minutes: number; prep?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);
  const phase = useRef<"prep" | "main">("main");
  useEffect(() => {
    if (left === null) return;
    const id = setInterval(
      () =>
        setLeft((l) => {
          if (l === null) return l;
          if (l - 1 < 0 && phase.current === "prep") {
            phase.current = "main";
            return minutes * 60;
          }
          return l - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [left === null, minutes]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = () => {
    if (left !== null) {
      setLeft(null);
      return;
    }
    phase.current = prep ? "prep" : "main";
    setLeft(prep ? 60 : minutes * 60);
  };
  const v = left ?? (prep ? 60 : minutes * 60),
    a = Math.abs(v);
  return (
    <div className="player">
      <span className={"timer" + (v < 0 ? " over" : "")}>
        {(v < 0 ? "+" : "") + Math.floor(a / 60) + ":" + String(a % 60).padStart(2, "0")}
      </span>
      <button type="button" className="btn" onClick={toggle}>
        {left !== null ? tx(UI.timer_stop) : tx(UI.timer_start)}
      </button>
    </div>
  );
}
