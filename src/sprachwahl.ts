import { el } from "./dom";
import { sprache, spracheSetzen, type Sprache } from "./i18n";

export function sprachwahl(): HTMLElement {
  const gruppe = el("div", { class: "sprachwahl", role: "group", "aria-label": "Sprache" });
  for (const [code, name] of [["de", "Deutsch"], ["en", "Englisch"]] as [Sprache, string][]) {
    const taste = el("button", { type: "button", "data-sprache": code, "aria-label": name,
      "aria-pressed": String(sprache() === code), lang: code }, [code.toUpperCase()]);
    taste.addEventListener("click", () => spracheSetzen(code));
    gruppe.append(taste);
  }
  return gruppe;
}
