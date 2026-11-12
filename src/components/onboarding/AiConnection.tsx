import { useId, useState } from "react";
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { aiInfo, getApiKey, setApiKey, applyStandalone, testConnection } from "../../lib/standalone";
import { errCopy } from "../../lib/ai";
import { bump } from "../../lib/store";
import { StatusLine } from "../ui/StatusLine";

/** API-key field shown only when the site runs outside Claude without a server function. */
export function AiConnection() {
  const id = useId();
  const [key, setKey] = useState(getApiKey());
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({ msg: "" });
  if (window.claude || aiInfo.source === "claude") return null;
  if (aiInfo.hasProxy)
    return (
      <div className="ob-field">
        <div className="lab">{tx(UI.ai_h)}</div>
        <div className="note">{tx(UI.ai_proxy)}</div>
      </div>
    );
  const save = (k: string) => {
    setApiKey(k);
    applyStandalone();
    bump();
  };
  const test = async () => {
    save(key);
    setStatus({ msg: "…" });
    try {
      await testConnection();
      setStatus({ msg: tx(UI.ai_ok) });
    } catch (e) {
      setStatus({ msg: errCopy(e), err: true });
    }
  };
  return (
    <div className="ob-field">
      <div className="lab">{tx(UI.ai_h)}</div>
      <p className="note" style={{ margin: 0 }}>
        {tx(UI.ai_lead)}
      </p>
      <label htmlFor={id} className="note">
        {tx(UI.ai_key)}
      </label>
      <input
        type="password"
        id={id}
        autoComplete="off"
        spellCheck={false}
        placeholder="sk-ant-…"
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
          save(e.target.value);
          setStatus({ msg: "" });
        }}
      />
      <div className="player">
        <button type="button" className="btn" disabled={!key} onClick={test}>
          {tx(UI.ai_test)}
        </button>
        {key && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setKey("");
              save("");
              setStatus({ msg: "" });
            }}
          >
            {tx(UI.ai_remove)}
          </button>
        )}
        <StatusLine {...status} />
      </div>
    </div>
  );
}
