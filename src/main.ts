import "./styles.css";
import { themaInitialisieren } from "./thema";
import { shell } from "./views/shell";
import { bibliothek } from "./views/library";

themaInitialisieren();

const wurzel = document.querySelector<HTMLElement>("#app");
if (!wurzel) throw new Error("#app fehlt im Dokument");

wurzel.append(shell.kopfleiste(), shell.hero(), shell.strecke(), bibliothek(), shell.fuss());
