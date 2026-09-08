import { el } from "../dom";
import { alleDrills, kennzahlen, taxonomie } from "../data";

type Tor = {
  ziffer: string;
  name: string;
  ziel: string;
  meta: string[];
  gebaut: boolean;
};

const zahlen = () => kennzahlen(alleDrills);

function tore(): Tor[] {
  const z = zahlen();
  return [
    {
      ziffer: "1",
      name: "Drill-Liste",
      ziel: "#/bibliothek",
      meta: [`${z.gesamt} Übungen`, "U8–U18", "mit Quelle"],
      gebaut: true,
    },
    {
      ziffer: "2",
      name: "Automatischer Plan",
      ziel: "#/generator",
      meta: ["Rahmen rein, Plan raus"],
      gebaut: false,
    },
    {
      ziffer: "3",
      name: "Halbautomatischer Trainingsplan",
      ziel: "#/builder",
      meta: ["Schritt für Schritt"],
      gebaut: false,
    },
  ];
}

export function startseite(wurzel: HTMLElement): () => void {
  const z = zahlen();
  const seite = el("div", { class: "poster" });

  const kopf = el("header", { class: "poster-kopf" });
  kopf.append(
    el("span", { class: "poster-marke" }, [el("i", { "aria-hidden": "true" }, ["CF"]), "CourtFlow"]),
    el("p", { class: "mikro" }, [
      `Saison 26/27 · Kinder- und Jugendbasketball · ${z.gesamt} Übungen · ${z.mitQuelle} mit Quelle · ${
        z.gesamt - z.mitQuelle
      } offen`,
    ]),
  );
  seite.append(kopf);

  const liste = el("nav", { class: "tore", "aria-label": "Bereiche" });
  for (const t of tore()) {
    const a = el("a", {
      class: `tor tor--${t.ziffer}${t.gebaut ? "" : " geplant"}`,
      href: t.ziel,
    });
    const ziffer = el("span", { class: "ziffer", "aria-hidden": "true" }, [t.ziffer]);

    const text = el("span", { class: "tor-text" });
    const meta = el("span", { class: "mikro tor-meta" }, [
      t.meta.join(" • ") + (t.gebaut ? "" : " • noch nicht gebaut"),
    ]);
    text.append(el("span", { class: "tor-name" }, [t.name]), meta);

    a.append(ziffer, text, el("span", { class: "pfeil", "aria-hidden": "true" }, ["→"]));
    liste.append(a);
  }
  seite.append(liste);

  seite.append(
    el("footer", { class: "poster-fuss" }, [
      el("p", { class: "mikro" }, [
        `Grundlage: Kompetenzkatalog v${taxonomie.katalogversion} · Beschreibungen sind Eigenformulierungen mit Link auf das Original`,
      ]),
    ]),
  );

  wurzel.append(seite);
  return () => seite.remove();
}

export function geplant(wurzel: HTMLElement, was: "generator" | "builder"): () => void {
  const t = tore().find((x) => x.ziel.endsWith(was))!;
  const seite = el("div", { class: "poster" });

  const kopf = el("header", { class: "poster-kopf" });
  const zurueck = el("a", { class: "poster-marke", href: "#/" }, [
    el("i", { "aria-hidden": "true" }, ["CF"]),
    "CourtFlow",
  ]);
  kopf.append(zurueck);
  seite.append(kopf);

  const block = el("div", { class: `tor tor--${t.ziffer} geplant standbild` });
  const ziffer = el("span", { class: "ziffer", "aria-hidden": "true" }, [t.ziffer]);
  const text = el("span", { class: "tor-text" });
  const meta = el("span", { class: "mikro tor-meta" }, ["noch nicht gebaut"]);
  text.append(el("span", { class: "tor-name" }, [t.name]), meta);
  block.append(ziffer, text);
  seite.append(block);

  const grund =
    was === "generator"
      ? "Der Generator darf laut Katalog nur freigegebene Übungen ausspielen. Ausdrücklich freigegeben sind fünf. Vorher muss entschieden werden, welche vorhandene Statusangabe als Freigabe gilt — QA A/B, Statusstufe S2 bis S4 oder die Redaktionsbewertung."
      : "Der geführte Aufbau setzt auf demselben freigegebenen Bestand auf und braucht zusätzlich das Trainingsplan-Modell mit lokaler Ablage. Beides steht noch aus; die Reihenfolge ist im Steuerungsdokument festgelegt.";

  seite.append(
    el("p", { class: "sperrgrund" }, [grund]),
    el("a", { class: "weiter", href: "#/bibliothek" }, ["Zur Drill-Liste"]),
  );

  wurzel.append(seite);
  return () => seite.remove();
}
