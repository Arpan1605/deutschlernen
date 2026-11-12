/** Static content for the "How a German sentence is built" card. */
import { B } from "../lib/i18n";

export const RULES_INTRO = B(
  "Im Englischen gilt meistens Subjekt – Verb – Objekt (I drink coffee). Im Deutschen ist die wichtigste Regel eine andere: Das konjugierte Verb steht im Aussagesatz IMMER auf Position 2.\n\nPosition 1 kann das Subjekt sein – oder etwas anderes (Zeit, Ort, Objekt). Steht etwas anderes auf Position 1, rutscht das Subjekt direkt HINTER das Verb.\n\nEin zweiter Verbteil (Infinitiv, Partizip II, trennbares Präfix) geht ans ENDE. Dazwischen liegt das Mittelfeld.",
  "English mostly uses subject – verb – object (I drink coffee). German has a different main rule: in a statement the conjugated verb is ALWAYS in position 2.\n\nPosition 1 can be the subject – or something else (time, place, object). If something else is in position 1, the subject moves to right AFTER the verb.\n\nA second verb part (infinitive, past participle, separable prefix) goes to the END. Everything in between is the middle field.",
);

/** [label, position 1, verb, middle field, end] */
export const SLOT_ROWS: [ReturnType<typeof B>, string, string, string, string][] = [
  [B("Aussagesatz", "Statement"), "Ich", "trinke", "morgens einen Kaffee", ""],
  [B("Zeit vorne", "Time first"), "Morgens", "trinke", "ich einen Kaffee", ""],
  [B("Perfekt", "Perfect tense"), "Ich", "habe", "gestern einen Kaffee", "getrunken"],
  [B("Modalverb", "Modal verb"), "Ich", "muss", "heute früh", "aufstehen"],
  [B("Trennbares Verb", "Separable verb"), "Der Zug", "kommt", "um 8 Uhr in Frankfurt", "an"],
  [B("W-Frage", "W-question"), "Wann", "kommst", "du nach Hause", "?"],
  [B("Ja/Nein-Frage", "Yes/no question"), "—", "Hast", "du heute Zeit", "?"],
];
export const SLOT_HEAD = [
  B("", ""),
  B("Position 1", "Position 1"),
  B("Position 2: Verb", "Position 2: verb"),
  B("Mittelfeld", "Middle field"),
  B("Ende: Verb-Teil 2", "End: verb part 2"),
];

export const RULES_MORE = B(
  "Nebensatz (weil, dass, wenn, obwohl …): Das konjugierte Verb geht ganz ans Ende.\n   Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.\n\nReihenfolge im Mittelfeld – „TeKaMoLo“: Zeit – Grund – Art & Weise – Ort.\n   Ich fahre morgen wegen der Arbeit mit dem Zug nach Berlin.\n\nZwei Objekte: Nomen – erst Dativ, dann Akkusativ (Ich gebe meiner Kollegin den Bericht). Pronomen – erst Akkusativ, dann Dativ (Ich gebe ihn ihr).\n\n„nicht“ steht vor dem Teil, den es verneint, sonst möglichst weit hinten (Ich komme heute nicht).",
  'Subordinate clause (weil, dass, wenn, obwohl …): the conjugated verb goes right to the end.\n   Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.\n\nOrder in the middle field – "TeKaMoLo": time – reason – manner – place.\n   Ich fahre morgen wegen der Arbeit mit dem Zug nach Berlin.\n\nTwo objects: nouns – dative first, then accusative (Ich gebe meiner Kollegin den Bericht). Pronouns – accusative first, then dative (Ich gebe ihn ihr).\n\n"nicht" goes before the part it negates, otherwise as far back as possible (Ich komme heute nicht).',
);
export const RULES_EXAMPLES = [
  "Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.",
  "Ich fahre morgen wegen der Arbeit mit dem Zug nach Berlin.",
  "Ich gebe meiner Kollegin den Bericht.",
  "Ich komme heute nicht.",
];
