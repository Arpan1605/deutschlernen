import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { errCopy } from "../../lib/ai";
import { runtime } from "../../lib/runtime";
import { StatusLine } from "./StatusLine";
import { AppContext } from "../../lib/appContext";
import { useContext, useState } from "react";

interface Props {
  label: string;
  onGenerate: () => Promise<void>;
  note?: string;
  variant?: "empty" | "regen";
}

/** Button that asks Claude to create material; shows progress and readable errors. */
export function GenerateButton({ label, onGenerate, note, variant = "empty" }: Props) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({ msg: "" });
  const app = useContext(AppContext);
  const unavailable = runtime.sampleReady && !runtime.sample;
  const msgUnavailable = tx(window.claude ? UI.unavailable_claude : UI.unavailable);
  const keyBtn =
    unavailable && !window.claude && app ? (
      <button type="button" className="btn" onClick={app.openProfile}>
        {tx(UI.add_key)}
      </button>
    ) : null;
  const go = async () => {
    if (!runtime.sample) {
      setStatus({ msg: msgUnavailable, err: true });
      return;
    }
    setBusy(true);
    setStatus({ msg: tx(UI.creating) });
    try {
      await onGenerate();
      setStatus({ msg: "" });
    } catch (e) {
      setStatus({ msg: errCopy(e), err: true });
    } finally {
      setBusy(false);
    }
  };
  const btn = (
    <button type="button" className={"btn" + (variant === "empty" ? " primary" : "")} disabled={busy} onClick={go}>
      {label}
    </button>
  );
  const line = (
    <>
      <StatusLine msg={status.msg || (unavailable ? msgUnavailable : "")} err={status.err || (unavailable && !status.msg)} />
      {keyBtn}
    </>
  );
  if (variant === "regen")
    return (
      <div className="player">
        {btn}
        {line}
      </div>
    );
  return (
    <div className="gen-empty">
      {note && (
        <p className="note" style={{ margin: 0, maxWidth: "62ch" }}>
          {note}
        </p>
      )}
      {btn}
      {line}
    </div>
  );
}
