import { el } from "./dom";

const iconUrl = new URL("../assets/courtflow-icon.png", import.meta.url).href;

/** Der Markenname steht direkt daneben; das Bild wird nicht doppelt vorgelesen. */
export function markenIcon(): HTMLImageElement {
  return el("img", {
    class: "marken-icon",
    src: iconUrl,
    alt: "",
    width: "36",
    height: "36",
    decoding: "async",
  });
}
