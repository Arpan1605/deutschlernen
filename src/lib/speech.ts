/** Read-aloud using the browser's German speech voices. */
export interface Script {
  speakers?: { name: string; gender: string }[];
  lines?: { speaker: string; text: string }[];
}

const germanVoices = () => {
  try {
    return (speechSynthesis.getVoices() || []).filter((v) => /^de/i.test(v.lang));
  } catch {
    return [];
  }
};
function pickVoices() {
  const vs = germanVoices();
  if (!vs.length) return null;
  const fem = vs.find((v) => /female|frau|anna|helena|katja|marlene|vicki|petra|hedda|google deutsch/i.test(v.name)) || vs[0];
  const male =
    vs.find((v) => v !== fem && /male|mann|hans|stefan|markus|yannick|conrad|daniel|killian/i.test(v.name)) ||
    vs.find((v) => v !== fem) ||
    vs[0];
  return { fem, male };
}
export const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;
export function stopSpeech() {
  try {
    speechSynthesis.cancel();
  } catch {
    /* unsupported */
  }
}

export function say(text: string, rate = 0.9) {
  try {
    speechSynthesis.cancel();
    const v = pickVoices();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = rate;
    if (v) u.voice = v.fem;
    speechSynthesis.speak(u);
  } catch {
    /* unsupported */
  }
}

/** Play a dialogue with a female/male voice per speaker. onEnd(false) means no German voice exists. */
export function playLines(H: Script, rate: number, onEnd?: (ok: boolean) => void) {
  stopSpeech();
  const v = pickVoices();
  if (!v) {
    onEnd?.(false);
    return;
  }
  const g: Record<string, string> = {};
  (H.speakers || []).forEach((s) => (g[s.name] = s.gender));
  const lines = H.lines || [];
  lines.forEach((ln, i) => {
    const u = new SpeechSynthesisUtterance(ln.text);
    u.lang = "de-DE";
    u.rate = rate;
    const m = g[ln.speaker] === "m";
    u.voice = m ? v.male : v.fem;
    u.pitch = m ? 0.92 : 1.06;
    if (i === lines.length - 1) u.onend = () => onEnd?.(true);
    speechSynthesis.speak(u);
  });
}
export function warmVoices() {
  try {
    if (hasSpeech()) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => {};
    }
  } catch {
    /* unsupported */
  }
}
