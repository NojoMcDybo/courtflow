import { modell } from "../src/plan";
import { lesen, speichern, validiereRahmen, wiederherstellen } from "../src/speicher";
import type { GespeicherterPlan } from "../src/speicher";

class Speicher {
  daten = new Map<string, string>();
  blockiert = false;
  getItem(key: string): string | null { return this.daten.get(key) ?? null; }
  setItem(key: string, wert: string): void {
    if (this.blockiert) throw new Error("quota");
    this.daten.set(key, wert);
  }
}

let fehler = 0;
const pruefe = (bedingung: unknown, text: string) => {
  if (!bedingung) { fehler++; console.error("FEHLER: " + text); }
};
const rahmen = { pfadId: "TR-05", dauer: 90, altersstufe: 12 };
const plan = (id: string, aktualisiert: string, modus: "fuehrung" | "automatik" = "fuehrung"): GespeicherterPlan => ({
  version: 1, id, name: "Einheit " + id, modus, rahmen,
  bloecke: modell.pfade.find((p) => p.id === rahmen.pfadId)!.folge.map((code, i) => ({
    code, minuten: [10, 15, 20, 20, 15][i]!, drillId: ["EX-017", "EX-037", "EX-147", "EX-077", "EX-134"][i]!,
  })),
  aktualisiert,
});

pruefe(validiereRahmen(rahmen)?.pfadId === "TR-05", "gültiger Rahmen");
pruefe(validiereRahmen({ ...rahmen, dauer: 91 }) === null, "nicht erlaubte Dauer");
pruefe(validiereRahmen({ ...rahmen, altersstufe: 13 }) === null, "unpassendes Alter");
pruefe(validiereRahmen({ ...rahmen, pfadId: "AW-Technik", altersstufe: 9 }) === null, "nur Katalogaltersstufen zulässig");
pruefe(validiereRahmen({ ...rahmen, pfadId: "kein-pfad" }) === null, "unbekannter Pfad");

const speicher = new Speicher();
const erste = plan("eins", "2026-09-10T10:00:00.000Z");
const zweite = plan("zwei", "2026-09-10T11:00:00.000Z", "automatik");
pruefe(speichern(speicher, erste).fehler === null, "erster Plan speicherbar");
pruefe(speichern(speicher, zweite).plaene[0]?.id === "zwei", "neuester Plan zuerst");
const geladen = lesen(speicher);
pruefe(geladen.plaene.length === 2 && geladen.plaene[1]?.modus === "fuehrung", "beide Modi im Rundlauf");
for (const gespeichert of geladen.plaene) {
  const rundlauf = wiederherstellen(gespeichert);
  pruefe(rundlauf.bloecke.every((b) => b.gewaehlt !== null), `vollständige Auswahl für ${gespeichert.modus} wiederhergestellt`);
  pruefe(rundlauf.bloecke.map((b) => b.gewaehlt?.id).join(",") === "EX-017,EX-037,EX-147,EX-077,EX-134", `IDs für ${gespeichert.modus} bleiben erhalten`);
}

for (const modus of ["fuehrung", "automatik"] as const) {
  const lokal = new Speicher();
  const teilweise = { ...plan("entwurf", "2026-09-10T12:00:00.000Z", modus),
    bloecke: erste.bloecke.map((b, i) => ({ ...b, drillId: i < 2 ? b.drillId : null })) };
  speichern(lokal, teilweise);
  const ausArchiv = lesen(lokal).plaene[0]!;
  const wieder = wiederherstellen(ausArchiv);
  pruefe(JSON.stringify(ausArchiv) === JSON.stringify(teilweise), `voller Datensatz im Rundlauf für ${modus}`);
  pruefe(wieder.bloecke.map((b) => b.gewaehlt?.id ?? null).join(",") === "EX-017,EX-037,,,", `offene Blöcke bleiben offen für ${modus}`);
}

const zukuenftig = new Speicher();
const fremdesFormat = JSON.stringify([{ ...erste, version: 2 }]);
zukuenftig.daten.set("courtflow.plaene.v1", fremdesFormat);
pruefe(speichern(zukuenftig, erste).fehler !== null && zukuenftig.getItem("courtflow.plaene.v1") === fremdesFormat,
  "unbekannte Archivversion bleibt unverändert");

const wieder = wiederherstellen({ ...erste, bloecke: erste.bloecke.map((b, i) => ({ ...b, minuten: 11 + i, drillId: i === 0 ? "EX-001" : b.drillId })) });
pruefe(wieder.bloecke.map((b) => b.code).join(",") === "A,B,C,D,E", "Blockreihenfolge bleibt exakt");
pruefe(wieder.bloecke.map((b) => b.minuten).join(",") === "11,12,13,14,15", "eigene Minuten bleiben exakt");
pruefe(wieder.bloecke[0]?.gewaehlt?.id === "EX-017", "Alias wird auf kanonische Übung aufgelöst");
const fehlend = wiederherstellen({ ...erste, bloecke: erste.bloecke.map((b, i) => ({ ...b, drillId: i === 1 ? "ENTFERNT-1" : b.drillId })) });
pruefe(fehlenedOk(fehlend), "fehlende Übung erzeugt Hinweis statt Neuauswahl");
function fehlenedOk(wert: ReturnType<typeof wiederherstellen>): boolean {
  return wert.bloecke[1]?.gewaehlt === null && wert.hinweise.length === 1;
}

for (let i = 0; i < 12; i++) speichern(speicher, plan("p" + i, `2026-09-10T${String(i).padStart(2, "0")}:00:00.000Z`));
const begrenzt = lesen(speicher);
pruefe(begrenzt.plaene.length === 10 && begrenzt.plaene[0]?.id === "p11", "maximal zehn Pläne, nach Aktualität");
pruefe(speichern(speicher, plan("p11", "2026-09-11T00:00:00.000Z", "automatik")).plaene.filter((p) => p.id === "p11").length === 1, "Upsert statt Dublette");

const kaputt = new Speicher();
kaputt.daten.set("courtflow.plaene.v1", "{kaputt");
const vorher = kaputt.getItem("courtflow.plaene.v1");
pruefe(lesen(kaputt).fehler !== null && speichern(kaputt, erste).fehler !== null && kaputt.getItem("courtflow.plaene.v1") === vorher, "beschädigtes Archiv bleibt erhalten");
const quota = new Speicher(); quota.blockiert = true;
pruefe(speichern(quota, erste).fehler !== null, "Speicherblockade wird gemeldet");
const ungueltig = { ...erste, bloecke: [...erste.bloecke, erste.bloecke[0]!] };
pruefe(speichern(new Speicher(), ungueltig).fehler !== null, "falsche Blockmenge abgelehnt");
const doppelt = { ...erste, bloecke: erste.bloecke.map((b, i) => ({ ...b, drillId: i < 2 ? "EX-017" : null })) };
pruefe(speichern(new Speicher(), doppelt).fehler !== null, "doppelte Auswahl abgelehnt");
const aliasDoppelt = { ...erste, bloecke: erste.bloecke.map((b, i) => ({ ...b, drillId: i === 0 ? "EX-001" : i === 1 ? "EX-017" : null })) };
pruefe(speichern(new Speicher(), aliasDoppelt).fehler !== null, "Alias-Dublette abgelehnt");
pruefe(speichern(new Speicher(), { ...erste, version: 2 } as unknown as GespeicherterPlan).fehler !== null, "falsche Version abgelehnt");
pruefe(speichern(new Speicher(), { ...erste, id: "" }).fehler !== null, "leere Kennung abgelehnt");
pruefe(speichern(new Speicher(), { ...erste, name: "   " }).fehler !== null, "leerer Name abgelehnt");
pruefe(speichern(new Speicher(), { ...erste, aktualisiert: "morgen" }).fehler !== null, "ungültiges Datum abgelehnt");
pruefe(speichern(new Speicher(), { ...erste, bloecke: erste.bloecke.slice(1) }).fehler !== null, "fehlender Block abgelehnt");
pruefe(lesen({ getItem: () => { throw new Error("blocked"); } }).fehler !== null, "Leseblockade wird gemeldet");
const schreibfehler = new Speicher();
speichern(schreibfehler, erste);
const archivVorher = schreibfehler.getItem("courtflow.plaene.v1");
schreibfehler.blockiert = true;
pruefe(speichern(schreibfehler, zweite).fehler !== null && schreibfehler.getItem("courtflow.plaene.v1") === archivVorher, "Schreibfehler erhält bestehendes Archiv");

console.log(`Speicherprüfungen: ${fehler ? "fehlgeschlagen" : "ok"}`);
process.exit(fehler ? 1 : 0);
