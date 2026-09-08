import drillsRoh from "../data/drills.json";
import taxonomieRoh from "../data/taxonomy.json";
import type { Drill, Filter, Taxonomie } from "./types";

export const taxonomie = taxonomieRoh as unknown as Taxonomie;

/** Aliaskarten sind Dubletten auf eine kanonische Karte -- nicht doppelt anzeigen. */
export const alleDrills = (drillsRoh as unknown as Drill[]).filter((d) => !d.ist_alias);

export const aliaseVon = (id: string): string[] =>
  Object.entries(taxonomie.aliase)
    .filter(([, kanonisch]) => kanonisch === id)
    .map(([alias]) => alias);

export const kompetenzName = (code: string): string => {
  const treffer = taxonomie.kompetenzen.find((k) => k.code === code);
  return treffer?.name ? `${code} ${treffer.name}` : code;
};

export const familieVon = (code: string): string =>
  taxonomie.kompetenzen.find((k) => k.code === code)?.familie ?? "unbekannt";

const TIEFE_RANG: Record<string, number> = {
  vollstaendig: 0,
  standard: 1,
  redaktionsscore: 2,
  kurz: 3,
  nur_belege: 4,
  nur_titel: 5,
};

export const TIEFE_LABEL: Record<string, string> = {
  vollstaendig: "vollständig erfasst",
  standard: "Standarddatensatz",
  redaktionsscore: "mit Redaktionsscore",
  kurz: "Kurzerfassung",
  nur_belege: "nur Prüfnotiz",
  nur_titel: "nur Titel",
};

const passtAlter = (d: Drill, stufe: number | null): boolean => {
  if (stufe === null) return true;
  if (d.alter.von === null || d.alter.bis === null) return false;
  return d.alter.von <= stufe && stufe <= d.alter.bis;
};

const suchtext = (d: Drill): string =>
  [d.id, d.titel, d.originaltitel, d.lernziel, d.ablauf, d.evidenz, d.kompetenz.roh,
   d.quelle.name, d.methodik]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export function filtern(drills: Drill[], f: Filter): Drill[] {
  const begriff = f.suche.trim().toLowerCase();
  return drills
    .filter((d) => passtAlter(d, f.altersstufe))
    .filter((d) => (f.familie ? d.kompetenz.alle.some((c) => familieVon(c) === f.familie) : true))
    .filter((d) => (f.kompetenz ? d.kompetenz.alle.includes(f.kompetenz) : true))
    .filter((d) => (f.tiefe ? d.dokumentationstiefe === f.tiefe : true))
    .filter((d) => (f.nurMitQuelle ? Boolean(d.quelle.url ?? d.quelle.name) : true))
    .filter((d) => (begriff ? suchtext(d).includes(begriff) : true))
    .sort(
      (a, b) =>
        (TIEFE_RANG[a.dokumentationstiefe] ?? 9) - (TIEFE_RANG[b.dokumentationstiefe] ?? 9) ||
        a.id.localeCompare(b.id),
    );
}

export const kennzahlen = (drills: Drill[]) => ({
  gesamt: drills.length,
  mitQuelle: drills.filter((d) => d.quelle.url ?? d.quelle.name).length,
  vollstaendig: drills.filter((d) => d.dokumentationstiefe === "vollstaendig").length,
  publishReady: drills.filter((d) => d.qa.publish_ready === true).length,
});
