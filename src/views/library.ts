import { el } from "../dom";
import { markenIcon } from "../marke";
import { themaIstDunkel, themaUmschalten } from "../thema";
import { TIEFE_LABEL, aliaseVon, alleDrills, filtern, kompetenzName, taxonomie } from "../data";
import type { Drill, Filter } from "../types";
import { matrix } from "./abdeckung";

const SKALEN_LABEL: Record<string, string> = {
  entscheidung: "Entscheidung",
  gegnerdruck: "Gegnerdruck",
  technik: "Technik",
  spielnaehe: "Spielnähe",
  zeitdruck: "Zeitdruck",
  raumdruck: "Raumdruck",
  wahrnehmung: "Wahrnehmung",
  kooperation: "Kooperation",
};

function feld(label: string, wert: string | null): HTMLElement | null {
  return wert ? el("div", {}, [el("b", {}, [label]), wert]) : null;
}

function blattInhalt(d: Drill, schliessen: () => void): HTMLElement {
  const inhalt = el("div", { class: "blatt" });

  const kopf = el("div", { class: "blatt-kopf" });
  const titel = el("div", {});
  titel.append(el("span", { class: "kennung" }, [d.id]), el("h2", {}, [d.titel]));
  const zu = el("button", { class: "schliessen", type: "button", "aria-label": "Schließen" }, ["✕"]);
  zu.addEventListener("click", schliessen);
  kopf.append(titel, zu);
  inhalt.append(kopf);

  for (const [label, text] of [
    ["Lernziel", d.lernziel],
    ["Ablauf", d.ablauf ?? d.evidenz],
    ["Coachingpunkte", d.coachingpunkte],
    ["Typische Fehler", d.typische_fehler],
    ["Regression", d.regression],
    ["Progression", d.progression],
  ] as [string, string | null][]) {
    if (text) inhalt.append(el("h4", {}, [label]), el("p", {}, [text]));
  }

  const felder = el("div", { class: "felder" });
  for (const f of [
    feld("Alter", d.alter.roh),
    feld("Kompetenz", d.kompetenz.alle.map(kompetenzName).join(", ") || null),
    feld("Dauer", d.dauer_min.roh),
    feld("Spieler", d.spielerzahl.roh),
    feld("Raum", d.raum),
    feld("Material", d.material),
    feld("Methodik", d.methodik),
    feld("Erfahrung", d.erfahrung),
  ]) {
    if (f) felder.append(f);
  }
  for (const [name, wert] of Object.entries(d.skalen)) {
    if (!wert || wert.wert === null) continue;
    felder.append(el("div", {}, [el("b", {}, [SKALEN_LABEL[name] ?? name]), wert.roh]));
  }
  if (felder.childElementCount) inhalt.append(el("h4", {}, ["Merkmale"]), felder);

  inhalt.append(el("h4", {}, ["Quelle"]));
  const q = el("p", {});
  if (d.quelle.url) {
    q.append(
      el("a", { href: d.quelle.url, target: "_blank", rel: "noreferrer noopener" }, [
        d.quelle.name ?? d.quelle.url,
      ]),
    );
  } else {
    q.append(d.quelle.name ?? "keine im Katalog hinterlegt");
  }
  inhalt.append(q);

  const notizen = [
    `Beleg: ${TIEFE_LABEL[d.dokumentationstiefe]}${
      d.dokumentationstiefe === "vollstaendig" ? "" : " — leere Felder fehlen in der Quelle"
    }`,
    d.qa.stufe && `Status ${d.qa.stufe}`,
    d.qa.note && `QA ${d.qa.note}`,
    d.qa.bewertung?.roh && `Bewertung ${d.qa.bewertung.roh}`,
    aliaseVon(d.id).length ? `Dublette zu ${aliaseVon(d.id).join(", ")}` : "",
  ].filter(Boolean);
  inhalt.append(el("p", { class: "fussnote" }, [notizen.join(" · ")]));

  return inhalt;
}

export function seite(wurzel: HTMLElement): () => void {
  const filter: Filter = { suche: "", altersstufe: null, familie: null, kompetenz: null, tiefe: null, nurMitQuelle: false };
  let sortierung = "titel";
  let ausloeser: HTMLButtonElement | null = null;
  const dialog = el("dialog", { "aria-label": "Übungsdetails", class: "drill-dialog" });
  dialog.addEventListener("close", () => ausloeser?.focus());

  const leiste = el("header", { class: "leiste bibliothek-leiste" });
  const thema = el("button", { type: "button" });
  const beschriften = () => (thema.textContent = themaIstDunkel() ? "Hell" : "Dunkel");
  beschriften();
  thema.addEventListener("click", () => { themaUmschalten(); beschriften(); });
  leiste.append(
    el("a", { class: "wortmarke", href: "#/", title: "Zur Startseite" }, [markenIcon(), "CourtFlow"]),
    el("span", { class: "seitentitel" }, ["01 / Bibliothek"]),
    el("span", { class: "leiste-rechts" }, [thema, el("a", { href: "#/aufbau" }, ["Training bauen ↗"])]),
  );

  const bereich = el("main", { class: "bibliothek" });
  const suche = el("input", { type: "search", class: "suchfeld", placeholder: "Übung suchen …", "aria-label": "Übungen durchsuchen" });
  suche.addEventListener("input", () => { filter.suche = suche.value; zeichnen(); });
  const reset = el("button", { type: "button", class: "bibliothek-reset" }, ["Alles anzeigen"]);
  const extras = el("details", { class: "bibliothek-extras" });
  const extrasTitel = el("summary", {}, ["Weitere Filter"]);
  const extraFelder = el("div", { class: "bibliothek-extra-felder" });
  const select = (name: string, optionen: [string, string][], callback: (wert: string) => void) => {
    const s = el("select", { "aria-label": name }, optionen.map(([value, label]) => el("option", { value }, [label])));
    s.addEventListener("change", () => { callback(s.value); zeichnen(); });
    return s;
  };
  const familie = select("Familie", [["", "Alle Bereiche"], ...[...new Set(taxonomie.kompetenzen.map(k => k.familie))].map(f => [f, f] as [string, string])], w => {
    filter.familie = w || null;
    filter.kompetenz = null;
  });
  const tiefe = select("Belegtiefe", [["", "Alle Belegtiefen"], ...Object.entries(TIEFE_LABEL)], w => filter.tiefe = (w || null) as Filter["tiefe"]);
  const quelle = el("input", { type: "checkbox" });
  quelle.addEventListener("change", () => { filter.nurMitQuelle = quelle.checked; zeichnen(); });
  extraFelder.append(familie, tiefe, el("label", { class: "haken" }, [quelle, "Mit Quelle"]));
  extras.append(extrasTitel, extraFelder);
  reset.addEventListener("click", () => {
    Object.assign(filter, { suche: "", altersstufe: null, familie: null, kompetenz: null, tiefe: null, nurMitQuelle: false });
    suche.value = ""; familie.value = ""; tiefe.value = ""; quelle.checked = false;
    zeichnen();
  });

  const intro = el("div", { class: "bibliothek-kopf" }, [
    el("div", {}, [el("h1", {}, ["Übungen entdecken"]), el("p", {}, ["Thema und Alter wählen. Passende Übungen öffnen."])]),
    suche,
  ]);
  const navigation = el("details", { class: "bibliothek-navigation", open: "" });
  const navTitel = el("summary", {}, ["Abdeckung"]);
  const matrixPlatz = el("div");
  navigation.append(navTitel, matrixPlatz);
  const ergebnisse = el("section", { class: "bibliothek-ergebnisse", "aria-labelledby": "ergebnis-titel" });
  const titel = el("h2", { id: "ergebnis-titel" });
  const anzahl = el("span", { class: "ergebnis-anzahl", role: "status", "aria-live": "polite", "aria-atomic": "true" });
  const sort = select("Sortierung", [["titel", "Name A–Z"], ["alter", "Alter aufsteigend"]], w => sortierung = w);
  const auswahl = el("div", { class: "bibliothek-auswahl" });
  const karten = el("div", { class: "drill-karten" });
  ergebnisse.append(
    el("div", { class: "ergebnis-kopf" }, [el("div", { class: "ergebnis-titel" }, [titel, anzahl]), sort]),
    auswahl, karten,
  );
  bereich.append(intro, navigation, el("div", { class: "bibliothek-werkzeuge" }, [reset, extras]), ergebnisse);

  const altersname = (d: Drill): string => d.alter.von === null || d.alter.bis === null
    ? "Alter offen" : d.alter.von === d.alter.bis ? `U${d.alter.von}` : `U${d.alter.von}–U${d.alter.bis}`;

  // Einige Quelldatensätze tragen QA oder Fließtext im Titelfeld.
  // Keine Übungsnamen erfinden; den unveränderten Eintrag im Detail erhalten.
  const kurzname = (d: Drill): string => /^QA\s/.test(d.titel) || d.titel.length > 180
    ? d.originaltitel ?? "Übung ohne Kurztitel" : d.titel;

  function karte(d: Drill): HTMLElement {
    const knopf = el("button", { type: "button", class: "drill-karte", "aria-haspopup": "dialog" }, [
      el("span", { class: "drill-alter" }, [altersname(d)]),
      el("span", { class: "drill-name" }, [kurzname(d)]),
      el("span", { class: "drill-oeffnen", "aria-hidden": "true" }, ["Ansehen", el("span", {}, ["↗"])]),
    ]);
    knopf.addEventListener("click", () => {
      ausloeser = knopf;
      dialog.setAttribute("aria-label", d.titel);
      dialog.replaceChildren(blattInhalt(d, () => dialog.close()));
      dialog.showModal();
    });
    return knopf;
  }

  function zeichnen(): void {
    // Preserve keyboard position when the matrix is replaced after a selection.
    const fokus = document.activeElement;
    const matrixFokus = fokus instanceof HTMLButtonElement && matrixPlatz.contains(fokus)
      ? { code: fokus.dataset.code, age: fokus.dataset.age, family: fokus.closest("section")?.getAttribute("aria-label") } : null;
    matrixPlatz.replaceChildren(matrix(filter, (code, alter) => {
      filter.kompetenz = code; filter.altersstufe = alter;
      // A new matrix choice must not be blocked by an old family filter.
      filter.familie = null; familie.value = "";
      zeichnen();
      if (window.matchMedia("(max-width: 1179px)").matches) {
        navigation.open = false;
        navTitel.focus();
      }
    }));
    if (matrixFokus) {
      const knoepfe = [...matrixPlatz.querySelectorAll<HTMLButtonElement>("button[data-code][data-age]")];
      knoepfe.find(b => b.dataset.code === matrixFokus.code && b.dataset.age === matrixFokus.age &&
        b.closest("section")?.getAttribute("aria-label") === matrixFokus.family)?.focus({ preventScroll: true });
    }
    const treffer = [...filtern(alleDrills, filter)].sort((a, b) =>
      (sortierung === "alter" ? (a.alter.von ?? 99) - (b.alter.von ?? 99) : 0) || a.titel.localeCompare(b.titel, "de") || a.id.localeCompare(b.id));
    const themaName = taxonomie.kompetenzen.find(k => k.code === filter.kompetenz)?.name;
    titel.textContent = themaName ?? filter.familie ?? "Alle Übungen";
    anzahl.textContent = `${treffer.length} ${treffer.length === 1 ? "Übung" : "Übungen"}`;
    navTitel.textContent = `Abdeckung${themaName ? ` · ${themaName}` : ""}${filter.altersstufe ? ` · U${filter.altersstufe}` : ""}`;
    auswahl.replaceChildren();
    const chip = (text: string, entfernen: () => void) => {
      const b = el("button", { type: "button", "aria-label": `${text} entfernen` }, [text, el("span", { "aria-hidden": "true" }, [" ×"])]);
      b.addEventListener("click", () => { entfernen(); zeichnen(); reset.focus(); });
      auswahl.append(b);
    };
    if (themaName) chip(themaName, () => filter.kompetenz = null);
    if (filter.altersstufe) chip(`U${filter.altersstufe}`, () => filter.altersstufe = null);
    if (filter.familie) chip(filter.familie, () => { filter.familie = null; familie.value = ""; });
    if (filter.tiefe) chip(TIEFE_LABEL[filter.tiefe] ?? filter.tiefe, () => { filter.tiefe = null; tiefe.value = ""; });
    if (filter.nurMitQuelle) chip("Mit Quelle", () => { filter.nurMitQuelle = false; quelle.checked = false; });
    extrasTitel.textContent = `Weitere Filter${filter.familie || filter.tiefe || filter.nurMitQuelle ? " · aktiv" : ""}`;
    karten.replaceChildren(...treffer.map(karte));
    if (!treffer.length) karten.append(el("div", { class: "bibliothek-leer" }, [
      el("h3", {}, ["Hier gibt es noch keine passende Übung."]),
      el("p", {}, ["Andere Zelle wählen oder Filter zurücksetzen."]),
    ]));
  }

  const tasten = (e: KeyboardEvent) => {
    if (e.key === "/" && !dialog.open && !e.ctrlKey && !e.metaKey && !e.altKey &&
      !(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || (e.target instanceof HTMLElement && e.target.isContentEditable))) {
      e.preventDefault(); suche.focus();
    }
  };
  document.addEventListener("keydown", tasten);
  const fuss = el("footer", { class: "fuss" }, ["Kompetenzkatalog v3.8 · Quellen und Belegangaben in den Übungsdetails."]);
  wurzel.append(leiste, bereich, dialog, fuss);
  zeichnen();
  return () => {
    document.removeEventListener("keydown", tasten);
    for (const element of [leiste, bereich, dialog, fuss]) element.remove();
  };
}
