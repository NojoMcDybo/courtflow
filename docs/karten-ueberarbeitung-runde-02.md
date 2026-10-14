# Kartenüberarbeitung – Runde 2

Stand: 02.10.2026. Lokaler Arbeitsstand; nicht veröffentlicht.

Vier bislang unbeschriebene Karten sind anhand offizieller Jr.-NBA-Trainingspläne
ergänzt. 22 Inhaltsfelder liegen neu auf Deutsch und Englisch vor. Jede Karte
verweist jetzt auf die passende Originalseite und nennt den Abschnitt im Link.

| Karte | Geprüfter Originalabschnitt |
|---|---|
| EX-013 Hot Ball (Taps) | [Rookie Practice 1](https://jr.nba.com/basketball-practice-plans/rookie/) · Hot Ball (Taps) |
| EX-014 Stationary Dribble – Low / Middle / High | [Rookie Practice 5](https://jr.nba.com/basketball-practice-plans/rookie/page/5/) · Low, Middle, High Dribble |
| EX-015 Stationary Crossover | [Rookie Practice 3](https://jr.nba.com/basketball-practice-plans/rookie/page/3/) · Stationary Crossover Low, Middle, High |
| EX-038 Defensive Stance | [Rookie Practice 4](https://jr.nba.com/basketball-practice-plans/rookie/page/4/) · Defensive Stance |

Bei EX-015 bleibt die Gesamtdauer wegen einer uneindeutigen Serienangabe offen.
EX-038 bleibt eine Technikbeschreibung ohne erfundene Übungsorganisation.
Videos wurden nicht geprüft. Die Nachweise und Prüfentscheidungen stehen im
[Rechercheprotokoll](quellen/karten-recherche-2026-10-02.json).

## Aktueller Umfang

Grundgesamtheit: 146 kanonische Karten; 11 Aliase werden nicht doppelt gezählt.

| Inhalt | Nach Runde 1 | Nach Runde 2 | Weiterhin fehlend |
|---|---:|---:|---:|
| Eigenes Ablauffeld | 94 | 98 | 48 |
| Lernziel | 46 | 50 | 96 |
| Coachingpunkte | 9 | 13 | 133 |
| Progression | 48 | 50 | 96 |
| Dauer/Umfang als Text | 44 | 46 | 100 |
| Raum | 29 | 32 | 114 |
| Material | 24 | 27 | 119 |
| Quellen-URL | 75 | 79 | 67 |

29 statt 33 Karten haben weder Ablauf noch Evidenztext. Insgesamt wurden seit
Beginn der Überarbeitung 30 Karten inhaltlich bearbeitet; einschließlich der
Importkorrekturen aus Runde 1 unterscheiden sich 49 Datensätze vom Ausgangsstand.
Das ist noch keine vollständige Überarbeitung der Bibliothek.

## Nachvollziehbarkeit

[karten-runde-02.json](redaktion/karten-runde-02.json) enthält die erwarteten
Ausgangswerte, neue Eigenformulierungen und ihre englischen Fassungen. Das
separate Rechercheprotokoll bindet die Originalseite an Karten-ID, Titel und
geprüfte Felder. Der Import weist vertauschte Belege, veraltete Ausgangswerte,
unpassende Quellen und unbelegte Feldänderungen ab. Die inhaltliche Belegprüfung
bleibt eine redaktionelle Aufgabe; eine URL allein beweist keine Aussage.

Die Ergänzungen werden nach Runde 1 eingespielt und überstehen den Datenimport.
Ursprüngliche Evidenz, Alter, Kompetenzzuordnung und QA bleiben erhalten. Die
Erfassungsstufe bezeichnet weiterhin den Ursprungskatalog und wird deshalb in
Bibliothek und Trainingsdetails als „Katalogerfassung“ bezeichnet. Leere Felder
heißen nun „bisher nicht dokumentiert“; eine Aussage über ihre Abwesenheit in der
Originalquelle wäre falsch. Es gibt keine neuen Vollständigkeits- oder
Freigabemarkierungen.

## Prüfung

- 25 Import-/Redaktionstests bestanden, einschließlich Zuordnungsschutz,
  unveränderter übriger Karten und vollständiger Wiederherstellung der Daten.
- 9 Selbsttests des Datenprüfers bestanden. Weiterhin genau zwei bekannte
  Quellenbefunde: EX-106 und EX-107; Datenprüfung deshalb mit Fehlerstatus.
- Build, Sprachprüfung und Trainingsplanprüfung bestanden; 441 Übersetzungen.
  Der Build weist auf eine Hauptdatei knapp über 500 kB hin.
- Browser-Stichproben nach dem Build: EX-014 auf Deutsch und EX-038 auf Englisch
  gerendert und visuell geprüft. Texte, Quellenlinks und der korrigierte Hinweis
  zur Katalogerfassung erscheinen vollständig. Bilder der geprüften Ansichten:
  [EX-014](../tmp/karte-EX-014-runde-02.png),
  [EX-038 Englisch](../tmp/karte-EX-038-en-runde-02.png).

## Nächste Lücken

Die verbleibenden unbeschriebenen Grundlagenkarten benötigen jeweils einen
eindeutigen Originalabschnitt. Checklisten und benachbarte Übungen reichen dafür
nicht. Insbesondere EX-016, EX-020, EX-025 und EX-039 sind in dieser Runde nicht
aus ähnlich benannten Drills ergänzt worden. Die offenen Alters-, Kompetenz-
und Quellenfragen aus der [Gesamtprüfung](karten-inhaltspruefung-2026-10-01.md)
bestehen fort.
