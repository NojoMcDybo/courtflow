import { el } from "../dom";
import { themaIstDunkel, themaUmschalten } from "../thema";
import { TIEFE_LABEL } from "../data";
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

function drillZeile(d: Drill, stufe: number): HTMLElement {
  const box = el("span", { class: "karte-zeile" });
  box.append(
    el("span", { class: "kennung" }, [d.id]),
    el("span", { class: "karte-titel" }, [d.titel]),
  );
  const marken = el("span", { class: "karte-marken" });
  if (d.alter.von) {
    marken.append(
      el("span", { class: ausserhalbAlter(d, stufe) ? "pille ausser" : "pille" }, [
        `U${d.alter.von}–U${d.alter.bis}`,
      ]),
    );
  }
  for (const c of d.kompetenz.alle.slice(0, 3)) marken.append(el("span", { class: "pille" }, [c]));
  if (d.dokumentationstiefe !== "vollstaendig") {
    marken.append(el("span", { class: "pille schwach" }, [TIEFE_LABEL[d.dokumentationstiefe]!]));
  }
  box.append(marken);
  return box;
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
  /* Beim Wählen fliegt die Karte an ihren Platz. Der Startpunkt wird vor dem
     Neuzeichnen gemessen, das Ziel danach — FLIP. */
  let flugstart: { rect: DOMRect; knoten: HTMLElement } | null = null;

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
      el("i", { "aria-hidden": "true" }, ["CF"]),
      "CourtFlow",
    ]),
    el("span", { class: "seitentitel" }, [
      modus === "fuehrung" ? "Trainingsaufbau" : "Automatischer Plan",
    ]),
    el("span", { class: "leiste-rechts" }, [
      thema,
      el("a", { href: "#/bibliothek" }, ["Bibliothek"]),
      el("a", { href: REPO, target: "_blank", rel: "noreferrer noopener" }, ["Code"]),
    ]),
  );

  const ablage = el("section", { class: "planablage", "aria-label": "Gespeicherte Trainingspläne" });
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
  const zeile = el("div", { class: "filterzeile" });
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
    letzte = plan.some((b) => b.gewaehlt) ? plan : null;
    neuerEntwurf();
    plan = neuWuerfeln(rahmen, letzte);
    zeichnen();
  });

  if (modus === "automatik") {
    zeile.append(sAlter, sDauer, sWeg, wuerfeln, hinweis);
  }

  /* ---- Inhalt ---- */
  const bereich = el("main", { class: "bereich plan" });

  /* Die gewählte Karte läuft von ihrem Platz im Raster an ihren Platz im Plan.
     Gemessen wird vorher und nachher, bewegt wird eine Kopie — das Layout
     bleibt davon unberührt. */
  function fliegen(code: string): void {
    const start = flugstart;
    flugstart = null;
    if (!start || ruhig()) return;
    const ziel = bereich.querySelector<HTMLElement>(`.planzeile[data-block="${code}"]`);
    if (!ziel) return;

    const zielRect = ziel.getBoundingClientRect();
    const kopie = start.knoten.cloneNode(true) as HTMLElement;
    kopie.classList.add("flugkarte");
    Object.assign(kopie.style, {
      top: `${start.rect.top}px`,
      left: `${start.rect.left}px`,
      width: `${start.rect.width}px`,
      height: `${start.rect.height}px`,
    });
    document.body.append(kopie);

    const dx = zielRect.left - start.rect.left;
    const dy = zielRect.top - start.rect.top;
    const sx = zielRect.width / start.rect.width;

    ziel.style.opacity = "0";
    kopie.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${sx})`, opacity: 0 },
      ],
      { duration: 460, easing: FEDER, fill: "forwards" },
    ).addEventListener("finish", () => {
      kopie.remove();
      ziel.style.opacity = "";
    });

    ziel.animate(
      [
        { opacity: 0, transform: "translateX(14px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 340, delay: 200, easing: FEDER, fill: "backwards" },
    );
    setTimeout(() => {
      ziel.style.opacity = "";
    }, 220);
  }

  function minutenText(folge: string[]): number[] {
    return minutenVerteilen(folge, rahmen.dauer, rahmen.altersstufe);
  }

  function neuAufbauen(): void {
    plan = modus === "automatik" ? neuWuerfeln(rahmen, null) : bloecke(rahmen);
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

  function planZeilen(): HTMLElement {
    const liste = el("ol", { class: "planliste" });
    plan.forEach((b, i) => {
      const bs = baustein(b.code);
      const zeileEl = el("li", {
        class: `planzeile${modus === "fuehrung" && i === schritt ? " aktiv" : ""}${
          b.gewaehlt ? " voll" : ""
        }`,
      });
      const kopfEl = el("div", { class: "planzeile-kopf" });
      kopfEl.append(
        el("span", { class: "blockcode" }, [b.code]),
        el("span", { class: "blockname" }, [bs.kurz]),
        el("span", { class: "blockzeit" }, [`${b.minuten} min`]),
      );
      zeileEl.append(kopfEl);
      if (b.gewaehlt) {
        const d = b.gewaehlt;
        zeileEl.dataset["block"] = b.code;
        const istOffen = offen.has(b.code);

        const auslöser = el("button", {
          class: "kartenkopf-taste",
          type: "button",
          "aria-expanded": String(istOffen),
        });
        auslöser.append(drillZeile(d, rahmen.altersstufe), el("span", { class: "pfeilchen" }, ["⌄"]));

        const huelle = el("div", { class: "detailhuelle" });
        huelle.style.height = istOffen ? "auto" : "0px";
        huelle.append(detailInhalt(d));

        auslöser.addEventListener("click", () => {
          const jetztOffen = !offen.has(b.code);
          jetztOffen ? offen.add(b.code) : offen.delete(b.code);
          auslöser.setAttribute("aria-expanded", String(jetztOffen));
          zeileEl.classList.toggle("offen", jetztOffen);
          klappen(huelle, jetztOffen);
        });

        if (istOffen) zeileEl.classList.add("offen");
        const tauschen = el("button", { class: "textknopf", type: "button" }, ["Tauschen"]);
        tauschen.addEventListener("click", () => {
          schritt = i;
          offen.delete(b.code);
          b.gewaehlt = null;
          zeichnen();
        });
        zeileEl.append(auslöser, huelle, tauschen);
      } else {
        zeileEl.append(el("p", { class: "blockfunktion" }, [bs.funktion]));
      }
      liste.append(zeileEl);
    });
    return liste;
  }

  function auswahlKarten(b: Block): HTMLElement {
    const box = el("section", { class: "auswahlbereich" });
    const bs = baustein(b.code);
    const [min, max] = modell.regeln.karten_je_schritt as [number, number];
    const gezeigt = b.kandidaten.filter((d) => !plan.some((x) => x.gewaehlt?.id === d.id)).slice(0, max);

    box.append(
      el("h2", {}, [`${b.code} · ${bs.name}`]),
      el("p", { class: "blockfunktion" }, [`${bs.funktion} · ${b.minuten} min · Hebel: ${bs.hebel ?? "—"}`]),
    );
    if (gezeigt.length < min) {
      box.append(
        el("p", { class: "duenn" }, [
          `Nur ${gezeigt.length} passende Karten für diesen Block bei U${rahmen.altersstufe}. Der Bestand ist hier dünn.`,
        ]),
      );
    }

    const raster = el("div", { class: "kartenwahl" });
    for (const d of gezeigt) {
      const knopf = el("button", { class: "wahlkarte", type: "button" });
      knopf.append(drillZeile(d, rahmen.altersstufe));
      if (d.lernziel ?? d.ablauf ?? d.evidenz) {
        knopf.append(el("p", {}, [(d.lernziel ?? d.ablauf ?? d.evidenz)!]));
      }
      knopf.addEventListener("click", () => {
        flugstart = { rect: knopf.getBoundingClientRect(), knoten: knopf };
        b.gewaehlt = d;
        const naechster = plan.findIndex((x) => !x.gewaehlt);
        schritt = naechster < 0 ? plan.length : naechster;
        zeichnen();
        fliegen(b.code);
      });
      raster.append(knopf);
    }
    box.append(raster);
    return box;
  }

  function abschluss(): HTMLElement {
    const box = el("section", { class: "abschluss" });
    const befund = belastungsbefund(plan);
    const summe = plan.reduce((a, b) => a + b.minuten, 0);
    box.append(
      el("h2", {}, ["Einheit steht"]),
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
    planSichern();
    ablageZeichnen();
    const pfad = modell.pfade.find((p) => p.id === rahmen.pfadId)!;
    hinweis.replaceChildren(
      el("b", {}, [pfad.folge.join(" → ")]),
      pfad.herkunft === "abgeleitet" ? " · abgeleitete Aufbauweise" : ` · ${pfad.id}`,
    );

    if (modus === "fuehrung" && phase !== "bloecke") {
      bereich.replaceChildren(schrittleiste(), phase === "alter" ? alterWaehlen() : artWaehlen());
      return;
    }

    const spalten = el("div", { class: "plan-spalten" });
    const links = el("div", { class: "plan-links" });
    links.append(
      el("p", { class: "druck-planname" }, [planName.trim() || standardName()]),
      el("h2", { class: "plan-ziel" }, [pfad.ziel]),
      planZeilen(),
    );
    for (const text of ladeHinweise) links.prepend(el("p", { class: "duenn" }, [text]));
    if (pfad.individualisierung) {
      links.append(el("p", { class: "blockfunktion" }, [pfad.individualisierung]));
    }
    spalten.append(links);

    const offen = plan.findIndex((b) => !b.gewaehlt);
    if (modus === "fuehrung") {
      spalten.append(offen >= 0 ? auswahlKarten(plan[offen]!) : abschluss());
    } else {
      spalten.append(offen >= 0 ? auswahlKarten(plan[offen]!) : abschluss());
    }
    bereich.replaceChildren(...(modus === "fuehrung" ? [schrittleiste()] : []), spalten);
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

  wurzel.append(kopf, ablage, ...(modus === "automatik" ? [zeile] : []), bereich, fuss);
  if (modus === "automatik" && !fortsetzen) neuAufbauen();
  else zeichnen();

  return () => {
    for (const k of [kopf, ablage, zeile, bereich, fuss]) k.remove();
  };
}
