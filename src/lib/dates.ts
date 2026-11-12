import { getLang } from "./i18n";

const WD = {
  de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};
const MON = {
  de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
export const MONTHS = {
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export const DAY_MS = 86400000;

export function parseDate(s?: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
}
export const isoDate = (dt: Date) =>
  dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
export function fmt(dt: Date) {
  const L = getLang();
  return L === "de"
    ? WD.de[dt.getDay()] + ", " + dt.getDate() + ". " + MON.de[dt.getMonth()] + " " + dt.getFullYear()
    : WD.en[dt.getDay()] + ", " + dt.getDate() + " " + MON.en[dt.getMonth()] + " " + dt.getFullYear();
}
export const short = (dt: Date) =>
  getLang() === "de" ? dt.getDate() + ". " + MON.de[dt.getMonth()] : dt.getDate() + " " + MON.en[dt.getMonth()];
