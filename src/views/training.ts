import { el } from "../dom";
import { setText, setAttribut, sprachText } from "../i18n";
import { sprachwahl } from "../sprachwahl";
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
  aktiveFolge,
  folgeFuerAnzahl,
  kandidaten,
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
    q.append(sprachText(d.quelle.name ?? "keine im Katalog hinterlegt"));
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
  type Phase = "alter" | "art" | "umfang" | "bloecke";
  let phase: Phase = "alter";
  let alterAuswahl: number | null = null;
  let artAuswahl: string | null = null;
  let dauerAuswahl = rahmen.dauer;
  let umfangFolge: string[] = [];
  let umfangMinuten: number[] = [];
  let umfangSchluessel = "";
  let zeitverteilung: "schwerpunkt" | "gleich" | "eigen" = "schwerpunkt";
  let moduleOffen = false;
  const entfernteModule = new Map<string, Block>();
  const schrittAnimationen = new Set<Animation>();
  const offen = new Set<string>();
  const bewegung = kartenbewegung();
  let beschaeftigt = false;
  let verteilen = false;
  let einsammeln = false;
  const eingesammelt = new Set<string>();
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
    umfangSchluessel = "";
    austausch = null;
    ankunft = null;
    const geladen = wiederherstellen(p);
    delete rahmen.folge;
    delete rahmen.minuten;
    Object.assign(rahmen, p.rahmen);
    entfernteModule.clear();
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
    entfernteModule.clear();
  }

  /* ---- Kopf ---- */
  const kopf = el("header", { class: "leiste" });
  const thema = el("button", { type: "button" });
  const beschriften = () => setText(thema, themaIstDunkel() ? "Hell" : "Dunkel");
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
      sprachwahl(),
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
    setText(speicherStand, speicherFehler ?? (letzteSignatur
      ? "In diesem Browser gespeichert · letzte 10 Pläne"
      : "Pläne werden in diesem Browser gespeichert · letzte 10 Pläne"));
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
    sichern();
    zeichnen();
  });
  function neuesTraining(): void {
    if (beschaeftigt) return;
    alterAuswahl = null;
    artAuswahl = null;
    dauerAuswahl = rahmen.dauer;
    umfangFolge = [];
    umfangMinuten = [];
    umfangSchluessel = "";
    delete rahmen.folge;
    delete rahmen.minuten;
    neuerEntwurf();
    plan = [];
    letzte = null;
    schritt = 0;
    phase = "alter";
    zeichnen();
  }
  neu.addEventListener("click", neuesTraining);

  /* ---- Rahmenzeile ---- */
  const zeile = el("div", { class: "filterzeile trainingsrahmen" });
  const hinweis = el("span", { class: "stand" });

  const stufen = modell.pfade;
  const wegOptionen = (): [string, string][] =>
    stufen
      .filter(
        (p) =>
          p.alter_von === null ||
          (p.alter_von <= rahmen.altersstufe && rahmen.altersstufe <= (p.alter_bis ?? 18)),
      )
      .map((p) => [p.id, `${pfadName(p.id)} · ${p.folge.join("→")}`] as [string, string]);

  const wuerfeln = el("button", { class: "haupttaste", type: "button" }, ["Neu würfeln"]);
  wuerfeln.addEventListener("click", () => {
    if (beschaeftigt) return;
    letzte = plan.some((b) => b.gewaehlt) ? plan : null;
    neuerEntwurf();
    void automatischEinsetzen(neuWuerfeln(rahmen, letzte));
  });

  if (modus === "automatik") {
    const anpassen = el("button", { type: "button", class: "textknopf" }, ["Rahmen ändern"]);
    anpassen.addEventListener("click", () => {
      umfangSchluessel = "";
      alterAuswahl = rahmen.altersstufe;
      artAuswahl = rahmen.pfadId;
      dauerAuswahl = rahmen.dauer;
      void schrittWechsel(() => { phase = "art"; }, true);
    });
    zeile.append(anpassen, wuerfeln, hinweis);
  }

  /* ---- Inhalt ---- */
  const bereich = el("main", { class: "bereich plan trainingsstudio" });
  const meldung = el("p", { class: "bewegungsstatus", role: "status", "aria-live": "polite", "aria-atomic": "true" });
  const dialog = el("dialog", { class: "drill-dialog" });
  let detailAusloeser: HTMLElement | null = null;
  dialog.addEventListener("close", () => detailAusloeser?.focus());

  async function schrittWechsel(aktion: () => void, zurueck = false): Promise<void> {
    if (beschaeftigt || beendet) return;
    const vorherPhase = phase;
    beschaeftigt = true;
    bereich.inert = true;
    verwaltung.inert = true;
    const lauf = async (element: HTMLElement | null, hinein: boolean) => {
      if (!element || ruhig() || beendet) return;
      const x = (zurueck ? -1 : 1) * (hinein ? 36 : -36);
      const frames = hinein
        ? [{ transform: `translateX(${x}px)`, opacity: 0 }, { transform: "translateX(0)", opacity: 1 }]
        : [{ transform: "translateX(0)", opacity: 1 }, { transform: `translateX(${x}px)`, opacity: 0 }];
      const animation = element.animate(frames, { duration: hinein ? 260 : 170, easing: FEDER, fill: "forwards" });
      schrittAnimationen.add(animation);
      await animation.finished.catch(() => undefined);
      schrittAnimationen.delete(animation);
      animation.cancel();
    };
    await lauf(bereich.querySelector<HTMLElement>(".wahlbild, .auswahlbereich, .abschluss"), false);
    if (beendet) return;
    aktion();
    zeichnen();
    const naechste = bereich.querySelector<HTMLElement>(".wahlbild, .auswahlbereich, .abschluss");
    if (vorherPhase !== phase) bereich.scrollIntoView({ block: "start", behavior: "instant" });
    await lauf(naechste, true);
    if (beendet) return;
    beschaeftigt = false;
    bereich.inert = false;
    verwaltung.inert = false;
    zeile.inert = false;
    bereich.querySelector<HTMLElement>(".plan-spalten")?.removeAttribute("inert");
    bereich.setAttribute("aria-busy", "false");
    naechste?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }

  function vorschau(d: Drill, taste: HTMLElement): void {
    detailAusloeser = taste;
    setAttribut(dialog, "aria-label", drillName(d));
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
    if (!alt) karte.style.visibility = "hidden";
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
    await schrittWechsel(() => {
      verteilen = false;
      austausch = null;
      ankunft = null;
      rueckgabe = null;
      schritt = plan.findIndex(x => !x.gewaehlt);
      if (schritt < 0) schritt = plan.length;
    });
    if (beendet) return;
    setText(meldung, `${drillName(d)} → ${baustein(b.code).kurz}${alt ? ` · ersetzt ${drillName(alt)}` : ""}`);
    bereich.querySelector<HTMLElement>(".auswahlbereich h2, .abschluss h2")?.focus({ preventScroll: true });
  }

  async function automatischEinsetzen(neu: Block[]): Promise<void> {
    if (beschaeftigt || beendet) return;
    if (!ruhig() && plan.some(b => b.gewaehlt)) {
      beschaeftigt = true;
      einsammeln = true;
      eingesammelt.clear();
      zeichnen();
      for (const b of plan) {
        if (beendet) return;
        if (!b.gewaehlt) continue;
        const karte = bereich.querySelector<HTMLElement>(`.planzeile[data-block="${b.code}"] .plan-einsatz`);
        const start = karte ? bewegung.merken(karte) : null;
        eingesammelt.add(b.code);
        zeichnen();
        const stapel = bereich.querySelector<HTMLElement>(".stapelplatz .stapelruecken");
        if (start && stapel) await bewegung.fliegen(start, stapel);
      }
      if (beendet) return;
    }
    einsammeln = false;
    eingesammelt.clear();
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
    setText(meldung, schritt === plan.length ? "Dein Training steht. Alle Karten sind eingesetzt." : "Vorschläge eingesetzt. Offene Blöcke kannst du selbst füllen.");
  }

  function schrittleiste(): HTMLElement {
    const leiste = el("nav", { class: "schritte", "aria-label": "Ablauf" });
    const stufen: [Phase, string, string | null][] = [
      ["alter", "Altersgruppe", phase === "alter" ? null : `U${rahmen.altersstufe}`],
      ["art", "Trainingsweise", phase === "umfang" ? pfadName(artAuswahl ?? rahmen.pfadId) : phase === "bloecke" ? pfadName(rahmen.pfadId) : null],
      ...(modus === "automatik" ? [["umfang", "Umfang", phase === "bloecke" ? `${plan.length} Übungen · ${rahmen.dauer} min` : null] as [Phase, string, string | null]] : []),
      ["bloecke", "Übungen", null],
    ];
    leiste.style.setProperty("--schrittzahl", String(stufen.length));
    stufen.forEach(([p, name, wert], i) => {
      const erledigt = i < stufen.findIndex(s => s[0] === phase);
      const knopf = el("button", {
        class: `schritt${phase === p ? " jetzt" : ""}${erledigt ? " fertig" : ""}`,
        type: "button",
        ...(phase === p ? { "aria-current": "step" } : {}),
        ...(erledigt ? {} : { disabled: "" }),
      });
      knopf.append(
        el("span", { class: "schrittnr" }, [String(i + 1)]),
        el("span", { class: "schrittname" }, [name]),
      );
      if (wert) knopf.append(el("span", { class: "schrittwert" }, [wert]));
      knopf.addEventListener("click", () => {
        void schrittWechsel(() => {
          if (phase === "bloecke") {
            alterAuswahl = rahmen.altersstufe;
            artAuswahl = rahmen.pfadId;
            dauerAuswahl = rahmen.dauer;
            umfangSchluessel = "";
          }
          if (p === "umfang") umfangVorbereiten();
          phase = p;
        }, true);
      });
      leiste.append(knopf);
    });
    return leiste;
  }

  function alterWaehlen(): HTMLElement {
    const box = el("section", { class: "wahlbild" }, [
      el("span", { class: "studio-augenbraue" }, [`Schritt 1 von ${modus === "automatik" ? 4 : 3}`]),
      el("h2", { tabindex: "-1" }, ["Wer trainiert?"]),
      el("p", { class: "blockfunktion" }, ["Wähle zuerst die Altersgruppe deines Teams."]),
    ]);
    const raster = el("div", { class: "grossewahl" });
    for (const u of [8, 10, 12, 14, 16, 18]) {
      const k = el("button", {
        class: `grosskarte${alterAuswahl === u ? " gewaehlt" : ""}`, type: "button",
        "aria-pressed": String(alterAuswahl === u), "data-alter": String(u),
      }, [el("span", { class: "grossziffer" }, [`U${u}`]), el("span", { class: "grossnote" }, [alterAuswahl === u ? "Ausgewählt ✓" : "Altersgruppe wählen"])]);
      k.addEventListener("click", () => {
        alterAuswahl = u;
        zeichnen();
        bereich.querySelector<HTMLElement>(`[data-alter="${u}"]`)?.focus({ preventScroll: true });
      });
      raster.append(k);
    }
    const weiter = el("button", { type: "button", class: "schritt-weiter", ...(alterAuswahl === null ? { disabled: "" } : {}) }, ["Weiter zur Trainingsweise →"]);
    weiter.addEventListener("click", () => {
      if (alterAuswahl === null) return;
      void schrittWechsel(() => {
        if (rahmen.altersstufe !== alterAuswahl) {
          neuerEntwurf(); plan = []; artAuswahl = null;
          umfangSchluessel = "";
          dauerAuswahl = rahmen.dauer;
          delete rahmen.folge; delete rahmen.minuten;
        }
        rahmen.altersstufe = alterAuswahl!;
        const moeglich = wegOptionen();
        if (!moeglich.some(([id]) => id === rahmen.pfadId)) rahmen.pfadId = moeglich[0]![0];
        sichern();
        phase = "art";
      });
    });
    box.append(raster, el("div", { class: "schritt-abschluss" }, [
      el("span", { class: "auswahl-bestaetigung" }, [alterAuswahl ? `Dein Team: U${alterAuswahl}` : "Noch keine Altersgruppe gewählt"]), weiter,
    ]));
    return box;
  }

  function artWaehlen(): HTMLElement {
    const box = el("section", { class: "wahlbild" }, [
      el("span", { class: "studio-augenbraue" }, [`Schritt 2 von ${modus === "automatik" ? 4 : 3} · U${rahmen.altersstufe}`]),
      el("h2", { tabindex: "-1" }, ["Was möchtest du trainieren?"]),
      el("p", { class: "blockfunktion" }, [modus === "automatik" ? "Wähle den Schwerpunkt. Den Umfang legst du danach fest." : "Wähle den Schwerpunkt. Module und Minuten kannst du im Plan anpassen."]),
    ]);
    const dauerzeile = el("div", { class: "dauerwahl" }, [el("span", { class: "dauerlabel" }, ["Trainingsdauer"])]);
    const segmente = el("div", { class: "segmente", role: "group", "aria-label": "Trainingsdauer" });
    for (const d of modell.referenzdauern) {
      const k = el("button", { type: "button", "aria-pressed": String(dauerAuswahl === d), "aria-selected": String(dauerAuswahl === d), "data-dauer": String(d) }, [`${d} min`]);
      k.addEventListener("click", () => {
        dauerAuswahl = d;
        zeichnen();
        bereich.querySelector<HTMLElement>(`[data-dauer="${d}"]`)?.focus({ preventScroll: true });
      });
      segmente.append(k);
    }
    dauerzeile.append(segmente);
    const raster = el("div", { class: "grossewahl breit" });
    for (const p of modell.pfade.filter(x => (x.alter_von ?? 8) <= rahmen.altersstufe && rahmen.altersstufe <= (x.alter_bis ?? 18))) {
      const minuten = minutenVerteilen(p.folge, dauerAuswahl, rahmen.altersstufe);
      const k = el("button", {
        class: `grosskarte artkarte${artAuswahl === p.id ? " gewaehlt" : ""}`, type: "button",
        "aria-pressed": String(artAuswahl === p.id), "data-art": p.id,
      }, [el("span", { class: "artname" }, [pfadName(p.id)])]);
      const folge = el("span", { class: "artfolge" });
      p.folge.forEach((c, i) => folge.append(el("span", { class: "art-baustein" }, [`${baustein(c).kurz} ${minuten[i]}′`])));
      k.append(folge, el("span", { class: "grossnote" }, [artAuswahl === p.id ? "Ausgewählt ✓" : `${p.folge.length} Trainingsblöcke`]));
      k.addEventListener("click", () => {
        artAuswahl = p.id;
        zeichnen();
        bereich.querySelector<HTMLElement>(`[data-art="${p.id}"]`)?.focus({ preventScroll: true });
      });
      raster.append(k);
    }
    const zurueck = el("button", { type: "button", class: "tauschen-taste" }, ["← Altersgruppe"]);
    zurueck.addEventListener("click", () => { void schrittWechsel(() => { alterAuswahl = rahmen.altersstufe; phase = "alter"; }, true); });
    const weiter = el("button", { type: "button", class: "schritt-weiter", ...(artAuswahl === null ? { disabled: "" } : {}) }, [modus === "automatik" ? "Weiter zum Umfang →" : "Weiter zu den Übungen →"]);
    weiter.addEventListener("click", () => {
      if (!artAuswahl) return;
      void schrittWechsel(() => {
        if (modus === "automatik") { umfangVorbereiten(); phase = "umfang"; return; }
        const behalten = plan.length > 0 && rahmen.pfadId === artAuswahl && rahmen.dauer === dauerAuswahl;
        if (!behalten) neuerEntwurf();
        if (rahmen.pfadId !== artAuswahl) { delete rahmen.folge; delete rahmen.minuten; }
        else if (rahmen.dauer !== dauerAuswahl) delete rahmen.minuten;
        rahmen.pfadId = artAuswahl!;
        rahmen.dauer = dauerAuswahl;
        sichern();
        phase = "bloecke";
        if (!behalten) { plan = bloecke(rahmen); schritt = 0; }
      });
    });
    box.append(...(modus === "fuehrung" ? [dauerzeile] : []), raster, el("div", { class: "schritt-abschluss" }, [zurueck, weiter]));
    return box;
  }
  function neuZeichnen(fokus: string): void {
    zeichnen();
    bereich.querySelector<HTMLInputElement>(`[data-zahl="${fokus}"]`)?.focus({ preventScroll: true });
  }

  function zahlsteuerung(name: string, wert: number, min: number, max: number, schrittweite: number,
    beiAenderung: (wert: number) => void, kennung: string, einheit = "min"): HTMLElement {
    const box = el("div", { class: "zahlfeld" });
    const input = el("input", { type: "number", min: String(min), max: String(max), step: "1",
      value: String(wert), "aria-label": name, "data-zahl": kennung, inputmode: "numeric" });
    const setzen = (n: number) => {
      if (beschaeftigt || !box.isConnected || n === wert) return;
      if (!Number.isInteger(n) || n < min || n > max) { input.value = String(wert); return; }
      beiAenderung(n);
      neuZeichnen(kennung);
    };
    input.addEventListener("change", () => setzen(input.valueAsNumber));
    input.addEventListener("blur", () => setzen(input.valueAsNumber));
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") { event.preventDefault(); setzen(input.valueAsNumber); }
    });
    const minus = el("button", { type: "button", "aria-label": `${name} verringern`, ...(wert <= min ? { disabled: "" } : {}) }, ["−"]);
    const plus = el("button", { type: "button", "aria-label": `${name} erhöhen`, ...(wert >= max ? { disabled: "" } : {}) }, ["+"]);
    minus.addEventListener("click", () => setzen(Math.max(min, wert - schrittweite)));
    plus.addEventListener("click", () => setzen(Math.min(max, wert + schrittweite)));
    box.append(el("span", { class: "zahl-label" }, [name]), el("div", { class: "zahlsteuerung" }, [
      minus, input, el("span", { class: "zahl-einheit", "aria-hidden": "true" }, [einheit]), plus,
    ]));
    return box;
  }

  function umfangVorbereiten(): void {
    const pfadId = artAuswahl ?? rahmen.pfadId;
    const schluessel = `${rahmen.altersstufe}:${pfadId}`;
    if (umfangSchluessel === schluessel && umfangFolge.length) return;
    umfangSchluessel = schluessel;
    const behalten = plan.length > 0 && rahmen.pfadId === pfadId;
    umfangFolge = behalten ? plan.map(b => b.code) : [...aktiveFolge({ pfadId, dauer: dauerAuswahl, altersstufe: rahmen.altersstufe })];
    umfangMinuten = behalten ? plan.map(b => b.minuten) : minutenVerteilen(umfangFolge, dauerAuswahl, rahmen.altersstufe);
    zeitverteilung = behalten && rahmen.minuten ? "eigen" : "schwerpunkt";
    if (!behalten) umfangVerteilen();
  }

  function umfangVerteilen(): void {
    umfangMinuten = zeitverteilung === "gleich"
      ? umfangFolge.map(() => Math.max(1, Math.floor((dauerAuswahl - Math.round(dauerAuswahl * modell.regeln.organisationsanteil)) / umfangFolge.length)))
      : minutenVerteilen(umfangFolge, dauerAuswahl, rahmen.altersstufe);
    // Der neue Assistent arbeitet minutengenau: Rundung auf fünf Minuten darf
    // die gewählte Gesamtzeit einschließlich Organisation nicht überschreiten.
    const budget = dauerAuswahl - Math.round(dauerAuswahl * modell.regeln.organisationsanteil);
    while (umfangMinuten.reduce((a, b) => a + b, 0) > budget) {
      const index = umfangMinuten.indexOf(Math.max(...umfangMinuten));
      if (index < 0 || umfangMinuten[index]! <= 1) break;
      umfangMinuten[index]!--;
    }
    if (zeitverteilung === "eigen") zeitverteilung = "schwerpunkt";
  }

  function zeitsumme(minuten: number[], dauer: number): HTMLElement {
    const uebungszeit = minuten.reduce((a, b) => a + b, 0);
    const organisation = Math.round(dauer * modell.regeln.organisationsanteil);
    const gesamt = uebungszeit + organisation;
    const differenz = dauer - gesamt;
    return el("div", { class: `zeitbilanz${differenz < 0 ? " ueberzeit" : ""}`, role: "status", "aria-live": "polite" }, [
      el("div", { class: "zeitsumme" }, [el("strong", {}, [`${gesamt} min`]), el("span", {}, [` / ${dauer} min geplant`])]),
      el("span", { class: "zeitaufteilung" }, [`${uebungszeit} min Übungen + ${organisation} min Wechsel & Pausen`]),
      el("span", { class: "zeitsaldo" }, [differenz === 0 ? "Passt genau" : differenz > 0 ? `${differenz} min frei` : `${-differenz} min über deiner Gesamtdauer`]),
    ]);
  }

  function umfangWaehlen(): HTMLElement {
    const box = el("section", { class: "wahlbild umfangbild" }, [
      el("span", { class: "studio-augenbraue" }, [`Schritt 3 von 4 · U${rahmen.altersstufe}`]),
      el("h2", { tabindex: "-1" }, ["Wie viel Zeit habt ihr?"]),
      el("p", { class: "blockfunktion" }, [pfadName(artAuswahl ?? rahmen.pfadId)]),
    ]);
    const regler = el("div", { class: "umfang-regler" }, [
      zahlsteuerung("Gesamtdauer", dauerAuswahl, 30, 240, 5, n => { dauerAuswahl = n; if (zeitverteilung !== "eigen") umfangVerteilen(); }, "umfang-dauer"),
      zahlsteuerung("Übungsanzahl", umfangFolge.length, 3, 7, 1, n => {
        const bisher = new Map(umfangFolge.map((code, i) => [code, umfangMinuten[i]!]));
        umfangFolge = folgeFuerAnzahl(artAuswahl ?? rahmen.pfadId, n);
        if (zeitverteilung === "eigen") umfangMinuten = umfangFolge.map(code => bisher.get(code) ?? 10);
        else umfangVerteilen();
      }, "umfang-anzahl", "Übungen"),
    ]);
    const verteilung = el("div", { class: "zeitverteilung" }, [el("span", { class: "zahl-label" }, ["Übungsdauer"])]);
    for (const [wert, name] of [["schwerpunkt", "Nach Schwerpunkt"], ["gleich", "Gleich lang"]] as const) {
      const taste = el("button", { type: "button", "aria-pressed": String(zeitverteilung === wert), class: "zeitmodus" }, [name]);
      taste.addEventListener("click", () => { zeitverteilung = wert; umfangVerteilen(); zeichnen(); });
      verteilung.append(taste);
    }
    if (zeitverteilung === "eigen") verteilung.append(el("span", { class: "zeitaufteilung" }, ["Minuten individuell angepasst"]));
    const vorschau = el("div", { class: "umfang-vorschau", "aria-label": "Module und Übungsdauer" });
    umfangFolge.forEach((code, i) => vorschau.append(el("div", { class: "modul-vorschau" }, [
      el("span", { class: "modul-nummer" }, [String(i + 1).padStart(2, "0")]),
      el("strong", {}, [baustein(code).kurz]),
      zahlsteuerung(`${baustein(code).kurz}: Minuten`, umfangMinuten[i]!, 1, 120, 1,
        n => { umfangMinuten[i] = n; zeitverteilung = "eigen"; }, `vorschau-${code}`),
    ])));
    const summe = umfangMinuten.reduce((a, b) => a + b, 0);
    const zuLang = summe + Math.round(dauerAuswahl * modell.regeln.organisationsanteil) > dauerAuswahl;
    const zurueck = el("button", { type: "button", class: "tauschen-taste" }, ["← Trainingsweise"]);
    zurueck.addEventListener("click", () => { void schrittWechsel(() => { phase = "art"; }, true); });
    const erstellen = el("button", { type: "button", class: "schritt-weiter", ...(zuLang ? { disabled: "" } : {}) }, ["Training erstellen →"]);
    erstellen.addEventListener("click", async () => {
      if (beschaeftigt || zuLang) return;
      let automatisch: Block[] = [];
      await schrittWechsel(() => {
        neuerEntwurf();
        rahmen.pfadId = artAuswahl ?? rahmen.pfadId;
        rahmen.dauer = dauerAuswahl;
        rahmen.folge = [...umfangFolge];
        rahmen.minuten = [...umfangMinuten];
        automatisch = neuWuerfeln(rahmen, null);
        plan = automatisch.map(b => ({ ...b, gewaehlt: null }));
        verteilen = true;
        phase = "bloecke";
      });
      if (!beendet) await automatischEinsetzen(automatisch);
    });
    box.append(regler, verteilung, el("p", { class: "zeitaufteilung" }, ["Eine Übung pro Modul. Jede Minutenzahl ist direkt anpassbar."]), vorschau, zeitsumme(umfangMinuten, dauerAuswahl));
    if (zuLang) {
      const passend = Math.ceil(summe / (1 - modell.regeln.organisationsanteil) / 5) * 5;
      if (passend <= 240) {
        const erweitern = el("button", { type: "button", class: "tauschen-taste" }, [`Gesamtdauer auf ${passend} min setzen`]);
        erweitern.addEventListener("click", () => { dauerAuswahl = passend; zeichnen(); });
        box.append(erweitern);
      } else box.append(el("p", { class: "duenn" }, ["Kürze die Übungen, bis sie in die Gesamtdauer passen."]));
    }
    box.append(el("div", { class: "schritt-abschluss" }, [zurueck, erstellen]));
    return box;
  }

  function planRahmenAnpassen(): void {
    rahmen.folge = plan.map(b => b.code);
    rahmen.minuten = plan.map(b => b.minuten);
  }

  function moduleAnpassen(): HTMLElement {
    const details = el("details", { class: "modulverwaltung", ...(moduleOffen ? { open: "" } : {}) }, [
      el("summary", {}, [`Module anpassen · ${plan.length} Übungen`]),
    ]);
    details.addEventListener("toggle", () => { if (details.isConnected) moduleOffen = details.open; });
    details.append(el("p", { class: "zeitaufteilung" }, ["3–7 Module · eine Übung je Modul"]));
    const auswahl = el("div", { class: "modulauswahl" });
    for (const bs of modell.bausteine) {
      const enthalten = plan.some(b => b.code === bs.code);
      const taste = el("button", { type: "button", class: "modulschalter", "aria-pressed": String(enthalten), "data-modul": bs.code,
        ...(enthalten && plan.length <= 3 ? { disabled: "" } : {}) }, [`${enthalten ? "✓" : "+"} ${bs.kurz}`]);
      taste.addEventListener("click", () => {
        if (beschaeftigt) return;
        if (enthalten) {
          entfernteModule.set(bs.code, plan.find(b => b.code === bs.code)!);
          plan = plan.filter(b => b.code !== bs.code);
          if (austausch === bs.code) austausch = null;
          offen.delete(bs.code);
        } else {
          const vorher = entfernteModule.get(bs.code);
          const gewaehlt = vorher?.gewaehlt && !plan.some(b => b.gewaehlt?.id === vorher.gewaehlt?.id) ? vorher.gewaehlt : null;
          plan.push({ code: bs.code, minuten: vorher?.minuten ?? 10, gewaehlt, kandidaten: kandidaten(bs.code, rahmen.altersstufe) });
          plan.sort((a, b) => a.code.localeCompare(b.code));
        }
        planRahmenAnpassen();
        zeichnen();
        bereich.querySelector<HTMLElement>(`[data-modul="${bs.code}"]`)?.focus({ preventScroll: true });
        setText(meldung, `${bs.kurz} ${enthalten ? "entfernt" : "hinzugefügt"} · ${plan.length} Übungen`);
      });
      auswahl.append(taste);
    }
    details.append(auswahl, zahlsteuerung("Geplante Gesamtdauer", rahmen.dauer, 30, 240, 5,
      n => { rahmen.dauer = n; planRahmenAnpassen(); }, "plan-gesamt"));
    return details;
  }

  function aktiverBlock(): Block | undefined {
    return plan.find(b => b.code === (ankunft ?? austausch)) ?? plan.find(b => !b.gewaehlt);
  }

  function planZeilen(): HTMLElement {
    const liste = el("ol", { class: "planliste" });
    const aktiv = aktiverBlock();
    plan.forEach((b, i) => {
      const bs = baustein(b.code);
      const d = ausstehend.has(b.code) || eingesammelt.has(b.code) ? null : b.gewaehlt;
      const zeileEl = el("li", {
        class: `planzeile${aktiv === b ? " aktiv" : ""}${d ? " voll" : ""}`,
        "data-block": b.code,
      });
      zeileEl.append(el("div", { class: "planzeile-kopf" }, [
        el("span", { class: "blockcode" }, [String(i + 1).padStart(2, "0")]),
        el("span", { class: "blockname" }, [bs.kurz]),
        modus === "fuehrung"
          ? zahlsteuerung(`${bs.kurz}: Minuten`, b.minuten, 1, 120, 1,
            n => { b.minuten = n; planRahmenAnpassen(); }, `plan-${b.code}`)
          : el("span", { class: "blockzeit" }, [`${b.minuten} min`]),
        ...(modus === "fuehrung" ? [el("span", { class: "druck-minuten" }, [`${b.minuten} min`])] : []),
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
      el("span", { class: "studio-augenbraue" }, [modus === "fuehrung" ? `Schritt 3 · Übung ${plan.indexOf(b) + 1} von ${plan.length}` : "Aus der Übungsauswahl"]),
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
    const rest = plan.filter(b => ausstehend.has(b.code) && b.gewaehlt);
    const box = el("section", { class: "auswahlbereich verteilstapel", "aria-label": "Automatische Vorschläge" }, [
      el("span", { class: "studio-augenbraue" }, ["Dein Kartenstapel"]),
      el("h2", { tabindex: "-1" }, [einsammeln ? "Einsammeln. Neu austeilen." : "Karte für Karte in deinen Plan."]),
      el("p", { class: "blockfunktion" }, [einsammeln ? "Die bisherigen Karten gehen zurück in den Stapel." : rest.length ? `${rest.length} Karten werden noch ausgeteilt` : "Dein Stapel wird vorbereitet."]),
    ]);
    const stapel = el("div", { class: "stapelplatz" });
    stapel.append(el("div", { class: "stapelruecken", "aria-hidden": "true" }, [el("span", {}, ["CourtFlow"]), el("strong", {}, [einsammeln ? "⇄" : "✓"])]));
    const b = rest[0];
    if (!einsammeln && b?.gewaehlt) stapel.append(el("article", { class: "vorschlagskarte automatisch-karte stapel-oben", "data-vorschlag": b.code }, [
      drillZeile(b.gewaehlt, rahmen.altersstufe),
      el("span", { class: "karten-route" }, [`→ ${baustein(b.code).kurz} · ${b.minuten} min`]),
    ]));
    box.append(stapel);
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
    if (!einsammeln) planSichern();
    ablageZeichnen();
    const pfad = modell.pfade.find(p => p.id === rahmen.pfadId)!;
    setText(hinweis, `${plan.length} Blöcke`);
    zeile.hidden = phase !== "bloecke";
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
    if (phase !== "bloecke") {
      bereich.replaceChildren(intro, schrittleiste(), phase === "alter" ? alterWaehlen() : phase === "art" ? artWaehlen() : umfangWaehlen());
      return;
    }

    const vorherScroll = bereich.querySelector<HTMLElement>(".plan-scroll")?.scrollTop ?? 0;
    const vorherAuswahl = bereich.querySelector<HTMLElement>(".auswahlbereich");
    const spalten = el("div", { class: "plan-spalten" });
    const zielbereich = el("section", { class: "plan-links", "aria-label": "Dein Trainingsplan" });
    const anzahl = plan.filter(b => b.gewaehlt && !ausstehend.has(b.code)).length;
    zielbereich.append(
      el("p", { class: "druck-planname", translate: "no" }, [planName.trim() || standardName()]),
      el("div", { class: "plan-kopf" }, [
        el("div", {}, [el("span", { class: "studio-augenbraue" }, ["In deinen Trainingsplan"]), el("h2", { class: "plan-ziel" }, ["Dein Training"])]),
        el("span", { class: "plan-zaehler" }, [`${anzahl} / ${plan.length}`]),
      ]),
      el("progress", { class: "plan-fortschritt", value: String(anzahl), max: String(plan.length || 1), "aria-label": "Eingesetzte Übungen" }),
      el("p", { class: "plan-art" }, [pfadName(rahmen.pfadId)]),
      zeitsumme(plan.map(b => b.minuten), rahmen.dauer),
    );
    if (modus === "fuehrung") zielbereich.append(moduleAnpassen());
    const liste = el("div", { class: "plan-scroll" }, [planZeilen()]);
    zielbereich.append(liste);
    zielbereich.append(el("details", { class: "modellinfo" }, [
      el("summary", {}, ["Zum Trainingsaufbau"]),
      el("p", { class: "blockfunktion" }, [pfad.ziel]),
      el("p", { class: "blockfunktion" }, [pfad.herkunft === "abgeleitet" ? "Redaktionell abgeleitete Aufbauweise" : `Katalogpfad ${pfad.id}`]),
      ...(plan.map(b => b.code).join() !== pfad.folge.join() ? [el("p", { class: "blockfunktion" }, ["Modulfolge individuell angepasst."])] : []),
      ...(pfad.individualisierung ? [el("p", { class: "blockfunktion" }, [pfad.individualisierung])] : []),
    ]));
    for (const text of ladeHinweise) zielbereich.append(el("p", { class: "duenn" }, [text]));
    const aktiv = aktiverBlock();
    const quelle = verteilen || einsammeln ? vorschlagsStapel()
      : ankunft && !rueckgabe && vorherAuswahl ? vorherAuswahl
      : aktiv ? auswahlKarten(aktiv) : abschluss();
    spalten.append(quelle, zielbereich);
    spalten.inert = beschaeftigt;
    bereich.replaceChildren(intro, schrittleiste(), mobilesZiel(), spalten);
    liste.scrollTop = vorherScroll;
    if (beschaeftigt && ankunft) setText(meldung, `Karte → ${baustein(ankunft).kurz}`);
  }
  const fuss = el("footer", { class: "fuss" });
  fuss.append(
    sprachText(`Bausteine A–G und Referenzpfade aus dem Kompetenzkatalog v${modell.katalogversion}, Forschungsblock XIII · Zeitverteilung und Kartenzuordnung sind redaktionelle Ableitung · `),
  );
  fuss.append(
    el("a", { href: `${REPO}/blob/main/docs/trainingsmodell.md`, target: "_blank", rel: "noreferrer noopener" }, [
      "Modell und Quellen",
    ]),
  );

  wurzel.append(kopf, verwaltung, ...(modus === "automatik" ? [zeile] : []), bereich, meldung, dialog, fuss);
  zeichnen();

  return () => {
    beendet = true;
    for (const animation of schrittAnimationen) animation.cancel();
    schrittAnimationen.clear();
    bewegung.abbrechen();
    for (const k of [kopf, verwaltung, zeile, bereich, meldung, dialog, fuss]) k.remove();
  };
}
