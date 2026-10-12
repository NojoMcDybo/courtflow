import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const drills = JSON.parse(readFileSync(join(root, "data/drills.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(root, "data/uebungsbilder.json"), "utf8"));
const katalogIds = new Set(drills.filter((drill) => !drill.ist_alias).map((drill) => drill.id));
const bildIds = new Set();
const pfade = new Set();

for (const bild of manifest.bilder) {
  assert(katalogIds.has(bild.id), `Bild ohne Katalogkarte: ${bild.id}`);
  assert(!bildIds.has(bild.id), `Doppeltes Bild: ${bild.id}`);
  bildIds.add(bild.id);
  assert(bild.alt?.trim() && bild.alt_en?.trim(), `Bildtext fehlt: ${bild.id}`);

  for (const art of ["vorschau", "detail"]) {
    const pfad = bild[art];
    assert(/^bilder\/uebungen\/[\w.-]+\.webp$/.test(pfad), `Ungültiger Bildpfad: ${pfad}`);
    assert(!pfade.has(pfad), `Doppelter Bildpfad: ${pfad}`);
    pfade.add(pfad);
    for (const ordner of ["public", "dist"]) {
      const datei = resolve(root, ordner, ...pfad.split("/"));
      assert(datei.startsWith(resolve(root, ordner) + sep), `Bild außerhalb von ${ordner}: ${pfad}`);
      assert(statSync(datei).size > 1000, `Leere Bilddatei: ${datei}`);
      const kopf = readFileSync(datei).subarray(0, 12);
      assert(kopf.toString("ascii", 0, 4) === "RIFF" && kopf.toString("ascii", 8, 12) === "WEBP", `Kein WebP: ${datei}`);
    }
  }
}

const fehlend = [...katalogIds].filter((id) => !bildIds.has(id));
assert.deepEqual(fehlend, [], `Karten ohne Bild: ${fehlend.join(", ")}`);
console.log(`${bildIds.size} Kartenbilder mit Vorschau und Detail in public und dist geprüft.`);
