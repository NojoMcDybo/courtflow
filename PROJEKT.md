# CourtFlow — Steuerungsdokument

Stand: 08.09.2026 · Datengrundlage: Kompetenzkatalog v3.8 (Research Freeze mit Backlog)
Repo: <https://github.com/NojoMcDybo/courtflow> · Live: <https://nojomcdybo.github.io/courtflow/>

## Was das Vorhaben liefert, das die Quellen nicht liefern

Jr. NBA, FIBA/WABC und der DBB veröffentlichen Übungen. Keine dieser Quellen
ordnet ihre Aufgaben in ein durchgängiges Kompetenz-, Alters- und
Belastungsmodell ein, und keine weist aus, wie gut die einzelne Aufgabe belegt
ist. CourtFlow tut beides: es macht die Einordnung durchsuchbar und die
Belegtiefe sichtbar. Fällt einer dieser beiden Punkte weg, ist das Ergebnis eine
schwächere Fassung einer bestehenden Übungssammlung.

## Grundprobleme des Gegenstands

Diese vier Eigenschaften bestimmen das Datenmodell; sie nachträglich zu
entdecken hätte einen Umbau bedeutet.

1. **Vier Erfassungsgenerationen nebeneinander.** Der Katalog ist über
   Forschungsblöcke gewachsen. Dieselbe Karte trägt je nach Block ein anderes
   Feldschema: Kurzform im Fliesstext, Standarddatensatz, Redaktionsscore-Fassung,
   Vollfassung mit QA. Ein Zielschema ist deshalb ein Obermenge-Schema, kein
   gemeinsamer Nenner.
2. **Ungleiche Auflösungsdichte.** 8 Karten sind vollständig erfasst, 146
   existieren. Die Oberfläche zeigt das über `dokumentationstiefe` an jeder Karte,
   statt die dünnen Karten wie die dichten aussehen zu lassen.
3. **Zwei Skalensysteme.** Merkmale laufen teils 0–3, teils 1–5, teils 0–5. Werte
   werden mit ihrer Skala gespeichert (`{wert, skala, roh}`), nie auf eine
   gemeinsame Skala umgerechnet — die Umrechnung wäre eine Erfindung.
4. **Dubletten mit kanonischer Auflösung.** 11 IDs sind Aliase auf eine
   kanonische Karte. Die Bibliothek zeigt die kanonische Fassung und nennt die
   Aliase; sie zählt sie nicht doppelt.

## Reihenfolge

Inhalt → Modell → Gestaltung. Der Inhalt ist recherchiert und eingefroren; die
laufende Arbeit ist Modell und Gestaltung. Neue breite Inhaltsrecherche ist
gestoppt (Katalog 62.11) — Ausnahme sind die im Backlog benannten Lücken.

## Datenfluss

```
docs/quellen/*.docx        Primärquelle, unverändert
   │  tools/extract.py     → docs/quellen/records-raw.json   (keine Interpretation)
   │  tools/normalize.py   → data/drills.json                (Zielschema, 157 Karten)
   │  tools/taxonomy.py    → data/taxonomy.json              (Kompetenzmodell, Skalen, Quellen)
   │  tools/validate.py    → Befunde + Abdeckungsmatrix
   ▼
src/                       Vite + Vanilla TypeScript, statisch
```

`npm run daten` erzeugt die Datenstände neu, `npm run pruefen` prüft sie.
Beides ist reproduzierbar aus der DOCX — die Zwischendateien sind Artefakte,
keine Quelle.

## Regeln mit Zähnen

- **Belegpflicht.** Kein Feld wird gefüllt, das im Katalog nicht steht. Fehlende
  Angaben bleiben `null` und werden in der Oberfläche als Lücke gezeigt.
- **Keine Herleitung aus dem Umfeld.** Eine Quelle wird nicht aus der
  Abschnittsüberschrift auf eine Karte übertragen. Lieber 32 Karten ohne
  Quellenangabe als 32 stille Falschzuordnungen.
- **Prüfregel ohne Selbsttest zählt nicht.** `tools/validate.py --selbsttest`
  läuft vor jeder Datenprüfung; eine Regel ohne bekannt-gut/bekannt-schlecht-Fall
  bricht den Lauf ab.
- **Werkzeugbelegpflicht.** Keine Aussage über die Oberfläche ohne Rendern und
  Hinsehen. Codelesen ersetzt das nicht.
- **Fremdtext bleibt draußen.** Übungsbeschreibungen sind redaktionelle
  Eigenformulierungen mit Link auf das Original, nie übernommener Quelltext.

## Entscheidungen

| Datum | Entscheidung | Grund |
|---|---|---|
| 08.09.2026 | Stack: Vite + Vanilla TypeScript, statisch, kein Backend | Katalogvorgabe; der vorgefundene vinext/Cloudflare-Scaffold widersprach ihr und wurde verworfen |
| 08.09.2026 | Ziel: öffentliche Website für Trainer:innen | Quelle und QA je Karte sichtbar; Karten ohne Quelle sind nicht veröffentlichungsreif |
| 08.09.2026 | Erste Fläche ist die Bibliothek, nicht der Generator | Sie prüft das Datenmodell an allen 146 Karten, bevor Generator und Builder darauf aufsetzen |
| 08.09.2026 | Bildkacheln bleiben leer statt Platzhalterbild | Es existiert kein Bildbestand; ein Platzhalter würde Vollständigkeit vortäuschen |
| 08.09.2026 | Repo öffentlich, Auslieferung über GitHub Pages und Actions | Auf Wunsch von Nojo; damit sind auch die Primärquellen unter docs/quellen/ öffentlich |
| 08.09.2026 | Oberfläche als Tabellenwerkzeug statt Landingpage | Hero, Kennzahlenband, Prozessstrecke und Kartenraster waren Fläche ohne Funktion. 146 strukturierte Datensätze sind eine Tabelle, keine Kachelwand |
| 08.09.2026 | Text ist kein Gestaltungsmittel | Erklärender Fließtext wurde durch Spalten, Marken und Zahlen ersetzt. Vollständiger Text nur noch im Detailblatt, wo er der Inhalt ist |
| 08.09.2026 | Gestaltungsgrundlage ist Puppertino (MIT), CSS-Umsetzung der Apple HIG | Systemfarben, Schatten- und Vibrancy-Stufen und Radien kommen aus einer fremden, geprüften Quelle statt aus eigener Schätzung. Als Referenz gelesen, nicht als Abhängigkeit eingebunden |
| 08.09.2026 | Akzent ist Apple Indigo rgb(88,86,214) | Trifft Jords LED-Violett und ist zugleich eine Systemfarbe — beide Vorgaben ohne Kompromiss erfüllt |
| 08.09.2026 | Belegtiefe wird neutral dargestellt, nicht grün | Grün liest sich als Gütesiegel. Belegtiefe ist eine Menge, keine Bewertung |
| 08.09.2026 | Die Jord-Bilder werden nicht auf der Seite verwendet | Sie zeigen echte Marken (NBA, Chicago Bulls, Nike, Jordan) und sind für eine öffentliche Seite kein nutzbares Asset |

## Drei Elemente, die über die Tabelle hinausgehen

1. **Vorschau auf Leertaste.** Pfeiltasten wählen eine Zeile, Leertaste öffnet
   das Blatt, Leertaste schließt es. Bleibt es offen, blättern die Pfeiltasten
   durch die Datensätze weiter — dasselbe Verhalten wie die Übersicht im Finder.
2. **Altersspur statt Alterstext.** Das Altersfenster jeder Übung ist eine
   Strecke von U8 bis U18, nicht die Zeichenfolge „U8–U10". Der Bestand wird
   dadurch beim Überfliegen lesbar, und die 18 Karten ohne Fenster zeigen ein
   leeres Gleis statt eines Gedankenstrichs.
3. **Abdeckung als zweite Ansicht.** Die Matrix Kompetenz × Altersstufe aus dem
   Prüfstand wird zur Oberfläche: sie rechnet mit dem aktuellen Filter, und ein
   Klick auf eine Zelle setzt Kompetenz und Altersstufe als Filter. Leere Zellen
   sind unverändert leer — die Lücke ist der Zweck der Ansicht, nicht ihr Fehler.

## Offene Befunde

- **32 Karten ohne Quellenangabe.** Sie sind für eine öffentliche Seite nicht
  veröffentlichungsreif. `tools/validate.py` listet sie. Bevor sie online gehen,
  muss je Karte die Originalquelle aus dem Katalog nachgetragen werden.
- **Nur 5 Karten sind explizit als publish-ready ausgewiesen.** Der Katalog
  vergibt dieses Merkmal nur im jüngsten Forschungsblock. Der Generator darf laut
  Spezifikation ausschließlich solche Karten ausspielen — mit 5 Karten ist er
  nicht baubar. Vor dem Generator muss geklärt werden, welche vorhandene
  Statusangabe (QA A/B, Statusstufe S2–S4, Redaktionsbewertung) als
  Veröffentlichungsfreigabe gilt.
- **18 Karten ohne Kompetenzcode und Altersfenster** (EX-111–114, EX-153–158 u. a.).
  Der Katalog nennt für EX-153–158 selbst einen offenen Standardexport.
- **S7 U8 ist die einzige benannte inhaltliche Lücke** (Katalog 62.11); die
  Abdeckungsmatrix bestätigt zusätzlich dünne Belegung bei K4, K5 und in U16/U18.
- **Öffentlich mit 32 unbelegten Karten.** Die Seite ist live, obwohl der
  Prüfstand 35 Befunde meldet. Das ist eine bewusste Zwischenstufe, kein
  erreichter Zustand — die Karten sind in der Oberfläche als unbelegt
  gekennzeichnet.
- **Jord trägt fremde Marken.** Beide Referenzbilder zeigen NBA-, Bulls-,
  Nike- und Jordan-Zeichen samt Trikot „Jordan 23". Solange das so ist, ist
  Jord auf einer öffentlichen Seite nicht einsetzbar — weder als Hero noch als
  Kartenmotiv. Entweder eine markenfreie Fassung des Charakters oder Jord
  bleibt internes Moodboard.
- **Kein Bildbestand.** Die Bildprompt-Datei beschreibt Motive, enthält aber keine
  Bilder. Die drei Jord-Referenzbilder unter `assets/reference/` sind
  Charakterreferenz, keine Kartenmotive.

## Nächste Schritte

1. Freigabekriterium für den Generator festlegen (siehe offene Befunde).
2. Quellen für die 32 unbelegten Karten nachtragen; Prüfstand muss auf 0 Befunde.
3. Trainingsplan-Modell + localStorage-Schicht, dann geführter Builder.
4. Generator zuletzt — er ist nur so gut wie das Freigabekriterium darunter.
