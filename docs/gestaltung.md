# Gestaltung

CourtFlow trägt **zwei getrennte Systeme**. Sie sehen absichtlich nicht gleich
aus und dürfen sich nicht vermischen.

| | System Plakat | System Werkzeug |
|---|---|---|
| Wo | Startseite, gesperrte Bereiche | Bibliothek, Abdeckung, Detailblatt |
| Aufgabe | eine Entscheidung anbieten | mit 146 Datensätzen arbeiten |
| Grund | drei Wege, wenige Sekunden Aufenthalt | lange Sitzungen, hohe Dichte |
| Grund­fläche | Schwarz | Systemfläche, hell oder dunkel |
| Farbe | fünf Neonfarben in Verläufen | Apple Systemfarben, ein Akzent |
| Schrift | 900, übergroß, angeschnitten | 13 px, ruhig, tabellarisch |

Die Grenze verläuft am Attribut `data-ansicht` auf dem Wurzelelement, gesetzt
vom Router in `src/main.ts`. `start`, `generator` und `builder` sind Plakat;
alles andere ist Werkzeug. Es gibt keine Fläche, auf der beide gelten.

**Warum getrennt.** Neonverläufe hinter einer Tabelle mit 146 Zeilen sind nach
fünf Minuten anstrengend; eine graue Systemleiste als Einstieg macht keine
Entscheidung attraktiv. Ein System für beides wäre für beide Aufgaben das
falsche.

## Dateien

```
src/stil/tokens-werkzeug.css   Marken des Werkzeugsystems
src/stil/tokens-plakat.css     Marken des Plakatsystems
src/stil/basis.css             gilt für beide: Reset, Fließtext, Fokus
src/stil/werkzeug.css          Bauteile: Leiste, Filter, Tabelle, Blatt
src/stil/plakat.css            Bauteile: Einstiege, Ziffern, Mikroschrift
src/styles.css                 bindet die fünf in dieser Reihenfolge ein
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
- Dichte ist eine Anforderung, kein Nebeneffekt: sichtbare Zeilen pro Bildschirm
  sind ein Qualitätsmaß der Bibliothek.
- Text ist kein Gestaltungsmittel. Zusammenhängender Text steht nur im
  Detailblatt, wo er der Inhalt ist.

## System Plakat

**Herkunft.** Eine Saisongrafik als Stilvorlage: schwarzer Grund, übergroße
Ziffern mit mehrstufigem Verlauf, oben und unten angeschnitten, dazu eine Zeile
gesperrter Versalien mit `•` als Trenner. Übernommen ist die Machart, nicht die
Marke — keine fremden Zeichen, keine nachgebaute Komposition.

**Fünf Farben**, aus denen jeder Verlauf gemischt wird:

| Marke | Wert |
|---|---|
| `--neon-violett` | `#8b2cf5` |
| `--neon-magenta` | `#e0308f` |
| `--neon-orange` | `#ff7a1a` |
| `--neon-amber` | `#ffb02e` |
| `--neon-blau` | `#2f6bff` |

Daraus vier Verläufe: `--verlauf-1` bis `--verlauf-3` je Einstieg,
`--verlauf-mikro` für die Versalienzeile. Alle mit demselben Winkel (104°),
alle mit drei bis vier Halten. Ein fünfter Verlauf gehört in die Markendatei,
nicht in eine Bauteilregel.

### Die Ziffernmechanik

Das ist der eigentliche Kern des Systems und der Grund, warum es auf jedem
Gerät funktioniert.

**Die Ziffer bemisst sich an der Höhe ihrer eigenen Zeile, nicht am
Bildschirm.** Die drei Einstiege teilen sich die Resthöhe der Seite zu gleichen
Teilen (`flex: 1 1 0`). Jede Zeile ist ein Größencontainer; die Ziffer bekommt
ihren Schriftgrad in `cqh`, also in Prozent der Zeilenhöhe.

```
--ziffer-ueberstand: 1.34   Schriftgrad als Vielfaches der Zeilenhöhe
--ziffer-breite:     1.28   waagerechte Dehnung (0.94 unter 500 px)
--ziffer-aspekt:     0.58   Vorschub einer Ziffer in em
--ziffer-platz:      ueberstand × breite × aspekt
```

Daraus folgt beides zugleich:

- **Höhe.** `font-size = ueberstand × Zeilenhöhe`. Weil der Wert über 1 liegt,
  ragt die Ziffer über ihre Zeile hinaus und wird oben wie unten angeschnitten —
  auf einem 360-px-Handy genauso wie auf einem 1440-px-Bildschirm. Gemessen
  belegt die Ziffer auf jeder geprüften Größe 93 bis 94 Prozent der Zeilenhöhe.
- **Platz.** Der Textblock hält den Abstand `platz × Zeilenhöhe + luft`. Weil
  derselbe Zeilenwert beide Seiten speist, kann der Text nicht in die Ziffer
  laufen, egal wie hoch die Zeile gerade ist.

Auf schmalen Geräten wird die Ziffer **nicht kleiner, sondern schlanker**
(`--ziffer-breite: 0.94`). Volle Höhe bleibt, der Text bekommt trotzdem Platz.

Ohne Unterstützung für Container-Einheiten greift ein `@supports`-Zweig mit
Schätzwerten nach Fensterbreite. Die Reihenfolge im Stylesheet ist dabei
bindend: Gerätespezifische Regeln stehen **vor** dem `@supports`-Block, sonst
überschreibt die Ausnahme das System. Genau dieser Fehler ist einmal passiert
und hat den Text auf 65 px zusammengedrückt.

### Prüfung

Die Mechanik wird nicht nach Augenmaß beurteilt, sondern gemessen. Je Fenster­größe:

1. Füllen die drei Zeilen die Seitenhöhe? (`scrollHeight ≤ innerHeight`)
2. Wie groß ist die Ziffer im Verhältnis zur Zeile? (Soll: 0.9 bis 1.0)
3. Überlappt die rechte Kante der Ziffer die linke Kante des Textes? (Soll: nein)
4. Läuft die Seite waagerecht über? (Soll: nein)

Geprüfte Größen: 360×640, 390×844, 430×932, 820×1180, 1440×900.

## Was für beide gilt

- **Kein Feld wird gefüllt, das im Katalog nicht steht.** Lücken bleiben
  sichtbar leer — das leere Altersgleis in der Tabelle, die leere Zelle in der
  Abdeckung, der gedämpfte Einstieg für einen Bereich, den es nicht gibt.
- **Nichts sieht fertig aus, was es nicht ist.** Ein Einstieg ohne Funktion
  trägt „noch nicht gebaut" und führt auf eine Seite, die den Grund nennt.
- **Bewegung nur, wo sie etwas zeigt.** `prefers-reduced-motion` schaltet sie ab.
