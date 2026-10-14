import { el } from "../dom";
import { sprachwahl } from "../sprachwahl";
import { markenIcon } from "../marke";
import { alleDrills, kennzahlen, taxonomie } from "../data";
import { modell } from "../plan";
import { bildUrl } from "../uebungsbilder";
import { anzahlUebungsvideos } from "../uebungsvideos";

type Infokarte = {
  wert: string;
  titel: string;
  text: string;
  ziel: string;
  farbe: string;
};

export function startseite(wurzel: HTMLElement): () => void {
  const zahlen = kennzahlen(alleDrills);
  const karten: Infokarte[] = [
    { wert: String(zahlen.gesamt), titel: "Übungen", text: "Nach Alter und Thema filtern.", ziel: "#/bibliothek", farbe: "violett" },
    { wert: String(anzahlUebungsvideos), titel: "Übungsvideos", text: "Bei ausgewählten Karten öffnen.", ziel: "#/bibliothek", farbe: "magenta" },
    { wert: "U8–U18", titel: "Altersstufen", text: "Passende Übungen fürs Team finden.", ziel: "#/bibliothek", farbe: "blau" },
    { wert: String(modell.bausteine.length), titel: "Bausteine", text: "Dein Training Schritt für Schritt bauen.", ziel: "#/aufbau", farbe: "orange" },
  ];

  const seite = el("div", { class: "poster" });
  const kopf = el("header", { class: "poster-kopf" }, [
    el("a", { class: "poster-marke", href: "#/", "aria-label": "CourtFlow — Startseite" }, [markenIcon(), "CourtFlow"]),
    sprachwahl(),
  ]);
  const inhalt = el("main", { class: "poster-inhalt" }, [
    el("section", { class: "poster-intro" }, [
      el("p", { class: "mikro" }, ["Saison 26/27 · Jugendbasketball"]),
      el("h1", {}, ["Für dein nächstes Training."]),
      el("p", { class: "poster-lead" }, ["Entdecke Übungen, baue deine Einheit oder lass dir einen Plan erstellen."]),
    ]),
  ]);

  const feature = el("a", { class: "start-feature", href: "#/generator" }, [
    el("img", {
      class: "start-feature-bild",
      src: bildUrl("bilder/uebungen/EX-147-3-on-2-advantage.webp"),
      alt: "",
      loading: "eager",
      fetchpriority: "high",
    }),
    el("span", { class: "start-feature-inhalt" }, [
      el("span", { class: "start-feature-kicker" }, ["AUTOMATISCHER PLAN"]),
      el("span", { class: "start-feature-titel" }, ["Aus Alter und Zeit wird eine Einheit."]),
      el("span", { class: "start-feature-text" }, ["Wähle den Rahmen. CourtFlow stellt die Übungen zusammen."]),
      el("span", { class: "start-feature-taste" }, ["Plan erstellen", el("span", { "aria-hidden": "true" }, ["→"])]),
    ]),
  ]);
  inhalt.append(feature);

  const ueberblick = el("section", { class: "start-ueberblick", "aria-label": "Auf einen Blick" }, [
    el("div", { class: "start-ueberblick-kopf" }, [
      el("h2", {}, ["Auf einen Blick"]),
      el("span", { class: "start-ueberblick-hinweis" }, ["Deine Möglichkeiten"]),
    ]),
  ]);
  const raster = el("div", { class: "start-karten" });
  for (const karte of karten) {
    raster.append(el("a", { class: `start-karte start-karte--${karte.farbe}`, href: karte.ziel }, [
      el("span", { class: "start-karte-kopf" }, [
        el("span", { class: "start-karte-titel" }, [karte.titel]),
        el("span", { class: "start-karte-pfeil", "aria-hidden": "true" }, ["↗"]),
      ]),
      el("span", { class: "start-karte-wert" }, [karte.wert]),
      el("span", { class: "start-karte-text" }, [karte.text]),
    ]));
  }
  ueberblick.append(raster);
  inhalt.append(ueberblick);

  const fuss = el("footer", { class: "poster-fuss" }, [
    el("p", {}, [`Grundlage: Kompetenzkatalog v${taxonomie.katalogversion} · Beschreibungen mit Link auf die Originalquelle`]),
  ]);
  seite.append(kopf, inhalt, fuss);
  wurzel.append(seite);
  return () => seite.remove();
}
