# Katalogkorrekturen vom 14.09.2026

Grundlage bleibt der unveränderte Kompetenzkatalog v3.8. Die Änderungen beheben
Verluste beim Import; es wurden keine neuen Übungen, Altersfreigaben oder
publish-ready-Kennzeichnungen erfunden. Zahlen beziehen sich auf 146 kanonische
Karten, ohne die elf Aliase.

| Befund | Vorher | Jetzt |
|---|---:|---:|
| Weder Quellenname noch URL | 32 | 2 |
| Kein eigener Ablauf im Datenfeld | 103 | 67 |
| QA oder langer Fließtext statt Kurztitel | 5 | 0 |
| Ohne Altersfenster | 10 | 10 |
| Ohne Kompetenzcode | 11 | 11 |
| Vollständig dokumentiert | 8 | 8 |
| Explizit publish-ready | 5 | 5 |

## Was übernommen wurde

- Kandidatentabellen liefern die tatsächlichen Titel für EX-104–107 und
  EX-109–110. EX-126 heißt vollständig „Guards: Pick & Roll Situational
  Shooting“. Die QA- und Belegtexte bleiben erhalten.
- EX-096–103 nennen ihren Anbieter direkt vor der Durchführung. EX-105 ist
  im Satz „Jr. NBA Rookie Practice 5 dokumentiert das …“ eindeutig betitelt
  (Katalog 44.3). Diese Angaben waren bisher nicht als Quelle zugänglich.
- Die ID-bezogenen Evidenzabsätze zu EX-130–152 enthalten Quellen und Links,
  die bisher nicht in die Kartenfelder gelangten. Gemeinsame ID-Präfixe wie
  EX-138/139 werden korrekt aufgelöst. IDs, die nur im Fließtext erwähnt
  werden, erhalten diese Quelle nicht.
- Explizite Quellenfelder bleiben nebeneinander erhalten: Ein URL-Feld
  „Originalquelle“ verdrängt keinen Anbieternamen im Feld „Quelle“ mehr.
  Abgeschnittene Angaben wie „Jr“ werden anhand derselben Kartenbelegzeile
  wieder vollständig.
- 36 bereits beschriebene Durchführungen stehen nun im Ablauf-Feld. Sie
  stammen aus dem Muster „Übungstitel: Durchführung“. Nachfolgende QA- und
  Quellenmetadaten werden dort abgeschnitten und bleiben in den Belegen.

Neue Quellenangaben bei kanonischen Karten: EX-096–103, EX-105, EX-130–142
und EX-145–152. Die übrigen IDs dieses Forschungsblocks enthalten Aliase.

## Grenzen und gesicherte Sonderfälle

Eine allgemeine Erwähnung von DBB oder FIBA im Umfeld genügt nicht als
Quellenzuordnung. EX-106 und EX-107 bleiben deshalb offen. EX-107 wird vom
Katalog selbst als Methodikanker bezeichnet, nicht als eigenständige
Originalübung (44.6). Eine solche Karte darf nicht durch erfundene
Durchführung vervollständigt werden.

Ein gemeinsamer Beleg mit zwei unterschiedlichen URLs wird nicht automatisch
auf die erste URL verkürzt. Der gemeinsame Quellenname und die vollständige
Evidenz bleiben verfügbar.

EX-053 und EX-054 haben widersprüchliche ältere Review-Titel. Der plausible
Titel ihrer strukturierten Feldkarte („Run to That Line“ bzw. „Diamond
Passing“) bleibt maßgeblich. Eine Titelreparatur greift nur bei QA, langem
Fließtext oder einem nachweislich am Doppelpunkt abgeschnittenen Titel.

Kurze Kandidatenzeilen werden nicht zu Standard- oder Vollfassungen
hochgestuft. Altersfenster und Kompetenzcodes fehlen weiterhin bei den oben
gezählten Karten; das ist mit diesem Import nicht zu lösen.

## U18-Wettbewerbsblock

Katalog 47.3 beschreibt EX-127 „4 on 4 Rebounding“ ausdrücklich als Wettbewerb
um fünf aufeinanderfolgende defensive Rebounds. Die Bewertung für Baustein F
berücksichtigt nun eine ausdrücklich im Ablauf benannte Wettbewerbsform.
Damit stehen bei U18 vier statt drei Kandidaten zur Verfügung. Alter und
Mindestwert wurden nicht verändert. Die Zuordnung bleibt eine redaktionelle
Ableitung des Trainingsmodells; vier Kandidaten im Ausgangspool garantieren
keine vier verbleibenden Alternativen nach jeder bereits getroffenen Auswahl.

## Prüfung

`tools/test_normalize.py` prüft acht Fälle, darunter vollständige Quellenlabels,
Titelkonflikte, Mehrfach-URLs, Fremd-ID-Erwähnungen und ausbleibende
Quellenzuordnung bei unklaren Belegen. Die neun Selbsttests des Datenprüfers
bestehen. Der Datenprüfer meldet weiter zwei offene Quellenbefunde.

`npm run pruefen:plan` prüft zusätzlich EX-127 als U18-Wettbewerb und EX-124 als
Gegenbeispiel. Der Trainingsprüfstand und die Speicherprüfung bestehen.
