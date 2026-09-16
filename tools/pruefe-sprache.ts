import assert from "node:assert/strict";
import { english, englischBereit } from "../src/i18n";
import { alleDrills, filtern } from "../src/data";
import drillEnglish from "../src/locales/drills.en.json";

// Die englische Fassung wird in der Seite nachgeladen; hier wird sie erzwungen.
await englischBereit();

for (const [de, en] of [
  ["Übungen entdecken", "Discover drills"],
  ["Abdeckung · Passen/Fangen · U12", "Coverage · Passing/catching · U12"],
  ["T2 Passen/Fangen, U12: 3 Übungen", "T2 Passing/catching, U12: 3 drills"],
  ["Beleg: Kurzerfassung — leere Felder fehlen in der Quelle · QA A", "Documentation: brief record — blank fields are missing from the source · QA A"],
  ["Dein Plan → Fundament · 15 min", "Your plan → Foundation · 15 min"],
  ["Karte → Aktivieren", "Card → Activate"],
  [" / 60 min geplant", " / 60 min planned"],
  ["U12 · 15 Minuten im Plan", "U12 · 15 minutes in the plan"],
  ["✓ Aktivieren", "✓ Activate"],
  ["Gesamtdauer erhöhen", "Total duration increase"],
  ["https://example.com/drill", "https://example.com/drill"],
  ["", ""],
]) assert.equal(english(de!), en, de);

const filter = { suche: "", altersstufe: null, familie: null, kompetenz: null, tiefe: null, nurMitQuelle: false };
const original = JSON.stringify(alleDrills);
const deutsch = filtern(alleDrills, { ...filter, suche: "Gleichgewicht" });
const englisch = filtern(alleDrills, { ...filter, suche: "balance" });
assert.ok(deutsch.length > 0 && englisch.length > 0, "Both languages return search results");
assert.equal(JSON.stringify(alleDrills), original, "Translation/search must not alter source drills");

const dictionary: Record<string, string> = drillEnglish;
const fehlend = alleDrills.filter(d => {
  const text = d.ablauf ?? d.evidenz;
  return text && !dictionary[text];
});
assert.deepEqual(fehlend.map(d => d.id), [], "All visible drill narratives have an English translation");
for (const [source, translation] of Object.entries(dictionary)) {
  assert.ok(translation.trim(), "No empty translations");
  for (const url of source.match(/https?:\/\/[^\s<>]+/g) ?? []) {
    assert.ok(translation.includes(url), `Source URL preserved: ${url}`);
  }
}
console.log(`Sprachprüfungen: ok · ${Object.keys(dictionary).length} Übungstexte · Suche DE/EN`);
