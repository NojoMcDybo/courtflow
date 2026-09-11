import { el } from "../dom";
import { alleDrills, filtern, taxonomie } from "../data";
import type { Drill, Filter, Kompetenz } from "../types";

const STUFEN = taxonomie.altersstufen.map((stufe) => stufe.alter_bis);

/** Die Klassen bilden eine einzelne, von CSS lesbare Dichteskala. */
const dichte = (n: number): string =>
  n === 0 ? "" : n <= 2 ? "d1" : n <= 5 ? "d2" : n <= 10 ? "d3" : "d4";

const nameVon = (kompetenz: Kompetenz): string => kompetenz.name ?? kompetenz.code;
const vollstaendigerName = (kompetenz: Kompetenz): string =>
  kompetenz.name ? `${kompetenz.code} ${kompetenz.name}` : kompetenz.code;

export function matrix(
  filter: Filter,
  waehlen: (code: string | null, stufe: number | null) => void,
): HTMLElement {
  // Kompetenz und Alter sind Ziele der Matrix, keine Einschränkungen ihres Bestands.
  const matrixFilter: Filter = { ...filter, kompetenz: null, altersstufe: null, familie: null };
  const drills = filtern(alleDrills, matrixFilter);
  const zaehlen = (code: string, stufe: number): number =>
    drills.filter(
      (drill: Drill) =>
        drill.kompetenz.alle.includes(code) && drill.alter.von !== null && drill.alter.bis !== null &&
        drill.alter.von <= stufe && stufe <= drill.alter.bis,
    ).length;

  const huelle = el("div", { class: "coverage" });
  const familien = new Map<string, Kompetenz[]>();
  for (const kompetenz of taxonomie.kompetenzen) {
    const gruppe = familien.get(kompetenz.familie) ?? [];
    gruppe.push(kompetenz);
    familien.set(kompetenz.familie, gruppe);
  }

  for (const [familie, kompetenzen] of familien) {
    const id = `coverage-${kompetenzen[0]!.code}`;
    const abschnitt = el("section", { class: "coverage-family", "aria-label": familie, "aria-labelledby": id });
    abschnitt.append(el("h2", { id }, [familie]));
    const tabelle = el("table", { class: "coverage-table" });
    tabelle.append(el("caption", {}, [`Übungsabdeckung: ${familie}`]));
    const kopf = el("tr", {}, [el("th", { scope: "col" }, ["Thema"])]);
    for (const stufe of STUFEN) {
      const knopf = el("button", {
        class: "coverage-age", type: "button", "data-code": "", "data-age": String(stufe),
        "aria-label": `U${stufe} auswählen`, "aria-pressed": String(filter.altersstufe === stufe),
      }, [`U${stufe}`]);
      knopf.addEventListener("click", () => waehlen(null, stufe));
      kopf.append(el("th", { scope: "col" }, [knopf]));
    }
    tabelle.append(el("thead", {}, [kopf]));

    const koerper = el("tbody");
    for (const kompetenz of kompetenzen) {
      const aktiv = filter.kompetenz === kompetenz.code;
      const thema = el("button", {
        class: "coverage-topic", type: "button", "data-code": kompetenz.code, "data-age": "",
        "aria-label": `${vollstaendigerName(kompetenz)} auswählen`, "aria-pressed": String(aktiv),
      }, [nameVon(kompetenz)]);
      thema.addEventListener("click", () => waehlen(kompetenz.code, null));
      const zeile = el("tr", {}, [el("th", { scope: "row" }, [thema])]);
      for (const stufe of STUFEN) {
        const anzahl = zaehlen(kompetenz.code, stufe);
        const knopf = el("button", {
          class: `coverage-cell ${dichte(anzahl)}`.trim(), type: "button",
          "data-code": kompetenz.code, "data-age": String(stufe),
          "aria-label": `${vollstaendigerName(kompetenz)}, U${stufe}: ${anzahl} ${anzahl === 1 ? "Übung" : "Übungen"}`,
          "aria-pressed": String(aktiv && filter.altersstufe === stufe),
        }, [anzahl === 0 ? "–" : String(anzahl)]);
        knopf.addEventListener("click", () => waehlen(kompetenz.code, stufe));
        zeile.append(el("td", {}, [knopf]));
      }
      koerper.append(zeile);
    }
    tabelle.append(koerper);
    abschnitt.append(tabelle);
    huelle.append(abschnitt);
  }

  const ohneZuordnung = drills.filter((drill) =>
    drill.alter.von === null || drill.alter.bis === null ||
    !STUFEN.some((stufe) => drill.alter.von! <= stufe && stufe <= drill.alter.bis!),
  ).length;
  const legende = el("p", { class: "coverage-legend" }, [el("span", {}, ["Zahlen: Übungen je Altersstufe · – keine Übung"])]);
  if (ohneZuordnung) {
    legende.append(el("span", {}, [
      `${ohneZuordnung} ohne Altersangabe · unter „Alles anzeigen“.`,
    ]));
  }
  huelle.append(legende);
  return huelle;
}
