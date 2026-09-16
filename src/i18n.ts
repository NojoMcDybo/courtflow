export type Sprache = "de" | "en";
const SCHLUESSEL = "courtflow.sprache";
let aktuell: Sprache = "de";

type Muster = (text: string, translate: (text: string) => string) => string | null;

// Die englische Fassung ist ein eigenes Bündel und wird erst geholt, wenn sie
// gebraucht wird: beim Umschalten auf EN und beim ersten Griff ins Suchfeld.
// Solange sie fehlt, gibt english() den deutschen Text zurück.
let englisch: Record<string, string> | null = null;
let interfacePattern: Muster = () => null;
let trainingPattern: Muster = () => null;
let ladevorgang: Promise<void> | null = null;

function englischLaden(): Promise<void> {
  ladevorgang ??= (async () => {
    const [drills, oberflaeche, training] = await Promise.all([
      import("./locales/drills.en.json"),
      import("./locales/interface.en"),
      import("./locales/training.en"),
    ]);
    interfacePattern = oberflaeche.interfacePattern;
    trainingPattern = training.trainingPattern;
    englisch = {
      ...(drills.default as Record<string, string>),
      ...training.trainingEnglish,
      ...oberflaeche.interfaceEnglish,
    };
  })();
  return ladevorgang;
}

/** Holt die englische Fassung im Hintergrund; danach findet die Suche auch englische Begriffe. */
export function englischVorladen(): void {
  if (englisch !== null) return;
  void englischLaden().then(() => document.dispatchEvent(new Event("courtflow:sprache")));
}

/** Für Prüfstände: wartet, bis die englische Fassung geladen ist. */
export const englischBereit = (): Promise<void> => englischLaden();

/** Translate display text only. Data, IDs, URLs and saved plans keep their original values. */
export function english(text: string): string {
  if (englisch === null) return text;
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

function uebernehmen(): void {
  anwenden();
  document.dispatchEvent(new Event("courtflow:sprache"));
}

export function spracheSetzen(neu: Sprache): void {
  if (neu === aktuell) return;
  aktuell = neu;
  try { localStorage.setItem(SCHLUESSEL, neu); } catch { /* Session choice still works. */ }
  // Zweimal anwenden: sofort für Schalterzustand und lang-Attribut, noch einmal,
  // wenn die nachgeladenen Texte da sind.
  uebernehmen();
  if (neu === "en" && englisch === null) void englischLaden().then(uebernehmen);
}

export function spracheInitialisieren(): void {
  try { aktuell = localStorage.getItem(SCHLUESSEL) === "en" ? "en" : "de"; } catch { aktuell = "de"; }
  anwenden();
  if (aktuell === "en") void englischLaden().then(uebernehmen);
}