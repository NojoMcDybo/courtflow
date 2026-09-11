import { el } from "../dom";
import { themaIstDunkel, themaUmschalten } from "../thema";
import { alleDrills, kennzahlen, taxonomie } from "../data";

const REPO = "https://github.com/NojoMcDybo/courtflow";

/** Die Wegstrecke zeigt den geplanten Ablauf -- und was davon existiert.
 *  Ein fertig wirkender Schritt, den es nicht gibt, wäre eine Behauptung. */
const SCHRITTE: { titel: string; text: string; zustand: string; fertig: boolean }[] = [
  {
    titel: "Übung finden",
    text: "Bibliothek mit Suche und Filtern über Alter, Kompetenz und Belegtiefe.",
    zustand: "gebaut",
    fertig: true,
  },
  {
    titel: "Rahmen setzen",
    text: "Alter, Erfahrung, Spielerzahl, Dauer und Hauptziel als Eingabe.",
    zustand: "geplant",
    fertig: false,
  },
  {
    titel: "Bausteine wählen",
    text: "Pro Schritt einige geprüfte Vorschläge, aus denen einer gewählt wird.",
    zustand: "geplant",
    fertig: false,
  },
  {
    titel: "Plan bearbeiten",
    text: "Blöcke tauschen, kürzen, umstellen und lokal sichern.",
    zustand: "geplant",
    fertig: false,
  },
];

function kopfleiste(): HTMLElement {
  const kopf = el("header", { class: "topbar" });

  kopf.append(
    el("div", { class: "marke" }, [
      el("span", { class: "zeichen", "aria-hidden": "true" }, ["CF"]),
      "CourtFlow",
    ]),
  );

  const nav = el("nav", { class: "hauptnav", "aria-label": "Bereiche" });
  nav.append(
    el("a", { href: "#bibliothek", "aria-current": "page" }, ["Bibliothek"]),
    el("span", { title: "Noch nicht gebaut" }, ["Generator"]),
    el("span", { title: "Noch nicht gebaut" }, ["Trainingsplan"]),
  );
  kopf.append(nav);

  const rechts = el("div", { class: "topbar-rechts" });
  const schalter = el("button", {
    class: "themaschalter",
    type: "button",
    "aria-label": "Zwischen hellem und dunklem Erscheinungsbild wechseln",
  });
  const beschriften = () => {
    schalter.textContent = themaIstDunkel() ? "Hell" : "Dunkel";
  };
  beschriften();
  schalter.addEventListener("click", () => {
    themaUmschalten();
    beschriften();
  });
  rechts.append(
    schalter,
    el("a", { class: "kopflink", href: REPO, target: "_blank", rel: "noreferrer noopener" }, [
      "Quellcode",
    ]),
  );
  kopf.append(rechts);
  return kopf;
}

function hero(): HTMLElement {
  const zahlen = kennzahlen(alleDrills);
  const bereich = el("section", { class: "hero" });
  const inhalt = el("div", { class: "hero-inhalt" });

  inhalt.append(
    el("h1", {}, ["Übungen, die ihre ", el("em", {}, ["Herkunft"]), " nennen."]),
    el("p", {}, [
      "Kinder- und Jugendbasketball von U8 bis U18. Jede Karte trägt ihren Kompetenzbezug, " +
        "ihr Altersfenster und die Quelle, aus der sie stammt — und sagt, wie tief sie belegt ist. " +
        "Was der Katalog nicht hergibt, bleibt sichtbar leer.",
    ]),
  );

  const kz = el("div", { class: "kennzahlen" });
  const felder: [number, string, boolean][] = [
    [zahlen.gesamt, "Karten in der Bibliothek", false],
    [zahlen.mitQuelle, "mit Quellenangabe", false],
    [zahlen.gesamt - zahlen.mitQuelle, "ohne Quelle, nicht freigegeben", true],
    [zahlen.vollstaendig, "vollständig erfasst", false],
    [taxonomie.kompetenzen.length, "Kompetenzen im Modell", false],
  ];
  for (const [wert, label, gedaempft] of felder) {
    kz.append(
      el("div", { class: gedaempft ? "kennzahl gedaempft" : "kennzahl" }, [
        el("b", {}, [String(wert)]),
        el("span", {}, [label]),
      ]),
    );
  }
  inhalt.append(kz);
  bereich.append(inhalt);
  return bereich;
}

function strecke(): HTMLElement {
  const bereich = el("section", { class: "strecke" });
  const kopf = el("div", { class: "strecke-kopf" });
  kopf.append(
    el("h2", {}, ["So soll ein Training entstehen"]),
    el("p", {}, ["Stand heute existiert Schritt eins. Der Rest steht als Plan, nicht als Funktion."]),
  );
  bereich.append(kopf);

  const liste = el("ol", { class: "schritte" });
  SCHRITTE.forEach((s, i) => {
    const punkt = el("li", { class: s.fertig ? "schritt fertig" : "schritt" });
    punkt.append(
      el("span", { class: "nummer" }, [String(i + 1)]),
      el("h3", {}, [s.titel]),
      el("p", {}, [s.text]),
      el("span", { class: "zustand" }, [s.zustand]),
    );
    liste.append(punkt);
  });
  bereich.append(liste);
  return bereich;
}

function fuss(): HTMLElement {
  const bereich = el("footer", { class: "fuss" });
  const inhalt = el("div", { class: "fuss-inhalt" });
  inhalt.append(
    el("p", {}, [
      `Datengrundlage: ${taxonomie.quelle}, Katalogversion ${taxonomie.katalogversion}. ` +
        "Übungsbeschreibungen sind redaktionelle Eigenformulierungen; die Originalquelle ist je Karte verlinkt.",
    ]),
    el("p", {}, [
      "Karten ohne Quellenangabe sind gekennzeichnet und gelten nicht als veröffentlichungsreif. ",
      el("a", { href: `${REPO}/blob/main/PROJEKT.md`, target: "_blank", rel: "noreferrer noopener" }, [
        "Offene Punkte und Regeln",
      ]),
      ".",
    ]),
  );
  bereich.append(inhalt);
  return bereich;
}

export const shell = { kopfleiste, hero, strecke, fuss };
