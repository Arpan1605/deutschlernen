/** Every instruction sent to Claude. Each builder returns the full prompt text;
 *  responses are requested as JSON so the UI can render them. */
import { LADDER } from "../data/levels";
import type { Level } from "../data/levels";
import type { Pattern } from "../data/patterns";
import { plan, prof, levelFor, lvIdx, weekTheme, weekdayOrdinal, wordsPerDay, blockOf } from "./plan";
import { WEEKS } from "../data/weeks";
import { state } from "./store";
import { pad3 } from "./text";

/* ---------- continuity helpers ---------- */
function allVocabLemmas(beforeDay: number) {
  const out: string[] = [];
  for (const c of Object.values(state.content))
    if (c?.kind === "vocab" && c.day < beforeDay && c.data?.words) c.data.words.forEach((w: { de: string }) => out.push(w.de));
  return out;
}
function summaries(kind: string, beforeDay: number) {
  const out: string[] = [];
  for (let i = 1; i < beforeDay; i++) {
    const c = state.content[kind + "-d" + pad3(i)];
    if (c?.data?.summary) out.push((c.data.no || "") + ": " + c.data.summary);
  }
  return out;
}
export function countPrev(kind: string, beforeDay: number) {
  let n = 0;
  for (let i = 1; i < beforeDay; i++) if (state.content[kind + "-d" + pad3(i)]) n++;
  return n;
}

/* ---------- daily material ---------- */
export function vocabPrompt(d: number) {
  const W = weekTheme(d),
    lv = levelFor(d),
    known = allVocabLemmas(d),
    n = wordsPerDay();
  return `Erstelle ${n} deutsche Vokabeln für einen erwachsenen Lerner (Hilfssprache Englisch), Niveau ${lv.code}. Ziel: in ${plan.total} Tagen Niveau ${prof().target} – die häufigsten Wörter plus Themenwortschatz.
Mische: ca. 70 % hochfrequente Allgemeinwörter (Verben, Adjektive, Adverbien, Nomen – nach Häufigkeit, passend zum Niveau) und ca. 30 % Wörter zum Wochenthema „${W.t.de}“.
NICHT verwenden (schon gelernt): ${known.slice(-1500).join(", ") || "–"}.
Antworte NUR mit JSON: {"words":[${n}× {"de":"Nomen mit Artikel (die Entscheidung) bzw. Infinitiv/Adjektiv","pl":"Plural-Endung bei Nomen (-en) oder Präteritum/Perfekt bei unregelmäßigen Verben (ging, ist gegangen), sonst leer","pos":"Nomen|Verb|Adjektiv|Adverb|andere","en":"English meaning","ex":"natürlicher Beispielsatz auf Niveau ${lv.code}","ex_en":"English translation"}]}`;
}

export function grammarPrompt(d: number) {
  const W = weekTheme(d),
    lv = levelFor(d),
    sub = W.sub[weekdayOrdinal(d)];
  return `Erstelle eine kompakte, sehr klare Grammatiklektion für einen erwachsenen Deutschlerner (Englisch gut), Niveau ${lv.code}.
Thema: ${W.g.de} – heute: ${sub.de}. Kontext/Beispiele zum Wochenthema „${W.t.de}“.
Antworte NUR mit JSON:
{"title":"…","explain_en":"Erklärung auf Englisch, 120–200 Wörter, Absätze mit \\n\\n","explain_de":"dieselbe Erklärung auf einfachem Deutsch","table":{"head":["…"],"rows":[["…"]]},"examples":[6× {"de":"…","en":"…"}],"tips":[3 kurze Merksätze (englisch)],"exercises":[10× {"q":"Satz mit ___ als Lücke","answer":"Lösung","alt":["weitere akzeptierte Lösungen"],"hint":"kurzer Hinweis (z. B. Infinitiv oder Kasus)"}]}
Die Tabelle fasst die Formen zusammen (z. B. Endungen). Übungen werden schwieriger.`;
}

export function syntaxPrompt(d: number) {
  const W = weekTheme(d),
    lv = levelFor(d),
    sub = W.sub[weekdayOrdinal(d)].de;
  const simple = lvIdx(d) <= LADDER.indexOf("A2");
  const types = simple
    ? "Aussagesätze mit Subjekt vorne, Aussagesätze mit Zeit/Ort/Objekt auf Position 1, Perfekt, Modalverben, trennbare Verben, W-Fragen, Ja/Nein-Fragen, einfache weil/dass-Nebensätze"
    : "alle Satztypen inkl. Nebensätze (weil, dass, obwohl, wenn), Relativsätze, Passiv, Infinitiv mit zu, TeKaMoLo im Mittelfeld, Dativ/Akkusativ-Reihenfolge, Stellung von nicht";
  return `Erstelle eine Satzbau-Übung (deutsche Wortstellung) für einen Lerner, Niveau ${lv.code}: ${lv.de}. Thema: „${W.t.de}“; heutige Grammatik: ${sub}. Satztypen gemischt: ${types}.
Zerlege jeden Satz in Satzglieder (Bausteine). Rollen: S=Subjekt, V=konjugiertes Verb, V2=zweiter Verbteil (Infinitiv/Partizip/trennbares Präfix), AKK, DAT, PO=Präpositionalobjekt, TE=Zeit, KA=Grund, MO=Art und Weise, LO=Ort, NEG=nicht/nie, KONJ=Konnektor/Subjunktion, W=Fragewort, REST=Sonstiges. Ein Nebensatz darf in seine eigenen Satzglieder zerlegt werden (KONJ, S, …, V am Ende).
Schreibe jeden Baustein so, wie er MITTEN im Satz stünde (gestern, ich, der Zug – Nomen groß, Rest klein), ohne Satzzeichen.
Antworte NUR mit JSON:
{"build":[8× {"chunks":[{"t":"…","r":"S"}],"full":"vollständiger korrekter Satz mit Satzzeichen","en":"English translation","alts":[[andere ebenfalls korrekte Reihenfolgen als Index-Listen der chunks, z. B. Zeit vorne], …],"rule_de":"1 Satz: warum diese Stellung","rule_en":"1 sentence"}],
 "label":[5× {"chunks":[{"t":"…","r":"…"}],"full":"…","en":"…"}]}
Die chunks stehen immer in der Reihenfolge des Satzes "full". 3–${simple ? 6 : 8} Bausteine pro Satz, Schwierigkeit steigend.`;
}

export function readingPrompt(d: number) {
  const W = weekTheme(d),
    lv = levelFor(d),
    sub = W.sub[weekdayOrdinal(d)].de;
  const kind = ["Zeitungsartikel", "Forumsdiskussion mit 3 Beiträgen", "Interview", "Blogbeitrag", "Reportage"][d % 5];
  return `Schreibe einen deutschen Lesetext für einen erwachsenen Lerner. Niveau ${lv.code}: ${lv.de}. Thema: „${W.t.de}“. Benutze die Struktur „${sub}“ mehrmals natürlich.
Textsorte abwechselnd (Tag ${d}): ${kind}. Länge ca. ${lv.words + 40} Wörter, Absätze mit \\n\\n. Realistisch, interessant, keine erfundenen Statistiken als Fakten.
Antworte NUR mit JSON: {"title":"…","texttype":"…","text":"…","glossary":[8× {"de":"Wort aus dem Text","en":"English"}],"questions":[5× {"q":"…","options":["…","…","…"],"answer":<0-2>,"why_de":"…","why_en":"…"}]}`;
}

export function storyPrompt(d: number) {
  const lv = levelFor(d),
    no = countPrev("story", d) + 1,
    prev = summaries("story", d);
  return `Du schreibst einen Fortsetzungsroman für einen Deutschlerner: „Neuanfang in Frankfurt“. Hauptfigur: Ravi (31), UX-Designer aus Ahmedabad, zieht für einen neuen Job nach Frankfurt. Weitere Figuren entwickelst du (Kollegin Lena, Vermieter Herr Kowalski, Nachbarin Frau Yıldız, …). Warmherzig, mit leichtem Humor und echten deutschen Alltagssituationen (Behörden, Wohnungssuche, Arbeit, Freundschaften).
Kapitel ${no}. Niveau ${lv.code}: ${lv.de}. Länge ca. ${lv.words + 60} Wörter, viele Dialoge, Absätze mit \\n\\n. Thema der Woche, das vorkommen soll: „${weekTheme(d).t.de}“.
Bisherige Kapitel (Zusammenfassungen): ${prev.length ? prev.join(" | ") : "– (erstes Kapitel: Ankunft am Flughafen Frankfurt)"}
Antworte NUR mit JSON: {"no":${no},"title":"Kapitelüberschrift","text":"…","glossary":[8× {"de":"…","en":"…"}],"questions":[3× {"q":"…","options":["…","…","…"],"answer":<0-2>,"why_de":"…","why_en":"…"}],"summary":"2 Sätze Zusammenfassung für die Kontinuität"}`;
}

export function episodePrompt(d: number) {
  const lv = levelFor(d),
    no = countPrev("ep", d) + 1,
    prev = summaries("ep", d),
    W = weekTheme(d);
  return `Du schreibst ein Hörspiel für Deutschlerner: „Die WG am Main“ – vier Mitbewohner in Frankfurt: Jonas (28, Krankenpfleger, chaotisch), Mira (25, Informatikstudentin, ehrgeizig), Aylin (30, Journalistin, ironisch), Ben (34, Koch, gemütlich). Gelegentlich Gäste.
Folge ${no}. Niveau ${lv.code}: ${lv.de}. Thema der Woche einbauen: „${W.t.de}“, Grammatik: ${W.g.de}. 14–22 Repliken, natürliche gesprochene Sprache (ja, na ja, also, echt?), kleine Spannung oder Humor, Ende mit leichtem Cliffhanger.
Bisherige Folgen: ${prev.length ? prev.join(" | ") : "– (erste Folge: eine neue Mitbewohnerin wird gesucht)"}
Antworte NUR mit JSON: {"no":${no},"title":"Folgentitel","situation":"1 Satz: wo, wer","speakers":[{"name":"Jonas","gender":"m"},{"name":"Mira","gender":"f"},{"name":"Aylin","gender":"f"},{"name":"Ben","gender":"m"}],"lines":[{"speaker":"…","text":"…"}],"questions":[5× {"statement":"…","answer":true|false,"why_de":"…","why_en":"…"}],"summary":"2 Sätze"}`;
}

export function songPrompt(d: number) {
  const W = weekTheme(d),
    lv = levelFor(d);
  return `Schreibe einen originellen deutschen Liedtext (Pop-Song) zum Thema „${W.t.de}“ für Deutschlerner auf Niveau ${lv.code}. Strophe – Refrain – Strophe – Refrain, 18–24 Zeilen, Reime, einfacher Rhythmus, wiederholter Refrain mit der Grammatik „${W.g.de}“.
Antworte NUR mit JSON: {"title":"…","lines":["Zeile 1","…"],"gaps":[10× {"l":<Zeilenindex 0-basiert>,"w":"genau ein Wort aus dieser Zeile, das als Lücke dient"}],"words":[6× {"de":"…","en":"…"}]}`;
}

/* ---------- marking ---------- */
export function gradePrompt(kind: "schreiben" | "sprechen", task: string, text: string, lv: Level) {
  const crit =
    kind === "schreiben"
      ? '"Aufgabenerfüllung","Kohärenz","Wortschatz","Strukturen"'
      : '"Aufgabenerfüllung","Flüssigkeit & Kohärenz","Wortschatz","Strukturen"';
  return `Du bist erfahrene/r Prüfer/in für das Goethe-Zertifikat. Bewerte die folgende ${kind === "schreiben" ? "schriftliche Antwort" : "mündliche Antwort (transkribiert; Tippfehler der Diktierfunktion ignorieren)"} eines Deutschlerners (Ziel ${prof().target}). Erwartetes Niveau: ${lv.code} (${lv.de}). Bewerte streng, aber fair im Verhältnis zu diesem Niveau.

AUFGABE:
${task}

ANTWORT:
"""${text}"""

Antworte NUR mit JSON:
{"score":<0-100>,"criteria":[für jedes von ${crit}: {"name":"…","score":<0-5>,"comment_de":"1 Satz","comment_en":"1 sentence"}],"errors":[bis zu 6: {"wrong":"…","right":"…","rule_de":"kurze Regel","rule_en":"short rule"}],"corrected":"verbesserte Version nahe am Original","summary_de":"2 Sätze","summary_en":"2 sentences"}`;
}

export function patternCheckPrompt(p: Pattern, sentences: string[]) {
  return `Prüfe diese Sätze eines Deutschlerners (Niveau A2–B1), die das Muster „${p[0]}“ verwenden sollen. Antworte NUR mit JSON: {"items":[für jeden Satz: {"ok":true|false,"fix":"korrigierter Satz (oder gleich)","note_de":"kurz","note_en":"short"}]}
Sätze:
${sentences.map((x, n) => n + 1 + ". " + x).join("\n")}`;
}

/* ---------- tests ---------- */
export function dailyTestPrompt(d: number) {
  const W = weekTheme(d),
    lv = levelFor(d),
    sub = W.sub[weekdayOrdinal(d)].de;
  return `Erstelle einen kurzen deutschen Übungstest für einen erwachsenen Lerner (Ziel: Goethe-Zertifikat ${prof().target}).
Niveau: ${lv.code} – ${lv.de}. Wochenthema: ${W.t.de}. Grammatikfokus: ${W.g.de} (${sub}). Tag-Seed: ${d}.
Antworte NUR mit JSON:
{"lesen":{"title":"…","texttype":"…","text":"ca. ${lv.words} Wörter, Absätze mit \\n\\n","questions":[5× {"q":"…","options":["…","…","…"],"answer":<0-2>,"why_de":"…","why_en":"…"}]},
 "hoeren":{"situation":"1 Satz","speakers":[{"name":"…","gender":"f|m"}],"lines":[{"speaker":"Name","text":"…"}],"questions":[5× {"statement":"…","answer":true|false,"why_de":"…","why_en":"…"}]},
 "schreiben":{"task_de":"…","task_en":"…","points":["4 Leitpunkte"],"min_words":${lv.wmin},"minutes":${Math.max(15, Math.round(lv.wmin / 6))}},
 "sprechen":{"task_de":"${lvIdx(d) < LADDER.indexOf("B1+") ? "über sich erzählen / etwas planen / Meinung sagen" : "kurzer Vortrag mit Meinung, Vor- und Nachteilen"}","task_en":"…","points":["3-4 Leitpunkte"],"phrases":["6 Redemittel"],"followups":["3 Nachfragen"],"minutes":${lv.speak}}}
Hörtext: natürlicher Dialog oder Monolog, 8–14 Zeilen. Etwa die Hälfte der Hör-Aussagen ist falsch. Plausible falsche Optionen.`;
}

export function weeklyTestPrompt(w: number) {
  const lastDay = Math.min(plan.total, w * 7 + 7),
    W = WEEKS[blockOf(lastDay)],
    lv = levelFor(lastDay);
  const wm = Math.max(lv.wmin, 100),
    fm = Math.max(60, lv.wmin - 40);
  return `Erstelle eine Wochen-Probeprüfung Deutsch im Stil des Goethe-Zertifikats (${lv.code.replace("+", "")}) für einen erwachsenen Lerner (Endziel ${prof().target}).
Niveau: ${lv.code} – ${lv.de}. Wochenthema: ${W.t.de}. Grammatik: ${W.g.de}, plus Wiederholung früherer Wochen.
Antworte NUR mit JSON:
{"lesen":[2× {"title":"…","texttype":"…","text":"ca. ${lv.words + 60} Wörter","questions":[5× {"q":"…","options":["…","…","…"],"answer":<0-2>,"why_de":"…","why_en":"…"}]}],
 "hoeren":[2× {"situation":"…","speakers":[{"name":"…","gender":"f|m"}],"lines":[{"speaker":"…","text":"…"}],"questions":[5× {"statement":"…","answer":true|false,"why_de":"…","why_en":"…"}]}],
 "schreiben":[{"task_de":"Forumsbeitrag …","task_en":"…","points":["4 Leitpunkte"],"min_words":${wm},"minutes":${Math.max(20, Math.round(wm / 4))}},{"task_de":"Formelle Nachricht im Beruf …","task_en":"…","points":["4 Leitpunkte"],"min_words":${fm},"minutes":${Math.max(20, Math.round(fm / 4))}}],
 "sprechen":{"task_de":"Vortrag mit Diskussion","task_en":"…","points":["4 Leitpunkte"],"phrases":["8 Redemittel"],"followups":["4 Diskussionsfragen"],"minutes":${lv.speak + 1}}}
Hörtexte: ein Interview und ein Alltags- oder Radiobeitrag, je 10–16 Zeilen. Etwa die Hälfte der Aussagen ist falsch.`;
}

export const placementPrompt = () =>
  `Erstelle einen Deutsch-Einstufungstest mit 30 Multiple-Choice-Fragen (Grammatik, Wortschatz, kurze Lesesätze), je 6 auf A1, A2, B1, B2 und 6 gemischte B1/B2-Fragen, aufsteigend sortiert. Antworte NUR mit JSON: {"questions":[30× {"q":"…","options":["…","…","…","…"],"answer":<0-3>,"level":"A1|A2|B1|B2","why_de":"kurz","why_en":"short"}]}`;

export function chatRules(d: number) {
  const lv = levelFor(d),
    W = weekTheme(d);
  return `Du bist Sophie, eine freundliche Gesprächspartnerin aus Frankfurt, und übst mit einem Deutschlerner (Niveau ${lv.code}: ${lv.de}) für das Goethe-Zertifikat. Thema: „${W.talk}“ (Wochenthema ${W.t.de}).
Regeln: Antworte immer auf Deutsch, auf seinem Niveau, 2–4 Sätze, natürlich und persönlich. Stelle am Ende genau eine Frage, die ihn zum Weitersprechen bringt. Widersprich auch mal höflich, damit er argumentieren muss.
Wenn seine letzte Nachricht Fehler hatte, füge GANZ am Ende eine Zeile hinzu, die mit "✎ " beginnt: die 1–3 wichtigsten Korrekturen im Format "falsch → richtig". Keine Korrekturzeile, wenn alles stimmt.`;
}
