import { el } from "../dom";
import { alleDrills, filtern, kompetenzName, taxonomie } from "../data";
import type { Drill, Filter } from "../types";

const STUFEN = [8, 10, 12, 14, 16, 18];

/** Eine Sequenz, ein Farbton, hell nach dunkel. Null ist keine Rampenstufe,
 *  sondern eine leere Zelle -- die Lücke ist die Aussage. */
const dichte = (n: number): string =>
  n === 0 ? "" : n <= 2 ? "d1" : n <= 5 ? "d2" : n <= 10 ? "d3" : "d4";

export function matrix(
  filter: Filter,
  waehlen: (code: string, stufe: number) => void,
): HTMLElement {
  const treffer = filtern(alleDrills, filter);

  const zaehlen = (code: string, stufe: number): Drill[] =>
    treffer.filter(
      (d) =>
        d.kompetenz.alle.includes(code) &&
        d.alter.von !== null &&
        d.alter.bis !== null &&
        d.alter.von <= stufe &&
        stufe <= d.alter.bis,
    );

  const huelle = el("div", { class: "matrix-huelle" });
  const t = el("table", { class: "matrix" });

  const kopf = el("tr", {}, [el("th", {})]);
  for (const s of STUFEN) kopf.append(el("th", { scope: "col" }, [`U${s}`]));
  t.append(el("thead", {}, [kopf]));

  const blase = el("div", { class: "blase", hidden: "" });

  const koerper = el("tbody");
  for (const k of taxonomie.kompetenzen) {
    const zeile = el("tr", {}, [el("th", { scope: "row" }, [kompetenzName(k.code)])]);
    for (const s of STUFEN) {
      const n = zaehlen(k.code, s).length;
      const knopf = el("button", {
        class: `zelle ${dichte(n)}`.trim(),
        type: "button",
        "aria-label": `${kompetenzName(k.code)}, U${s}: ${n} Übungen`,
      });
      knopf.addEventListener("click", () => waehlen(k.code, s));
      knopf.addEventListener("mouseenter", (e) => {
        blase.replaceChildren(
          `${kompetenzName(k.code)} · U${s} · `,
          el("b", {}, [String(n)]),
          n === 1 ? " Übung" : " Übungen",
        );
        blase.hidden = false;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        blase.style.left = `${Math.min(r.left, window.innerWidth - 260)}px`;
        blase.style.top = `${r.bottom + 6}px`;
      });
      knopf.addEventListener("mouseleave", () => (blase.hidden = true));
      zeile.append(el("td", {}, [knopf]));
    }
    koerper.append(zeile);
  }
  t.append(koerper);

  const skala = el("div", { class: "skala" });
  skala.append(
    "keine",
    el("span", { class: "s0" }),
    el("span", { class: "s1" }),
    el("span", { class: "s2" }),
    el("span", { class: "s3" }),
    el("span", { class: "s4" }),
    "mehr als 10",
  );

  huelle.append(t, skala, blase);
  return huelle;
}
