import { el } from "../dom";
import { themaIstDunkel, themaUmschalten } from "../thema";
import { TIEFE_LABEL, aliaseVon, alleDrills, filtern, kompetenzName, taxonomie } from "../data";
import type { Drill, Filter } from "../types";
import { matrix } from "./abdeckung";

const REPO = "https://github.com/NojoMcDybo/courtflow";
const STUFEN = [8, 10, 12, 14, 16, 18];

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

const STUFE: Record<string, number> = {
  vollstaendig: 3,
  standard: 2,
  redaktionsscore: 2,
  kurz: 1,
  nur_belege: 1,
  nur_titel: 0,
};

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

/** Altersfenster als Strecke U8…U18 statt als Text. Ein leeres Gleis heißt:
 *  der Katalog nennt kein Fenster. */
function altersspur(d: Drill): HTMLElement {
  const leer = d.alter.von === null || d.alter.bis === null;
  const spur = el("span", {
    class: leer ? "spur leer" : "spur",
    title: leer ? "kein Altersfenster im Katalog" : `U${d.alter.von}–U${d.alter.bis}`,
  });
  for (const s of STUFEN) {
    const an = !leer && d.alter.von! <= s && s <= d.alter.bis!;
    spur.append(el("i", { class: an ? "an" : "" }));
  }
  return spur;
}

function belegbalken(d: Drill): HTMLElement {
  const n = STUFE[d.dokumentationstiefe] ?? 0;
  const box = el("span", {
    class: "balken",
    title: TIEFE_LABEL[d.dokumentationstiefe] ?? d.dokumentationstiefe,
  });
  for (let i = 1; i <= 3; i++) box.append(el("i", { class: i <= n ? "an" : "" }));
  return box;
}

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

export function seite(wurzel: HTMLElement): void {
  const filter: Filter = {
    suche: "",
    altersstufe: null,
    familie: null,
    kompetenz: null,
    tiefe: null,
    nurMitQuelle: false,
  };
  let sortierung: { feld: "id" | "titel" | "alter" | "beleg"; ab: boolean } = {
    feld: "beleg",
    ab: true,
  };
  let ansicht: "liste" | "abdeckung" = "liste";
  let sichtbar: Drill[] = [];
  let markiert = -1;

  const dialog = el("dialog") as HTMLDialogElement;
  dialog.addEventListener("close", () => zeilenFokus());

  /* ---- Leiste ---- */
  const leiste = el("header", { class: "leiste" });
  const suche = el("input", {
    type: "search",
    class: "suchfeld",
    placeholder: "Suchen",
    "aria-label": "Übungen durchsuchen",
  }) as HTMLInputElement;
  suche.addEventListener("input", () => {
    filter.suche = suche.value;
    markiert = -1;
    zeichnen();
  });

  const segListe = el("button", { type: "button", "aria-selected": "true" }, ["Liste"]);
  const segMatrix = el("button", { type: "button", "aria-selected": "false" }, ["Abdeckung"]);
  const segmente = el("div", { class: "segmente", role: "tablist" }, [segListe, segMatrix]);
  const umschalten = (neu: typeof ansicht) => {
    ansicht = neu;
    segListe.setAttribute("aria-selected", String(neu === "liste"));
    segMatrix.setAttribute("aria-selected", String(neu === "abdeckung"));
    zeichnen();
  };
  segListe.addEventListener("click", () => umschalten("liste"));
  segMatrix.addEventListener("click", () => umschalten("abdeckung"));

  const thema = el("button", { type: "button" });
  const beschriften = () => (thema.textContent = themaIstDunkel() ? "Hell" : "Dunkel");
  beschriften();
  thema.addEventListener("click", () => {
    themaUmschalten();
    beschriften();
  });

  leiste.append(
    el("span", { class: "wortmarke" }, [el("i", { "aria-hidden": "true" }, ["CF"]), "CourtFlow"]),
    suche,
    segmente,
    el("span", { class: "leiste-rechts" }, [
      thema,
      el("a", { href: REPO, target: "_blank", rel: "noreferrer noopener" }, ["Code"]),
    ]),
  );

  /* ---- Filter ---- */
  const filterzeile = el("div", { class: "filterzeile" });
  const stand = el("span", { class: "stand" });

  const auswahl = (
    name: string,
    optionen: [string, string][],
    beim: (w: string) => void,
  ): HTMLSelectElement => {
    const s = el("select", { "aria-label": name, "data-leer": "" });
    s.append(el("option", { value: "" }, [name]));
    for (const [w, t] of optionen) s.append(el("option", { value: w }, [t]));
    s.addEventListener("change", () => {
      s.value ? s.removeAttribute("data-leer") : s.setAttribute("data-leer", "");
      beim(s.value);
      markiert = -1;
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

  const hakenLabel = el("label", { class: "haken" });
  const haken = el("input", { type: "checkbox" }) as HTMLInputElement;
  haken.addEventListener("change", () => {
    filter.nurMitQuelle = haken.checked;
    zeichnen();
  });
  hakenLabel.append(haken, "mit Quelle");

  const leeren = el("button", { class: "textknopf", type: "button" }, ["Zurücksetzen"]);
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
    haken.checked = false;
    for (const s of [sAlter, sFamilie, sKompetenz, sTiefe]) {
      s.value = "";
      s.setAttribute("data-leer", "");
    }
    markiert = -1;
    zeichnen();
  });

  filterzeile.append(sAlter, sFamilie, sKompetenz, sTiefe, hakenLabel, leeren, stand);

  /* ---- Inhalt ---- */
  const bereich = el("main", { class: "bereich" });

  function oeffnen(d: Drill): void {
    dialog.replaceChildren(blattInhalt(d, () => dialog.close()));
    if (!dialog.open) dialog.showModal();
  }

  function zeilenFokus(): void {
    const tr = bereich.querySelectorAll("tbody tr")[markiert] as HTMLElement | undefined;
    tr?.focus();
  }

  function markieren(i: number): void {
    if (!sichtbar.length) return;
    markiert = Math.max(0, Math.min(sichtbar.length - 1, i));
    for (const [n, tr] of [...bereich.querySelectorAll("tbody tr")].entries()) {
      tr.setAttribute("aria-selected", String(n === markiert));
    }
    const tr = bereich.querySelectorAll("tbody tr")[markiert] as HTMLElement | undefined;
    tr?.scrollIntoView({ block: "nearest" });
    if (dialog.open) oeffnen(sichtbar[markiert]!);
    else tr?.focus();
  }

  /* Quick Look: Leertaste zeigt, Leertaste schließt, Pfeile blättern weiter. */
  document.addEventListener("keydown", (e) => {
    if (ansicht !== "liste") return;
    const imFeld = e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement;
    if (e.key === "ArrowDown" && !imFeld) {
      e.preventDefault();
      markieren(markiert + 1);
    } else if (e.key === "ArrowUp" && !imFeld) {
      e.preventDefault();
      markieren(markiert - 1);
    } else if (e.key === " " && !imFeld) {
      e.preventDefault();
      if (dialog.open) dialog.close();
      else if (markiert >= 0) oeffnen(sichtbar[markiert]!);
      else markieren(0);
    } else if (e.key === "/" && !imFeld) {
      e.preventDefault();
      suche.focus();
    }
  });

  function zeile(d: Drill, i: number): HTMLElement {
    const tr = el("tr", { tabindex: "-1", "aria-selected": String(i === markiert) });

    const codes = el("span", { class: "codes" });
    for (const c of d.kompetenz.alle.slice(0, 3)) codes.append(el("span", { class: "code" }, [c]));

    const quelle = el("td", { class: "s-quelle" });
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
      quelle.className = "s-quelle fehlt";
      quelle.append("ohne Quelle");
    }

    tr.append(
      el("td", { class: "s-id kennung" }, [d.id]),
      el("td", { class: "s-titel" }, [d.titel]),
      el("td", { class: "s-alter" }, [altersspur(d)]),
      el("td", { class: "s-komp" }, [codes]),
      el("td", { class: "s-beleg" }, [belegbalken(d)]),
      quelle,
    );

    tr.addEventListener("click", () => {
      markieren(i);
      oeffnen(d);
    });
    return tr;
  }

  function listeZeichnen(): HTMLElement {
    const t = el("table");
    const kopfzeile = el("tr");
    const SPALTEN: [string, typeof sortierung.feld | null, string][] = [
      ["ID", "id", "s-id"],
      ["Übung", "titel", "s-titel"],
      ["Alter", "alter", "s-alter"],
      ["Kompetenz", null, "s-komp"],
      ["Beleg", "beleg", "s-beleg"],
      ["Quelle", null, "s-quelle"],
    ];
    for (const [label, f, klasse] of SPALTEN) {
      const th = el("th", { class: f ? `${klasse} klickbar` : klasse, scope: "col" }, [label]);
      if (f) {
        if (sortierung.feld === f) {
          th.setAttribute("aria-sort", sortierung.ab ? "descending" : "ascending");
        }
        th.addEventListener("click", () => {
          sortierung = sortierung.feld === f ? { feld: f, ab: !sortierung.ab } : { feld: f, ab: true };
          markiert = -1;
          zeichnen();
        });
      }
      kopfzeile.append(th);
    }

    const koerper = el("tbody");
    if (!sichtbar.length) {
      koerper.append(el("tr", {}, [el("td", { colspan: "6", class: "nichts" }, ["Kein Treffer"])]));
    } else {
      sichtbar.forEach((d, i) => koerper.append(zeile(d, i)));
    }
    t.append(el("thead", {}, [kopfzeile]), koerper);
    return t;
  }

  function sortieren(treffer: Drill[]): Drill[] {
    const { feld: f, ab } = sortierung;
    const wert = (d: Drill): string | number =>
      f === "id" ? d.id
      : f === "titel" ? d.titel.toLowerCase()
      : f === "alter" ? (d.alter.von ?? 99)
      : STUFE[d.dokumentationstiefe] ?? 0;
    return [...treffer].sort((a, b) => {
      const [x, y] = [wert(a), wert(b)];
      const r = x < y ? -1 : x > y ? 1 : a.id.localeCompare(b.id);
      return f === "beleg" ? (ab ? -r : r) : ab ? r : -r;
    });
  }

  function zeichnen(): void {
    sichtbar = sortieren(filtern(alleDrills, filter));
    const ohne = sichtbar.filter((d) => !d.quelle.url && !d.quelle.name).length;
    stand.replaceChildren(
      el("b", {}, [String(sichtbar.length)]),
      ` / ${alleDrills.length}`,
      ...(ohne ? [" · ", el("s", {}, [`${ohne} ohne Quelle`])] : []),
    );

    bereich.replaceChildren(
      ansicht === "liste"
        ? listeZeichnen()
        : matrix(filter, (code, stufe) => {
            filter.kompetenz = code;
            filter.altersstufe = stufe;
            sKompetenz.value = code;
            sKompetenz.removeAttribute("data-leer");
            sAlter.value = String(stufe);
            sAlter.removeAttribute("data-leer");
            markiert = -1;
            umschalten("liste");
          }),
    );
  }

  const fuss = el("footer", { class: "fuss" });
  fuss.append(
    el("span", { class: "taste" }, ["↑"]),
    " ",
    el("span", { class: "taste" }, ["↓"]),
    " blättern · ",
    el("span", { class: "taste" }, ["Leer"]),
    " Vorschau · ",
    el("span", { class: "taste" }, ["/"]),
    " suchen · Daten aus dem Kompetenzkatalog, Originalquelle je Zeile verlinkt · ",
  );
  fuss.append(
    el("a", { href: `${REPO}/blob/main/PROJEKT.md`, target: "_blank", rel: "noreferrer noopener" }, [
      "offene Punkte",
    ]),
  );

  wurzel.append(leiste, filterzeile, bereich, dialog, fuss);
  zeichnen();
}
