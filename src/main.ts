import "./styles.css";
import { themaInitialisieren } from "./thema";
import { seite } from "./views/library";
import { geplant, startseite } from "./views/home";

themaInitialisieren();

const gefunden = document.querySelector<HTMLElement>("#app");
if (!gefunden) throw new Error("#app fehlt im Dokument");
const wurzel: HTMLElement = gefunden;

let aufraeumen: (() => void) | null = null;

function route(): void {
  aufraeumen?.();
  const pfad = location.hash.replace(/^#\/?/, "");
  document.documentElement.dataset.ansicht = pfad || "start";
  window.scrollTo(0, 0);
  aufraeumen =
    pfad === "bibliothek" ? seite(wurzel)
    : pfad === "generator" ? geplant(wurzel, "generator")
    : pfad === "builder" ? geplant(wurzel, "builder")
    : startseite(wurzel);
}

addEventListener("hashchange", route);
route();
