import { el } from "../dom";
import { sprachwahl } from "../sprachwahl";
import { markenIcon } from "../marke";
import { alleDrills, kennzahlen, taxonomie } from "../data";

type Tor = {
  ziffer: string;
  name: string;
  ziel: string;
  beschreibung: string;
};

const TORE: Tor[] = [
  {
    ziffer: "1",
    name: "Übungen entdecken",
    ziel: "#/bibliothek",
    beschreibung: "Nach Alter und Können filtern. Ablauf, Material und Quelle auf der Karte prüfen.",
  },
  {
    ziffer: "2",
    name: "Training selbst bauen",
    ziel: "#/aufbau",
    beschreibung: "Übungen Block für Block auswählen und zu einer Einheit verbinden.",
  },
  {
    ziffer: "3",
    name: "Plan erstellen lassen",
    ziel: "#/generator",
    beschreibung: "Altersgruppe und Zeit vorgeben. CourtFlow stellt eine Einheit zusammen.",
  },
];

export function startseite(wurzel: HTMLElement): () => void {
  const z = kennzahlen(alleDrills);
  const seite = el("div", { class: "poster" });

  const kopf = el("header", { class: "poster-kopf" });
  kopf.append(
    el("span", { class: "poster-marke" }, [markenIcon(), "CourtFlow"]),
    el("span", { class: "mikro poster-saison" }, ["Saison 26/27 · Jugendbasketball"]),
    sprachwahl(),
  );
  const inhalt = el("main", { class: "poster-inhalt" });
  seite.append(kopf, inhalt);
  inhalt.append(el("section", { class: "poster-intro" }, [
    el("p", { class: "mikro" }, [`${z.gesamt} Übungen · U8–U18`]),
    el("h1", {}, ["Vom Übungskatalog zur fertigen Einheit."]),
    el("p", { class: "poster-lead" }, [
      "Finde passende Übungen, stelle dein Training zusammen oder lass dir einen Plan erstellen.",
    ]),
  ]));

  const liste = el("nav", { class: "tore", "aria-label": "Bereiche" });
  for (const t of TORE) {
    const a = el("a", {
      class: `tor tor--${t.ziffer}`,
      href: t.ziel,
    });
    const ziffer = el("span", { class: "ziffer", "aria-hidden": "true" }, [t.ziffer]);

    const text = el("span", { class: "tor-text" });
    text.append(el("span", { class: "tor-name" }, [t.name]),
      el("span", { class: "tor-beschreibung" }, [t.beschreibung]));

    a.append(ziffer, text, el("span", { class: "pfeil", "aria-hidden": "true" }, ["→"]));
    liste.append(a);
  }
  inhalt.append(liste);

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
