# CourtFlow — Steuerungsdokument

Stand: 14.10.2026 · Datengrundlage: Kompetenzkatalog v3.8 (Research Freeze mit Backlog)
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

- **Belegpflicht.** Felder stammen aus dem Katalog oder aus einer ausdrücklich
  beauftragten Nachrecherche zu seinen Lücken. Nachrecherchen benötigen einen
  kartengebundenen Primärbeleg und eine dokumentierte Eigenformulierung.
  Unbelegte Angaben bleiben `null` und werden als Lücke gezeigt.
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
- **Jord-Referenz festgelegt (18.09.2026).** `assets/reference/jord-master-v6.png`
  ist die vom Nutzer bestätigte markenfreie Vorlage: schlanker mechanischer Körper,
  schwarz-pink-lila Kleidung, kompakte mechanische Schuhe und neutrale Beleuchtung
  ohne violetten Lichtsaum. Frühere Referenzbilder liegen in
  `assets/reference/PICTURE-DUMP-ARCHIVE/` und gelten nicht als aktive Vorlagen.
- **Zehn Testmotive (18.09.2026).** Je ein Bild pro Themen-Court ist lokal in
  der Bibliothek eingebunden, auffindbar über „Weitere Filter → Testbilder“.
  Jord v6 stellt alle Mitspieler dar, AntiJord v6 mit invertierten Farben alle
  Gegner. PNG-Master liegen unter `assets/testkarten/`, optimierte WebP-Bilder
  unter `public/bilder/uebungen/`; Zuordnung in `data/uebungsbilder.json`.
  Auswahl, Korrekturen und Prüfgrenzen stehen in `docs/testkarten-jord-v6.md`.
- **Stapel 02 fertig (23.09.2026).** Zehn weitere Motive (EX-014, EX-037,
  EX-044, EX-065, EX-071, EX-087, EX-115, EX-125, EX-147, EX-154) sind lokal
  eingebunden; damit sind 20 kanonische Übungen bebildert.
  Originale mit Kennung und Übungsname liegen unter `assets/uebungsbilder/stapel-02/`.
  Dort dokumentieren `README.md` und `zuordnung.json` die Zuordnung und Prüfgrenzen.
  Das Bildlimit wurde nach dem vom Nutzer gemeldeten Reset aufgehoben. WebP-Vorschauen
  und Detailbilder liegen unter `public/bilder/uebungen/`; Dubletten teilen das
  kanonische Motiv. Kein automatischer Folgelauf eingerichtet.

- **Stapel 03 fertig (24.09.2026).** Zehn Motive (EX-002, EX-015, EX-020,
  EX-026, EX-038, EX-066, EX-083, EX-135, EX-136, EX-146) sind lokal eingebunden;
  damit sind 30 kanonische Übungen bebildert. PNG-Master mit Kennung und Namen
  liegen unter assets/uebungsbilder/stapel-03/, optimierte WebP-Vorschauen und
  Details unter public/bilder/uebungen/. EX-143 teilt das Bild von EX-146.
  Korrekturen, Zuordnung und Prüfgrenzen sind im Stapelordner dokumentiert.

- **Stapel 04 fertig (25.09.2026).** Zehn weitere Motive (EX-004, EX-017,
  EX-021, EX-022, EX-027, EX-039, EX-074, EX-080, EX-118, EX-120) sind lokal
  eingebunden; insgesamt sind 40 kanonische Übungen bebildert. Der Post-Apocalyptic-
  Court ist bereits vollständig; dieser Stapel deckt neun Courts ab, mit einem
  zusätzlichen Passmotiv im Team Court. EX-001 teilt das Bild von EX-017.
  Dateien, Prompts, Zuordnung und Prüfgrenzen: assets/uebungsbilder/stapel-04/.

- **Stapel 05 fertig (25.09.2026).** Zehn weitere Motive (EX-012, EX-030,
  EX-018, EX-028, EX-005, EX-041, EX-079, EX-082, EX-090, EX-126) sind lokal eingebunden;
  insgesamt sind 50 kanonische Übungen bebildert. Neun Courts mit einem zusätzlichen
  Gym-Court-Motiv. Dateinamen, Prompts, Korrekturen, Zuordnung und Prüfstand stehen
  unter assets/uebungsbilder/stapel-05/. Vorschauen, Details und zwei mobile Stichproben geprüft.

- **Stapel 06 fertig (26.09.2026).** Zehn weitere Motive (EX-016, EX-029,
  EX-006, EX-008, EX-025, EX-053, EX-064, EX-131, EX-137, EX-138) sind lokal
  eingebunden; insgesamt sind 60 kanonische Übungen bebildert. Acht Courts mit je
  einem zusätzlichen Gym- und Team-Court-Motiv. Dateien, Prompts, Korrekturen und
  Prüfstand: assets/uebungsbilder/stapel-06/.

- **Stapel 07 fertig (27.09.2026).** Zehn weitere Motive (EX-031, EX-032,
  EX-019, EX-024, EX-010, EX-049, EX-081, EX-151, EX-145, EX-157) sind lokal
  eingebunden; insgesamt 70 kanonische Übungen bebildert. Acht Courts mit je einem
  zusätzlichen Gym- und Team-Court-Motiv. Dateien, Prompts, Zuordnung und Prüfstand:
  assets/uebungsbilder/stapel-07/.

- **Stapel 08 fertig (Handyprüfung ergänzt am 29.09.2026).** Zehn weitere Motive (EX-033, EX-050,
  EX-023, EX-035, EX-042, EX-052, EX-075, EX-127, EX-156, EX-139) sind lokal
  eingebunden; insgesamt 80 kanonische Übungen bebildert. EX-123 teilt das Bild
  von EX-139. Build und Bildabrufe geprüft; die zuvor offene mobile Website-Prüfung
  für EX-127 und EX-139 erfolgreich nachgeholt. Dateien, Prompts, Korrekturen und Prüfstand:
  assets/uebungsbilder/stapel-08/.

- **Stapel 09 fertig (Abschlussprüfung am 29.09.2026).** Zehn weitere Motive (EX-060, EX-062,
  EX-036, EX-051, EX-043, EX-045, EX-055, EX-059, EX-128, EX-141) sind lokal
  eingebunden; insgesamt 90 kanonische Übungen bebildert. Sieben Courts;
  Build, alle 20 Bildabrufe und mobile Stichproben EX-051/EX-128 am 29.09.2026 geprüft;
  unabhängige Daten- und Dateiprüfung ohne blockierenden Befund.
  Dateien, Prompts, Korrekturen und Prüfstand: assets/uebungsbilder/stapel-09/.

- **Stapel 10 fertig (29.09.2026).** Zehn weitere Motive (EX-076, EX-048,
  EX-054, EX-063, EX-046, EX-058, EX-069, EX-070, EX-085, EX-133) sind lokal
  eingebunden; insgesamt 100 von 146 kanonischen Übungen bebildert. Sechs Courts.
  Build, 20 Bildabrufe, mobile Stichproben EX-063/EX-133 und unabhängige Dateiprüfung erfolgreich.
  Dateien, Prompts, Korrekturen und Prüfstand: assets/uebungsbilder/stapel-10/.

- **Stapel 11 fertig (29.09.2026).** Zehn weitere Motive (EX-011, EX-061,
  EX-067, EX-084, EX-091, EX-092, EX-088, EX-089, EX-111, EX-149) sind lokal
  zugeordnet; insgesamt 110 von 146 kanonischen Übungen bebildert. Fünf Courts.
  EX-121 teilt das Motiv von EX-149. Build, 20 Bildabrufe, mobile Stichproben
  EX-092/EX-061 und unabhängige Dateiprüfung erfolgreich.
  Dateien, Prompts und Prüfstand: assets/uebungsbilder/stapel-11/.

- **Stapel 12 fertig (30.09.2026).** Zehn weitere Motive (EX-068, EX-072,
  EX-073, EX-077, EX-096, EX-097, EX-099, EX-102, EX-103, EX-112) sind lokal
  eingebunden; insgesamt 120 von 146 kanonischen Übungen bebildert. Vier Courts.
  EX-104 und EX-119 teilen das Motiv von EX-077. Build, 20 Bildabrufe, mobile
  Stichproben EX-112/EX-102 und unabhängige Dateiprüfung erfolgreich.
  Dateien, Prompts, Korrekturen und Prüfstand: assets/uebungsbilder/stapel-12/.

- **Stapel 13 fertig (30.09.2026).** Zehn weitere Motive (EX-093, EX-095,
  EX-098, EX-101, EX-100, EX-109, EX-110, EX-105, EX-134, EX-132) sind lokal
  eingebunden; insgesamt 130 von 146 kanonischen Übungen bebildert. Vier Courts.
  EX-122 teilt das Motiv von EX-134. Build, 20 Bildabrufe, mobile Stichproben
  EX-109/EX-134 und unabhängige Dateiprüfung erfolgreich.
  Dateien, Prompts und Prüfstand: assets/uebungsbilder/stapel-13/.

- **Stapel 14 fertig (Abschlussprüfung 01.10.2026).** Zehn Motive (EX-108,
  EX-116, EX-129, EX-130, EX-140, EX-142, EX-113, EX-114, EX-117, EX-155)
  sind lokal eingebunden; insgesamt 140 von 146 kanonischen Übungen bebildert.
  Drei Courts. Build, 20 Bildabrufe, mobile Stichproben EX-117/EX-129 und
  unabhängige Dateiprüfung erfolgreich; erster Reviewversuch durch Nutzungslimit
  unterbrochen. Drei verworfene Korrekturfassungen archiviert.
  Dateien, Prompts und Prüfstand: assets/uebungsbilder/stapel-14/.

- **Bildbestand vollständig (01.10.2026).** Stapel 15 ergänzt die letzten sechs
  Motive EX-106, EX-107, EX-148, EX-150, EX-152 und EX-158. Alle 146 kanonischen
  Übungen haben nun ein lokal eingebundenes Bild; elf Alias-Karten teilen die
  kanonischen Motive. Kleine WebP-Vorschauen und größere Detailansichten vorhanden.
  Build, zwölf neue Bildabrufe, mobile Stichproben EX-150/EX-158 und unabhängige
  Prüfung erfolgreich. Zwei verworfene EX-158-Fassungen archiviert.
  Dateien, Prompts und Prüfgrenzen: assets/uebungsbilder/stapel-15/.
  Die offenen Quellenfragen EX-106/EX-107 bleiben davon unberührt.

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

## Kartenüberarbeitung 01.10.2026 – Runde 1

26 Karten auf Basis vorhandener Katalogbelege überarbeitet: 40 Inhaltsfelder,
darunter 13 neu erschlossene Kurzabläufe. Eigenes Ablauffeld jetzt bei 94 von
146 kanonischen Karten; 52 bleiben ohne. Zusätzlich zwölf fehlerhafte Zeitwerte
und die Auslegung von Spieler-/Team-/Materialzahlen beim Import korrigiert.
Insgesamt ändern sich 45 kanonische Datensätze. Alle neuen Texte liegen auf
Deutsch und Englisch vor.

Die beleggebundene Redaktion liegt in `docs/redaktion/karten-runde-01.json`
und wird nach dem Rohimport durch `tools/normalize.py` eingespielt. ID, Titel,
vorheriger Feldwert und Belegtext werden geprüft. Rohquelle, Evidenz, Alter,
Kompetenzen, Quellenzuordnung, Erfassungsstufen und Freigaben bleiben erhalten.
20 Import-/Redaktionstests, Build, Plan- und Sprachprüfung bestanden; der
Datenprüfer meldet weiterhin EX-106/EX-107 ohne Quelle. Lokal, nicht veröffentlicht.
Details und offene Arbeit: `docs/karten-ueberarbeitung-runde-01.md`.


## Karteninhalt – Fortsetzung am 02.10.2026

Auf den Auftrag zur weiteren Überarbeitung folgen vier konkrete Lücken aus der
Gesamtprüfung: EX-013, EX-014, EX-015 und EX-038. Die Primärquellen sind separat
kartengebunden dokumentiert; 22 Inhaltsfelder und vier Quellenlinks ergänzt.
Aktueller Stand und Restlücken: [Runde 2](docs/karten-ueberarbeitung-runde-02.md).
Der Datenimport spielt beide Redaktionsrunden ein. Keine neue QA-Freigabe.

## Karteninhalt – Runde 3 am 02.10.2026

Zehn weitere Karten mit 47 belegten Inhaltsfeldern und zehn Quellenlinks ergänzt.
Der Datenimport spielt jetzt alle drei Redaktionsrunden ein; jede Rechercherunde
behält ihre eigene Herkunft. 108 von 146 Karten haben ein eigenes Ablauffeld,
19 weiterhin weder Ablauf noch Evidenztext. Insgesamt 40 Karten inhaltlich
bearbeitet. 27 Importtests, Build, Sprach- und Planprüfung bestanden; die bekannten
Quellenlücken EX-106/EX-107 bestehen fort. Keine neue QA-Freigabe.
Details: [Runde 3](docs/karten-ueberarbeitung-runde-03.md).

## Karteninhalt – Runde 4 am 03.10.2026

Vier weitere Karten mit 22 belegten Inhaltsfeldern und vier Quellenlinks ergänzt.
Der Datenimport spielt alle vier Redaktionsrunden ein. 112 von 146 Karten haben
ein eigenes Ablauffeld; 15 haben weiterhin weder Ablauf noch Evidenztext.
Insgesamt 44 Karten inhaltlich bearbeitet. 28 Importtests, Build, Sprach- und
Planprüfung bestanden; die bekannten Quellenlücken EX-106/EX-107 bestehen fort.
Keine neue QA-Freigabe. Details: [Runde 4](docs/karten-ueberarbeitung-runde-04.md).

## Karteninhalt – Gesamtfortsetzung am 03.10.2026

Alle 146 kanonischen Karten erneut inventarisiert. In den Runden 5–10 wurden
25 weitere Karten anhand kartengebundener Primärquellen um 135 Inhaltsfelder
ergänzt. 136 Karten haben nun einen Ablauf und 106 einen direkten Quellenlink.
Zehn Karten bleiben ohne eigenen Ablauf; die Gründe sind einzeln festgehalten.
Die importierten Inhalte sind zweisprachig. Keine neue QA-Freigabe.
Details der früheren Runden: [Gesamtstand](docs/karten-gesamtstand-2026-10-04.md).

## Karteninhalt – Quellenkorrektur am 05.10.2026

Bei EX-022 und EX-040 wurden zwei bisher als Ablauf gezählte, nicht eindeutig
belegte Skizzen entfernt. Diese Karten zeigen jetzt einen zweisprachigen
Prüfhinweis und einen direkten Link zur Rookie-Skills-Checklist. Acht weitere
Kompetenzkarten erhielten kartenbezogene Hinweise zur fehlenden
Originaldurchführung. Anschließend wurde EX-106 mit der konkreten
DBB-2-gegen-2-Form und EX-107 mit dem FIBA-Verteidigungsprinzip belegt.
Der aktuelle Stand: 133 von 146 Karten mit Ablauf, 117 mit Quellenlink;
13 ohne Ablauf, aber keine mehr ohne Ablauf und Hinweis.
Details: [Gesamtstand](docs/karten-gesamtstand-2026-10-05.md) und
[Einzelinventar](docs/karten-bestandsstand-2026-10-05.md).

## Karteninhalt – Stand 14.10.2026

Alle 146 kanonischen Karten haben inzwischen einen eigenen Ablauf. Die letzte
Einzelprüfung führte bei EX-027 und EX-112 zu präziseren Angaben für Aufbau,
Wechsel und Durchführung. Für EX-027 ist das von Jr. NBA zugeordnete Video in
der Karte verlinkt und nach Klick einbettbar; insgesamt sind 18 Übungsvideos
zugeordnet. Die Kartenbilder erscheinen in Vorschau und Detailansicht auch auf
schmalen Bildschirmen. EX-098 ist als allgemeines Kompetenzmotiv gekennzeichnet.
Die überarbeiteten Texte und Übersetzungen sind aus den Redaktions- und
Quellenakten reproduzierbar. Dieser Stand bedeutet keine neue sportfachliche
QA-Freigabe. Details: [Durchführbarkeit](docs/karten-durchfuehrbarkeit-2026-10-11.md).
