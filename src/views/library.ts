import { el } from "../dom";
import { themaIstDunkel, themaUmschalten } from "../thema";
import {
  TIEFE_LABEL,
  aliaseVon,
  alleDrills,
  filtern,
  kompetenzName,
  taxonomie,
} from "../data";
import type { Drill, Filter } from "../types";

const REPO = "https://github.com/NojoMcDybo/courtflow";

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

/** Belegtiefe als drei Stufen -- ablesbar ohne Beschriftung. */
const STUFE: Record<string, number> = {
  vollstaendig: 3,
  standard: 2,
  redaktionsscore: 2,
  kurz: 1,
  nur_belege: 1,
  nur_titel: 0,
};

/** Wer die Quelle ist, in einem Wort. Ein gekürzter Fließtexttitel sagt nichts;
 *  die herausgebende Organisation schon. */
const HERAUSGEBER: [RegExp, string][] = [
  [/(^|\.)jr\.nba\.com$/, "Jr. NBA"],
  [/(^|\.)nba\.com$/, "NBA"],
  [/basketball-bund\.de$/, "DBB"],
  [/fiba\.basketball$/, "FIBA"],
];

function herkunft(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Quelle";
  }
  for (const [muster, name] of HERAUSGEBER) if (muster.test(host)) return name;
  return host;
}

const alterKurz = (d: Drill): string =>
  d.alter.von ? `U${d.alter.von}–U${d.alter.bis}` : "—";

type Sortierung = { feld: "id" | "titel" | "alter" | "beleg"; ab: boolean };

function belegbalken(d: Drill): HTMLElement {
  const stufe = STUFE[d.dokumentationstiefe] ?? 0;
  const box = el("span", {
    class: "balken",
    title: TIEFE_LABEL[d.dokumentationstiefe] ?? d.dokumentationstiefe,
  });
  for (let i = 1; i <= 3; i++) {
    box.append(el("i", { class: i <= stufe ? "an" : "" }));
  }
  return box;
}

function zeile(d: Drill, oeffnen: (d: Drill) => void): HTMLElement {
  const tr = el("tr", { tabindex: "0" });

  const codes = el("span", { class: "codes" });
  for (const c of d.kompetenz.alle.slice(0, 3)) {
    codes.append(el("span", { class: `code ${c[0]}` }, [c]));
  }

  const quelle = el("td", { class: "sp-quelle quelle-zelle" });
  if (d.quelle.url) {
    const a = el("a", {
      href: d.quelle.url,
      target: "_blank",
      rel: "noreferrer noopener",
      title: d.quelle.name ?? d.quelle.url,
    }, [herkunft(d.quelle.url)]);
    a.addEventListener("click", (e) => e.stopPropagation());
    quelle.append(a);
  } else if (d.quelle.name) {
    quelle.title = d.quelle.name;
    quelle.append(d.quelle.name);
  } else {
    quelle.className = "sp-quelle quelle-zelle fehlt";
    quelle.append("ohne Quelle");
  }

  tr.append(
    el("td", { class: "sp-id" }, [d.id]),
    el("td", { class: "sp-titel" }, [d.titel]),
    el("td", { class: "sp-alter" }, [alterKurz(d)]),
    el("td", { class: "sp-komp" }, [codes]),
    el("td", { class: "sp-beleg" }, [belegbalken(d)]),
    quelle,
  );

  tr.addEventListener("click", () => oeffnen(d));
  tr.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      oeffnen(d);
    }
  });
  return tr;
}

function paar(label: string, wert: string | null): HTMLElement | null {
  return wert ? el("div", {}, [el("b", {}, [label]), wert]) : null;
}

function blatt(d: Drill, dialog: HTMLDialogElement): void {
  const inhalt = el("div", { class: "blatt" });

  const kopf = el("div", { class: "blatt-kopf" });
  const titel = el("div", {});
  titel.append(el("span", { class: "kennung" }, [d.id]), el("h2", {}, [d.titel]));
  const zu = el("button", { class: "zu", type: "button", "aria-label": "Schließen" }, ["✕"]);
  zu.addEventListener("click", () => dialog.close());
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
    if (!text) continue;
    inhalt.append(el("h4", {}, [label]), el("p", {}, [text]));
  }

  const paare = el("div", { class: "paare" });
  for (const p of [
    paar("Alter", d.alter.roh),
    paar("Kompetenz", d.kompetenz.alle.map(kompetenzName).join(", ") || null),
    paar("Dauer", d.dauer_min.roh),
    paar("Spieler", d.spielerzahl.roh),
    paar("Raum", d.raum),
    paar("Material", d.material),
    paar("Methodik", d.methodik),
    paar("Erfahrung", d.erfahrung),
  ]) {
    if (p) paare.append(p);
  }
  for (const [name, wert] of Object.entries(d.skalen)) {
    if (!wert || wert.wert === null) continue;
    paare.append(el("div", {}, [el("b", {}, [SKALEN_LABEL[name] ?? name]), wert.roh]));
  }
  if (paare.childElementCount) inhalt.append(el("h4", {}, ["Merkmale"]), paare);

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
    TIEFE_LABEL[d.dokumentationstiefe] &&
      `Beleg: ${TIEFE_LABEL[d.dokumentationstiefe]}${
        d.dokumentationstiefe === "vollstaendig" ? "" : " — leere Felder fehlen in der Quelle"
      }`,
    d.qa.stufe && `Status ${d.qa.stufe}`,
    d.qa.note && `QA ${d.qa.note}`,
    d.qa.bewertung?.roh && `Bewertung ${d.qa.bewertung.roh}`,
    aliaseVon(d.id).length && `Dublette zu ${aliaseVon(d.id).join(", ")}`,
  ].filter(Boolean);
  if (notizen.length) inhalt.append(el("p", { class: "notiz" }, [notizen.join(" · ")]));

  dialog.replaceChildren(inhalt);
  dialog.showModal();
}

export function seite(wurzel: HTMLElement): void {
  const filter: Filter = {
    suche: "",
    altersstufe: null,
    familie: null,
    kompetenz: null,
    tiefe: null,
    nurMitQuelle: false,
  };
  let sortierung: Sortierung = { feld: "beleg", ab: true };

  /* Kopf */
  const kopf = el("header", { class: "kopf" });
  const suche = el("input", {
    type: "search",
    class: "suche",
    placeholder: "Suchen",
    "aria-label": "Übungen durchsuchen",
  }) as HTMLInputElement;
  suche.addEventListener("input", () => {
    filter.suche = suche.value;
    zeichnen();
  });

  const themaKnopf = el("button", { type: "button" });
  const beschriften = () => (themaKnopf.textContent = themaIstDunkel() ? "Hell" : "Dunkel");
  beschriften();
  themaKnopf.addEventListener("click", () => {
    themaUmschalten();
    beschriften();
  });

  kopf.append(
    el("span", { class: "marke" }, [el("i", { "aria-hidden": "true" }, ["CF"]), "CourtFlow"]),
    suche,
    el("span", { class: "kopf-rechts" }, [
      themaKnopf,
      el("a", { href: REPO, target: "_blank", rel: "noreferrer noopener" }, ["Code"]),
    ]),
  );

  /* Werkzeugleiste */
  const leiste = el("div", { class: "werkzeugleiste" });
  const zaehler = el("span", { class: "zaehler" });

  const auswahl = (
    beschriftung: string,
    optionen: [string, string][],
    beim: (w: string) => void,
  ): HTMLSelectElement => {
    const s = el("select", { "aria-label": beschriftung, "data-leer": "" });
    s.append(el("option", { value: "" }, [beschriftung]));
    for (const [w, t] of optionen) s.append(el("option", { value: w }, [t]));
    s.addEventListener("change", () => {
      if (s.value) s.removeAttribute("data-leer");
      else s.setAttribute("data-leer", "");
      beim(s.value);
      zeichnen();
    });
    return s;
  };

  const familien = [...new Set(taxonomie.kompetenzen.map((k) => k.familie))];
  const sAlter = auswahl(
    "Alter",
    taxonomie.altersstufen.map((a) => [String(a.alter_bis), a.code] as [string, string]),
    (w) => (filter.altersstufe = w ? Number(w) : null),
  );
  const sFamilie = auswahl(
    "Familie",
    familien.map((f) => [f, f] as [string, string]),
    (w) => (filter.familie = w || null),
  );
  const sKompetenz = auswahl(
    "Kompetenz",
    taxonomie.kompetenzen.map((k) => [k.code, kompetenzName(k.code)] as [string, string]),
    (w) => (filter.kompetenz = w || null),
  );
  const sTiefe = auswahl(
    "Beleg",
    Object.entries(TIEFE_LABEL) as [string, string][],
    (w) => (filter.tiefe = (w || null) as Filter["tiefe"]),
  );

  const nurQuelle = el("label", { class: "umschalter" });
  const box = el("input", { type: "checkbox" }) as HTMLInputElement;
  box.addEventListener("change", () => {
    filter.nurMitQuelle = box.checked;
    zeichnen();
  });
  nurQuelle.append(box, "mit Quelle");

  const leeren = el("button", { class: "leeren", type: "button" }, ["Zurücksetzen"]);
  leeren.addEventListener("click", () => {
    Object.assign(filter, {
      suche: "",
      altersstufe: null,
      familie: null,
      kompetenz: null,
      tiefe: null,
      nurMitQuelle: false,
    });
    suche.value = "";
    box.checked = false;
    for (const s of [sAlter, sFamilie, sKompetenz, sTiefe]) {
      s.value = "";
      s.setAttribute("data-leer", "");
    }
    zeichnen();
  });

  leiste.append(sAlter, sFamilie, sKompetenz, sTiefe, nurQuelle, leeren, zaehler);

  /* Tabelle */
  const liste = el("div", { class: "liste" });
  const tabelle = el("table");
  const kopfzeile = el("tr");
  const koerper = el("tbody");

  const SPALTEN: [string, Sortierung["feld"] | null, string][] = [
    ["ID", "id", "sp-id"],
    ["Übung", "titel", "sp-titel"],
    ["Alter", "alter", "sp-alter"],
    ["Kompetenz", null, "sp-komp"],
    ["Beleg", "beleg", "sp-beleg"],
    ["Quelle", null, "sp-quelle"],
  ];
  const kopfzellen = new Map<Sortierung["feld"], HTMLElement>();
  for (const [label, feld, klasse] of SPALTEN) {
    const th = el("th", { class: feld ? `${klasse} sortierbar` : klasse, scope: "col" }, [label]);
    if (feld) {
      kopfzellen.set(feld, th);
      th.addEventListener("click", () => {
        sortierung = sortierung.feld === feld ? { feld, ab: !sortierung.ab } : { feld, ab: true };
        zeichnen();
      });
    }
    kopfzeile.append(th);
  }
  tabelle.append(el("thead", {}, [kopfzeile]), koerper);
  liste.append(tabelle);

  const dialog = el("dialog") as HTMLDialogElement;

  function sortieren(treffer: Drill[]): Drill[] {
    const { feld, ab } = sortierung;
    const wert = (d: Drill): string | number =>
      feld === "id" ? d.id
      : feld === "titel" ? d.titel.toLowerCase()
      : feld === "alter" ? (d.alter.von ?? 99)
      : STUFE[d.dokumentationstiefe] ?? 0;
    return [...treffer].sort((a, b) => {
      const [x, y] = [wert(a), wert(b)];
      const r = x < y ? -1 : x > y ? 1 : a.id.localeCompare(b.id);
      return ab && feld === "beleg" ? -r : ab ? r : -r;
    });
  }

  function zeichnen(): void {
    const treffer = sortieren(filtern(alleDrills, filter));
    const ohne = treffer.filter((d) => !d.quelle.url && !d.quelle.name).length;

    zaehler.replaceChildren(
      el("b", {}, [String(treffer.length)]),
      ` / ${alleDrills.length}`,
      ...(ohne ? [" · ", el("s", {}, [`${ohne} ohne Quelle`])] : []),
    );

    for (const [feld, th] of kopfzellen) {
      if (sortierung.feld === feld) th.setAttribute("aria-sort", sortierung.ab ? "descending" : "ascending");
      else th.removeAttribute("aria-sort");
    }

    koerper.replaceChildren();
    if (!treffer.length) {
      koerper.append(
        el("tr", {}, [el("td", { colspan: "6", class: "leer-hinweis" }, ["Kein Treffer"])]),
      );
      return;
    }
    for (const d of treffer) koerper.append(zeile(d, (x) => blatt(x, dialog)));
  }

  const fuss = el("footer", { class: "fuss" }, [
    `Quelle der Daten: ${taxonomie.quelle} · Beschreibungen sind Eigenformulierungen, Originalquelle je Zeile verlinkt · `,
  ]);
  fuss.append(
    el("a", { href: `${REPO}/blob/main/PROJEKT.md`, target: "_blank", rel: "noreferrer noopener" }, [
      "offene Punkte",
    ]),
  );

  wurzel.append(kopf, leiste, liste, dialog, fuss);
  zeichnen();
}
