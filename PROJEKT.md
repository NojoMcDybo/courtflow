# CourtFlow — Steuerungsdokument

Stand: 14.09.2026 · Datengrundlage: Kompetenzkatalog v3.8 (Research Freeze mit Backlog)
Repo: <https://github.com/NojoMcDybo/courtflow> · Live: <https://nojomcdybo.github.io/courtflow/>

## Was steht

| Fläche | Route | Zustand |
|---|---|---|
| Startseite, drei Einstiege | `#/` | gebaut |
| Drill-Bibliothek mit Matrix-Navigation und Karten | `#/bibliothek` | gebaut |
| Trainingsaufbau, geführt in drei Schritten | `#/aufbau` | gebaut |
| Automatischer Plan mit Neu-Würfeln | `#/generator` | gebaut |
| Gemeinsame lokale Ablage, letzte zehn Pläne und Entwürfe | Aufbau und Generator | gebaut |

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
   existieren. Die Oberfläche zeigt das über `dokumentationstiefe` im geöffneten Kartendetail,
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

## Gestaltung

Zwei getrennte Systeme, beschrieben in [`docs/gestaltung.md`](docs/gestaltung.md):

- **System Plakat** auf den Einstiegsflächen — schwarzer Grund, übergroße
  Ziffern mit Verlauf, angeschnitten. Vorlage ist eine Saisongrafik; übernommen
  ist die Machart, nicht die Marke.
- **System Werkzeug** auf den Arbeitsflächen — Apple Human Interface Guidelines
  über [Puppertino](https://github.com/codedgar/Puppertino) (MIT), Akzent Apple
  Indigo.

Die Grenze verläuft am Attribut `data-ansicht` auf dem Wurzelelement. Marken
liegen in `src/stil/tokens-*.css`, Bauteile in `src/stil/werkzeug.css` und
`src/stil/plakat.css`. Ein fester Farbwert in einer Bauteildatei ist ein Fehler.

Die Ziffern der Startseite bemessen sich an der Höhe ihrer eigenen Zeile, nicht
am Bildschirm: ein Regelsatz füllt jede Zeile auf jedem Gerät und hält
gleichzeitig den Platz frei, den der Text braucht. Die Rechnung steht in
`docs/gestaltung.md`, die Prüfgrößen ebenfalls.

## Regeln mit Zähnen

- **Belegpflicht.** Kein Feld wird gefüllt, das im Katalog nicht steht. Fehlende
  Angaben bleiben `null` und werden in der Oberfläche als Lücke gezeigt.
- **Keine Herleitung aus dem Umfeld.** Eine Quelle wird nicht aus der
  Abschnittsüberschrift auf eine Karte übertragen. Unklare Zuordnungen bleiben
  offen; eindeutige Kartenbelege werden übernommen.
- **Prüfregel ohne Selbsttest zählt nicht.** `tools/validate.py --selbsttest`
  läuft vor jeder Datenprüfung; eine Regel ohne bekannt-gut/bekannt-schlecht-Fall
  bricht den Lauf ab.
- **Werkzeugbelegpflicht.** Keine Aussage über die Oberfläche ohne Rendern und
  Hinsehen. Codelesen ersetzt das nicht.
- **Fremdtext bleibt draußen.** Übungsbeschreibungen sind redaktionelle
  Eigenformulierungen mit Link auf das Original, nie übernommener Quelltext.
- **Ein System, keine Ausnahmen daneben.** Eine Regel für ein einzelnes Gerät
  ist erlaubt, solange sie eine Marke des Systems ändert. Wer stattdessen die
  Systemregel überschreibt, hat kein System mehr, sondern zwei Sonderfälle.

## Entscheidungen

| Datum | Entscheidung | Grund |
|---|---|---|
| 08.09.2026 | Stack: Vite + Vanilla TypeScript, statisch, kein Backend | Katalogvorgabe; der vorgefundene vinext/Cloudflare-Scaffold widersprach ihr und wurde verworfen |
| 08.09.2026 | Ziel: öffentliche Website für Trainer:innen | Quelle und QA je Karte sichtbar; Karten ohne Quelle sind nicht veröffentlichungsreif |
| 08.09.2026 | Erste Fläche ist die Bibliothek, nicht der Generator | Sie prüft das Datenmodell an allen 146 Karten, bevor Generator und Builder darauf aufsetzen |
| 08.09.2026 | Bildkacheln bleiben leer statt Platzhalterbild | Es existiert kein Bildbestand; ein Platzhalter würde Vollständigkeit vortäuschen |
| 08.09.2026 | Repo öffentlich, Auslieferung über GitHub Pages und Actions | Auf Wunsch von Nojo; damit sind auch die Primärquellen unter docs/quellen/ öffentlich |
| 08.09.2026 | Ursprünglich Tabellenwerkzeug; ersetzt am 11.09.2026 | Die neue Entscheidung setzt Matrix-Navigation und reduzierte Übungskarten ein |
| 08.09.2026 | Text ist kein Gestaltungsmittel | Erklärender Fließtext wurde durch Spalten, Marken und Zahlen ersetzt. Vollständiger Text nur noch im Detailblatt, wo er der Inhalt ist |
| 08.09.2026 | Gestaltungsgrundlage ist Puppertino (MIT), CSS-Umsetzung der Apple HIG | Systemfarben, Schatten- und Vibrancy-Stufen und Radien kommen aus einer fremden, geprüften Quelle statt aus eigener Schätzung. Als Referenz gelesen, nicht als Abhängigkeit eingebunden |
| 08.09.2026 | Akzent ist Apple Indigo rgb(88,86,214) | Trifft Jords LED-Violett und ist zugleich eine Systemfarbe — beide Vorgaben ohne Kompromiss erfüllt |
| 08.09.2026 | Belegtiefe wird neutral dargestellt, nicht grün | Grün liest sich als Gütesiegel. Belegtiefe ist eine Menge, keine Bewertung |
| 08.09.2026 | Zwei getrennte Gestaltungssysteme statt eines gemischten | Einstieg und Werkzeug haben unterschiedliche Aufgaben und Aufenthaltsdauern; ein System für beides wäre für beide falsch |
| 08.09.2026 | Ziffern bemessen sich an ihrer Zeile, nicht am Bildschirm | Ein Regelsatz statt Schriftgrade je Gerät; füllt jede Zeile und hält zugleich den Textplatz frei |
| 08.09.2026 | Trainingsmodell wird aus dem Katalog ausgelesen, nicht neu erfunden | Bausteine, Pfade und Regeln stehen quellenbelegt in Forschungsblock XIII; eine zweite, eigene Fassung wäre eine unbelegte Parallelwahrheit |
| 08.09.2026 | Ein Modul für beide Systeme, Unterschied ist nur, wer wählt | Aufbau und Generator teilen Modell, Zeitrechnung und Kandidatenlogik; getrennter Code hätte zwei Wahrheiten erzeugt |
| 08.09.2026 | Freigabeprüfung vorerst ausgesetzt, alle Karten im Pool | Entscheidung von Nojo, um das Modell überhaupt testen zu können; Belegtiefe bleibt an jeder Karte sichtbar |
| 08.09.2026 | Die Jord-Bilder werden nicht auf der Seite verwendet | Sie zeigen echte Marken (NBA, Chicago Bulls, Nike, Jordan) und sind für eine öffentliche Seite kein nutzbares Asset |
| 09.09.2026 | Trainingsaufbau fragt in drei Schritten statt in einer Filterzeile | Drei gleichzeitige Entscheidungen ohne Vorschau auf ihre Wirkung; jetzt Altersgruppe, dann Trainingsart, dann die Übungsblöcke |
| 09.09.2026 | Die Dauer steht beim Schritt „Trainingsart", nicht davor | Sie verändert die Blockminuten sichtbar; danach zu fragen wäre eine Entscheidung ohne Vorschau |
| 09.09.2026 | Gewählte Karten laufen sichtbar an ihren Platz; Bewegung am 13.09.2026 ersetzt | Die erste Fassung verformte Karten beim Übergang zur Planzeile |
| 09.09.2026 | Planzeilen sind aufklappbar statt nur Titel | Die Einheit wird dadurch ein lesbarer Stapel; leere Felder erscheinen nicht als Platzhalter |
| 11.09.2026 | System 1: Abdeckung als Hauptnavigation, Übungen als Karten | Wunsch von Nojo: Thema × Alter direkt wählen; Name und Alter sofort, Beschreibung und Fachangaben erst im geöffneten Detail |
| 13.09.2026 | Karten behalten ihre Form, Generator sammelt ein und teilt aus | Wunsch von Nojo: Bewegung wie ein neu verteilter Kartenstapel, ohne Verzerrung |
| 13.09.2026 | System 2 bestätigt Alter und Trainingsart über Weiter | Auswahl, Übergang und nächster Schritt sollen klar voneinander erkennbar sein |

## Trainingsmodell

Beschrieben in [`docs/trainingsmodell.md`](docs/trainingsmodell.md). Der Katalog
enthält das Modell bereits quellenbelegt (Forschungsblock XIII): sieben
Bausteine A–G, zehn Referenzpfade TR-01 bis TR-10, die Belastungsregel und die
Eigenständigkeitsregel. `tools/trainingsmodell.py` liest sie aus den
Katalogtabellen aus; erfunden wurde nichts.

Ableitung — und als solche gekennzeichnet — sind: Intensität und Zeitgewicht je
Baustein, der Altersfaktor auf die Gewichte, die drei zusätzlichen
Aufbauweisen für Altersstufen mit nur einem Referenzpfad, und die Zuordnung
Übung → Baustein, weil der Katalog je Karte keine Bausteinmarke vergibt.

`npm run pruefen:plan` misst das Modell gegen den Bestand: Kandidaten je
Baustein und Altersstufe, Minutensumme, Wege je Referenzfall, Verschiedenheit
der Auswürfelungen.

## Navigation in System 1

Die Abdeckung steht vor den Übungskarten. Drei Bereiche zeigen die Zahl der
Übungen je Thema und Altersstufe. Zelle, Themenname und Alterskopf sind
bedienbar; die Auswahl markiert die Matrix und filtert die Karten darunter.
Andere Themen und Altersstufen bleiben erreichbar. Suche und Belegtiefe bzw.
Quellenfilter beeinflussen die Zahlen; die aktuelle Themen-, Familien- und
Altersauswahl schränkt die Navigation selbst nicht ein.

Karten zeigen Übungsname und Altersfenster. Klick, Enter oder Leertaste öffnen
das Detail mit Beschreibung, ID, Kompetenz, Quelle und Belegtiefe. Escape
schließt es und gibt den Fokus zurück. Weitere Filter sind zunächst zugeklappt.
Auf schmalen Bildschirmen klappt die Matrix nach der Auswahl ein und lässt
sich über ihre beschriftete Zusammenfassung wieder öffnen. „Alles anzeigen“
entfernt sämtliche Filter; Karten ohne Altersangabe bleiben so erreichbar.

Die früheren QA- und Fließtexttitel sind seit 14.09.2026 anhand expliziter
Titelspalten repariert. Belegtexte bleiben im Detail erhalten. Die Änderungen
und Grenzen stehen in [`docs/katalog-importkorrekturen.md`](docs/katalog-importkorrekturen.md).

## Offene Befunde

- **Zwei Karten ohne eindeutige Quellenzuordnung: EX-106 und EX-107.** Beim
  Import konnten 30 der bisherigen 32 Lücken anhand vorhandener Belege
  geschlossen werden. EX-107 ist zudem ausdrücklich ein Methodikanker.
- **Nur 5 Karten sind explizit als publish-ready ausgewiesen.** Der Katalog
  vergibt dieses Merkmal nur im jüngsten Forschungsblock. Die Spezifikation will,
  dass der Generator ausschließlich solche Karten ausspielt. Die Prüfung ist
  ausgesetzt, damit das Modell überhaupt testbar ist. Zu entscheiden bleibt,
  welche vorhandene Statusangabe (QA A/B, Statusstufe S2–S4,
  Redaktionsbewertung) als Veröffentlichungsfreigabe gilt. **Das ist der einzige
  Freigabeentscheid vor einer abschließenden Veröffentlichung.**
- **Zehn Karten ohne Altersfenster, elf ohne Kompetenzcode.** Betroffen sind
  EX-111–114 und EX-153–158; bei EX-145 fehlt zusätzlich der Kompetenzcode.
  Der Katalog nennt für EX-153–158 selbst einen offenen Standardexport.
- **S7 U8: spezifische Help-/Recover-Lücke.** Es gibt bereits allgemeinere
  Defense-Karten in der Matrix; sie schließen diese fachliche Lücke nicht.
  Zusätzlich bleiben K4, K5 und einige Bereiche bei U16/U18 dünn besetzt.
- **F Wettbewerb bei U18 erreicht jetzt vier Kandidaten.** Der belegte Ablauf
  von EX-127 wird bei der redaktionellen Zuordnung berücksichtigt. Der
  Trainingsprüfstand besteht; der Bestand bleibt an dieser Stelle klein.
- **Die QA-Freigabe ist ausgesetzt.** Auf Entscheidung von Nojo ziehen
  Aufbau und Generator aus allen 146 Karten, nicht nur aus freigegebenen. Die
  Belegtiefe steht an jeder Karte. Die Freigabestufe bleibt zu entscheiden.
- **Lokaler Datenprüfstand: zwei Befunde.** Der letzte dokumentierte
  Veröffentlichungsstand hatte 35. Die aktuellen Änderungen sind lokal
  geprüft und mit diesem Arbeitsschritt noch nicht veröffentlicht.
- **Jord trägt fremde Marken.** Beide Referenzbilder zeigen NBA-, Bulls-,
  Nike- und Jordan-Zeichen samt Trikot „Jordan 23". Solange das so ist, ist
  Jord auf einer öffentlichen Seite nicht einsetzbar — weder als Hero noch als
  Kartenmotiv. Entweder eine markenfreie Fassung des Charakters oder Jord
  bleibt internes Moodboard.
- **Kein Bildbestand.** Die Bildprompt-Datei beschreibt Motive, enthält aber keine
  Bilder. Die drei Jord-Referenzbilder unter `assets/reference/` sind
  Charakterreferenz, keine Kartenmotive.

## Nächste Schritte

1. Eindeutige Quellenzuordnung für EX-106 klären; EX-107 als Methodikanker
   gegenüber eigenständigen Übungen abgrenzen.
2. Fehlende Altersfenster und Kompetenzcodes aus dem offenen Standardexport
   klären; keine Altersangaben aus Jr.-NBA-Niveaustufen erfinden.
3. Vor abschließender Veröffentlichung das Freigabekriterium entscheiden.
   Bis dahin bleibt die ausdrücklich ausgesetzte QA-Sperre ausgesetzt.
4. Gruppengröße und Material als Filter in die Kandidatenauswahl aufnehmen; der
   Katalog nennt dafür Organisationsregeln in 61.3 bis 61.7.
5. Erledigt am 10.09.2026: vollständige Trainingspläne und Entwürfe lokal
   speichern, automatisch sichern und über „Letzte Pläne“ wieder öffnen.
   Gemeinsames Speichermodul für beide Arbeitsweisen; Minuten und Auswahl
   bleiben erhalten. Browser-/Gerätewechsel sind keine Synchronisierung.
# Umsetzung 14.09.2026: Umfang vor dem Erstellen

Der automatische Plan fragt jetzt Altersgruppe, Trainingsweise, Gesamtdauer,
Übungsanzahl und Übungszeiten in getrennten Schritten ab. Manuell sind Zeiten an
den Karten und 3–7 Module über „Module anpassen“ veränderbar. Zeitbilanz und
Speicherung berücksichtigen die individuelle Folge. Diese Erweiterung ist lokal;
eine Veröffentlichung gehört nicht zu diesem Arbeitsschritt.
# Umsetzung 16.09.2026: Deutsch / Englisch

DE/EN-Schalter in allen Kopfzeilen; Sprachwahl lokal gespeichert. Oberfläche,
Übungstexte und Merkmale werden übersetzt, Filter und Trainingsentwürfe bleiben
beim Umschalten erhalten. Zweisprachige Suche und eigene Sprachprüfungen ergänzt.
Details: `docs/sprachen.md`. Lokal geprüft, noch nicht veröffentlicht.
