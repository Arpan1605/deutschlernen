import { B } from "../lib/i18n";

export type SkillKey = "wort" | "gram" | "lesen" | "hoeren" | "schreiben" | "sprechen" | "musik" | "test";

export const SK: Record<SkillKey, ReturnType<typeof B>> = {
  wort: B("Wortschatz", "Vocabulary"),
  gram: B("Grammatik", "Grammar"),
  lesen: B("Lesen", "Reading"),
  hoeren: B("Hören", "Listening"),
  schreiben: B("Schreiben", "Writing"),
  sprechen: B("Sprechen", "Speaking"),
  musik: B("Lied", "Song"),
  test: B("Test", "Test"),
};
export const SKC: Record<SkillKey, string> = {
  wort: "var(--c-wort)",
  gram: "var(--c-gram)",
  lesen: "var(--c-lesen)",
  hoeren: "var(--c-hoeren)",
  schreiben: "var(--c-schreiben)",
  sprechen: "var(--c-sprechen)",
  musik: "var(--c-musik)",
  test: "var(--ink)",
};
