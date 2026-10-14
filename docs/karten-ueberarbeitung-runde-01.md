# Kartenüberarbeitung – Runde 1

Stand: 01.10.2026. Lokaler Arbeitsstand; nicht veröffentlicht.

26 Karten wurden auf Grundlage bereits vorhandener Katalogbelege redaktionell
überarbeitet. Insgesamt wurden 40 Inhaltsfelder ergänzt oder verständlicher
formuliert. Zusätzlich wurden die Zeit- und Spielerzahlangaben beim Import
korrigiert. Dadurch ändern sich insgesamt 45 kanonische Datensätze.

## Was sich verbessert hat

| Inhalt | Vorher vorhanden | Jetzt vorhanden | Weiterhin fehlend |
|---|---:|---:|---:|
| Eigenes Ablauffeld | 81 | 94 | 52 |
| Lernziel | 43 | 46 | 100 |
| Coachingpunkte | 8 | 9 | 137 |
| Progression | 43 | 48 | 98 |
| Spielerzahl/Organisation als Text | 43 | 45 | 101 |
| Dauer/Umfang als Text | 43 | 44 | 102 |
| Raum | 28 | 29 | 117 |
| Material | 23 | 24 | 122 |

Die 13 neu gefüllten Ablauffelder sind belegte Kurzbeschreibungen, keine pauschal
vollständigen Übungsanleitungen. Wo im zugehörigen Beleg etwa Startaufstellung,
Wechselregel oder genaue Blockfolge fehlen, benennt der neue Text die offene
Angabe. Erfassungsstufen, Altersfenster, Kompetenzen, Quellen und Freigaben wurden
nicht verändert. Die sieben offenen Kompetenzanker EX-062–EX-068 bleiben offen.

## Überarbeitete Karten

| Karten | Überarbeitung |
|---|---|
| EX-077 | Ablauf aus vorhandenem Evidenztext erschlossen; belegte Coachingpunkte ergänzt. |
| EX-111, EX-112 | Korblegerabläufe verständlicher; bei EX-112 Lernziel und Progression ausgegliedert. |
| EX-113 | Partnerablauf, Spielerzahl, Material und Progression strukturiert. |
| EX-115, EX-117 | Grundablauf und Steigerungen getrennt. |
| EX-118, EX-120 | Explizit belegte Lernziele ergänzt; Ablauf gestrafft. |
| EX-128, EX-130, EX-131, EX-134 | Eigene Ablauffelder aus vorhandenen Katalogbelegen. |
| EX-138, EX-139 | Gemeinsamen Beleg nach der ausdrücklich genannten Zuordnung Down Screen bzw. Pick-and-Roll getrennt formuliert. |
| EX-142, EX-145, EX-149, EX-150, EX-151, EX-152 | Eigene Kurzabläufe; bei dünner Dokumentation offene Details benannt. |
| EX-153 | Ablauf, vier Minuten je Spiel und Ganzfeld strukturiert. |
| EX-154, EX-155, EX-156, EX-157 | Spielregeln verständlicher formuliert; EX-157 mit eigener Progression. |
| EX-158 | Fünfergruppe einschließlich Wechselrolle strukturiert; Wechselregel bleibt offen. |

## Importkorrekturen

Zwölf bisher falsche Zeitwerte sind korrigiert:

- EX-054: 4 × 1 Minute → 4 Minuten Arbeitszeit.
- EX-058: 3 × 2 Minuten → 6 Minuten Arbeitszeit.
- EX-085: 2 × 30 Sekunden → 1 Minute Arbeitszeit; die gesonderte Variante mit
  30–45 Sekunden wird nicht mit der Grundform vermischt.
- EX-055–EX-057, EX-059–EX-061, EX-078, EX-082 und EX-084: Spiele, Punkte oder
  Wiederholungen ohne Zeiteinheit erzeugen keine fiktiven Minuten mehr.

Pausen werden nicht hinzuerfunden. Originalangaben bleiben als Rohtext erhalten.
„4+ pro Rotation“ und „6+“ bekommen keine erfundene Obergrenze. Coach-, Ball-,
Team- und Linienzahlen werden nicht als Spielerzahl gelesen. „3er-Gruppen,
2 Bälle“ wird als drei Spieler erkannt; „Paare“ als zwei. Gemischte oder
nicht eindeutig auflösbare Organisationsformen bleiben nur als Text verfügbar.

## Belegbindung und Wiederholbarkeit

[karten-runde-01.json](redaktion/karten-runde-01.json) enthält je Karte den
unveränderten Katalogbeleg, den erwarteten bisherigen Feldwert sowie die neue
deutsche und englische Fassung. `tools/normalize.py` spielt diese Redaktion nach
dem Quellenimport ein. Jede Zuordnung wird gegen ID, Titel, bisherigen Feldwert
und den exakten Belegtext geprüft. Bei Abweichung stoppt der Import, statt eine
zwischenzeitlich geänderte Karte zu überschreiben. Quellen und QA können über
diesen Redaktionsschritt nicht verändert werden. Die ursprüngliche Evidenz und
ein zusätzlicher Redaktionsnachweis bleiben im Datensatz erhalten.

Zusätzlich muss der Beleg die bearbeitete Karten-ID im Präfix nennen oder die
Quelle ausdrücklich den exakten Übungstitel zuordnen. Ein vorhandener Beleg
einer anderen Karte wird abgewiesen; gemeinsame ID-Präfixe wie EX-138/139 bleiben
zulässig.

Die Ergänzungen überstehen damit `npm run daten`. Neue redaktionelle Fassungen
müssen zugleich in `src/locales/drills.en.json` vorliegen; die Tests prüfen die
Übereinstimmung. Der Primärkatalog und seine Rohdaten wurden nicht verändert.

## Prüfung und verbleibende Arbeit

- 20 Import-/Redaktionstests sowie 9 Selbsttests des Datenprüfers bestanden.
- Build, Trainingsplanprüfung und Sprachprüfung bestanden; 422 Übersetzungseinträge.
- Browser-Stichproben: EX-153 zeigt Ablauf, vier Minuten je Spiel und Ganzfeld;
  EX-158 zeigt die Fünfergruppe und die offene Wechselregel auf Deutsch und
  Englisch. Beide Detailansichten wurden gerendert und visuell kontrolliert.
- Der Datenprüfer meldet weiterhin die zwei bekannten fehlenden Quellen bei
  EX-106 und EX-107. Er ist deshalb nicht vollständig grün.
- 33 Karten besitzen weiterhin weder Ablauf noch Evidenztext. Sie benötigen
  als nächsten Inhaltsblock eine konkrete, belegte Durchführung.
- 10 Altersfenster, 11 Kompetenzzuordnungen und die Quellenfragen bleiben offen.
- Externe Quellen/Videos wurden in dieser Runde nicht erneut recherchiert.
  Die acht bisherigen „vollständig“-Markierungen und fünf ausdrücklichen
  publish-ready-Kennzeichnungen wurden nicht erweitert.
