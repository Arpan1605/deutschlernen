import { useId, useState } from "react";
import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { cwork, saveC, bump } from "../lib/store";
import { levelFor, todayIdx, weekTheme } from "../lib/plan";
import { chatRules } from "../lib/prompts";
import { runtime } from "../lib/runtime";
import { errCopy } from "../lib/ai";
import { say } from "../lib/speech";
import { pad3 } from "../lib/text";
import { SpeakButton } from "../components/ui/SpeakButton";
import { StatusLine } from "../components/ui/StatusLine";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

/** Chat with "Sophie" on the week's topic; corrections arrive on a ✎ line. */
export function ConversationPage() {
  const inputId = useId();
  const d = todayIdx(),
    W = weekTheme(d),
    lv = levelFor(d),
    key = "chat-d" + pad3(d);
  const C = cwork(key, "chat", d);
  C.st = C.st || {};
  const msgs: Msg[] = (C.st.msgs = C.st.msgs || []);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState<string | null>(null);
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({ msg: "" });

  const send = async () => {
    if (!runtime.sample) {
      setStatus({ msg: tx(UI.unavailable), err: true });
      return;
    }
    const text = draft.trim();
    if (!text && msgs.length) return;
    if (text) msgs.push({ role: "user", content: text });
    setDraft("");
    saveC(key);
    bump();
    setStatus({ msg: "…" });
    setLive("…");
    const turns: Msg[] = [
      {
        role: "user",
        content: chatRules(d) + (msgs.length ? "" : "\nBeginne das Gespräch mit einer kurzen Begrüßung und einer Frage zum Thema."),
      },
    ];
    if (!msgs.length || msgs[0].role !== "user") turns.push({ role: "assistant", content: "Alles klar, ich bin Sophie." });
    msgs.forEach((m) => turns.push(m));
    if (turns[turns.length - 1].role !== "user") turns.push({ role: "user", content: "(weiter)" });
    try {
      const { text: reply } = await runtime.sample(turns, {
        cache: false,
        modelTier: "quick",
        onText: ({ text }: { text: string }) => setLive(text),
      });
      msgs.push({ role: "assistant", content: reply.trim() });
      saveC(key);
      setStatus({ msg: "" });
      say(reply.split("\n✎ ")[0]);
    } catch (e) {
      setStatus({ msg: errCopy(e), err: true });
    }
    setLive(null);
    bump();
  };

  return (
    <section className="view">
      <div className="dayhead">
        <div>
          <div className="eyebrow">
            {tx(UI.level)} {lv.code} · {tx(UI.theme)}: {tx(W.t)}
          </div>
          <h1>{tx(UI.chat_h)}</h1>
          <div className="sub">{W.talk}</div>
        </div>
      </div>
      <p className="lead" style={{ margin: "-6px 0 18px" }}>
        {tx(UI.chat_lead)}
      </p>
      <div className="stack">
        <div className="chat">
          {msgs.map((m, i) => {
            if (m.role === "user")
              return (
                <div key={i} className="msg me">
                  {m.content}
                </div>
              );
            const [main, corr] = m.content.split("\n✎ ");
            return (
              <div key={i} className="msg ai">
                {main} <SpeakButton text={main} />
                {corr && <span className="corr">✎ {corr}</span>}
              </div>
            );
          })}
          {live !== null && <div className="msg ai">{live}</div>}
        </div>
        <div className="chat-in">
          <label htmlFor={inputId} className="visually-hidden">
            {tx(UI.chat_ph)}
          </label>
          <textarea
            id={inputId}
            value={draft}
            placeholder={tx(UI.chat_ph)}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="btn primary" disabled={live !== null} onClick={send}>
            {msgs.length ? tx(UI.chat_send) : tx(UI.chat_start)}
          </button>
        </div>
        <StatusLine {...status} />
        <div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              C.st.msgs = [];
              saveC(key);
              bump();
            }}
          >
            {tx(UI.chat_new)}
          </button>
        </div>
      </div>
    </section>
  );
}
