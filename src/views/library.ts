import { el } from "../dom";
import {
  TIEFE_LABEL,
  aliaseVon,
  alleDrills,
  filtern,
  kompetenzName,
  taxonomie,
} from "../data";
import type { Drill, Filter } from "../types";

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

const TIEFE_RANG: Record<string, "voll" | "mittel" | ""> = {
  vollstaendig: "voll",
  standard: "mittel",
  redaktionsscore: "mittel",
};

const altersLabel = (d: Drill): string =>
  d.alter.roh ?? (d.alter.von ? `U${d.alter.von}–U${d.alter.bis}` : "Alter offen");

const kurzfassung = (d: Drill): string =>
  d.lernziel ??
  d.ablauf ??
  d.evidenz ??
  d.redaktionsnotiz ??
  "Für diese Karte ist im Katalog noch keine Durchführung erfasst.";

function marken(d: Drill): HTMLElement {
  const box = el("div", { class: "marken" });
  box.append(el("span", { class: "marke-pille alter" }, [altersLabel(d)]));
  for (const code of d.kompetenz.alle.slice(0, 3)) {
    box.append(el("span", { class: `marke-pille ${code[0]}` }, [code]));
  }
  const voll = d.dokumentationstiefe === "vollstaendig";
  box.append(
    el("span", { class: `marke-pille tiefe${voll ? " voll" : ""}` }, [
      TIEFE_LABEL[d.dokumentationstiefe] ?? d.dokumentationstiefe,
    ]),
  );
  return box;
}

function karte(d: Drill, oeffnen: (d: Drill) => void): HTMLElement {
  const knopf = el("button", { class: "karte", type: "button" });
  const kopf = el("div", { class: "kartenkopf" });
  kopf.append(
    el("span", { class: "kennung" }, [d.id]),
    el("span", {
      class: `tiefe-punkt ${TIEFE_RANG[d.dokumentationstiefe] ?? ""}`.trim(),
      title: `Dokumentationstiefe: ${TIEFE_LABEL[d.dokumentationstiefe] ?? d.dokumentationstiefe}`,
    }),
  );
  knopf.append(
    el("div", { class: "motiv", "aria-hidden": "true", title: "Noch kein Bild im Bestand" }),
    kopf,
    el("h3", {}, [d.titel]),
    el("p", {}, [kurzfassung(d)]),
    marken(d),
  );
  knopf.addEventListener("click", () => oeffnen(d));
  return knopf;
}

function wertfeld(label: string, wert: string | null): HTMLElement | null {
  if (!wert) return null;
  return el("div", {}, [el("b", {}, [label]), wert]);
}

function detail(d: Drill, dialog: HTMLDialogElement): void {
  const inhalt = el("div", { class: "detail-inhalt" });

  const kopf = el("div", { class: "detail-kopf" });
  const titelblock = el("div", {});
  titelblock.append(el("span", { class: "kennung" }, [d.id]), el("h2", {}, [d.titel]));
  const schliessen = el("button", { class: "schliessen", type: "button" }, ["Schließen"]);
  schliessen.addEventListener("click", () => dialog.close());
  kopf.append(titelblock, schliessen);
  inhalt.append(kopf, marken(d));

  if (d.originaltitel && d.originaltitel !== d.titel) {
    inhalt.append(el("p", { class: "hinweis" }, [`Originaltitel: ${d.originaltitel}`]));
  }

  const abschnitte: [string, string | null][] = [
    ["Lernziel", d.lernziel],
    ["Ablauf", d.ablauf],
    ["Coachingpunkte", d.coachingpunkte],
    ["Typische Fehler", d.typische_fehler],
    ["Regression", d.regression],
    ["Progression", d.progression],
    ["Belegtext aus dem Katalog", d.ablauf ? null : d.evidenz],
  ];
  for (const [titel, text] of abschnitte) {
    if (!text) continue;
    inhalt.append(el("h4", {}, [titel]), el("p", {}, [text]));
  }

  const werte = el("div", { class: "werte" });
  for (const feld of [
    wertfeld("Altersfenster", altersLabel(d)),
    wertfeld("Kompetenzen", d.kompetenz.alle.map(kompetenzName).join(" · ") || null),
    wertfeld("Dauer", d.dauer_min.roh),
    wertfeld("Spielerzahl", d.spielerzahl.roh),
    wertfeld("Raum", d.raum),
    wertfeld("Material", d.material),
    wertfeld("Methodik", d.methodik),
    wertfeld("Erfahrungsniveau", d.erfahrung),
  ]) {
    if (feld) werte.append(feld);
  }
  for (const [name, wert] of Object.entries(d.skalen)) {
    if (!wert || wert.wert === null) continue;
    werte.append(el("div", {}, [el("b", {}, [SKALEN_LABEL[name] ?? name]), wert.roh]));
  }
  if (werte.childElementCount) inhalt.append(el("h4", {}, ["Merkmale"]), werte);

  inhalt.append(el("h4", {}, ["Quelle und Prüfstand"]));
  const quelle = el("p", {});
  if (d.quelle.url) {
    quelle.append(
      el("a", { href: d.quelle.url, target: "_blank", rel: "noreferrer noopener" }, [
        d.quelle.name ?? d.quelle.url,
      ]),
    );
  } else if (d.quelle.name) {
    quelle.append(d.quelle.name);
  } else {
    quelle.append("Für diese Karte ist im Katalog keine Originalquelle hinterlegt.");
  }
  inhalt.append(quelle);

  const pruef = [
    d.qa.stufe && `Statusstufe ${d.qa.stufe}`,
    d.qa.note && `QA ${d.qa.note}`,
    d.qa.bewertung?.roh && `Redaktionsbewertung ${d.qa.bewertung.roh}`,
    d.qa.pruefstatus,
    d.qa.redaktionsstatus,
    d.quelle.video_status && `Video: ${d.quelle.video_status}`,
  ].filter(Boolean);
  if (pruef.length) inhalt.append(el("p", { class: "hinweis" }, [pruef.join(" · ")]));

  const alias = aliaseVon(d.id);
  if (alias.length) {
    inhalt.append(
      el("p", { class: "hinweis" }, [
        `Dieselbe Aufgabe ist im Katalog zusätzlich als ${alias.join(", ")} erfasst; diese Karte ist die kanonische Fassung.`,
      ]),
    );
  }

  if (d.dokumentationstiefe !== "vollstaendig") {
    inhalt.append(
      el("p", { class: "hinweis streng" }, [
        `Dokumentationstiefe: ${TIEFE_LABEL[d.dokumentationstiefe]}. Der Katalog belegt für diese Karte nicht alle Felder. Was hier fehlt, fehlt in der Quelle — es wurde nicht ergänzt.`,
      ]),
    );
  }

  dialog.replaceChildren(inhalt);
  dialog.showModal();
}

export function bibliothek(): HTMLElement {
  const filter: Filter = {
    suche: "",
    altersstufe: null,
    familie: null,
    kompetenz: null,
    tiefe: null,
    nurMitQuelle: false,
  };

  const bereich = el("section", { class: "bibliothek", id: "bibliothek" });
  const huelle = el("div", { class: "bibliothek-huelle" });
  const kopf = el("div", { class: "bibliothek-kopf" });
  const trefferzeile = el("p", { class: "trefferzeile" });
  kopf.append(el("h2", {}, ["Bibliothek"]), trefferzeile);

  const spalten = el("div", { class: "spalten" });
  const seitenleiste = el("details", { class: "filter" }) as HTMLDetailsElement;
  const breit = window.matchMedia("(min-width: 901px)");
  seitenleiste.open = breit.matches;
  breit.addEventListener("change", (e) => {
    seitenleiste.open = e.matches;
  });

  const raster = el("div", { class: "raster" });
  const dialog = el("dialog", { class: "detail" }) as HTMLDialogElement;

  const auswahl = (
    label: string,
    optionen: [string, string][],
    beim: (wert: string) => void,
  ): HTMLElement => {
    const feld = el("div", { class: "feld" });
    const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
    const select = el("select", { id });
    select.append(el("option", { value: "" }, ["alle"]));
    for (const [wert, text] of optionen) select.append(el("option", { value: wert }, [text]));
    select.addEventListener("change", () => {
      beim(select.value);
      zeichnen();
    });
    feld.append(el("label", { for: id }, [label]), select);
    return feld;
  };

  const suchfeld = el("div", { class: "feld" });
  const sucheingabe = el("input", {
    type: "search",
    id: "f-suche",
    placeholder: "Titel, Lernziel, Kompetenz …",
  }) as HTMLInputElement;
  sucheingabe.addEventListener("input", () => {
    filter.suche = sucheingabe.value;
    zeichnen();
  });
  suchfeld.append(el("label", { for: "f-suche" }, ["Suche"]), sucheingabe);

  const familien = [...new Set(taxonomie.kompetenzen.map((k) => k.familie))];
  const quellenschalter = el("label", { class: "schalter" });
  const quellenbox = el("input", { type: "checkbox", id: "f-quelle" }) as HTMLInputElement;
  quellenbox.addEventListener("change", () => {
    filter.nurMitQuelle = quellenbox.checked;
    zeichnen();
  });
  quellenschalter.append(quellenbox, "nur Karten mit Quellenangabe");

  const zuruecksetzen = el("button", { class: "zuruecksetzen", type: "button" }, [
    "Filter zurücksetzen",
  ]);

  seitenleiste.append(
    el("summary", {}, ["Filter"]),
    suchfeld,
    auswahl(
      "Altersstufe",
      taxonomie.altersstufen.map((a) => [String(a.alter_bis), a.code] as [string, string]),
      (w) => (filter.altersstufe = w ? Number(w) : null),
    ),
    auswahl(
      "Kompetenzfamilie",
      familien.map((f) => [f, f] as [string, string]),
      (w) => (filter.familie = w || null),
    ),
    auswahl(
      "Kompetenz",
      taxonomie.kompetenzen.map((k) => [k.code, kompetenzName(k.code)] as [string, string]),
      (w) => (filter.kompetenz = w || null),
    ),
    auswahl(
      "Dokumentationstiefe",
      Object.entries(TIEFE_LABEL) as [string, string][],
      (w) => (filter.tiefe = (w || null) as Filter["tiefe"]),
    ),
    el("div", { class: "feld" }, [quellenschalter]),
    zuruecksetzen,
  );

  zuruecksetzen.addEventListener("click", () => {
    filter.suche = "";
    filter.altersstufe = null;
    filter.familie = null;
    filter.kompetenz = null;
    filter.tiefe = null;
    filter.nurMitQuelle = false;
    sucheingabe.value = "";
    quellenbox.checked = false;
    for (const s of seitenleiste.querySelectorAll("select")) s.value = "";
    zeichnen();
  });

  function zeichnen(): void {
    const treffer = filtern(alleDrills, filter);
    const ohneQuelle = treffer.filter((d) => !d.quelle.url && !d.quelle.name).length;
    trefferzeile.textContent =
      `${treffer.length} von ${alleDrills.length} Karten` +
      (ohneQuelle ? ` · ${ohneQuelle} davon ohne hinterlegte Quelle` : "");
    raster.replaceChildren();
    if (!treffer.length) {
      raster.append(el("p", { class: "leer" }, ["Keine Karte passt zu dieser Kombination."]));
      return;
    }
    for (const d of treffer) raster.append(karte(d, (x) => detail(x, dialog)));
  }

  spalten.append(seitenleiste, raster);
  huelle.append(kopf, spalten);
  bereich.append(huelle, dialog);
  zeichnen();
  return bereich;
}
