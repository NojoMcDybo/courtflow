import bilderRoh from "../data/uebungsbilder.json";
import taxonomieRoh from "../data/taxonomy.json";
import type { Drill, Taxonomie } from "./types";

export interface Uebungsbild {
  id: string;
  thema: string;
  court: string;
  titel: string;
  art: string;
  alt: string;
  alt_en: string;
  vorschau: string;
  detail: string;
  width: number;
  height: number;
}

interface UebungsbilderDatei {
  version: 1;
  referenz: string;
  bilder: Uebungsbild[];
}

const datei = bilderRoh as unknown as UebungsbilderDatei;
const taxonomie = taxonomieRoh as unknown as Taxonomie;

/** Löst auch Alias-Ketten auf, damit Bild- und Katalogdaten dieselbe Karte meinen. */
function kanonischeId(id: string): string {
  let aktuell = id;
  const gesehen = new Set<string>();
  while (taxonomie.aliase[aktuell] && !gesehen.has(aktuell)) {
    gesehen.add(aktuell);
    aktuell = taxonomie.aliase[aktuell]!;
  }
  return aktuell;
}

const nachKanonischerId = new Map<string, Uebungsbild>(
  datei.bilder.map((bild) => [kanonischeId(bild.id), bild]),
);

/** Gibt das Bild für eine Übung zurück; Alias-Karten verwenden immer ihr kanonisches Motiv. */
export function uebungsbildFuer(drill: Pick<Drill, "id" | "kanonische_id">): Uebungsbild | undefined {
  return nachKanonischerId.get(kanonischeId(drill.kanonische_id || drill.id));
}

export function hatUebungsbild(drill: Pick<Drill, "id" | "kanonische_id">): boolean {
  return uebungsbildFuer(drill) !== undefined;
}

/** Öffentliche Dateien werden relativ zur ausgelieferten Seite aufgelöst, auch unter GitHub Pages. */
export function bildUrl(pfad: string): string {
  return new URL(pfad.replace(/^\/+/, ""), document.baseURI).toString();
}
