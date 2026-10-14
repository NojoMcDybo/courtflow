"""Prüft die organisatorischen Pflichtangaben aller kanonischen Übungskarten.

Dies ist eine redaktionelle Lückenliste, keine sportfachliche Freigabe. Vor allem
eine knappe Beschreibung kann trotz ausgefüllter Felder fachlich unklar sein.
"""

import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DATEN = ROOT / "data" / "drills.json"
VIDEOS = ROOT / "data" / "uebungsvideos.json"
BERICHT = ROOT / "docs" / "karten-durchfuehrbarkeit-2026-10-11.md"
KERNDATEN = {"spielerzahl": "Gruppengröße", "raum": "Raum/Aufbau", "material": "Material"}
RUNDE_21 = {f"EX-{i:03d}" for i in (16, 22, 23, 28, 40, 62, 64, 66, 68, 75, 107, 136, 137)}
REDAKTIONELLE_FORMEN = {f"EX-{i:03d}" for i in (16, 22, 23, 40, 62, 107, 136, 137)}


def vorhanden(karte, feld):
    wert = karte[feld]
    return bool(wert.get("roh")) if feld == "spielerzahl" else bool(wert)


def main():
    karten = sorted(
        (x for x in json.loads(DATEN.read_text(encoding="utf-8")) if not x["ist_alias"]),
        key=lambda x: x["id"],
    )
    videos = json.loads(VIDEOS.read_text(encoding="utf-8"))
    ids = {x["id"] for x in karten}
    assert len(karten) == 146 and len(ids) == 146
    assert set(videos) <= ids
    for eid, video in videos.items():
        assert re.fullmatch(r"[\w-]{11}", video["youtubeId"], re.ASCII), eid
        assert urlparse(video["belegUrl"]).netloc == "jr.nba.com", eid
        assert video["titel"] and video["quelle"], eid

    ohne_ablauf = [x for x in karten if not x["ablauf"]]
    ohne_organisation = [x for x in karten if not any(vorhanden(x, f) for f in KERNDATEN)]
    knapp = [x for x in karten if x["ablauf"] and len(x["ablauf"]) < 180]
    counts = Counter()
    zeilen = [
        "# Durchführbarkeit und Videos aller Karten – 11.10.2026", "",
        "146 kanonische Karten wurden auf dokumentierten Ablauf, Gruppengröße,",
        "Raum/Aufbau, Material und Dauer/Umfang gesichtet. Diese Felder sind",
        "**Prüfsignale**: Fehlt eine Angabe, kann sie im Ablauftext stehen; ist sie",
        "vorhanden, kann der Ablauf trotzdem noch unpräzise sein. Die Liste ist",
        "keine sportfachliche Freigabe. Bei redaktionellen Übungsformen sind",
        "Aufbau und Wechselregeln ausdrücklich als eigene Umsetzung gekennzeichnet.",
        "Elf Aliase werden nicht doppelt gezählt.", "",
        f"- **{len(ohne_ablauf)}** Karten haben keinen beschriebenen Übungsablauf.",
        f"- **{len(RUNDE_21)}** zuvor offene Karten haben jetzt eine ausführbare Folge; **{len(REDAKTIONELLE_FORMEN)}** davon sind ausdrücklich redaktionelle Übungsformen oder Organisationsfolgen.",
        f"- **{len(ohne_organisation)}** Karten nennen weder Gruppengröße noch Raum/Aufbau oder Material in eigenen Feldern; der Ablauftext ist jeweils gesondert zu lesen.",
        f"- **{len(knapp)}** vorhandene Abläufe sind kürzer als 180 Zeichen und brauchen eine genaue Lektüre auf Start, Handlung, Ende und Rotation.",
        f"- **{len(videos)}** Karten haben eine über offizielle Jr.-NBA-Übungsseiten eindeutig zugeordnete YouTube-Einbettung. Die tatsächliche Wiedergabe kann durch Browser- oder YouTube-Beschränkungen abweichen.", "",
        "Bei der lokalen Sichtprüfung meldete der eingebettete YouTube-Player für EX-142 und EX-060 „Dieses Video ist nicht verfügbar“. Die Browserumgebung blockierte außerdem den direkten YouTube-Metadatenabruf. Die Quellenzuordnung ist geprüft; die aktuelle Wiedergabefähigkeit ist damit nicht bestätigt. Die Karten bieten Links zum Video und zur offiziellen Übungsseite als Ausweichweg.", "",
        "Bei EX-011 und EX-012 nennt der [DBB-Videokatalog](https://www.basketball-bund.de/wp-content/uploads/sites/2/2022/02/Videokatalog-Minibasketball.pdf)",
        "die Übungen; für EX-012 auch den Zeitbereich 1:14:00–1:18:00. Eine",
        "eindeutige Einzelvideo-ID ließ sich daraus bislang nicht verifizieren.",
        "Die [offiziellen DBB-Playlists](https://www.basketball-bund.de/coaching/lehrmaterialien/videomaterial/)",
        "belegen zwar verfügbares Videomaterial, aber keine Zuordnung zu diesen",
        "konkreten Karten. Deshalb bleibt dort das Einbettungsfeld leer.", "",
        "## Zuvor offene Karten: Ablauf und Belegstatus", "",
        "Die 13 Karten sind jetzt ausführbar beschrieben. Die ursprüngliche Checkliste",
        "nennt bei mehreren Karten nur eine Fertigkeit. Dort ist die konkrete",
        "Übungsfolge als redaktionelle Form gekennzeichnet; Quellen und Prüfnotizen",
        "stehen in `docs/quellen/karten-recherche-runde-21.json`.", "",
        *[f"- **{x['id']} {x['titel']}:** {x['quelle']['name']}." for x in karten if x['id'] in RUNDE_21], "",
        "## Inhaltlich geprüfte Problemfälle", "",
        "- **EX-098 „Ich mach’ es wie Du“:** Der bisherige Text beschrieb eine andere DBB-Übung. Aufbau, Hütchenfolge, Wurf und Paarwertung wurden nach dem Easybasket-Handbuch berichtigt. Die dazu unpassenden Kompetenzcodes und das irreführende Motiv wurden ebenfalls korrigiert beziehungsweise aus der Karte entfernt.",
        "- **EX-117 „Shell Drill 4 on 4“:** Perimeteraufstellung, fünf Pässe vor dem freien Spiel und Rollenwechsel nach jedem Ballbesitz wurden nach der Jr.-NBA-Anleitung ergänzt.",
        "- **EX-128 „Screen the Screener“:** Die genaue Reihenfolge der beiden Blocks und der Neustart nach Ballbesitzwechsel stehen nun in der Karte. Die Quelle erklärt die konkrete Ballübergabe durch den Coach nach den Blocks jedoch nicht; diese Einzelheit bleibt offen.",
        "- **EX-142 „3-Person Pass, Cut and Replace“:** Die frühere Karte behauptete einen Übergang ins freie Spiel. Die Jr. NBA beschreibt stattdessen eine fortlaufende Pass-, Schnitt- und Nachrückfolge; diese steht nun in der Karte, zusammen mit dem passenden Video.",
        "- **EX-155 „3 on 3 – Defense Wins“:** Die bisher fehlende Regel nach einem Offensivtreffer ist ergänzt: Das erfolgreiche Angriffsteam wechselt in die Verteidigung, ein neues Team greift an.",
        "- **EX-157 „Using a Screen 2 on 1“:** Blocksteller, Zuspieler, Fünf-Sekunden-Fenster, Punkte und die Rollenfolge sind nun präzisiert; die Ausgangsform ist eins gegen eins mit einem nicht mitspielenden Blocksteller.",
        "- **EX-054 „Diamond Passing“:** Vier äußere Reihen, zentrale Markierung, Passfolge, Nachlaufen und vier Pivotvarianten sind nun beschrieben. Daraus folgt eine Mindestzahl von fünf Kindern statt der bisherigen vier.",
        "- **EX-057 „Decision 1 on 1“:** Der Start mit Ballkontakt am Rücken, das vorherige Bodentippen der Verteidigung und das vom Coach ausgelöste Lesen von Zug oder Wurf stehen nun in der Karte.",
        "- **EX-010 „Partner Shooting“:** Die Jr. NBA beschreibt Würfe zwischen zwei Kindern ohne Korb. Der Ablauf enthält jetzt die Partnerfolge und zwei Serien zu je fünf Würfen; das Korbmotiv ist als Fertigkeitsillustration gekennzeichnet.",
        "- **EX-017 „Stationary Wall Passing“:** Der Wandpass enthält jetzt Fußschritt, Daumenbewegung, einen Bodenaufprall vor dem Fangen und drei Serien zu je zehn Pässen.",
        "- **EX-115 „Pivot Pressure“:** Pass als Startsignal, Dribbelverbot, Rollenwechsel nach Wurf oder Ballgewinn und spätere Ein-Dribbling-Variante sind ergänzt.",
        "- **EX-124 „Side Ball Screen“:** Guards und Postspieler starten in vier Reihen. Startsignal, einzelner 2-gegen-2-Ballbesitz, Seitenwechsel und Rollenwechsel sind nun beschrieben.",
        "- **EX-126 „Pick & Roll Situational Shooting“:** Die Originalübung verwendet Stuhl oder Hütchen als Blockersatz und den Coach als Verteidiger des Blocks. Das Motiv mit menschlichem Blocksteller wird deshalb als Fertigkeitsillustration gekennzeichnet.",
        "- **EX-134 „Help the Helper“:** Die erste Grundlinienattacke, beide Hilfsschritte, Kickout und der Neustart an der Dreipunktbogenspitze sind präzisiert.",
        "- **EX-020 „Stationary Partner Pass“:** Der Wechsel aus Boden- und Brustpass, das Fangen und die Passrollen sind als ausführbare Paarfolge beschrieben; die Reihenfolge ist redaktionell organisiert.",
        "- **EX-069 „Exploring the Court / Pac Man“:** Linienwege, Fängerregel und Neustart mit anderen Fängern stehen nun im Ablauf. Die Zeitspanne ist weiterhin eine redaktionelle Orientierung, keine Quellenangabe.",
        "- **EX-070 „Visual / Verbal Direction Change“:** Paaraufstellung, je ein Ball, Gegenbewegung und wechselnde Sicht- und Rufsignale sind nach FIBA präzisiert. Das balllose Motiv ist als Fertigkeitsillustration gekennzeichnet.",
        "- **EX-071 „Partner Mirror Dribbling“:** Abstand, Blickkontakt, konkrete Dribbelmuster und Rollenwechsel machen die Spiegelübung ausführbar.",
        "- **EX-027 „Jump Stop Shooting“ und EX-112 „Korbleger – 2er-Rhythmus“:** Die Texte benennen Bewegungsschritte, aber keinen ausreichend genauen Aufbau und Wechsel zwischen den Kindern. Sie sind noch keine selbstständig ausführbaren Anleitungen.", "",
        "## Einzelprüfung", "",
        "Legende: „offen“ bezeichnet ein fehlendes Feld, nicht automatisch eine",
        "fehlende Information im Fließtext. „kurz“ ist nur ein Lesehinweis.", "",
        "| Karte | Ablauf | Offene Organisationsfelder | Dauer/Umfang | Video |",
        "|---|---|---|---|---|",
    ]
    for x in karten:
        fehlt = [name for feld, name in KERNDATEN.items() if not vorhanden(x, feld)]
        ablauf = "fehlt" if not x["ablauf"] else ("redaktionelle Form; fachlich prüfen" if x['id'] in REDAKTIONELLE_FORMEN else ("kurz; genau prüfen" if len(x["ablauf"]) < 180 else "vorhanden; fachlich prüfen"))
        dauer = "vorhanden" if x["dauer_min"]["roh"] else "offen"
        video = "belegt, eingebettet" if x["id"] in videos else "kein Einzelvideo verifiziert"
        counts[ablauf] += 1
        titel = x["titel"].replace("|", "\\|").replace("\n", " ")
        zeilen.append(f"| {x['id']} · {titel} | {ablauf} | {', '.join(fehlt) or 'keine'} | {dauer} | {video} |")
    BERICHT.write_text("\n".join(zeilen) + "\n", encoding="utf-8")
    print(f"{len(karten)} Karten; {len(ohne_ablauf)} ohne Ablauf; "
          f"{len(ohne_organisation)} ohne Organisationsfelder; "
          f"{len(knapp)} Kurzabläufe; {len(videos)} verifizierte Videos")
    print(f"geschrieben: {BERICHT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
