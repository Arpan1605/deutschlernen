/** 13 topic + grammar blocks, ordered by difficulty (A2 → C1). */
import { B } from "../lib/i18n";

export interface Week {
  t: { de: string; en: string };
  g: { de: string; en: string };
  sub: { de: string; en: string }[];
  forum: string;
  formal: string;
  talk: string;
}

export const WEEKS: Week[] = [
  {
    t: B("Ich & Alltag", "Me & daily life"),
    g: B("Satzbau, Modalverben & Perfekt", "Word order, modals & perfect tense"),
    sub: [
      B("Verbposition & Inversion im Hauptsatz", "Verb position & inversion"),
      B("Modalverben: können, müssen, dürfen, wollen, sollen", "Modal verbs: können, müssen, dürfen, wollen, sollen"),
      B("Perfekt mit haben und sein", "Perfect tense with haben and sein"),
      B("Trennbare und untrennbare Verben", "Separable and inseparable verbs"),
      B("Nebensätze: dass, weil, wenn", "Clauses with dass, weil, wenn"),
    ],
    forum: "Was macht einen guten Tag für dich aus?",
    formal: "Schreiben Sie Ihrer Sprachschule: Sie möchten einen Kurs am Abend statt am Morgen.",
    talk: "Mein Alltag",
  },
  {
    t: B("Wohnen & Stadt", "Housing & city"),
    g: B("Kasus & Präpositionen", "Cases & prepositions"),
    sub: [
      B("Akkusativ und Dativ: Artikel und Pronomen", "Accusative and dative: articles and pronouns"),
      B("Präpositionen mit Akkusativ (für, ohne, gegen, durch, um)", "Prepositions with accusative"),
      B("Präpositionen mit Dativ (mit, nach, bei, seit, von, zu, aus)", "Prepositions with dative"),
      B("Wechselpräpositionen: wo? (Dat) / wohin? (Akk)", "Two-way prepositions"),
      B("Verben mit Dativ: helfen, gefallen, gehören", "Verbs that take the dative"),
    ],
    forum: "Stadt oder Land – wo lebt man besser?",
    formal: "Informieren Sie Ihre Vermieterin über eine defekte Heizung und bitten Sie um einen Termin.",
    talk: "Wohnen in der Großstadt",
  },
  {
    t: B("Arbeit & Beruf", "Work & career"),
    g: B("Adjektive & Vergleiche", "Adjectives & comparison"),
    sub: [
      B("Adjektivendungen nach der/die/das", "Adjective endings after der/die/das"),
      B("Adjektivendungen nach ein/kein/mein", "Adjective endings after ein/kein/mein"),
      B("Adjektive ohne Artikel", "Adjectives without article"),
      B("Komparativ und Superlativ", "Comparative and superlative"),
      B("Vergleiche mit als und wie", "Comparisons with als and wie"),
    ],
    forum: "Homeoffice – Fluch oder Segen?",
    formal: "Bitten Sie Ihre Teamleiterin, Ihren Urlaub um eine Woche zu verschieben.",
    talk: "Homeoffice: bei uns und in Deutschland",
  },
  {
    t: B("Bildung & Lernen", "Education & learning"),
    g: B("Präteritum & Verben mit Präpositionen", "Simple past & verbs with prepositions"),
    sub: [
      B("Präteritum: sein, haben, Modalverben", "Simple past: sein, haben, modals"),
      B("Präteritum regelmäßiger und unregelmäßiger Verben", "Simple past of regular and irregular verbs"),
      B("Verben mit Präpositionen (warten auf, denken an)", "Verbs with prepositions"),
      B("da- und wo-Wörter (darauf, worauf)", "da- and wo- compounds"),
      B("Reflexive Verben (sich freuen, sich interessieren)", "Reflexive verbs"),
    ],
    forum: "Sollte ein Studium für alle kostenlos sein?",
    formal: "Sagen Sie Ihrer Kursleiterin einen Termin ab und schlagen Sie einen neuen vor.",
    talk: "Lebenslanges Lernen",
  },
  {
    t: B("Gesundheit", "Health"),
    g: B("Relativsätze", "Relative clauses"),
    sub: [
      B("Relativpronomen im Nominativ und Akkusativ", "Relative pronouns: nominative & accusative"),
      B("Relativpronomen im Dativ", "Relative pronouns: dative"),
      B("Präposition + Relativpronomen (mit dem, für die)", "Preposition + relative pronoun"),
      B("was und wo als Relativwörter", "was and wo as relatives"),
      B("Genitiv: dessen und deren", "Genitive: dessen and deren"),
    ],
    forum: "Fitness-Apps: Hilfe oder Druck?",
    formal: "Ihr Meeting morgen kann nicht stattfinden. Schreiben Sie dem Team und schlagen Sie eine Lösung vor.",
    talk: "Stress im Beruf",
  },
  {
    t: B("Medien & Digitales", "Media & digital life"),
    g: B("Passiv", "Passive voice"),
    sub: [
      B("Passiv Präsens (wird gemacht)", "Present passive"),
      B("Passiv Präteritum (wurde gemacht)", "Past passive"),
      B("Passiv Perfekt (ist gemacht worden)", "Perfect passive"),
      B("Passiv mit Modalverben (muss gemacht werden)", "Passive with modal verbs"),
      B("Zustandspassiv (ist geöffnet)", "Stative passive"),
    ],
    forum: "Sollten soziale Medien für Kinder unter 14 verboten werden?",
    formal: "Melden Sie der IT-Abteilung ein Problem mit einer Software und bitten Sie um Hilfe.",
    talk: "Smartphones im Alltag",
  },
  {
    t: B("Umwelt & Klima", "Environment & climate"),
    g: B("Konjunktiv II", "Konjunktiv II (would/could)"),
    sub: [
      B("wäre, hätte, würde + Infinitiv", "wäre, hätte, würde + infinitive"),
      B("Höfliche Bitten und Ratschläge (könnten, sollten)", "Polite requests and advice"),
      B("Irreale Bedingungen: Wenn ich … hätte, …", "Unreal conditions"),
      B("Irreale Wünsche: Wenn ich doch …!", "Unreal wishes"),
      B("Konjunktiv II der Vergangenheit (hätte … gemacht)", "Past Konjunktiv II"),
    ],
    forum: "Sollte Fliegen deutlich teurer werden?",
    formal: "Schlagen Sie Ihrer Kollegin vor, im Büro Müll zu trennen, und bitten Sie um Unterstützung.",
    talk: "Klimaschutz im Alltag",
  },
  {
    t: B("Konsum & Werbung", "Shopping & advertising"),
    g: B("Konnektoren & Infinitiv", "Connectors & infinitive clauses"),
    sub: [
      B("deshalb, trotzdem, außerdem", "deshalb, trotzdem, außerdem"),
      B("zwar … aber, nicht nur … sondern auch, je … desto", "Two-part connectors"),
      B("obwohl, während, bevor, nachdem", "obwohl, während, bevor, nachdem"),
      B("um … zu vs. damit", "um … zu vs. damit"),
      B("ohne … zu / statt … zu", "ohne … zu / statt … zu"),
    ],
    forum: "Online-Shopping oder lokale Geschäfte?",
    formal: "Beschweren Sie sich beim Kundenservice über eine falsche Lieferung für Ihre Firma.",
    talk: "Werbung und Kaufentscheidungen",
  },
  {
    t: B("Gesellschaft", "Society"),
    g: B("Nominalstil & Genitiv", "Nominal style & genitive"),
    sub: [
      B("Genitiv: des/der, Genitiv-s", "The genitive case"),
      B("Präpositionen mit Genitiv: trotz, wegen, während, aufgrund", "Genitive prepositions"),
      B("Nominalisierung (entscheiden → die Entscheidung)", "Turning verbs into nouns"),
      B("Verbalisierung: Nominal- zu Verbalstil", "Turning nouns back into verbs"),
      B("Funktionsverbgefüge (zur Verfügung stellen)", "Noun-verb collocations"),
    ],
    forum: "Sollte ein soziales Jahr für junge Menschen Pflicht sein?",
    formal: "Sagen Sie Ihre Teilnahme an der Firmenfeier ab und entschuldigen Sie sich.",
    talk: "Ehrenamt",
  },
  {
    t: B("Reisen & Mobilität", "Travel & mobility"),
    g: B("Partizipien", "Participles"),
    sub: [
      B("Partizip I als Adjektiv (der wachsende Verkehr)", "Present participle as adjective"),
      B("Partizip II als Adjektiv (das gebuchte Hotel)", "Past participle as adjective"),
      B("Erweiterte Partizipialattribute", "Extended participle phrases"),
      B("Partizipialattribut ↔ Relativsatz", "Participle phrase ↔ relative clause"),
      B("Passiversatz: sich lassen, -bar, sein + zu", "Passive alternatives"),
    ],
    forum: "Sollten Innenstädte autofrei werden?",
    formal: "Bitten Sie die Buchhaltung um Erstattung Ihrer Reisekosten.",
    talk: "Öffentlicher Verkehr",
  },
  {
    t: B("Kultur & Freizeit", "Culture & leisure"),
    g: B("Indirekte Rede (Konjunktiv I)", "Reported speech (Konjunktiv I)"),
    sub: [
      B("Formen des Konjunktiv I (er sei, sie habe)", "Konjunktiv I forms"),
      B("Indirekte Rede in der Gegenwart", "Reported speech, present"),
      B("Indirekte Rede in der Vergangenheit", "Reported speech, past"),
      B("Fragen und Bitten in indirekter Rede", "Reported questions and requests"),
      B("Redeeinleitende Verben: behaupten, betonen", "Reporting verbs"),
    ],
    forum: "Sollten Museen kostenlos sein?",
    formal: "Bitten Sie einen Kollegen, Sie während Ihres Urlaubs zu vertreten.",
    talk: "Kultur und Freizeit",
  },
  {
    t: B("Wissenschaft & Technik", "Science & technology"),
    g: B("Modalverben & Vermutung", "Modals & speculation"),
    sub: [
      B("Modalverben subjektiv: soll, muss, dürfte", "Modals for speculation"),
      B("Futur I als Vermutung", "Future I for assumptions"),
      B("Futur II (wird … gemacht haben)", "Future perfect"),
      B("n-Deklination (der Kollege, den Kollegen)", "Weak nouns (n-declension)"),
      B("Wortbildung: -ung, -heit, -keit, -schaft", "Word formation"),
    ],
    forum: "Künstliche Intelligenz am Arbeitsplatz – Chance oder Risiko?",
    formal: "Erklären Sie Ihrer Projektleiterin eine Verzögerung und schlagen Sie einen neuen Zeitplan vor.",
    talk: "KI im Beruf",
  },
  {
    t: B("Zukunft & Generalprobe", "Future & dress rehearsal"),
    g: B("Wiederholung", "Review"),
    sub: [
      B("Fehlerliste: Kasus & Präpositionen", "Error log: cases & prepositions"),
      B("Fehlerliste: Wortstellung", "Error log: word order"),
      B("Fehlerliste: Konjunktiv & Passiv", "Error log: Konjunktiv & passive"),
      B("Redemittel Vortrag & Diskussion", "Phrases for talk & discussion"),
      B("Redemittel Forumsbeitrag & formelle Nachricht", "Phrases for forum post & formal message"),
    ],
    forum: "Wie werden wir in 20 Jahren arbeiten?",
    formal: "Bitten Sie die Personalabteilung um ein Gespräch über eine Weiterbildung.",
    talk: "Arbeiten im Ausland",
  },
];

/** Real German songs mentioned as listening tips (titles only). */
export const REAL_SONGS: string[] = [
  "Silbermond – Symphonie",
  "Nena – 99 Luftballons",
  "Herbert Grönemeyer – Mensch",
  "Die Toten Hosen – Tage wie diese",
  "Clueso – Gewinner",
  "Tim Bendzko – Nur noch kurz die Welt retten",
  "Revolverheld – Halt dich an mir fest",
  "Peter Fox – Haus am See",
  "Juli – Perfekte Welle",
  "Wincent Weiss – Musik sein",
  "Sportfreunde Stiller – Ein Kompliment",
  "AnnenMayKantereit – Barfuß am Klavier",
  "Mark Forster – Chöre",
];
