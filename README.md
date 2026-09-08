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

Die Bibliothek läuft: 146 kanonische Karten mit Suche, Filtern nach Alter,
Kompetenzfamilie, Kompetenz und Dokumentationstiefe sowie Detailansicht mit
Quelle und QA-Status. Generator, geführter Builder und Trainingsplan sind noch
nicht gebaut — die Reihenfolge und die offenen Blocker stehen in
[`PROJEKT.md`](PROJEKT.md).

## Loslegen

```bash
npm install
npm run dev       # Entwicklungsserver
npm run build     # statischer Build nach dist/
npm run daten     # Datenstände aus der DOCX-Primärquelle neu erzeugen
npm run pruefen   # Prüfstand + Abdeckungsmatrix
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
