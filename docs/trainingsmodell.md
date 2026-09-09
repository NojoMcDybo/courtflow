# Trainingsmodell

Wie eine Einheit aufgebaut wird, welche Quelle das hergibt und was davon
Ableitung ist.

## Woher das Modell kommt

Der Kompetenzkatalog v3.8 enthält das Modell bereits, quellenbelegt in
Forschungsblock XIII (Abschnitt 56) und Block XVI (Abschnitt 61). Es wurde
nicht neu erfunden, sondern mit `tools/trainingsmodell.py` aus den
Katalogtabellen ausgelesen.

**Belegte Quellen des Katalogs**

- Jr. NBA, Instructional Curriculum: Praxispläne als Abfolge unterschiedlicher
  Lernkontexte statt als lineare Drillliste.
  <https://jr.nba.com/jr-nba-instructional-curriculum/>
- FIBA/WABC Level 1, Kapitel 2.1.7 *Planning Practice*: Belastung innerhalb
  einer Einheit körperlich **und** psychologisch steuern; hohe Belastung mit
  Erholung oder weniger intensiver Tätigkeit abwechseln.
  <https://assets.fiba.basketball/image/upload/documents-corporate-wabc-coaching-level-manuals-level-1-eng.pdf>
- FIBA/WABC Facilitator Handbook, *Sample Practice Plan*: konkrete Mischung aus
  Warm-up, Stationsarbeit, Passspiel und weiteren spielnahen Formen.
  <https://assets.fiba.basketball/image/upload/documents-corporate-wabc-start-coaching-eng-facilitator-handbook.pdf>

**Externe Fachquelle, nicht im Katalog**

- Jeffreys, I. (2007): *Warm-up revisited – the RAMP method of optimising
  warm-ups.* Professional Strength and Conditioning 6, 12–18. Ordnet den
  Aktivierungsblock in Raise, Activate, Mobilise, Potentiate. Der Katalog
  beschreibt Baustein A nur als „Bewegung, Ballgewöhnung, Reaktion"; RAMP ist
  die genauere Fassung derselben Funktion und hier als externe Ergänzung
  gekennzeichnet.

## Die sieben Bausteine

| Code | Baustein | Funktion | Intensität* | Gewicht* |
|---|---|---|---|---|
| A | Aktivieren | Körper und Wahrnehmung hochfahren | 2 | 12 |
| B | Fundament | eine Kernfertigkeit stabilisieren | 2 | 20 |
| C | Wahrnehmen/Entscheiden | Fertigkeit an Information koppeln | 3 | 18 |
| D | Kleingruppe | Kompetenz im Spielproblem anwenden | 4 | 22 |
| E | Transfer | Schwerpunkt unter offenen Bedingungen prüfen | 5 | 20 |
| F | Wettbewerb | Energie und Abschluss | 5 | 12 |
| G | Ausklang | Belastung senken, Lernen verbalisieren | 1 | 8 |

Code, Name und Funktion stehen im Katalog. *Intensität und Gewicht sind
Ableitung — der Katalog schreibt ausdrücklich **keine** starre Zeitverteilung
vor (56.3).

Eine Einheit hat 4 bis 7 Blöcke. Nicht jede braucht alle.

## Aufbauweisen

Zehn Referenzpfade **TR-01 bis TR-10** kommen aus dem Katalog, mit Altersstufe,
Ziel, Blockfolge und Individualisierungshinweis. Beispiele:

```
TR-01  U8       Ball + Bewegung              A → B → C → D → F
TR-04  U10–U12  Spacing + Zusammenspiel      A → C → D → E → F
TR-08  U14–U16  Pick-and-Roll                A → B → C → D → E → F
TR-10  U18      Screening + 5v5 Transfer     B → C → D → E → F
```

Weil der Katalog nicht für jede Altersstufe mehrere Wege nennt, kommen drei
**abgeleitete Aufbauweisen** dazu. Sie benutzen nur die Bausteine A–G, halten
die 4-bis-7-Regel ein, gelten für U8 bis U18 und sind in der Oberfläche als
Ableitung gekennzeichnet:

```
AW-Technik     Technikweg     A → B → C → D → G   viel Fundament, ruhiger Ausklang
AW-Spiel       Spielweg       A → C → D → E → F   ohne isolierten Technikblock
AW-Wettkampf   Wettkampfweg   A → B → D → E → F   kurz aufbauen, lange anwenden
```

## Der Ablauf im Trainingsaufbau

Die Führung fragt nacheinander, statt alles in eine Filterzeile zu legen:

1. **Altersgruppe** — U8 bis U18. Die Stufe steuert, welche Trainingsarten zur
   Wahl stehen und wie die Zeit auf die Blöcke verteilt wird.
2. **Trainingsart** — die Wege für diese Stufe, jeder mit seiner Blockfolge und
   den Minuten, die sich aus der gewählten Dauer ergeben. Die Dauer steht auf
   demselben Schritt, weil sie die Blockfolge sichtbar verändert.
3. **Übungen** — Block für Block, je 4 bis 6 Karten zur Wahl.

Die Schrittleiste bleibt sichtbar und führt zurück; bereits gewählte Übungen
bleiben dabei erhalten. Eine gewählte Karte läuft sichtbar an ihren Platz in der
Einheit und lässt sich dort aufklappen — mit Lernziel, Ablauf, Coachingpunkten,
typischen Fehlern, Regression, Progression, allen belegten Merkmalen und der
Quelle. Der automatische Plan hat dieselben Angaben, nur alle
in einer Zeile — er fragt nichts, er baut.

## Wie aus Dauer Minuten werden

Der Katalog nennt vier Referenzdauern: 60, 75, 90 und 120 Minuten. Die
Verteilung auf die Blöcke ist Ableitung:

```
netto   = Dauer − 10 % Organisation
Gewicht = Bausteingewicht × Altersfaktor
Minuten = netto × Gewicht / Summe der Gewichte,  auf 5 gerundet,
          mindestens 5 Minuten je Block
```

Der **Altersfaktor** setzt eine Aussage des Katalogs um (14.9): je jünger und
unerfahrener die Gruppe, desto höher der Anteil an Bewegung, Ballkontakten,
Wahrnehmung und kleinen Spielen; mit zunehmender Erfahrung darf der Anteil
expliziter Fundamentals steigen.

| Gruppe | Anhebung | Absenkung |
|---|---|---|
| U8–U10 | A ×1,25 · D ×1,25 · F ×1,2 | B ×0,85 · C ×0,9 · E ×0,85 |
| U12 | — | — |
| U14–U18 | B ×1,15 · C ×1,15 · E ×1,15 | A ×0,85 · F ×0,9 |

## Wie Übungen zu Blöcken kommen

Der Katalog vergibt **keine** Bausteinmarke je Karte. Die Zuordnung ist deshalb
eine Bewertung aus vorhandenen Feldern: Kompetenzcodes, Gegnerdruck,
Entscheidungsgrad, Spielnähe, Spielform im Titel, Methodik. Jeder Baustein hat
eine eigene Wertungsfunktion in `src/plan.ts`; eine Karte wird ab 3 Punkten
Kandidat und danach nach Punkten und Belegtiefe sortiert.

**Altersregel.** Der Katalog speichert die Altersstufe als „typisch", nicht als
Freigabe (14.6). Karten aus einem *jüngeren* Fenster werden deshalb angeboten,
aber nachrangig und in der Oberfläche markiert. Karten aus einem *älteren*
Fenster werden nicht angeboten.

**Belastungsregel.** Nach einem Block mit Intensität 4 oder 5 bevorzugt die
automatische Auswahl eine Karte mit geringerem Gegnerdruck. Stehen am Ende
trotzdem zwei intensive Blöcke mit belegtem hohem Gegnerdruck nebeneinander,
wird das am fertigen Plan angezeigt statt stillschweigend hingenommen.

**Eigenständigkeitsregel** (Katalog 56.5). Zwei Einheiten gelten erst als
verschieden, wenn sich mindestens zwei Dimensionen ändern: Übungen,
Hauptkompetenz, Spielerzahl, Raum, Gegnerdruck, Dauer. Der Generator würfelt
bis zu 24 Mal nach, bis das erfüllt ist.

## Prüfstand

`npm run pruefen:plan` misst das Modell gegen den echten Bestand:

1. Hat jeder Baustein auf jeder Altersstufe mindestens 4 Kandidaten?
2. Ergeben die Blockminuten die Nettozeit?
3. Gibt es je Referenzfall mehr als einen Weg?
4. Erzeugen zwölf Auswürfelungen wirklich unterschiedliche Einheiten?

**Aktueller Befund.** Ein Block bleibt dünn: **F Wettbewerb bei U18** mit drei
Kandidaten. Das ist keine Modellschwäche, sondern die bekannte Bestandslücke
bei U16 und U18, die auch die Abdeckungsmatrix zeigt. Die Oberfläche sagt es an
der Stelle, an der es auftritt.

## Was noch offen ist

- Die Kartenzuordnung ist eine Bewertung über Textmuster und Skalen. Sie wäre
  belastbarer, wenn der Katalog je Karte eine Bausteinmarke bekäme.
- Gruppengröße und Material sind noch kein Filter, obwohl der Katalog dafür
  Organisationsregeln nennt (61.3 bis 61.7).
- Die QA-Freigabe ist ausgesetzt: der Generator zieht aus **allen** Karten. Die
  Belegtiefe steht an jeder Karte, die Entscheidung über eine Freigabestufe
  steht weiterhin aus.
