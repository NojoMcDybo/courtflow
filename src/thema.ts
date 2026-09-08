/** Hell/Dunkel folgt dem System; die Wahl des Betrachters überschreibt das. */
const SCHLUESSEL = "courtflow.thema";
type Thema = "hell" | "dunkel" | "system";

const lesen = (): Thema => {
  try {
    const wert = localStorage.getItem(SCHLUESSEL);
    if (wert === "hell" || wert === "dunkel") return wert;
  } catch {
    /* privates Fenster oder blockierter Speicher -- dann eben System */
  }
  return "system";
};

const anwenden = (thema: Thema): void => {
  const wurzel = document.documentElement;
  if (thema === "system") wurzel.removeAttribute("data-thema");
  else wurzel.setAttribute("data-thema", thema);
};

export const themaInitialisieren = (): void => anwenden(lesen());

/** Gibt das neue Thema zurück, damit die Beschriftung mitgeführt werden kann. */
export function themaUmschalten(): Thema {
  const dunkelAktiv =
    document.documentElement.getAttribute("data-thema") === "dunkel" ||
    (!document.documentElement.hasAttribute("data-thema") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const neu: Thema = dunkelAktiv ? "hell" : "dunkel";
  anwenden(neu);
  try {
    localStorage.setItem(SCHLUESSEL, neu);
  } catch {
    /* nicht schlimm: gilt dann nur für diese Sitzung */
  }
  return neu;
}

export const themaIstDunkel = (): boolean =>
  document.documentElement.getAttribute("data-thema") === "dunkel" ||
  (!document.documentElement.hasAttribute("data-thema") &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
