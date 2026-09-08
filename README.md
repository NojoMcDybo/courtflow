# CourtFlow

**Live: <https://nojomcdybo.github.io/courtflow/>**

Übungsbibliothek für den Kinder- und Jugendbasketball U8–U18. Statische Website,
gebaut aus einem eigenen Kompetenzkatalog: jede Übung ist einer Kompetenz, einem
Altersfenster und einem Belastungsprofil zugeordnet, nennt ihre Originalquelle
und weist aus, wie tief sie belegt ist.

Der letzte Punkt ist der eigentliche Beitrag. Jr. NBA, FIBA/WABC und der DBB
veröffentlichen Übungen, aber keine dieser Quellen sagt, wie gut die einzelne
Aufgabe belegt ist. CourtFlow macht das sichtbar, statt dünne und dichte
Datensätze gleich aussehen zu lassen.

## Stand

Drei Flächen:

1. **Drill-Liste** — 146 Karten mit Suche, Filtern, Abdeckungsmatrix und
   Detailblatt; Quelle und Belegtiefe an jeder Karte.
2. **Trainingsaufbau** — führt Block für Block durch eine Einheit; du wählst je
   Block aus passenden Übungen.
3. **Automatischer Plan** — baut die Einheit selbst und würfelt auf Wunsch eine
   neue, die sich wirklich unterscheidet.

Aufbau und Generator benutzen dasselbe Modell, siehe
[`docs/trainingsmodell.md`](docs/trainingsmodell.md). Offene Punkte stehen in
[`PROJEKT.md`](PROJEKT.md).

## Loslegen

```bash
npm install
npm run dev       # Entwicklungsserver
npm run build     # statischer Build nach dist/
npm run daten        # Datenstände aus der DOCX-Primärquelle neu erzeugen
npm run pruefen      # Prüfstand Übungsdaten + Abdeckungsmatrix
npm run pruefen:plan # Prüfstand Trainingsmodell gegen den Bestand
```

Node ≥ 20 und Python 3 für die Datenkette.

## Aufbau

```
docs/quellen/     Primärquellen (DOCX) und ihre Rohauszüge
tools/            Extraktion, Normalisierung, Taxonomie, Prüfstand (Python)
data/             erzeugte Datenstände: drills.json, taxonomy.json
src/              Oberfläche (Vite + Vanilla TypeScript, kein Framework)
src/stil/         zwei getrennte Gestaltungssysteme, Marken und Bauteile
assets/reference/ Charakterreferenz, keine Kartenmotive
PROJEKT.md        Steuerungsdokument: Entscheidungen, Regeln, offene Befunde
docs/gestaltung.md  Gestaltungssysteme: Marken, Regeln, Ziffernmechanik
docs/trainingsmodell.md  Bausteine, Aufbauweisen, Zeitrechnung, Quellen
```

`data/` wird aus `docs/quellen/` erzeugt und nicht von Hand bearbeitet.

## Regeln, die das Projekt trägt

- Kein Feld wird gefüllt, das im Katalog nicht steht. Fehlende Angaben bleiben
  leer und werden in der Oberfläche als Lücke gezeigt.
- Eine Quelle wird nie aus dem Umfeld einer Karte hergeleitet.
- Jede Prüfregel hat einen Selbsttest gegen einen bekannt guten und einen
  bekannt schlechten Fall. Ohne bestandenen Selbsttest läuft keine Datenprüfung.
- Übungsbeschreibungen sind redaktionelle Eigenformulierungen mit Link auf das
  Original, nie übernommener Quelltext.
- Zwei Gestaltungssysteme, getrennt gehalten: Plakat am Einstieg, Werkzeug auf
  den Arbeitsflächen. Ein fester Farbwert in einer Bauteildatei ist ein Fehler.

## Datenquellen

Jr. NBA, FIBA/WABC und DBB. Die Originalquelle ist je Karte verlinkt; Karten
ohne Quellenangabe sind als solche gekennzeichnet und nicht veröffentlichungsreif.
