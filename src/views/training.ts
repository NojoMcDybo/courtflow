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
  modell,
  neuWuerfeln,
} from "../plan";
import type { Drill } from "../types";

const REPO = "https://github.com/NojoMcDybo/courtflow";
const SPEICHER = "courtflow.plan";

type Modus = "fuehrung" | "automatik";

const pfadName = (id: string): string => {
  const p = modell.pfade.find((x) => x.id === id)!;
  return p.name ?? `${p.id} · ${p.ziel}`;
};

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

  try {
    const roh = localStorage.getItem(`${SPEICHER}.${modus}`);
    if (roh) Object.assign(rahmen, JSON.parse(roh) as Rahmen);
  } catch {
    /* privates Fenster — dann eben Vorgabewerte */
  }

  const sichern = () => {
    try {
      localStorage.setItem(`${SPEICHER}.${modus}`, JSON.stringify(rahmen));
    } catch {
      /* egal */
    }
  };

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
    plan = neuWuerfeln(rahmen, letzte);
    zeichnen();
  });

  zeile.append(sAlter, sDauer, sWeg);
  if (modus === "automatik") zeile.append(wuerfeln);
  zeile.append(hinweis);

  /* ---- Inhalt ---- */
  const bereich = el("main", { class: "bereich plan" });

  function neuAufbauen(): void {
    plan = modus === "automatik" ? neuWuerfeln(rahmen, null) : bloecke(rahmen);
    schritt = 0;
    zeichnen();
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
        zeileEl.append(drillZeile(b.gewaehlt, rahmen.altersstufe));
        const tauschen = el("button", { class: "textknopf", type: "button" }, ["Tauschen"]);
        tauschen.addEventListener("click", () => {
          schritt = i;
          b.gewaehlt = null;
          zeichnen();
        });
        zeileEl.append(tauschen);
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
        b.gewaehlt = d;
        const naechster = plan.findIndex((x) => !x.gewaehlt);
        schritt = naechster < 0 ? plan.length : naechster;
        zeichnen();
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
    nochmal.addEventListener("click", neuAufbauen);
    box.append(el("div", { class: "abschluss-tasten" }, [drucken, nochmal]));
    return box;
  }

  function zeichnen(): void {
    const pfad = modell.pfade.find((p) => p.id === rahmen.pfadId)!;
    hinweis.replaceChildren(
      el("b", {}, [pfad.folge.join(" → ")]),
      pfad.herkunft === "abgeleitet" ? " · abgeleitete Aufbauweise" : ` · ${pfad.id}`,
    );

    const spalten = el("div", { class: "plan-spalten" });
    const links = el("div", { class: "plan-links" });
    links.append(
      el("h2", { class: "plan-ziel" }, [pfad.ziel]),
      planZeilen(),
    );
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
    bereich.replaceChildren(spalten);
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

  wurzel.append(kopf, zeile, bereich, fuss);
  neuAufbauen();

  return () => {
    for (const k of [kopf, zeile, bereich, fuss]) k.remove();
  };
}
