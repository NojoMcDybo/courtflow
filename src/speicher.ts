import { alleDrills, taxonomie } from "./data";
import { kandidaten, modell } from "./plan";
import type { Block, Rahmen } from "./plan";

const SCHLUESSEL = "courtflow.plaene.v1";
const MAX_PLAENE = 10;
const MODI = new Set(["fuehrung", "automatik"]);
const ALTER = new Set([8, 10, 12, 14, 16, 18]);

export type GespeicherterPlan = {
  version: 1;
  id: string;
  name: string;
  modus: "fuehrung" | "automatik";
  rahmen: Rahmen;
  bloecke: { code: string; minuten: number; drillId: string | null }[];
  aktualisiert: string;
};

export type SpeicherErgebnis = { plaene: GespeicherterPlan[]; fehler: string | null };

const istObjekt = (wert: unknown): wert is Record<string, unknown> =>
  typeof wert === "object" && wert !== null && !Array.isArray(wert);

const istText = (wert: unknown, max = 160): wert is string =>
  typeof wert === "string" && wert.trim().length > 0 && wert.length <= max;

const istDatum = (wert: unknown): wert is string =>
  typeof wert === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(wert) && Number.isFinite(Date.parse(wert));

const hatNur = (wert: Record<string, unknown>, felder: string[]): boolean =>
  Object.keys(wert).every((feld) => felder.includes(feld));

/** Prüft, ob der gespeicherte Rahmen noch zu einem Katalogpfad passt. */
export function validiereRahmen(wert: unknown): Rahmen | null {
  if (!istObjekt(wert) || typeof wert.pfadId !== "string" ||
    typeof wert.dauer !== "number" || typeof wert.altersstufe !== "number" ||
    !Number.isInteger(wert.dauer) || !Number.isInteger(wert.altersstufe) ||
    !hatNur(wert, ["pfadId", "dauer", "altersstufe"])) return null;
  if (!modell.referenzdauern.includes(wert.dauer) || !ALTER.has(wert.altersstufe)) return null;
  const pfad = modell.pfade.find((p) => p.id === wert.pfadId);
  if (!pfad || pfad.alter_von === null) return null;
  const bis = pfad.alter_bis ?? pfad.alter_von;
  return wert.altersstufe >= pfad.alter_von && wert.altersstufe <= bis
    ? { pfadId: wert.pfadId, dauer: wert.dauer, altersstufe: wert.altersstufe }
    : null;
}

function validierePlan(wert: unknown): GespeicherterPlan | null {
  if (!istObjekt(wert) || wert.version !== 1 || !istText(wert.id, 100) || !istText(wert.name, 120) ||
    !MODI.has(wert.modus as string) || !istDatum(wert.aktualisiert) || !Array.isArray(wert.bloecke) ||
    !hatNur(wert, ["version", "id", "name", "modus", "rahmen", "bloecke", "aktualisiert"])) return null;
  const rahmen = validiereRahmen(wert.rahmen);
  const pfad = rahmen && modell.pfade.find((p) => p.id === rahmen.pfadId);
  if (!rahmen || !pfad || wert.bloecke.length !== pfad.folge.length) return null;

  const ids = new Set<string>();
  const bloecke: GespeicherterPlan["bloecke"] = [];
  for (let i = 0; i < wert.bloecke.length; i++) {
    const block = wert.bloecke[i];
    if (!istObjekt(block) || typeof block.code !== "string" || typeof block.minuten !== "number" ||
      block.code !== pfad.folge[i] || !Number.isInteger(block.minuten) ||
      block.minuten <= 0 || (block.drillId !== null && !istText(block.drillId, 100)) ||
      !hatNur(block, ["code", "minuten", "drillId"])) return null;
    if (block.drillId !== null) {
      const kanonisch = taxonomie.aliase[block.drillId] ?? block.drillId;
      if (ids.has(kanonisch)) return null;
      ids.add(kanonisch);
    }
    bloecke.push({ code: block.code, minuten: block.minuten, drillId: block.drillId });
  }
  return {
    version: 1, id: wert.id, name: wert.name.trim(), modus: wert.modus as GespeicherterPlan["modus"],
    rahmen, bloecke, aktualisiert: wert.aktualisiert,
  };
}

/** Liest ausschließlich vollständige, bekannte Version-1-Archive. */
export function lesen(storage: Pick<Storage, "getItem">): SpeicherErgebnis {
  let roh: string | null;
  try { roh = storage.getItem(SCHLUESSEL); }
  catch { return { plaene: [], fehler: "Der lokale Speicher konnte nicht gelesen werden." }; }
  if (roh === null) return { plaene: [], fehler: null };
  let daten: unknown;
  try { daten = JSON.parse(roh); }
  catch { return { plaene: [], fehler: "Gespeicherte Pläne sind beschädigt und wurden nicht verändert." }; }
  if (!Array.isArray(daten) || daten.length > MAX_PLAENE) {
    return { plaene: [], fehler: "Gespeicherte Pläne haben ein unbekanntes Format und wurden nicht verändert." };
  }
  const plaene = daten.map(validierePlan);
  if (plaene.some((plan) => plan === null)) {
    return { plaene: [], fehler: "Gespeicherte Pläne haben ein unbekanntes Format und wurden nicht verändert." };
  }
  const fertig = plaene as GespeicherterPlan[];
  if (new Set(fertig.map((p) => p.id)).size !== fertig.length) {
    return { plaene: [], fehler: "Gespeicherte Pläne haben doppelte Kennungen und wurden nicht verändert." };
  }
  return { plaene: fertig, fehler: null };
}

/** Speichert maximal zehn Pläne; bei beschädigtem Bestand wird nie überschrieben. */
export function speichern(storage: Pick<Storage, "getItem" | "setItem">, plan: GespeicherterPlan): SpeicherErgebnis {
  const neu = validierePlan(plan);
  if (!neu) return { plaene: [], fehler: "Dieser Plan hat ein ungültiges Format und wurde nicht gespeichert." };
  const bestand = lesen(storage);
  if (bestand.fehler) return bestand;
  const plaene = [neu, ...bestand.plaene.filter((p) => p.id !== neu.id)]
    .sort((a, b) => Date.parse(b.aktualisiert) - Date.parse(a.aktualisiert))
    .slice(0, MAX_PLAENE);
  try { storage.setItem(SCHLUESSEL, JSON.stringify(plaene)); }
  catch { return { plaene: bestand.plaene, fehler: "Der Plan konnte nicht lokal gespeichert werden. Prüfe Speicherplatz oder Browsereinstellungen." }; }
  return { plaene, fehler: null };
}

/** Stellt Auswahl und eigene Minuten exakt wieder her, ohne neue Auswahl zu erzeugen. */
export function wiederherstellen(plan: GespeicherterPlan): { bloecke: Block[]; hinweise: string[] } {
  const geprueft = validierePlan(plan);
  if (!geprueft) return { bloecke: [], hinweise: ["Der gespeicherte Plan ist ungültig."] };
  const drillNachId = new Map(alleDrills.map((drill) => [drill.id, drill]));
  const hinweise: string[] = [];
  const belegt = new Set<string>();
  const bloecke = geprueft.bloecke.map((gespeichert) => {
    const kandidatenListe = kandidaten(gespeichert.code, geprueft.rahmen.altersstufe, belegt);
    const kanonisch = gespeichert.drillId === null ? null : (taxonomie.aliase[gespeichert.drillId] ?? gespeichert.drillId);
    const gewaehlt = kanonisch === null ? null : (drillNachId.get(kanonisch) ?? null);
    if (gespeichert.drillId !== null && !gewaehlt) hinweise.push(`Die Übung ${gespeichert.drillId} ist nicht mehr im Katalog verfügbar.`);
    if (gewaehlt) belegt.add(gewaehlt.id);
    // Die gespeicherte, bekannte Wahl bleibt auch dann erhalten, wenn sie heute
    // nicht mehr in der Kandidatenliste auftaucht.
    const vollstaendigeKandidaten = gewaehlt && !kandidatenListe.some((d) => d.id === gewaehlt.id)
      ? [gewaehlt, ...kandidatenListe] : kandidatenListe;
    return { code: gespeichert.code, minuten: gespeichert.minuten, kandidaten: vollstaendigeKandidaten, gewaehlt };
  });
  return { bloecke, hinweise };
}
