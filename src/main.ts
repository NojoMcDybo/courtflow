import "./styles.css";
import { themaInitialisieren } from "./thema";
import { seite } from "./views/library";
import { startseite } from "./views/home";
import { training } from "./views/training";

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
    : pfad === "aufbau" ? training(wurzel, "fuehrung")
    : pfad === "generator" ? training(wurzel, "automatik")
    : startseite(wurzel);
}

addEventListener("hashchange", route);
route();
