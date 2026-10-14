# Gestaltung

CourtFlow trägt **zwei getrennte Systeme**. Sie sehen absichtlich nicht gleich
aus und dürfen sich nicht vermischen.

| | System Plakat | System Werkzeug |
|---|---|---|
| Wo | Startseite | Bibliothek, Trainingsaufbau, Plan, Detailblatt |
| Aufgabe | Überblick und Einstieg anbieten | mit 146 Datensätzen arbeiten |
| Grund | schneller Einstieg mit belegbaren Angaben | lange Sitzungen, hohe Dichte |
| Grund­fläche | Schwarz | Systemfläche, hell oder dunkel |
| Farbe | fünf Neonfarben in Verläufen | Apple Systemfarben, ein Akzent |
| Schrift | klare Schlagzeile und farbige Werte | 13 px, ruhig, tabellarisch |

Die Grenze verläuft am Attribut `data-ansicht` auf dem Wurzelelement, gesetzt
vom Router in `src/main.ts`. **Nur `start` ist Plakat**, alles andere ist
Werkzeug. Es gibt keine Fläche, auf der beide gelten.

Als `generator` von einer Sperrseite zu einer Arbeitsfläche wurde, blieb die
Route im Plakatzweig stehen. Ergebnis: weiße Schrift auf weißem Grund, weil das
Plakatsystem die Werkzeugfarben überschrieb. Wer die Liste erweitert, muss
prüfen, ob die Seite wirklich ein Plakat ist.

**Warum getrennt.** Neonverläufe hinter einer Tabelle mit 146 Zeilen sind nach
fünf Minuten anstrengend; eine graue Systemleiste als Einstieg macht keine
Entscheidung attraktiv. Ein System für beides wäre für beide Aufgaben das
falsche.

## Dateien

```
src/stil/tokens-werkzeug.css   Marken des Werkzeugsystems
src/stil/tokens-plakat.css     Marken des Plakatsystems
src/stil/basis.css             gilt für beide: Reset, Fließtext, Fokus
src/stil/werkzeug.css          Bauteile: Leiste, Matrix, Karten, Blatt
src/stil/plakat.css            Bauteile: Bild- und Infokarten
src/stil/bereichswechsel.css   gemeinsame Navigation der drei Arbeitsbereiche
src/styles.css                 bindet die Gestaltungsdateien ein
```

Regel: eine Datei mit Bauteilen benutzt **nur** Marken aus der Markendatei
ihres eigenen Systems. Ein fester Farbwert in einer Bauteildatei ist ein Fehler.

## System Werkzeug

**Herkunft.** [Puppertino](https://github.com/codedgar/Puppertino) (MIT), eine
CSS-Umsetzung der Apple Human Interface Guidelines. Übernommen sind Apples
Systemfarben, die Schatten- und Vibrancy-Stufen und die Radien 6/10/50.
Eingebunden ist nichts — die Werte stehen als Marken in `tokens-werkzeug.css`.
Der Grund für die Übernahme: geprüfte Zahlen statt geschätzter.

**Akzent** ist Apple Indigo `rgb(88, 86, 214)` (dunkel: `rgb(94, 92, 230)`).
Er trifft das LED-Violett des Markencharakters Jord und ist zugleich eine
Systemfarbe — beide Vorgaben ohne Kompromiss erfüllt.

**Feste Größen**

| Marke | hell | dunkel |
|---|---|---|
| `--fenster` | `#f2f2f7` | `#1c1c1e` |
| `--inhalt` | `#ffffff` | `#000000` |
| `--erhoben` | `#ffffff` | `#2c2c2e` |
| `--haarlinie` | `rgba(60,60,67,.14)` | `rgba(255,255,255,.12)` |
| `--indigo` | `rgb(88,86,214)` | `rgb(94,92,230)` |
| `--orange` | `rgb(255,149,0)` | `rgb(255,159,10)` |

Radien `6 / 10 / 14 / 50`. Bewegungskurve `cubic-bezier(0.32, 0.72, 0, 1)` —
Apples Sheet-Kurve, schnell los, weich aus. Vibrancy auf den Leisten:
`saturate(180%) blur(20px)`.

**Regeln**

- Farbe trägt eine Menge, nie eine Bewertung. Die Belegtiefe ist deshalb
  neutral und nicht grün; grün liest sich als Gütesiegel.
- System 1 verwendet die Abdeckung als Hauptnavigation. Drei Themenbereiche
  nutzen die Bildschirmbreite; Zahlen machen die Zellbelegung direkt lesbar.
  Darunter zeigen Karten nur Übungsname und Altersfenster. Beschreibung,
  Kennung, Kompetenz, Quelle und Belegtiefe stehen im geöffneten Detail.
  Auf schmalen Bildschirmen klappt die Matrix nach einer Auswahl ein.
- Text ist kein Gestaltungsmittel. Zusammenhängender Text steht nur im
  Detailblatt, wo er der Inhalt ist.

## Startseite und Bereichswechsel

Die Startseite ist eine ruhige Übersicht auf schwarzem Grund. Sie kombiniert
eine große Bildkarte mit vier kompakten Infokarten. Die Bildkarte führt zum
automatischen Plan. Die Infokarten nennen echte Angaben aus dem Katalog:
Übungsanzahl, Anzahl zugeordneter Videos, filterbare Altersstufen und die
Bausteine des Trainingsmodells. Keine Fortschrittsringe oder Auszeichnungen
ohne Nutzerdaten.

Die Neonfarben aus `tokens-plakat.css` markieren Werte und Akzente; dunkle
Karten geben ihnen Platz. Das Hero-Bild ist ein vorhandenes CourtFlow-Motiv und
wird als echtes `img` mit zur Seite relativ aufgelöster URL geladen, auch unter
GitHub Pages und auf Mobilgeräten.

Unten bleibt ein Bereichswechsel mit Bibliothek, manuellem Aufbau und
automatischem Plan sichtbar. Sein aktiver Zustand folgt dem Router. Auf der
Startseite nutzt er die Plakatfarben, auf Arbeitsflächen die Werkzeugmarken.
Druckansichten blenden ihn aus. Zusätzlicher Abstand am Seitenende hält die
letzten Inhalte oberhalb der Leiste erreichbar.

## Bewegung im Werkzeugsystem

**Karten werden ausgeteilt, nicht verformt.** Eine bewegte Karte behält ihre
gemessene Breite und Höhe. Sie verschiebt und dreht sich leicht; erst am Ziel
übernimmt die Planzeile durch kurzes Einblenden. Es gibt keine Skalierung von
Karte zu Zeile. Der Flug dauert 540 ms, die Ankunft 150 ms. Beim Tauschen geht
die bisherige Karte sichtbar zurück in die Auswahl.

**Der Generator arbeitet mit einem Stapel.** Beim Neu-Würfeln werden zuerst die
bisherigen Karten eingesammelt, danach die neuen Karten einzeln ausgeteilt.
Die Stapelrückseiten bleiben an ihrem Platz. Das Einsammeln verändert nur die
Darstellung; gespeichert wird stets eine vollständige Auswahl. Ein Seitenwechsel
beendet laufende Bewegungen und entfernt ihre Kopien.

**System 2 bestätigt jede Auswahl.** Altersgruppe und Trainingsart haben jeweils
einen eigenen Schritt mit sichtbarer Auswahl und Weiter-Taste. Ohne Auswahl ist
Weiter gesperrt. Beim Wechsel gleitet der bisherige Schritt seitlich aus und der
nächste ein (170 / 260 ms); zurück läuft die Bewegung umgekehrt. Erst wenn eine
Übung im Plan angekommen ist, erscheint die Auswahl für den nächsten Block.
Auf schmalen Geräten bleibt das aktuelle Kartenziel am unteren Rand sichtbar.

**Die Planzeile klappt auf.** Die Zielhöhe wird gemessen und animiert, danach
steht `height: auto` — sonst springt der Inhalt, sobald sich der Text ändert.
300 ms.

Unter `prefers-reduced-motion: reduce` sind diese Bewegungen abgeschaltet:
Karten und Schritte erscheinen direkt, das Detail klappt ohne Übergang auf.
Die Auswahl und die Weiter-Tasten funktionieren unverändert.

Am 13.09.2026 im Browser geprüft: Auswahl und Bestätigung beider Schritte,
Einsetzen und Tauschen, Austausch abbrechen, Generator mit Einsammeln und
Austeilen, Fortsetzen nach Neuladen sowie Darstellung bei 390 × 844 px.
Während eines Kartenflugs blieben Breite und Höhe konstant; die gemessene
Transformation enthielt nur Verschiebung und Drehung.

## Was für beide gilt

- **Kein Feld wird gefüllt, das im Katalog nicht steht.** Lücken bleiben
  sichtbar — „Alter offen“ an einer Karte, die leere Zelle in der
  Abdeckung, der gedämpfte Einstieg für einen Bereich, den es nicht gibt.
- **Nichts sieht fertig aus, was es nicht ist.** Ein Einstieg ohne Funktion
  trägt „noch nicht gebaut" und führt auf eine Seite, die den Grund nennt.
- **Bewegung nur, wo sie etwas zeigt.** `prefers-reduced-motion` schaltet sie ab.
# Ergänzung: Umfang und Zeit (14.09.2026)

Der automatische Plan führt durch vier Schritte: Altersgruppe, Trainingsweise,
Umfang, Übungen. Die Umfangsvorschau zeigt Modul-Karten mit direkt editierbaren
Minuten. Plus/Minus und Zahleneingabe ergänzen sich; die Zeitbilanz zeigt Ist,
Ziel und freien beziehungsweise überschrittenen Zeitraum. Individuelle Eingaben
bleiben beim Zurückgehen erhalten. Auf schmalen Bildschirmen stehen die Karten
untereinander, auf mittleren in zwei und auf breiten in drei Spalten.

Im manuellen Plan stehen Minutenregler direkt am Modul. „Module anpassen“ öffnet
die Auswahl der sieben Module und die Zielzeit. Ein in derselben Sitzung wieder
hinzugefügtes Modul erhält seine vorherige Übung und Dauer zurück, sofern die
Übung nicht inzwischen anderweitig eingesetzt wurde. Im Druck erscheinen nur
die Zeiten, keine Bedienelemente.
