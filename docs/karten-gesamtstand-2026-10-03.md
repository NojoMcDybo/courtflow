# CourtFlow-Karten: Gesamtstand vom 03.10.2026

Alle 146 kanonischen Karten wurden im aktuellen Datenstand erneut auf Feldabdeckung,
Beschreibung und Quellenlink geprüft; elf Aliase werden gesondert gezählt. Die
vollständige Zeilenliste steht in [karten-bestandsstand-2026-10-03.md](karten-bestandsstand-2026-10-03.md).
Eine Feldzählung ist keine fachliche Freigabe: Nicht jede Karte braucht jedes Feld,
und aus einem bloßen Skillnamen lässt sich kein Originalablauf ableiten.

## Diese Fortsetzung: Runden 5 bis 10

| Runde | Karten | Neue Inhaltsfelder | Grundlage |
|---|---:|---:|---|
| 5 | 4 | 20 | FIBA Mini-Basketball, Abschnitt 4.5, Aktivitäten 1–4 |
| 6 | 5 | 32 | Jr. NBA Rookie, konkrete Übungen in Practice 1, 2, 7, 11 und 12 |
| 7 | 2 | 10 | DBB-Videokatalog Minibasketball, PDF-Seite 11 |
| 8 | 4 | 26 | Jr. NBA Rookie und FIBA, konkrete Formen zu vier Skill-Ankern |
| 9 | 8 | 42 | Jr. NBA Rookie, Starter und All-Star, exakt benannte Übungen |
| 10 | 2 | 5 | FIBA Mini-Basketball, Abschnitte 3.2 und 4.2 |
| **Summe** | **25** | **135** | Kartengebundene Primärquellen |

Bearbeitet wurden EX-002, 003, 006, 008, 011, 012, 018, 019, 020, 039,
049–052, 077, 105, 109, 110, 132, 133, 140, 141 und 146–148. Die
kartengebundenen Belege und die zweisprachigen Texte stehen in
`docs/quellen/karten-recherche-runde-05.json` bis `-10.json` und
`docs/redaktion/karten-runde-05.json` bis `-10.json`. Die FIBA-PDF-Seiten 15,
16, 23 und 30 sowie die DBB-PDF-Seite 11 wurden zusätzlich als gerenderte
Seiten geprüft. Die DBB-Zeitmarke bei EX-012 benennt die Videostelle, keine
Übungsdauer. EX-140 und EX-148 sind zwei Katalogkarten zur selben
Originalübung; diese Doppelung bleibt sichtbar.

## Aktuelle Abdeckung

136 von 146 Karten haben nun ein eigenes Ablauffeld (zuvor 112), 106 einen
direkten Quellenlink (zuvor 93). Fünf Karten haben weder Ablauf noch
Evidenztext (zuvor 15). Die englische Textsammlung umfasst 611 Übersetzungen.
Alter, Kompetenzen, ursprüngliche Katalog-Erfassungsstufe und QA wurden nicht
stillschweigend aufgewertet. Umfänge wie „vier Spiele bis zwei Treffer“ bleiben
als Umfangstext erhalten und werden nicht als Minuten ausgegeben.

Zehn Karten haben weiterhin keinen eigenen Ablauf. Bei EX-016, 023, 028, 031
und 075 liegt bislang nur ein Skillname ohne verifizierte Durchführung vor.
EX-106 und 107 haben keine eindeutige Originalquellen-Zuordnung;
EX-135 benötigt einen genaueren Abgleich mit dem FIBA-Level-1-Handbuch;
EX-136 und 137 beschreiben eher Technik beziehungsweise Methodik als einen
abgegrenzten Drill. Die Gründe und der Stand weiterer Originalprüfungen sind
in [karten-offene-verifikation-2026-10-03.json](quellen/karten-offene-verifikation-2026-10-03.json)
einzeln dokumentiert. Auch bei gefüllten Feldern können Coaching, Material,
Raum oder Dauer fehlen; der Gesamtbericht zeigt diese Lücken pro Karte.
Karten ohne eigenen Ablauf bleiben im Bibliotheksbestand sichtbar, werden aber
nicht mehr automatisch als Trainingsbaustein vorgeschlagen.

Die offiziellen Primärquellen dieser Fortsetzung:
[Jr. NBA Rookie](https://jr.nba.com/basketball-practice-plans/rookie/),
[Jr. NBA Starter](https://jr.nba.com/basketball-practice-plans/starter/),
[Jr. NBA All-Star](https://jr.nba.com/basketball-practice-plans/all-star/),
[FIBA/WABC Mini-Basketball Coaches Manual](https://assets.fiba.basketball/image/upload/documents-corporate-wabc-coaching-manual-mini-basketball-eng.pdf)
und [DBB-Videokatalog Minibasketball](https://www.basketball-bund.de/wp-content/uploads/sites/2/2022/02/Videokatalog-Minibasketball.pdf).

## Bildabgleich

Die bestehenden Illustrationen sind teils ausdrücklich als
„Kompetenzmotiv“ registriert und zeigen nicht immer die nun belegte
Originalorganisation. Bei EX-012 zeigt das Motiv eine Reaktion beim
Dribbling statt des nummerierten Korblaufs; bei EX-019 einen Pass auf ein
Wandziel statt durch Kegeltore; bei EX-110 einen Wurf in Richtung Behälter
statt der freien Hoch-/Weitwurfaufgabe. Die Abläufe und Quellen im Text sind
maßgeblich. Für diese drei Motive ist eine bildliche Anpassung noch offen.
Die Bibliothek kennzeichnet Kompetenzmotive im Kartendetail deshalb sichtbar
als Fertigkeitsillustration und nicht als genaue Ablaufdarstellung.

## Prüfung

Der Import ist reproduzierbar über `tools/normalize.py`. Jede Ergänzung prüft
Karten-ID, Titel, unveränderten vorherigen Feldwert, Quellenbeleg und DE/EN-Text.
20 Redaktionstests und 13 Normalisierungstests bestanden; ebenso Build,
Sprach- und Trainingsplanprüfung. Die Planprüfung stellt jetzt sicher, dass
kein automatisch vorgeschlagener Trainingsbaustein ohne eigenen Ablauf bleibt.
Die DE/EN-Ansicht von EX-105 wurde im lokalen Browser mit Anleitung, Merkmalen
und Quellenlink geprüft; dabei wurde auch die englische Einzahl in der
Ergebnisanzeige korrigiert. Der Datenvalidator meldet weiterhin nur die
bekannten Quellenlücken EX-106 und EX-107. Der Build weist auf ein großes
JavaScript-Bündel hin; das ist kein Inhaltsfehler.
