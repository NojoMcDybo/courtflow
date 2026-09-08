import {
  TIEFE_LABEL,
  aliaseVon,
  alleDrills,
  filtern,
  kennzahlen,
  kompetenzName,
  taxonomie,
} from "../data";
import type { Drill, Filter } from "../types";

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  kinder: (Node | string)[] = [],
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const kind of kinder) node.append(kind);
  return node;
};

const SKALEN_LABEL: Record<string, string> = {
  entscheidung: "Entscheidungsschwierigkeit",
  gegnerdruck: "Gegnerdruck",
  technik: "Technikschwierigkeit",
  spielnaehe: "Spielnähe",
  zeitdruck: "Zeitdruck",
  raumdruck: "Raumdruck",
  wahrnehmung: "Wahrnehmungsanforderung",
  kooperation: "Kooperationsgrad",
};

const altersLabel = (d: Drill): string =>
  d.alter.roh ?? (d.alter.von ? `U${d.alter.von}–U${d.alter.bis}` : "Alter nicht dokumentiert");

const kurzfassung = (d: Drill): string =>
  d.lernziel ?? d.ablauf ?? d.evidenz ?? d.redaktionsnotiz ?? "Für diese Karte ist im Katalog noch keine Durchführung erfasst.";

function marken(d: Drill): HTMLElement {
  const box = el("div", { class: "marken" });
  box.append(el("span", { class: "marke alter" }, [altersLabel(d)]));
  for (const code of d.kompetenz.alle.slice(0, 3)) {
    box.append(el("span", { class: `marke ${code[0]}` }, [code]));
  }
  box.append(
    el("span", { class: `marke tiefe-${d.dokumentationstiefe}` }, [
      TIEFE_LABEL[d.dokumentationstiefe] ?? d.dokumentationstiefe,
    ]),
  );
  return box;
}

function karte(d: Drill, oeffnen: (d: Drill) => void): HTMLElement {
  const knopf = el("button", { class: "karte", type: "button" });
  knopf.append(
    el("div", { class: "motiv", "aria-hidden": "true", title: "Für diese Karte liegt noch kein Bild vor" }),
    el("span", { class: "kennung" }, [d.id]),
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
  const schliessen = el("button", { class: "schliessen", type: "button" }, ["Schließen"]);
  schliessen.addEventListener("click", () => dialog.close());
  inhalt.append(schliessen, el("span", { class: "kennung" }, [d.id]), el("h2", {}, [d.titel]));
  if (d.originaltitel && d.originaltitel !== d.titel) {
    inhalt.append(el("p", { class: "kennung" }, [`Originaltitel: ${d.originaltitel}`]));
  }
  inhalt.append(marken(d));

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
  const skalen = Object.entries(d.skalen).filter(([, v]) => v && v.wert !== null);
  for (const [name, wert] of skalen) {
    werte.append(el("div", {}, [el("b", {}, [SKALEN_LABEL[name] ?? name]), wert?.roh ?? ""]));
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

export function bibliothek(wurzel: HTMLElement): void {
  const filter: Filter = {
    suche: "",
    altersstufe: null,
    familie: null,
    kompetenz: null,
    tiefe: null,
    nurMitQuelle: false,
  };

  const zahlen = kennzahlen(alleDrills);
  const kopf = el("header", { class: "kopf" });
  kopf.append(
    el("h1", {}, ["Court", el("span", {}, ["Flow"])]),
    el("p", {}, [
      `Übungsbibliothek Kinder- und Jugendbasketball U8–U18, aufgebaut aus dem Kompetenzkatalog v${taxonomie.katalogversion}. Jede Karte zeigt ihre Quelle und wie tief sie belegt ist.`,
    ]),
  );
  const kz = el("div", { class: "kennzahlen" });
  for (const [wert, label] of [
    [zahlen.gesamt, "Karten"],
    [zahlen.mitQuelle, "mit Quellenangabe"],
    [zahlen.vollstaendig, "vollständig erfasst"],
    [zahlen.publishReady, "als publish-ready ausgewiesen"],
    [taxonomie.kompetenzen.length, "Kompetenzen im Modell"],
  ] as [number, string][]) {
    kz.append(el("div", { class: "kennzahl" }, [el("b", {}, [String(wert)]), el("span", {}, [label])]));
  }
  kopf.append(kz);

  const huelle = el("div", { class: "huelle" });
  const seitenleiste = el("details", { class: "filter" }) as HTMLDetailsElement;
  // Auf breiten Fenstern offen, auf schmalen zugeklappt -- und beim Wechsel
  // mitgeführt, sonst bleibt ein schmal geladenes Fenster nach dem Aufziehen
  // dauerhaft mit zugeklapptem Filter stehen.
  const breit = window.matchMedia("(min-width: 861px)");
  seitenleiste.open = breit.matches;
  breit.addEventListener("change", (e) => {
    seitenleiste.open = e.matches;
  });
  const spalte = el("section", {});
  const trefferzeile = el("p", { class: "trefferzeile" });
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
      (ohneQuelle ? ` · ${ohneQuelle} davon ohne hinterlegte Quelle` : "") +
      " · Bildbestand noch leer, die Kacheln bleiben bis dahin frei";
    raster.replaceChildren();
    if (!treffer.length) {
      raster.append(
        el("p", { class: "leer" }, ["Keine Karte passt zu dieser Kombination."]),
      );
      return;
    }
    for (const d of treffer) raster.append(karte(d, (x) => detail(x, dialog)));
  }

  spalte.append(trefferzeile, raster);
  huelle.append(seitenleiste, spalte);

  const fuss = el("footer", { class: "fuss" });
  fuss.append(
    el("p", {}, [
      `Datengrundlage: ${taxonomie.quelle}. Übungsbeschreibungen sind redaktionelle Eigenformulierungen; die Originalquelle ist je Karte verlinkt. Karten ohne Quellenangabe sind als solche gekennzeichnet und nicht veröffentlichungsreif.`,
    ]),
  );

  wurzel.append(kopf, huelle, dialog, fuss);
  zeichnen();
}
