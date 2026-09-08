import "./styles.css";
import { bibliothek } from "./views/library";

const wurzel = document.querySelector<HTMLElement>("#app");
if (!wurzel) throw new Error("#app fehlt im Dokument");
bibliothek(wurzel);
