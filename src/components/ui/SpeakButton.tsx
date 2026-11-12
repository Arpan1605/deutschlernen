import { say } from "../../lib/speech";

/** 🔊 button that reads a German text aloud. */
export function SpeakButton({ text }: { text: string }) {
  if (!text) return null;
  return (
    <button type="button" className="speak" title="Anhören" aria-label={"Anhören: " + text} onClick={() => say(text)}>
      🔊
    </button>
  );
}
