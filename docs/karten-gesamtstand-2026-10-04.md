# CourtFlow-Karten: Gesamtstand vom 04.10.2026

Alle 146 kanonischen Karten wurden auf Beschreibung, Feldabdeckung und
Quellenzuordnung geprüft; elf Aliase zählen nicht als eigene Karten. Die
[Einzelprüfung](karten-bestandsstand-2026-10-04.md) zeigt den Stand pro Karte.
Eine Feldzählung ist keine sportfachliche Freigabe. Angaben, die nicht aus
einer zugeordneten Primärquelle hervorgehen, bleiben offen.

## Fortsetzung: Runde 11

Für EX-135 „Two Halves Scrimmage“ wurde die konkret benannte Originalübung
im [FIBA/WABC-Level-1-Handbuch](https://assets.fiba.basketball/image/upload/documents-corporate-wabc-coaching-level-manuals-level-1-eng.pdf),
Abschnitt 2.1.8, auf PDF-Seite 327 (gedruckte Seite 325) abgeglichen. Die
Seite wurde zusätzlich gerendert und visuell geprüft. Ablauf mit
Regelvarianten, Spielerzahl, Raum und Material sind nun zweisprachig erfasst.
Die Quelle nennt keine feste Dauer; deshalb wurde keine ergänzt. Katalogstufe, Alter und
QA blieben unverändert. Bearbeitete Texte und Quellenbeleg stehen in
[`karten-runde-11.json`](redaktion/karten-runde-11.json) und
[`karten-recherche-runde-11.json`](quellen/karten-recherche-runde-11.json).

Bei sieben weiteren Karten (EX-062–068) stand bisher im Feld „Ablauf“ nur ein
Prüfauftrag für die noch fehlende Originaldurchführung. Diese Platzhalter
wurden aus dem Ablauffeld entfernt und im
[Korrekturprotokoll](redaktion/karten-ablaufplatzhalter-2026-10-04.json)
mit ihrem Wortlaut erhalten. Damit werden diese Karten nicht mehr automatisch
für Trainings vorgeschlagen.

## Fortsetzung: Runde 12

Sechs weitere Kompetenzkarten wurden mit konkreten Abschnitten der offiziellen
Jr.-NBA-Trainingspläne abgeglichen. EX-031 „Body Control“ nutzt die
„Zig-Zag V Jumps“ aus Rookie Practice 6. EX-067 „Pass, Cut and Replace“
hat nun den Ablauf der gleichnamigen Übung aus Starter Practice 4. Für
EX-024 „Recognizing Open Teammates“ wurde der bisher allgemeine Text durch
„Who Is Ready“ aus Rookie Practice 9 ersetzt. EX-063 „Running Pass“ nutzt
die Passaufgabe mit Zielhütchen aus Starter Practice 8; EX-065 „Boxing Out“
das 2-gegen-2-Ausboxspiel aus Starter Practice 3. EX-036 „Drive and Kick“
beschreibt jetzt die 2-gegen-2-Entscheidung aus „The Kick Pass Drill“ in
Starter Practice 3. Dieser letzte Quellwechsel überschreitet die Rookie-Stufe
des Kompetenzankers; die Alterszuordnung ist deshalb weiter zu prüfen.
Die [Bearbeitungen](redaktion/karten-runde-12.json) und
[Einzelbelege](quellen/karten-recherche-runde-12.json) halten alle vorherigen
Feldwerte und Quellenabschnitte fest. QA und Katalogalter wurden nicht geändert.

Im aktuellen Datenstand haben **134 von 146 Karten einen Ablauf**; 12 sind
offen. Die frühere Zahl 136 erfasste auch die sieben Prüfaufträge als gefüllte
Felder. 109 Karten haben einen direkten Quellenlink. Die englische
Textsammlung enthält 643 Einträge. Die früheren Runden und ihre 25 Ergänzungen sind im
[Gesamtstand vom 03.10.2026](karten-gesamtstand-2026-10-03.md) dokumentiert.

Von den 12 Karten ohne Ablauf haben vier (EX-016, 023, 028,
075) nur einen Kompetenznamen aus der Jr.-NBA-Checkliste, jedoch keine
eindeutig zugeordnete Originaldurchführung. Für EX-016 und EX-028 gibt es
mit EX-076 beziehungsweise EX-044 bereits verwandte Übungskarten; eine
zweite, nahezu gleiche Durchführung wurde nicht erzeugt. EX-106 und 107 haben keine
eindeutige Originalquellen-Zuordnung. EX-136 beschreibt technische Optionen
am On-Ball-Screen, EX-137 eine methodische Querschnittsregel statt eines
isolierten Drills. Bei EX-062, EX-064, EX-066 und EX-068 fehlt weiterhin die jeweilige Originalübung.
Die einzelnen Gründe und zusätzliche Prüfaufträge stehen
in der [offenen Verifikation](quellen/karten-offene-verifikation-2026-10-04.json).
Diese 12 Karten bleiben sichtbar, werden aber nicht automatisch als
Trainingsbausteine vorgeschlagen. Im Kartendetail steht für sie ausdrücklich,
dass kein gesicherter Ablauf dokumentiert ist; vorhandene Evidenz erscheint
getrennt als Quellenhinweis.

Die bestehenden Kompetenzmotiv-Bilder sind im Kartendetail als Illustration
gekennzeichnet, wenn sie den Ablauf nicht genau zeigen. Der Bildabgleich von
EX-012, 019 und 110 ist weiterhin offen.

## Prüfung

Die Ergänzung wird über `tools/normalize.py` reproduzierbar eingespielt;
Karten-ID, Titel, unveränderter vorheriger Feldwert, Quellenbeleg und beide
Sprachen werden geprüft. 20 Redaktionstests und 13 Normalisierungstests,
Sprach- und Trainingsplanprüfung sowie der Build bestanden nach Runde 12.
Die DE/EN-Ansicht von EX-031 und die deutschen Ansichten von EX-063, EX-065
und EX-067 wurden im
lokalen Browser mit Ablauf, Merkmalen und Quellenlink kontrolliert; die
EX-135-Ansicht war bereits in Runde 11 geprüft. Der Datenvalidator meldet
weiterhin nur die bekannten Quellenlücken EX-106 und EX-107.
