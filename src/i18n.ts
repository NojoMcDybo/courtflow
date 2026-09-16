import drillsEnglish from "./locales/drills.en.json";
import { interfaceEnglish, interfacePattern } from "./locales/interface.en";
import { trainingEnglish, trainingPattern } from "./locales/training.en";

export type Sprache = "de" | "en";
const SCHLUESSEL = "courtflow.sprache";
let aktuell: Sprache = "de";
const englisch: Record<string, string> = { ...drillsEnglish, ...trainingEnglish, ...interfaceEnglish };

/** Translate display text only. Data, IDs, URLs and saved plans keep their original values. */
export function english(text: string): string {
  if (Object.hasOwn(englisch, text)) return englisch[text]!;
  const muster = interfacePattern(text, english) ?? trainingPattern(text, english);
  if (muster !== null) return muster;
  const rand = text.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  if (rand[1] || rand[3]) return rand[1] + english(rand[2]!) + rand[3];
  // Composed UI labels retain their individual, independently translated parts.
  for (const trenner of [" · ", " • ", ", "]) {
    if (text.includes(trenner)) return text.split(trenner).map(english).join(trenner);
  }
  return text;
}

export const sprache = (): Sprache => aktuell;
export const t = (text: string): string => aktuell === "en" ? english(text) : text;

// Weak bindings retain German originals without retaining discarded cards or views.
const texte = new WeakMap<Text, string>();
const attribute = new WeakMap<Element, Map<string, string>>();
const sprachAttribute = new Set(["aria-label", "aria-description", "title", "placeholder", "alt"]);

export function sprachText(text: string): Text {
  const node = document.createTextNode(t(text));
  texte.set(node, text);
  return node;
}

export function setText(node: Element, text: string): void {
  node.replaceChildren(sprachText(text));
}

export function setAttribut(node: Element, name: string, wert: string): void {
  if (sprachAttribute.has(name)) {
    const merker = attribute.get(node) ?? new Map<string, string>();
    merker.set(name, wert);
    attribute.set(node, merker);
    node.setAttribute(name, t(wert));
  } else node.setAttribute(name, wert);
}

function anwenden(): void {
  document.documentElement.lang = aktuell;
  document.title = t("CourtFlow — Übungsbibliothek Jugendbasketball");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node instanceof Text) {
      const original = texte.get(node);
      if (original !== undefined && !node.parentElement?.closest('[translate="no"]')) node.data = t(original);
    } else if (node instanceof Element) {
      for (const [name, original] of attribute.get(node) ?? []) node.setAttribute(name, t(original));
    }
  }
  for (const taste of document.querySelectorAll<HTMLButtonElement>("[data-sprache]")) {
    taste.setAttribute("aria-pressed", String(taste.dataset.sprache === aktuell));
  }
}

export function spracheSetzen(neu: Sprache): void {
  if (neu === aktuell) return;
  aktuell = neu;
  try { localStorage.setItem(SCHLUESSEL, neu); } catch { /* Session choice still works. */ }
  anwenden();
  document.dispatchEvent(new Event("courtflow:sprache"));
}

export function spracheInitialisieren(): void {
  try { aktuell = localStorage.getItem(SCHLUESSEL) === "en" ? "en" : "de"; } catch { aktuell = "de"; }
  anwenden();
}
