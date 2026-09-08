import "./styles.css";
import { themaInitialisieren } from "./thema";
import { seite } from "./views/library";

themaInitialisieren();

const wurzel = document.querySelector<HTMLElement>("#app");
if (!wurzel) throw new Error("#app fehlt im Dokument");
seite(wurzel);
