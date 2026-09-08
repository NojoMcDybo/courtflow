/* Prüfstand für das Trainingsmodell: trägt es auf dem vorhandenen Bestand?
   Aufruf: npm run pruefen:plan */
import { baustein, bloecke, kandidaten, modell, neuWuerfeln, belastungsbefund, genugAnders } from "../src/plan";

const REFERENZ = [
  { alter: 8, dauer: 60 },
  { alter: 10, dauer: 75 },
  { alter: 12, dauer: 90 },
  { alter: 14, dauer: 90 },
  { alter: 16, dauer: 90 },
  { alter: 18, dauer: 120 },
];

let fehler = 0;
const mind = modell.regeln.karten_je_schritt[0]!;

console.log("Kandidaten je Baustein und Altersstufe (Soll: mindestens " + mind + ")\n");
const stufen = [8, 10, 12, 14, 16, 18];
console.log("     " + stufen.map((s) => `U${s}`.padStart(6)).join(""));
for (const b of modell.bausteine) {
  const zeile = stufen.map((s) => {
    const n = kandidaten(b.code, s).length;
    if (n < mind) fehler++;
    return (n < mind ? `${n}!` : String(n)).padStart(6);
  });
  console.log(b.code.padEnd(5) + zeile.join("") + "  " + b.kurz);
}

console.log("\nReferenzfälle\n");
for (const r of REFERENZ) {
  const passende = modell.pfade.filter(
    (p) => p.alter_von !== null && p.alter_von <= r.alter && r.alter <= (p.alter_bis ?? p.alter_von),
  );
  const pfad = passende[0] ?? modell.pfade[0]!;
  const bl = bloecke({ pfadId: pfad.id, dauer: r.dauer, altersstufe: r.alter });
  const summe = bl.reduce((a, b) => a + b.minuten, 0);
  const duenn = bl.filter((b) => b.kandidaten.length < mind).map((b) => b.code);
  const soll = Math.round((r.dauer * (1 - modell.regeln.organisationsanteil)) / 5) * 5;
  if (summe !== soll) fehler++;
  if (duenn.length) fehler++;
  console.log(
    `U${r.alter} ${r.dauer}min  ${pfad.id} ${pfad.folge.join("→")}  ` +
      `${bl.map((b) => `${b.code}:${b.minuten}`).join(" ")}  = ${summe}/${soll} min` +
      (duenn.length ? `  DÜNN: ${duenn.join(",")}` : "") +
      `  Wege: ${passende.length}`,
  );
}

console.log("\nAuswürfelung: erzeugt sie wirklich andere Einheiten?\n");
const rahmen = { pfadId: "TR-05", dauer: 90, altersstufe: 12 };
let vorher = neuWuerfeln(rahmen, null, 1);
let gleich = 0;
for (let i = 2; i <= 12; i++) {
  const jetzt = neuWuerfeln(rahmen, vorher, i * 7919);
  if (!genugAnders(jetzt, vorher)) gleich++;
  vorher = jetzt;
}
if (gleich) fehler++;
console.log(`12 Auswürfelungen, davon zu ähnlich: ${gleich}`);
const beispiel = neuWuerfeln(rahmen, null, 42);
console.log(
  "Beispiel TR-05 U12 90min:\n" +
    beispiel
      .map((b) => `  ${b.code} ${String(b.minuten).padStart(2)}min  ${b.gewaehlt?.id ?? "—"}  ${b.gewaehlt?.titel ?? "keine Karte"}`)
      .join("\n"),
);
const befund = belastungsbefund(beispiel);
console.log("Belastungsfolge: " + (befund ?? "ok"));

console.log(`\nBefunde: ${fehler}`);
process.exit(fehler ? 1 : 0);
