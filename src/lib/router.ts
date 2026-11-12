import { useEffect, useState } from "react";

/** Pages, in tab order, with the UI-string key of their label. Routed on location.hash. */
export const ROUTES = [
  ["heute", "nav_heute"],
  ["plan", "nav_plan"],
  ["uebung", "nav_uebung"],
  ["wochentest", "nav_wtest"],
  ["satzbau", "nav_syn"],
  ["wortschatz", "nav_wort"],
  ["serie", "nav_serie"],
  ["roman", "nav_roman"],
  ["musik", "nav_musik"],
  ["muster", "nav_muster"],
  ["gespraech", "nav_chat"],
  ["pruefung", "nav_pruef"],
] as const;
export type Route = (typeof ROUTES)[number][0];
const isRoute = (h: string): h is Route => ROUTES.some((r) => r[0] === h);

export function useRoute(): Route {
  const read = () => {
    const h = location.hash.replace("#", "");
    return isRoute(h) ? h : "heute";
  };
  const [r, setR] = useState<Route>(read);
  useEffect(() => {
    const on = () => {
      setR(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return r;
}
export const go = (r: Route) => {
  location.hash = r;
};
