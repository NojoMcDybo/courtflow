import { el } from "../dom";
import { markenIcon } from "../marke";
import { themaIstDunkel, themaUmschalten } from "../thema";
import { TIEFE_LABEL, kompetenzName } from "../data";
import { kartenbewegung } from "../bewegung";
import {
  type Block,
  type Rahmen,
  ausserhalbAlter,
  baustein,
  belastungsbefund,
  bloecke,
  minutenVerteilen,
  modell,
  neuWuerfeln,
} from "../plan";
import type { Drill } from "../types";
import { lesen, speichern, validiereRahmen, wiederherstellen, type GespeicherterPlan } from "../speicher";

const REPO = "https://github.com/NojoMcDybo/courtflow";
const SPEICHER = "courtflow.plan";

type Modus = "fuehrung" | "automatik";

const pfadName = (id: string): string => {
  const p = modell.pfade.find((x) => x.id === id)!;
  return p.name ?? `${p.id} · ${p.ziel}`;
};

const FEDER = "cubic-bezier(0.32, 0.72, 0, 1)";
const ruhig = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SKALEN_KURZ: Record<string, string> = {
  entscheidung: "Entscheidung",
  gegnerdruck: "Gegnerdruck",
  technik: "Technik",
  spielnaehe: "Spielnähe",
  zeitdruck: "Zeitdruck",
  raumdruck: "Raumdruck",
  wahrnehmung: "Wahrnehmung",
  kooperation: "Kooperation",
};

/** Was in der aufgeklappten Karte steht. Leere Felder bleiben weg statt
 *  als Platzhalter zu erscheinen. */
function detailInhalt(d: Drill): HTMLElement {
  const box = el("div", { class: "detailinhalt" });
  box.append(el("p", { class: "kennung" }, [d.id]));
  for (const [label, wert] of [
    ["Lernziel", d.lernziel],
    ["Ablauf", d.ablauf ?? d.evidenz],
    ["Coachingpunkte", d.coachingpunkte],
    ["Typische Fehler", d.typische_fehler],
    ["Regression", d.regression],
    ["Progression", d.progression],
  ] as [string, string | null][]) {
    if (wert) box.append(el("h4", {}, [label]), el("p", {}, [wert]));
  }

  const felder = el("div", { class: "felder" });
  const paar = (l: string, w: string | null) =>
    w ? felder.append(el("div", {}, [el("b", {}, [l]), w])) : undefined;
  paar("Alter", d.alter.roh);
  paar("Kompetenz", d.kompetenz.alle.map(kompetenzName).join(", "));
  paar("Dauer", d.dauer_min.roh);
  paar("Spieler", d.spielerzahl.roh);
  paar("Raum", d.raum);
  paar("Material", d.material);
  paar("Methodik", d.methodik);
  paar("Erfahrung", d.erfahrung);
  for (const [name, wert] of Object.entries(d.skalen)) {
    if (wert && wert.wert !== null) paar(SKALEN_KURZ[name] ?? name, wert.roh);
  }
  if (felder.childElementCount) box.append(el("h4", {}, ["Merkmale"]), felder);

  box.append(el("h4", {}, ["Quelle"]));
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
  box.append(q);
  box.append(
    el("p", { class: "fussnote" }, [
      `Beleg: ${TIEFE_LABEL[d.dokumentationstiefe]}${
        d.dokumentationstiefe === "vollstaendig" ? "" : " — leere Felder fehlen in der Quelle"
      }`,
    ]),
  );
  return box;
}

/** Aufklappen und Zuklappen mit gemessener Höhe, damit es nicht springt. */
function klappen(huelle: HTMLElement, auf: boolean): void {
  const inhalt = huelle.firstElementChild as HTMLElement | null;
  if (!inhalt) return;
  if (ruhig()) {
    huelle.style.height = auf ? "auto" : "0px";
    return;
  }
  const von = huelle.getBoundingClientRect().height;
  const bis = auf ? inhalt.scrollHeight : 0;
  huelle.style.height = `${von}px`;
  huelle.animate([{ height: `${von}px` }, { height: `${bis}px` }], {
    duration: 300,
    easing: FEDER,
  }).addEventListener("finish", () => {
    huelle.style.height = auf ? "auto" : "0px";
  });
}

const drillName = (d: Drill): string => /^QA\s/.test(d.titel) || d.titel.length > 180
  ? d.originaltitel ?? "Übung ohne Kurztitel" : d.titel;

function drillZeile(d: Drill, stufe: number): HTMLElement {
  const alter = d.alter.von === null || d.alter.bis === null ? "Alter offen"
    : d.alter.von === d.alter.bis ? `U${d.alter.von}` : `U${d.alter.von}–U${d.alter.bis}`;
  return el("span", { class: "karte-zeile" }, [
    el("span", { class: ausserhalbAlter(d, stufe) ? "drill-alter ausser" : "drill-alter" }, [alter]),
    el("span", { class: "karte-titel" }, [drillName(d)]),
  ]);
}
export function training(wurzel: HTMLElement, modus: Modus): () => void {
  const rahmen: Rahmen = { pfadId: "TR-05", dauer: 90, altersstufe: 12 };
  let plan: Block[] = [];
  let schritt = 0;
  let letzte: Block[] | null = null;
  /* Die Führung fragt nacheinander: erst die Altersgruppe, dann die
     Trainingsart, dann kommen die Übungsblöcke. Die Automatik überspringt
     das nicht — sie hat dieselben Angaben nur alle in einer Zeile. */
  type Phase = "alter" | "art" | "bloecke";
  let phase: Phase = modus === "fuehrung" ? "alter" : "bloecke";
  const offen = new Set<string>();
  const bewegung = kartenbewegung();
  let beschaeftigt = false;
  let verteilen = false;
  let beendet = false;
  let austausch: string | null = null;
  let ankunft: string | null = null;
  let rueckgabe: Drill | null = null;
  const ausstehend = new Set<string>();

  let archiv: GespeicherterPlan[] = [];
  let speicherFehler: string | null = null;
  let ladeHinweise: string[] = [];
  let planId: string = crypto.randomUUID();
  let planName = "";
  let letzteSignatur = "";
  let aktiveId: string | null = null;

  try {
    const gelesen = lesen(localStorage);
    archiv = gelesen.plaene;
    speicherFehler = gelesen.fehler;
    aktiveId = localStorage.getItem(`courtflow.aktiv.${modus}`);
    // Alte Rahmeneinstellungen sind optional; kaputtes JSON darf das Archiv nicht sperren.
    try {
      const roh = localStorage.getItem(`${SPEICHER}.${modus}`);
      const alt = roh ? validiereRahmen(JSON.parse(roh)) : null;
      if (alt) Object.assign(rahmen, alt);
    } catch { /* Ungültige Altdaten: geprüfte Vorgabewerte nutzen. */ }
  } catch {
    speicherFehler = "Browserspeicher nicht verfügbar. Änderungen bleiben nur bis zum Schließen erhalten.";
  }

  const standardName = () => `U${rahmen.altersstufe} · ${pfadName(rahmen.pfadId)}`;
  const entwurf = (): GespeicherterPlan => ({
    version: 1, id: planId, name: planName.trim() || standardName(), modus,
    rahmen: { ...rahmen },
    bloecke: plan.map((b) => ({ code: b.code, minuten: b.minuten, drillId: b.gewaehlt?.id ?? null })),
    aktualisiert: new Date().toISOString(),
  });
  const signatur = (p: GespeicherterPlan) => JSON.stringify({ ...p, aktualisiert: "" });

  function laden(p: GespeicherterPlan): void {
    austausch = null;
    ankunft = null;
    const geladen = wiederherstellen(p);
    Object.assign(rahmen, p.rahmen);
    planId = p.id;
    planName = p.name;
    plan = geladen.bloecke;
    ladeHinweise = geladen.hinweise;
    schritt = plan.findIndex((b) => !b.gewaehlt);
    if (schritt < 0) schritt = plan.length;
    phase = "bloecke";
    offen.clear();
    letzteSignatur = signatur(entwurf());
  }

  const fortsetzen = archiv.find((p) => p.id === aktiveId) ?? archiv.find((p) => p.modus === modus);
  if (fortsetzen) laden(fortsetzen);

  const sichern = () => {
    try {
      localStorage.setItem(`${SPEICHER}.${modus}`, JSON.stringify(rahmen));
      if (archiv.some((p) => p.id === planId)) localStorage.setItem(`courtflow.aktiv.${modus}`, planId);
    } catch {
      /* egal */
    }
  };

  /* Ein gemeinsames Archiv für beide Wege; Speichern nur bei Inhaltsänderung. */
  function planSichern(): void {
    if (!plan.length || phase !== "bloecke") return;
    const p = entwurf();
    const neu = signatur(p);
    if (neu === letzteSignatur) return;
    try {
      const ergebnis = speichern(localStorage, p);
      speicherFehler = ergebnis.fehler;
      if (!ergebnis.fehler) {
        archiv = ergebnis.plaene;
        letzteSignatur = neu;
        sichern();
      }
    } catch {
      speicherFehler = "Speichern nicht möglich. Änderungen bleiben nur bis zum Schließen erhalten.";
    }
  }

  function neuerEntwurf(): void {
    austausch = null;
    ankunft = null;
    planId = crypto.randomUUID();
    planName = "";
    letzteSignatur = "";
    ladeHinweise = [];
    offen.clear();
  }

  /* ---- Kopf ---- */
  const kopf = el("header", { class: "leiste" });
  const thema = el("button", { type: "button" });
  const beschriften = () => (thema.textContent = themaIstDunkel() ? "Hell" : "Dunkel");
  beschriften();
  thema.addEventListener("click", () => {
    themaUmschalten();
    beschriften();
  });
  kopf.append(
    el("a", { class: "wortmarke", href: "#/", title: "Zur Startseite" }, [
      markenIcon(),
      "CourtFlow",
    ]),
    el("span", { class: "seitentitel" }, [
      modus === "fuehrung" ? "Trainingsaufbau" : "Automatischer Plan",
    ]),
    el("span", { class: "leiste-rechts" }, [
      thema,
      el("a", { href: "#/bibliothek" }, ["Bibliothek"]),
    ]),
  );

  const ablage = el("section", { class: "planablage", "aria-label": "Gespeicherte Trainingspläne" });
  const verwaltung = el("details", { class: "planverwaltung" }, [el("summary", {}, ["Meine Pläne"]), ablage]);
  const nameLabel = el("label", { class: "planname-label" }, ["Planname"]);
  const nameEingabe = el("input", { type: "text", maxlength: "80", "aria-label": "Planname" });
  nameLabel.append(nameEingabe);
  const verlaufLabel = el("label", { class: "verlauf-label" }, ["Letzte Pläne"]);
  const verlauf = el("select", { "aria-label": "Letzte Pläne" });
  verlaufLabel.append(verlauf);
  const neu = el("button", { type: "button", class: "textknopf" }, ["Neues Training"]);
  const speicherStand = el("p", { class: "speicherstand", role: "status", "aria-live": "polite" });
  const erneut = el("button", { type: "button", class: "textknopf" }, ["Erneut speichern"]);
  ablage.append(nameLabel, verlaufLabel, neu, speicherStand, erneut);

  function ablageZeichnen(): void {
    nameLabel.hidden = phase !== "bloecke" || !plan.length;
    if (document.activeElement !== nameEingabe) nameEingabe.value = planName || standardName();
    verlauf.replaceChildren(el("option", { value: "" }, [archiv.length ? "Plan öffnen …" : "Noch keine Pläne"]));
    for (const p of archiv) {
      const fertig = p.bloecke.every((b) => b.drillId !== null);
      const datum = new Date(p.aktualisiert).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      verlauf.append(el("option", { value: p.id }, [
        `${p.name} · ${p.rahmen.dauer} min · ${datum}${fertig ? "" : " · Entwurf"}`,
      ]));
    }
    verlauf.value = archiv.some((p) => p.id === planId) ? planId : "";
    verlauf.disabled = !archiv.length;
    speicherStand.textContent = speicherFehler ?? (letzteSignatur
      ? "In diesem Browser gespeichert · letzte 10 Pläne"
      : "Pläne werden in diesem Browser gespeichert · letzte 10 Pläne");
    speicherStand.classList.toggle("speicherfehler", Boolean(speicherFehler));
    erneut.hidden = !speicherFehler || !plan.length || phase !== "bloecke";
  }

  nameEingabe.addEventListener("input", () => {
    planName = nameEingabe.value;
    const druckName = bereich.querySelector(".druck-planname");
    if (druckName) druckName.textContent = planName.trim() || standardName();
    planSichern();
    ablageZeichnen();
  });
  nameEingabe.addEventListener("blur", () => { nameEingabe.value = planName.trim() || standardName(); });
  erneut.addEventListener("click", () => { planSichern(); ablageZeichnen(); });
  verlauf.addEventListener("change", () => {
    const p = archiv.find((x) => x.id === verlauf.value);
    if (!p) return;
    laden(p);
    // Öffnen ändert weder Auswahl noch Archiv; nur der Fortsetzungszeiger wechselt.
    sAlter.value = String(rahmen.altersstufe);
    sDauer.value = String(rahmen.dauer);
    sWeg.replaceChildren(...wegOptionen().map(([id, t]) => el("option", { value: id }, [t])));
    sWeg.value = rahmen.pfadId;
    sichern();
    zeichnen();
  });
  function neuesTraining(): void {
    neuerEntwurf();
    plan = [];
    letzte = null;
    schritt = 0;
    if (modus === "fuehrung") { phase = "alter"; zeichnen(); }
    else neuAufbauen();
  }
  neu.addEventListener("click", neuesTraining);

  /* ---- Rahmenzeile ---- */
  const zeile = el("div", { class: "filterzeile trainingsrahmen" });
  const hinweis = el("span", { class: "stand" });

  const auswahl = (
    name: string,
    optionen: [string, string][],
    wert: string,
    beim: (w: string) => void,
  ): HTMLSelectElement => {
    const s = el("select", { "aria-label": name });
    for (const [w, t] of optionen) s.append(el("option", { value: w }, [t]));
    s.value = wert;
    s.addEventListener("change", () => {
      beim(s.value);
      sichern();
      neuerEntwurf();
      neuAufbauen();
    });
    return s;
  };

  const stufen = modell.pfade;
  const wegOptionen = (): [string, string][] =>
    stufen
      .filter(
        (p) =>
          p.alter_von === null ||
          (p.alter_von <= rahmen.altersstufe && rahmen.altersstufe <= (p.alter_bis ?? 18)),
      )
      .map((p) => [p.id, `${pfadName(p.id)} · ${p.folge.join("→")}`] as [string, string]);

  let sWeg = auswahl("Aufbauweise", wegOptionen(), rahmen.pfadId, (w) => (rahmen.pfadId = w));
  const sAlter = auswahl(
    "Altersstufe",
    [8, 10, 12, 14, 16, 18].map((u) => [String(u), `U${u}`] as [string, string]),
    String(rahmen.altersstufe),
    (w) => {
      rahmen.altersstufe = Number(w);
      const moeglich = wegOptionen();
      if (!moeglich.some(([id]) => id === rahmen.pfadId)) rahmen.pfadId = moeglich[0]![0];
      const neu = auswahl("Aufbauweise", moeglich, rahmen.pfadId, (x) => (rahmen.pfadId = x));
      sWeg.replaceWith(neu);
      sWeg = neu;
    },
  );
  const sDauer = auswahl(
    "Dauer",
    modell.referenzdauern.map((d) => [String(d), `${d} min`] as [string, string]),
    String(rahmen.dauer),
    (w) => (rahmen.dauer = Number(w)),
  );

  const wuerfeln = el("button", { class: "haupttaste", type: "button" }, ["Neu würfeln"]);
  wuerfeln.addEventListener("click", () => {
    if (beschaeftigt) return;
    letzte = plan.some((b) => b.gewaehlt) ? plan : null;
    neuerEntwurf();
    void automatischEinsetzen(neuWuerfeln(rahmen, letzte));
  });

  if (modus === "automatik") {
    zeile.append(sAlter, sDauer, sWeg, wuerfeln, hinweis);
  }

  /* ---- Inhalt ---- */
  const bereich = el("main", { class: "bereich plan trainingsstudio" });
  const meldung = el("p", { class: "bewegungsstatus", role: "status", "aria-live": "polite", "aria-atomic": "true" });
  const dialog = el("dialog", { class: "drill-dialog" });
  let detailAusloeser: HTMLElement | null = null;
  dialog.addEventListener("close", () => detailAusloeser?.focus());

  function vorschau(d: Drill, taste: HTMLElement): void {
    detailAusloeser = taste;
    dialog.setAttribute("aria-label", drillName(d));
    const zu = el("button", { class: "schliessen", type: "button", "aria-label": "Schließen" }, ["✕"]);
    zu.addEventListener("click", () => dialog.close());
    dialog.replaceChildren(el("div", { class: "blatt" }, [
      el("div", { class: "blatt-kopf" }, [el("h2", {}, [d.titel]), zu]), detailInhalt(d),
    ]));
    dialog.showModal();
  }

  function bewegungsZiel(code: string): HTMLElement | null {
    if (window.matchMedia("(max-width: 900px)").matches) {
      return bereich.querySelector<HTMLElement>(".mobiles-ziel .zielkarte");
    }
    const ziel = bereich.querySelector<HTMLElement>(`.planzeile[data-block="${code}"] .plan-einsatz`);
    // Only move the internal plan list; never move the user's whole page mid-flight.
    const liste = bereich.querySelector<HTMLElement>(".plan-scroll");
    if (ziel && liste) {
      const r = ziel.getBoundingClientRect();
      const l = liste.getBoundingClientRect();
      if (r.top < l.top || r.bottom > l.bottom) liste.scrollTop += r.top - l.top - 12;
    }
    return ziel;
  }

  async function einsetzen(b: Block, d: Drill, karte: HTMLElement): Promise<void> {
    if (beschaeftigt) return;
    const start = bewegung.merken(karte);
    const alt = b.gewaehlt;
    const alterPlatz = bewegungsZiel(b.code);
    const rueckStart = alt && alterPlatz ? bewegung.merken(alterPlatz) : null;
    rueckgabe = alt;
    beschaeftigt = true;
    ankunft = b.code;
    b.gewaehlt = d;
    offen.delete(b.code);
    zeichnen();
    const ziel = bewegungsZiel(b.code);
    const zurueck = bereich.querySelector<HTMLElement>(".rueckgabe .vorschlagskarte");
    await Promise.all([
      ...(ziel ? [bewegung.fliegen(start, ziel)] : []),
      ...(rueckStart && zurueck ? [bewegung.fliegen(rueckStart, zurueck)] : []),
    ]);
    if (beendet) return;
    beschaeftigt = false;
    verteilen = false;
    austausch = null;
    ankunft = null;
    rueckgabe = null;
    schritt = plan.findIndex(x => !x.gewaehlt);
    if (schritt < 0) schritt = plan.length;
    zeichnen();
    meldung.textContent = `${drillName(d)} → ${baustein(b.code).kurz}${alt ? ` · ersetzt ${drillName(alt)}` : ""}`;
    bereich.querySelector<HTMLElement>(".auswahlbereich h2, .abschluss h2")?.focus({ preventScroll: true });
  }

  async function automatischEinsetzen(neu: Block[]): Promise<void> {
    if (beschaeftigt || beendet) return;
    plan = neu;
    verteilen = !ruhig();
    austausch = null;
    ausstehend.clear();
    if (!ruhig()) for (const b of plan) if (b.gewaehlt) ausstehend.add(b.code);
    beschaeftigt = ausstehend.size > 0;
    schritt = plan.length;
    zeichnen(); // Persist the full result once; animation never changes the stored plan.
    for (const b of plan) {
      if (beendet) return;
      if (!ausstehend.has(b.code)) continue;
      const karte = bereich.querySelector<HTMLElement>(`[data-vorschlag="${b.code}"]`);
      const start = karte ? bewegung.merken(karte) : null;
      ankunft = b.code;
      ausstehend.delete(b.code);
      zeichnen();
      const ziel = bewegungsZiel(b.code);
      if (start && ziel) await bewegung.fliegen(start, ziel);
    }
    if (beendet) return;
    beschaeftigt = false;
    verteilen = false;
    ankunft = null;
    schritt = plan.findIndex(b => !b.gewaehlt);
    if (schritt < 0) schritt = plan.length;
    zeichnen();
    meldung.textContent = schritt === plan.length ? "Dein Training steht. Alle Karten sind eingesetzt." : "Vorschläge eingesetzt. Offene Blöcke kannst du selbst füllen.";
  }

  function minutenText(folge: string[]): number[] {
    return minutenVerteilen(folge, rahmen.dauer, rahmen.altersstufe);
  }

  function neuAufbauen(): void {
    if (modus === "automatik") { void automatischEinsetzen(neuWuerfeln(rahmen, null)); return; }
    plan = bloecke(rahmen);
    schritt = 0;
    zeichnen();
  }

  function schrittleiste(): HTMLElement {
    const leiste = el("nav", { class: "schritte", "aria-label": "Ablauf" });
    const stufen: [Phase, string, string | null][] = [
      ["alter", "Altersgruppe", phase === "alter" ? null : `U${rahmen.altersstufe}`],
      ["art", "Trainingsart", phase === "bloecke" ? pfadName(rahmen.pfadId) : null],
      ["bloecke", "Übungen", null],
    ];
    stufen.forEach(([p, name, wert], i) => {
      const erledigt =
        (p === "alter" && phase !== "alter") || (p === "art" && phase === "bloecke");
      const knopf = el("button", {
        class: `schritt${phase === p ? " jetzt" : ""}${erledigt ? " fertig" : ""}`,
        type: "button",
        ...(erledigt ? {} : { disabled: "" }),
      });
      knopf.append(
        el("span", { class: "schrittnr" }, [String(i + 1)]),
        el("span", { class: "schrittname" }, [name]),
      );
      if (wert) knopf.append(el("span", { class: "schrittwert" }, [wert]));
      knopf.addEventListener("click", () => {
        phase = p;
        zeichnen();
      });
      leiste.append(knopf);
    });
    return leiste;
  }

  function alterWaehlen(): HTMLElement {
    const box = el("section", { class: "wahlbild" });
    box.append(
      el("h2", {}, ["Für welche Altersgruppe?"]),
      el("p", { class: "blockfunktion" }, [
        "Die Altersstufe steuert, welche Trainingsarten zur Wahl stehen und wie die Zeit auf die Blöcke verteilt wird.",
      ]),
    );
    const raster = el("div", { class: "grossewahl" });
    for (const u of [8, 10, 12, 14, 16, 18]) {
      const wege = modell.pfade.filter(
        (p) => (p.alter_von ?? 8) <= u && u <= (p.alter_bis ?? 18),
      ).length;
      const knopf = el("button", {
        class: `grosskarte${rahmen.altersstufe === u ? " gewaehlt" : ""}`,
        type: "button",
      });
      knopf.append(
        el("span", { class: "grossziffer" }, [`U${u}`]),
        el("span", { class: "grossnote" }, [`${wege} Trainingsarten`]),
      );
      knopf.addEventListener("click", () => {
        if (rahmen.altersstufe !== u) {
          neuerEntwurf();
          plan = [];
        }
        rahmen.altersstufe = u;
        const moeglich = wegOptionen();
        if (!moeglich.some(([id]) => id === rahmen.pfadId)) rahmen.pfadId = moeglich[0]![0];
        sichern();
        phase = "art";
        zeichnen();
      });
      raster.append(knopf);
    }
    box.append(raster);
    return box;
  }

  function artWaehlen(): HTMLElement {
    const box = el("section", { class: "wahlbild" });
    box.append(
      el("h2", {}, [`Welche Trainingsart für U${rahmen.altersstufe}?`]),
      el("p", { class: "blockfunktion" }, [
        "Die Trainingsart legt die Blockfolge fest. Referenzpfade stammen aus dem Katalog, abgeleitete Wege sind gekennzeichnet.",
      ]),
    );

    const dauerzeile = el("div", { class: "dauerwahl" });
    dauerzeile.append(el("span", { class: "dauerlabel" }, ["Dauer"]));
    const segmente = el("div", { class: "segmente" });
    for (const d of modell.referenzdauern) {
      const k = el("button", {
        type: "button",
        "aria-selected": String(rahmen.dauer === d),
      }, [`${d} min`]);
      k.addEventListener("click", () => {
        if (rahmen.dauer !== d) {
          neuerEntwurf();
          plan = [];
        }
        rahmen.dauer = d;
        sichern();
        zeichnen();
      });
      segmente.append(k);
    }
    dauerzeile.append(segmente);
    box.append(dauerzeile);

    const raster = el("div", { class: "grossewahl breit" });
    for (const p of modell.pfade.filter(
      (x) => (x.alter_von ?? 8) <= rahmen.altersstufe && rahmen.altersstufe <= (x.alter_bis ?? 18),
    )) {
      const minuten = minutenText(p.folge);
      const knopf = el("button", {
        class: `grosskarte artkarte${rahmen.pfadId === p.id ? " gewaehlt" : ""}`,
        type: "button",
      });
      const kopfEl = el("span", { class: "artkopf" });
      kopfEl.append(el("span", { class: "artname" }, [pfadName(p.id)]));
      kopfEl.append(
        el("span", { class: p.herkunft === "abgeleitet" ? "pille schwach" : "pille" }, [
          p.herkunft === "abgeleitet" ? "abgeleitet" : p.id,
        ]),
      );
      knopf.append(kopfEl);
      const folge = el("span", { class: "artfolge" });
      p.folge.forEach((c, i) => {
        folge.append(el("span", { class: "blockcode" }, [c]));
        folge.append(el("span", { class: "folgezeit" }, [`${minuten[i]}′`]));
      });
      knopf.append(folge);
      if (p.individualisierung) {
        knopf.append(el("span", { class: "artnote" }, [p.individualisierung]));
      }
      knopf.addEventListener("click", () => {
        const behalten = rahmen.pfadId === p.id && plan.length > 0;
        if (!behalten) neuerEntwurf();
        rahmen.pfadId = p.id;
        sichern();
        phase = "bloecke";
        if (behalten) zeichnen();
        else neuAufbauen();
      });
      raster.append(knopf);
    }
    box.append(raster);
    return box;
  }

  function aktiverBlock(): Block | undefined {
    return plan.find(b => b.code === (ankunft ?? austausch)) ?? plan.find(b => !b.gewaehlt);
  }

  function planZeilen(): HTMLElement {
    const liste = el("ol", { class: "planliste" });
    const aktiv = aktiverBlock();
    plan.forEach((b, i) => {
      const bs = baustein(b.code);
      const d = ausstehend.has(b.code) ? null : b.gewaehlt;
      const zeileEl = el("li", {
        class: `planzeile${aktiv === b ? " aktiv" : ""}${d ? " voll" : ""}`,
        "data-block": b.code,
      });
      zeileEl.append(el("div", { class: "planzeile-kopf" }, [
        el("span", { class: "blockcode" }, [String(i + 1).padStart(2, "0")]),
        el("span", { class: "blockname" }, [bs.kurz]),
        el("span", { class: "blockzeit" }, [`${b.minuten} min`]),
      ]));
      const einsatz = el("div", { class: "plan-einsatz" });
      if (d) {
        const istOffen = offen.has(b.code);
        const taste = el("button", {
          class: "kartenkopf-taste", type: "button", "aria-expanded": String(istOffen),
          "aria-controls": `detail-${b.code}`, "aria-label": `${drillName(d)} – Details`,
        }, [drillZeile(d, rahmen.altersstufe), el("span", { class: "pfeilchen", "aria-hidden": "true" }, ["⌄"])]);
        const huelle = el("div", { class: "detailhuelle", id: `detail-${b.code}` });
        huelle.style.height = istOffen ? "auto" : "0px";
        huelle.inert = !istOffen;
        huelle.append(detailInhalt(d));
        taste.addEventListener("click", () => {
          const auf = !offen.has(b.code);
          auf ? offen.add(b.code) : offen.delete(b.code);
          taste.setAttribute("aria-expanded", String(auf));
          huelle.inert = !auf;
          zeileEl.classList.toggle("offen", auf);
          klappen(huelle, auf);
        });
        if (istOffen) zeileEl.classList.add("offen");
        einsatz.append(taste);
        const tauschen = el("button", { class: "tauschen-taste", type: "button", "aria-label": `${bs.kurz}: Übung tauschen` }, ["⇄ Tauschen"]);
        tauschen.addEventListener("click", () => {
          if (beschaeftigt) return;
          austausch = b.code;
          schritt = i;
          offen.delete(b.code);
          zeichnen();
          bereich.querySelector<HTMLElement>(".auswahlbereich")?.scrollIntoView({ block: "start", behavior: "instant" });
          bereich.querySelector<HTMLElement>(".auswahlbereich h2")?.focus({ preventScroll: true });
        });
        zeileEl.append(einsatz, huelle, tauschen);
      } else {
        const waehlen = el("button", { class: "platzhalter-karte", type: "button", "aria-label": `${bs.kurz}: Übung auswählen` }, [
          el("span", { "aria-hidden": "true" }, ["＋"]), ausstehend.has(b.code) ? "Karte kommt hierhin" : "Übung einsetzen",
        ]);
        waehlen.addEventListener("click", () => {
          austausch = b.code;
          schritt = i;
          zeichnen();
          bereich.querySelector<HTMLElement>(".auswahlbereich")?.scrollIntoView({ block: "start", behavior: "instant" });
          bereich.querySelector<HTMLElement>(".auswahlbereich h2")?.focus({ preventScroll: true });
        });
        einsatz.append(waehlen);
        zeileEl.append(einsatz);
      }
      liste.append(zeileEl);
    });
    return liste;
  }

  function kandidatenKarte(d: Drill, b: Block): HTMLElement {
    const karte = el("article", { class: "vorschlagskarte", "data-drill": d.id });
    const details = el("button", { class: "vorschau-taste", type: "button", "aria-haspopup": "dialog", "aria-label": `${drillName(d)} – Details` }, [
      drillZeile(d, rahmen.altersstufe), el("span", { class: "kartendetail-link" }, ["Details ↗"]),
    ]);
    details.addEventListener("click", () => vorschau(d, details));
    const waehlen = el("button", { class: "einsetzen-taste", type: "button", "aria-label": `${drillName(d)} einsetzen` }, [
      b.gewaehlt ? "Ersetzen" : "Einsetzen", el("span", { "aria-hidden": "true" }, ["→"]),
    ]);
    waehlen.addEventListener("click", () => { void einsetzen(b, d, karte); });
    karte.append(details, waehlen);
    return karte;
  }

  function auswahlKarten(b: Block): HTMLElement {
    const box = el("section", { class: "auswahlbereich", "aria-label": "Übungsauswahl" });
    const bs = baustein(b.code);
    const [, max] = modell.regeln.karten_je_schritt as [number, number];
    const gezeigt = b.kandidaten.filter(d => !plan.some(x => x.gewaehlt?.id === d.id)).slice(0, max);
    box.append(
      el("span", { class: "studio-augenbraue" }, ["Aus der Übungsauswahl"]),
      el("h2", { tabindex: "-1" }, [b.gewaehlt ? `Alternative für ${bs.kurz}` : `Wähle für ${bs.kurz}`]),
      el("p", { class: "blockfunktion" }, [`U${rahmen.altersstufe} · ${b.minuten} Minuten im Plan`]),
    );
    if (b.gewaehlt && !beschaeftigt) {
      const abbrechen = el("button", { class: "tauschen-taste", type: "button" }, ["Bisherige Übung behalten"]);
      abbrechen.addEventListener("click", () => {
        austausch = null;
        zeichnen();
        bereich.querySelector<HTMLElement>(`.planzeile[data-block="${b.code}"] .tauschen-taste`)?.focus();
      });
      box.append(abbrechen);
    }
    if (rueckgabe) {
      box.append(el("div", { class: "rueckgabe" }, [
        el("span", { class: "studio-augenbraue" }, ["Zurück in die Auswahl"]), kandidatenKarte(rueckgabe, b),
      ]));
    }
    const raster = el("div", { class: "kartenwahl" });
    for (const d of gezeigt) if (d.id !== rueckgabe?.id) raster.append(kandidatenKarte(d, b));
    if (!gezeigt.length && !rueckgabe) raster.append(el("p", { class: "duenn" }, ["Keine weitere passende Übung im Bestand. Wähle einen anderen Block oder behalte deine Auswahl."]));
    box.append(raster);
    return box;
  }

  function vorschlagsStapel(): HTMLElement {
    const box = el("section", { class: "auswahlbereich verteilstapel", "aria-label": "Automatische Vorschläge" }, [
      el("span", { class: "studio-augenbraue" }, ["Aus der Übungsauswahl"]),
      el("h2", { tabindex: "-1" }, ["Dein Training entsteht"]),
      el("p", { class: "blockfunktion" }, ["Passende Karten wandern in ihre Trainingsblöcke."]),
    ]);
    const raster = el("div", { class: "kartenwahl" });
    for (const b of plan) {
      if (!b.gewaehlt || !ausstehend.has(b.code)) continue;
      raster.append(el("article", { class: "vorschlagskarte automatisch-karte", "data-vorschlag": b.code }, [
        drillZeile(b.gewaehlt, rahmen.altersstufe),
        el("span", { class: "karten-route" }, [`→ ${baustein(b.code).kurz} · ${b.minuten} min`]),
      ]));
    }
    if (!raster.childElementCount) raster.append(el("p", { class: "blockfunktion" }, ["Die letzte Karte wird eingesetzt …"]));
    box.append(raster);
    return box;
  }

  function mobilesZiel(): HTMLElement {
    const b = aktiverBlock() ?? plan[plan.length - 1];
    const box = el("aside", { class: "mobiles-ziel", "aria-label": "Ziel im Trainingsplan" });
    if (b) box.append(el("div", { class: "zielkarte" }, [
      el("span", { class: "studio-augenbraue" }, [`Dein Plan → ${baustein(b.code).kurz} · ${b.minuten} min`]),
      el("strong", {}, [b.gewaehlt && !ausstehend.has(b.code) ? drillName(b.gewaehlt) : "Hier kommt deine Karte hin"]),
    ]));
    return box;
  }
  function abschluss(): HTMLElement {
    const box = el("section", { class: "abschluss" });
    const befund = belastungsbefund(plan);
    const summe = plan.reduce((a, b) => a + b.minuten, 0);
    box.append(
      el("h2", { tabindex: "-1" }, ["Alle Karten am richtigen Platz."]),
      el("p", { class: "blockfunktion" }, [
        `${summe} Minuten Übungszeit · ${plan.length} Blöcke · ${Math.round(
          rahmen.dauer * modell.regeln.organisationsanteil,
        )} min Organisation eingerechnet`,
      ]),
    );
    if (befund) box.append(el("p", { class: "duenn" }, [befund]));
    const drucken = el("button", { class: "haupttaste", type: "button" }, ["Drucken"]);
    drucken.addEventListener("click", () => window.print());
    const nochmal = el("button", { class: "textknopf", type: "button" }, ["Von vorn"]);
    nochmal.addEventListener("click", neuesTraining);
    box.append(el("div", { class: "abschluss-tasten" }, [drucken, nochmal]));
    return box;
  }

  function zeichnen(): void {
    if (beendet) return;
    planSichern();
    ablageZeichnen();
    const pfad = modell.pfade.find(p => p.id === rahmen.pfadId)!;
    hinweis.textContent = `${plan.length} Blöcke`;
    verwaltung.inert = beschaeftigt;
    zeile.inert = beschaeftigt;
    bereich.inert = beschaeftigt;
    bereich.setAttribute("aria-busy", String(beschaeftigt));
    const intro = el("div", { class: "studio-kopf" }, [
      el("div", {}, [
        el("span", { class: "studio-augenbraue" }, [modus === "fuehrung" ? "02 / Gemeinsam aufbauen" : "03 / Automatisch zusammenstellen"]),
        el("h1", {}, [modus === "fuehrung" ? "Dein Training. Karte für Karte." : "Ein Plan für dein Team."]),
      ]),
      ...(phase === "bloecke" ? [el("span", { class: "studio-rahmen" }, [`U${rahmen.altersstufe} · ${rahmen.dauer} min`])] : []),
    ]);
    if (modus === "fuehrung" && phase !== "bloecke") {
      bereich.replaceChildren(intro, schrittleiste(), phase === "alter" ? alterWaehlen() : artWaehlen());
      return;
    }

    const vorherScroll = bereich.querySelector<HTMLElement>(".plan-scroll")?.scrollTop ?? 0;
    const spalten = el("div", { class: "plan-spalten" });
    const zielbereich = el("section", { class: "plan-links", "aria-label": "Dein Trainingsplan" });
    const anzahl = plan.filter(b => b.gewaehlt && !ausstehend.has(b.code)).length;
    zielbereich.append(
      el("p", { class: "druck-planname" }, [planName.trim() || standardName()]),
      el("div", { class: "plan-kopf" }, [
        el("div", {}, [el("span", { class: "studio-augenbraue" }, ["In deinen Trainingsplan"]), el("h2", { class: "plan-ziel" }, ["Dein Training"])]),
        el("span", { class: "plan-zaehler" }, [`${anzahl} / ${plan.length}`]),
      ]),
      el("progress", { class: "plan-fortschritt", value: String(anzahl), max: String(plan.length || 1), "aria-label": "Eingesetzte Übungen" }),
      el("p", { class: "plan-art" }, [pfadName(rahmen.pfadId)]),
    );
    const liste = el("div", { class: "plan-scroll" }, [planZeilen()]);
    zielbereich.append(liste);
    zielbereich.append(el("details", { class: "modellinfo" }, [
      el("summary", {}, ["Zum Trainingsaufbau"]),
      el("p", { class: "blockfunktion" }, [pfad.ziel]),
      el("p", { class: "blockfunktion" }, [pfad.herkunft === "abgeleitet" ? "Redaktionell abgeleitete Aufbauweise" : `Katalogpfad ${pfad.id}`]),
      ...(pfad.individualisierung ? [el("p", { class: "blockfunktion" }, [pfad.individualisierung])] : []),
    ]));
    for (const text of ladeHinweise) zielbereich.append(el("p", { class: "duenn" }, [text]));
    const aktiv = aktiverBlock();
    const quelle = verteilen ? vorschlagsStapel() : aktiv ? auswahlKarten(aktiv) : abschluss();
    spalten.append(quelle, zielbereich);
    spalten.inert = beschaeftigt;
    bereich.replaceChildren(intro, ...(modus === "fuehrung" ? [schrittleiste()] : []), mobilesZiel(), spalten);
    liste.scrollTop = vorherScroll;
    if (beschaeftigt && ankunft) meldung.textContent = `Karte → ${baustein(ankunft).kurz}`;
  }
  const fuss = el("footer", { class: "fuss" });
  fuss.append(
    `Bausteine A–G und Referenzpfade aus dem Kompetenzkatalog v${modell.katalogversion}, Forschungsblock XIII · Zeitverteilung und Kartenzuordnung sind redaktionelle Ableitung · `,
  );
  fuss.append(
    el("a", { href: `${REPO}/blob/main/docs/trainingsmodell.md`, target: "_blank", rel: "noreferrer noopener" }, [
      "Modell und Quellen",
    ]),
  );

  wurzel.append(kopf, verwaltung, ...(modus === "automatik" ? [zeile] : []), bereich, meldung, dialog, fuss);
  if (modus === "automatik" && !fortsetzen) neuAufbauen();
  else zeichnen();

  return () => {
    beendet = true;
    bewegung.abbrechen();
    for (const k of [kopf, verwaltung, zeile, bereich, meldung, dialog, fuss]) k.remove();
  };
}
