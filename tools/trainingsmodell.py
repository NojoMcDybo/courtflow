"""Baut data/trainingsmodell.json aus dem Kompetenzkatalog.

Der Katalog enthält das Trainingspfad-Modell bereits quellenbelegt
(Forschungsblock XIII, Abschnitt 56): die Bausteine A–G, die Referenzpfade
TR-01 bis TR-10, die Belastungsregel und die Referenzdauern. Dieses Skript
liest sie aus den Tabellen aus.

Streng getrennt davon steht die abgeleitete Schicht: Intensität, Zeitgewichte
und Auswahlregeln je Baustein. Der Katalog schreibt ausdrücklich keine starre
Zeitverteilung vor (56.3), deshalb ist jede Zahl hier als Ableitung markiert.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLES = ROOT / "docs" / "quellen" / "catalog-tables.json"
OUT = ROOT / "data" / "trainingsmodell.json"

# --- Abgeleitete Schicht -----------------------------------------------------
# Intensität 1–5: wie hoch die körperlich-kognitive Beanspruchung liegt.
# Gewicht: Anteil an der Nettozeit, bevor über den Pfad normiert wird.
ABGELEITET = {
    "A": {"intensitaet": 2, "gewicht": 12, "kurz": "Aktivieren"},
    "B": {"intensitaet": 2, "gewicht": 20, "kurz": "Fundament"},
    "C": {"intensitaet": 3, "gewicht": 18, "kurz": "Wahrnehmen"},
    "D": {"intensitaet": 4, "gewicht": 22, "kurz": "Kleingruppe"},
    "E": {"intensitaet": 5, "gewicht": 20, "kurz": "Transfer"},
    "F": {"intensitaet": 5, "gewicht": 12, "kurz": "Wettbewerb"},
    "G": {"intensitaet": 1, "gewicht": 8, "kurz": "Ausklang"},
}

# Katalog 14.9: je jünger und unerfahrener, desto höher der Anteil an Bewegung,
# Ballkontakten, Wahrnehmung und kleinen Spielen. Umgesetzt als Faktor auf die
# Gewichte, nicht als eigene Zeittabelle.
ALTERSFAKTOR = {
    "jung": {"A": 1.25, "D": 1.25, "F": 1.2, "B": 0.85, "C": 0.9, "E": 0.85},
    "mittel": {},
    "alt": {"B": 1.15, "C": 1.15, "E": 1.15, "A": 0.85, "F": 0.9},
}

REFERENZDAUERN = [60, 75, 90, 120]

# Der Katalog nennt zehn Referenzpfade, aber nicht für jede Altersstufe mehrere.
# Diese drei Aufbauweisen sind abgeleitet: sie benutzen ausschließlich die
# Bausteine A–G, halten die Regel „4–7 Blöcke" ein und sind altersoffen.
# Sie sind als Ableitung markiert und stehen neben, nicht anstelle der TR-Pfade.
ABGELEITETE_WEGE = [
    {
        "id": "AW-Technik",
        "name": "Technikweg",
        "ziel": "Eine Fertigkeit stabilisieren und anwenden",
        "folge": ["A", "B", "C", "D", "G"],
        "beschreibung": "Viel Zeit im Fundament, ruhiger Ausklang. Für neue Inhalte "
                        "und für Gruppen, die eine Technik erst aufbauen.",
    },
    {
        "id": "AW-Spiel",
        "name": "Spielweg",
        "ziel": "Früh ins Spielproblem",
        "folge": ["A", "C", "D", "E", "F"],
        "beschreibung": "Ohne isolierten Techniknblock. Gelernt wird an der Situation, "
                        "wie in den Referenzpfaden TR-04 und TR-09.",
    },
    {
        "id": "AW-Wettkampf",
        "name": "Wettkampfweg",
        "ziel": "Kurz aufbauen, lange anwenden",
        "folge": ["A", "B", "D", "E", "F"],
        "beschreibung": "Kurzer Aufbau, dann durchgehend Anwendung unter Druck. "
                        "Für erfahrene Gruppen und Einheiten nah am Spiel.",
    },
]

QUELLEN = [
    {
        "was": "Trainingspfad-Modell, Bausteine A–G, Referenzpfade",
        "wo": "Kompetenzkatalog v3.8, Forschungsblock XIII, Abschnitt 56.2 und 56.4",
        "art": "Projektquelle",
    },
    {
        "was": "Praxis als Abfolge unterschiedlicher Lernkontexte statt linearer Drillliste",
        "wo": "Jr. NBA Instructional Curriculum",
        "url": "https://jr.nba.com/jr-nba-instructional-curriculum/",
        "art": "Primärquelle",
    },
    {
        "was": "Belastungswechsel innerhalb einer Einheit, körperlich und psychologisch",
        "wo": "FIBA/WABC Level 1, Kapitel 2.1.7 Planning Practice",
        "url": "https://assets.fiba.basketball/image/upload/documents-corporate-wabc-coaching-level-manuals-level-1-eng.pdf",
        "art": "Primärquelle",
    },
    {
        "was": "Beispielhafte Mischung aus Warm-up, Stationsarbeit, Spielformen",
        "wo": "FIBA/WABC Facilitator Handbook, Sample Practice Plan",
        "url": "https://assets.fiba.basketball/image/upload/documents-corporate-wabc-start-coaching-eng-facilitator-handbook.pdf",
        "art": "Primärquelle",
    },
    {
        "was": "Aufbau des Aktivierungsblocks: Raise, Activate, Mobilise, Potentiate",
        "wo": "Jeffreys, I. (2007): Warm-up revisited – the RAMP method of optimising warm-ups. "
              "Professional Strength and Conditioning 6, 12–18",
        "art": "Externe Fachquelle, nicht im Katalog enthalten",
    },
]


def finde(tables, *kopf):
    ziel = [k.lower() for k in kopf]
    for t in tables:
        if t and t[0] and [str(c).strip().lower() for c in t[0]][: len(ziel)] == ziel:
            return t
    return None


def bausteine(tables):
    tab = finde(tables, "baustein", "primäre funktion")
    if not tab:
        raise SystemExit("Bausteintabelle nicht gefunden — Katalog geändert?")
    out = []
    for r in tab[1:]:
        m = re.match(r"([A-G])\s*[–-]\s*(.+)", r[0].strip())
        if not m:
            continue
        code = m.group(1)
        out.append({
            "code": code,
            "name": m.group(2).strip(),
            "funktion": r[1].strip(),
            "inhalte": r[2].strip(),
            "hebel": r[3].strip() if len(r) > 3 else None,
            **ABGELEITET[code],
        })
    return out


def pfade(tables):
    tab = finde(tables, "id", "alter", "ziel", "pfad")
    if not tab:
        raise SystemExit("Pfadtabelle nicht gefunden — Katalog geändert?")
    out = []
    for r in tab[1:]:
        if not r or not r[0].strip().startswith("TR-"):
            continue
        folge = re.findall(r"\b([A-G])\b", r[3])
        alter = [int(n) for n in re.findall(r"U(\d+)", r[1])]
        out.append({
            "id": r[0].strip(),
            "alter_roh": r[1].strip(),
            "alter_von": min(alter) if alter else None,
            "alter_bis": max(alter) if alter else None,
            "ziel": r[2].strip(),
            "folge": folge,
            "individualisierung": r[4].strip() if len(r) > 4 else None,
        })
    return out


def main():
    tables = json.loads(TABLES.read_text(encoding="utf-8"))
    modell = {
        "katalogversion": "3.8",
        "herkunft": "Bausteine, Pfade und Regeln aus dem Katalog; Intensität, "
                    "Zeitgewichte und Altersfaktoren sind redaktionelle Ableitung",
        "bausteine": bausteine(tables),
        "pfade": pfade(tables) + [
            {
                "id": w["id"],
                "alter_roh": "U8–U18",
                "alter_von": 8,
                "alter_bis": 18,
                "ziel": w["ziel"],
                "folge": w["folge"],
                "individualisierung": w["beschreibung"],
                "herkunft": "abgeleitet",
                "name": w["name"],
            }
            for w in ABGELEITETE_WEGE
        ],
        "referenzdauern": REFERENZDAUERN,
        "altersfaktor": ALTERSFAKTOR,
        "regeln": {
            "bloecke_min": 4,
            "bloecke_max": 7,
            "karten_je_schritt": [4, 6],
            "organisationsanteil": 0.1,
            "block_min_minuten": 5,
            "alterstoleranz": ["A", "G"],
            "belastung": "Hohe Intensitäten werden nicht ununterbrochen aneinandergereiht; "
                         "nach einem sehr intensiven Block folgt ein kontrollierterer.",
            "eigenstaendigkeit": "Zwei Trainings gelten als unterschiedlich, wenn sich "
                                 "mindestens zwei Dimensionen ändern: Lernziel, Spielproblem, "
                                 "Spielerzahl, Raum, Gegnerdruck, Informationsmenge, "
                                 "Startbedingung, Scoring, Belastungsprofil, Abschlussform.",
        },
        "quellen": QUELLEN,
    }
    OUT.write_text(json.dumps(modell, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Bausteine: {len(modell['bausteine'])}")
    print(f"Pfade: {len(modell['pfade'])} "
          f"({sum(1 for p in modell['pfade'] if p.get('herkunft') == 'abgeleitet')} abgeleitet)")
    print("Folgen:", ", ".join(f"{p['id']} {'→'.join(p['folge'])}" for p in modell["pfade"][:4]), "…")
    print(f"geschrieben: {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
