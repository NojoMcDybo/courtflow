"""Erstellt ein Feldinventar sämtlicher kanonischer Karten aus dem aktuellen Import."""

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "data" / "drills.json"
OUTPUT = ROOT / "docs" / "karten-bestandsstand-2026-10-05.md"

FIELDS = (
    ("lernziel", "Lernziel"), ("ablauf", "Ablauf"),
    ("coachingpunkte", "Coaching"), ("typische_fehler", "Fehlerbilder"),
    ("erfahrung", "Erfahrung"), ("spielerzahl", "Spieler"),
    ("raum", "Raum"), ("dauer_min", "Dauer/Umfang"),
    ("material", "Material"), ("regression", "Regression"),
    ("progression", "Progression"), ("methodik", "Methodik"),
    ("alter", "Alter"), ("kompetenz", "Kompetenz"),
)
OFFENE_ORIGINALDURCHFUEHRUNG = {
    "EX-016", "EX-022", "EX-040", "EX-075"
}
OFFENE_ABLAUFPLATZHALTER = {f"EX-{number:03}" for number in range(62, 69)}


def vorhanden(karte, feld):
    wert = karte[feld]
    if feld in ("spielerzahl", "dauer_min"):
        return bool(wert["roh"])
    if feld == "alter":
        return wert["von"] is not None
    if feld == "kompetenz":
        return bool(wert["alle"])
    return bool(wert)


def main():
    daten = json.loads(INPUT.read_text(encoding="utf-8"))
    karten = sorted((x for x in daten if not x["ist_alias"]), key=lambda x: x["id"])
    aliaszahl = len(daten) - len(karten)
    assert len(karten) == 146 and aliaszahl == 11
    assert len({x["id"] for x in karten}) == len(karten)
    counts = Counter()
    lines = [
        "# Inhaltsstand aller CourtFlow-Karten – 05.10.2026", "",
        "Lokaler Arbeitsstand nach Redaktionsrunde 13 und Quellenkorrektur vom 05.10.2026. 146 kanonische Karten; elf Aliase",
        "werden nicht doppelt gezählt. Diese Liste misst vorhandene Felder, keine",
        "sportfachliche Freigabe. Ein leeres Feld ist nur dann eine Lücke, wenn die",
        "Angabe für diese Kartenart sinnvoll und in einer Primärquelle belegbar ist.",
        "Fehlende Werte wurden nicht aus Titel oder Umfeld erschlossen. Die ursprüngliche",
        "Katalog-Erfassungsstufe und QA bleiben unverändert.", "",
        "## Feldabdeckung", "",
        "| Angabe | Vorhanden | Leer |", "|---|---:|---:|",
    ]
    for feld, name in FIELDS:
        count = sum(vorhanden(x, feld) for x in karten)
        counts[feld] = count
        lines.append(f"| {name} | {count} | {len(karten)-count} |")
    urls = sum(bool(x["quelle"]["url"]) for x in karten)
    names = sum(bool(x["quelle"]["name"]) for x in karten)
    blank = [x["id"] for x in karten if not x["ablauf"] and not x["evidenz"]]
    lines.extend([
        f"| Direkter Quellenlink | {urls} | {len(karten)-urls} |",
        f"| Quellenname | {names} | {len(karten)-names} |", "",
        f"{len(blank)} Karten haben weder eigenes Ablauffeld noch Evidenztext: "
        + ", ".join(blank) + ".", "",
        "Bei EX-062, EX-064, EX-066 und EX-068 fehlen weiterhin Originalabläufe;",
        "die früheren Texte waren lediglich Prüfaufträge. EX-063, EX-065 und",
        "EX-067 erhielten in Runde 12 belegte Praxisformen. EX-106 erhielt in",
        "Runde 13 die DBB-2-gegen-2-Form; EX-107 den FIBA-Prinzipienbeleg, aber",
        "weiterhin keinen eigenen Ablauf. Bei EX-022 und EX-040 wurden unbelegte",
        "Ablaufskizzen entfernt und als Prüfhinweise sichtbar gemacht.", "",
        "## Einzelstand", "",
        "| Karte | Erfassung im Katalog | Beschreibung | Quelle | Leere Felder | Prüfhinweis |",
        "|---|---|---|---|---|---|",
    ])
    for x in karten:
        eid = x["id"]
        beschreibung = "Ablauf" if x["ablauf"] else ("Evidenz" if x["evidenz"] else "leer")
        quelle = "URL" if x["quelle"]["url"] else ("nur Name" if x["quelle"]["name"] else "leer")
        missing = ", ".join(name for feld, name in FIELDS if not vorhanden(x, feld)) or "keine"
        hints = []
        if eid in OFFENE_ORIGINALDURCHFUEHRUNG:
            hints.append("Originaldurchführung offen")
        if eid in OFFENE_ABLAUFPLATZHALTER:
            hints.append("Ablaufplatzhalter entfernt; Runde 12 belegt" if eid in {"EX-063", "EX-065", "EX-067"}
                         else "Ablaufplatzhalter entfernt")
        if eid == "EX-036":
            hints.append("Starter-Praxisform; Alter prüfen")
        if eid == "EX-106":
            hints.append("DBB-Praxisform; U8 nur denkbare Vorstufe")
        if eid == "EX-107":
            hints.append("FIBA-Prinzip, keine eigene Übung")
        title = x["titel"].replace("|", "\\|")
        lines.append(f"| {eid} · {title} | {x['dokumentationstiefe']} | "
                     f"{beschreibung} | {quelle} | {missing} | {', '.join(hints) or '–'} |")
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{len(karten)} Karten, {aliaszahl} Aliase, {len(blank)} ohne Ablauf/Evidenz, "
          f"{urls} Quellenlinks; geschrieben: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
