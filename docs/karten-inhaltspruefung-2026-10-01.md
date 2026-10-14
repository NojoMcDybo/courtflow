> Fortschreibung vom 02.10.2026: [Kartenüberarbeitung – Runde 3](karten-ueberarbeitung-runde-03.md).

# Inhaltsprüfung aller CourtFlow-Karten

Stand: 01.10.2026. Geprüft wurde der lokale Arbeitsstand, nicht die veröffentlichte Website.

Dieser Bericht dokumentiert den Zustand **vor der Überarbeitung**. Fortschritt und aktuelle Zahlen der ersten Korrekturrunde stehen in [Kartenüberarbeitung – Runde 1](karten-ueberarbeitung-runde-01.md).

157 Datensätze: 146 eigenständige (kanonische) Karten und 11 Aliase. Die folgenden Zählungen beziehen sich auf die 146 eigenständigen Karten. Jede Karte ist unten einzeln aufgeführt.

## Ergebnis

**Der Bildbestand ist vollständig; der Textbestand ist nicht vollständig.** Nur 8 Karten tragen im Katalog die Einstufung „vollständig“ (EX-078–EX-085). Das ist eine Erfassungsstufe, kein fehlerfreies Qualitätsurteil. Auch in dieser Gruppe bestehen sachliche bzw. Importauffälligkeiten.

- 33 Karten haben weder Ablauf noch Evidenztext.
- 65 Karten haben kein eigenes Ablauffeld. Bei 32 davon existiert Evidenztext, teils mit einer kurzen Handlungsbeschreibung. Fehlendes Feld bedeutet deshalb nicht automatisch fehlender Inhalt im gesamten Katalog.
- Bei weiteren 7 Karten (EX-062–EX-068) ist das Ablauffeld gefüllt, enthält aber ausdrücklich noch offene Original-/Durchführungsprüfungen.
- 103 Karten ohne eigenes Lernziel; 138 ohne Coachingpunkte und typische Fehler.
- 10 ohne Altersfenster: EX-111–EX-114 und EX-153–EX-158. 11 ohne Kompetenzcode: dieselben zehn plus EX-145.
- 2 ohne Quellenname und URL: EX-106 und EX-107. Insgesamt 71 ohne Quellenlink; diese 71 schließen die beiden komplett fehlenden Quellen ein.
- 146 Bildzuordnungen mit 292 vorhandenen, nicht leeren Vorschau-/Detaildateien und deutschen/englischen Alternativtexten.

## Umfang und Aussagegrenzen

Geprüft: sämtliche Kartenfelder, alle Ablauftexte und ersatzweise verwendeten Evidenztexte, Aliasziele, Bildzuordnungen und Dateien, vorhandene Sprachprüfung sowie ausgewählte Rückvergleiche mit den extrahierten Katalogeinträgen. Quellenbasis: data/drills.json, data/uebungsbilder.json, docs/quellen/records-raw.json und die vorhandenen Import-/Prüfwerkzeuge.

Die Feldzählung misst explizit vorhandene Angaben. Ein „variabel“ zählt als vorhandener Umfang, aber nicht als konkrete Zeit. Ein Quellenname zählt als Herkunftsangabe, aber nicht als klickbarer Beleg. Texte in anderen Feldern werden nicht stillschweigend als strukturierte Angaben gewertet. Nicht jedes Feld ist für jede Übung fachlich zwingend; die Tabelle ist ein Lückeninventar, keine neue Freigaberegel.

Keine erneute Prüfung der externen Webseiten/Videos, keine vollständige sportfachliche Validierung und keine visuelle Abnahme aller Bilder oder Kartenansichten. Angaben zu Importfehlern beruhen auf lokalen Daten und Quelltext. Inhalte und Website wurden nicht geändert.

## Vollständigkeit je Feld

| Inhalt | Vorhanden | Fehlend |
|---|---:|---:|
| Titel | 146 | 0 |
| Lernziel | 43 | 103 |
| Ablauf | 81 | 65 |
| Coachingpunkte | 8 | 138 |
| Typische Fehler | 8 | 138 |
| Altersfenster | 136 | 10 |
| Kompetenz | 135 | 11 |
| Erfahrung | 8 | 138 |
| Spielerzahl | 43 | 103 |
| Raum | 28 | 118 |
| Dauer/Umfang | 43 | 103 |
| Material | 23 | 123 |
| Regression | 43 | 103 |
| Progression | 43 | 103 |
| Methodik | 23 | 123 |
| Quelle (Name oder URL) | 144 | 2 |
| Quellenlink | 75 | 71 |
| Skala: entscheidung (numerisch) | 23 | 123 |
| Skala: gegnerdruck (numerisch) | 23 | 123 |
| Skala: technik (numerisch) | 12 | 134 |
| Skala: spielnaehe (numerisch) | 12 | 134 |
| Skala: zeitdruck (numerisch) | 8 | 138 |
| Skala: raumdruck (numerisch) | 8 | 138 |
| Skala: wahrnehmung (numerisch) | 8 | 138 |
| Skala: kooperation (numerisch) | 8 | 138 |

## Zeit- und Umfangsprüfung

Der Import tools/normalize.py verwendet für Dauer/Umfang dieselbe Zahlensuche wie für allgemeine Spannen. Dadurch werden Wiederholungen, Punkte und Sekunden zu Minutenwerten. Die Rohtexte bleiben erhalten. Im aktuell gelesenen Plan-/Ansichtscode werden die Rohangaben verwendet; ein Einfluss dieser Zahlenfehler auf die konkrete Planminutensumme ist damit nicht nachgewiesen.

| Karte | Originalangabe im Datensatz | Gespeicherte Min–Max-Minuten | Befund |
|---|---|---|---|
| EX-054 | 4 x 1 min | 1–4 | Intervallfolge ist keine Minutenspanne. |
| EX-055 | 2-3 Spiele | 2–3 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-056 | 2 x 10 | 2–10 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-057 | Games to 3 | 3–3 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-058 | 3 x 2 min | 2–3 | Intervallfolge ist keine Minutenspanne. |
| EX-059 | 2 x 5 | 2–5 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-060 | 2 Durchgänge | 2–2 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-061 | Games to 5 | 5–5 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-078 | 3 × 8 als Originalangabe | 3–8 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-082 | Games to 3 als Originalangabe | 3–3 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-084 | 2 Spiele als Originalangabe | 2–2 | Punkte/Spiele/Wiederholungen ohne Minutenbeleg. |
| EX-085 | 2 × 30 s als Originalangabe; soziale Variation 30–45 s | 2–45 | Sekunden und Wiederholungszahl als Minuten eingelesen. |

## Inhaltlich priorisierte Nacharbeit

1. Die 33 Karten ohne jeden Beschreibungstext und die 7 offenen Kompetenzanker benötigen zuerst eine belegte Durchführung. EX-107 und EX-137 als Methodik-/Querschnittskarten gesondert einordnen.
2. Vorhandene Angaben strukturiert erschließen, bevor neu recherchiert wird: beispielsweise EX-077 (Ablauf), EX-112 (Lernziel), EX-153 (4 Minuten/Ganzfeld), EX-158 (5er-Gruppe). Solche Fälle widerlegen die pauschale Gleichsetzung „leeres Feld = fehlt in der Quelle“.
3. Einheiten und Mengen beim Import unterscheiden. EX-083 außerdem auf „4+“ statt einer festen Obergrenze 4 prüfen. Quellenwiderspruch bei EX-002 und Organisationswiderspruch bei EX-083 auflösen.
4. Altersfenster, Kompetenzcodes, Quellen und konkret benötigte Organisationsangaben nachtragen, soweit im Katalog belegt; sonst als offene Recherche führen.
5. Lernziele, Coachingpunkte, Fehlerbilder und Varianten redaktionell ausarbeiten und belegen. Danach separat freigeben. Aktuell: 5 Karten publish_ready=true, 3 false und 138 ohne ausdrückliche Kennzeichnung. Die im Projekt bewusst ausgesetzte Freigabesperre wurde nicht verändert.

## Vorhandene Prüfungen

- Datenprüfer: 9 Selbsttests bestanden; 2 bekannte Befunde (Quelle bei EX-106/EX-107 fehlt). Er prüft allgemeine Vollständigkeit nur sehr begrenzt: fehlende Lernziele/Abläufe werden primär bei publish-ready-Karten beanstandet. Die zwei Befunde bilden deshalb nicht den Gesamtumfang der Inhaltslücken ab.
- Sprachprüfung bestanden: 384 Übersetzungseinträge, alle als Ablauf/Evidenz verwendeten Beschreibungstexte abgedeckt; zweisprachige Suche und Erhalt der Quellenlinks geprüft. Keine vollständige semantische Übersetzungsabnahme.
- Bildzuordnungen eindeutig; 146 kanonische Karten vollständig technisch bebildert. Alle 11 Aliase verweisen auf vorhandene kanonische Karten.
- Frühere Dokumentation nennt 67 Karten ohne Ablauffeld. Der aktuelle lokale Bestand hat 65; dieser Bericht verwendet den aktuellen Datenstand.

## Einzelprüfung aller 146 Karten

Abkürzungen werden vermieden: Aufgeführt sind alle fehlenden Felder aus der obigen Inhaltstabelle (Skalen separat danach). „Keine“ bedeutet nur: die geprüften Felder sind befüllt. Die Hinweise benennen zusätzliche inhaltliche Auffälligkeiten.

| ID · Titel | Erfassungsstufe | Fehlende Felder | Zusätzliche Hinweise |
|---|---|---|---|
| EX-002 · Red Light Game | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. Quellenkonflikt: Hauptquelle Practice 2, spätere Belegtabelle 111 Practice 8; auflösen. |
| EX-003 · Jump Stop Game | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-004 · 5-5-5 Creative Dribble Drill | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-005 · Dribble Knockout | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-006 · Pass & Cut Drill | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-008 · Cone Knockdown / Hit the Cone | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-010 · Partner Shooting / Form Shooting | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-011 · Passen & Werfen – 5er-Team | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-012 · Reaktionsspiel | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-013 · Hot Ball (Taps) | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-014 · Stationary Dribble – Low / Middle / High | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-015 · Stationary Crossover | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-016 · Change of Direction Dribble | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-017 · Stationary Wall Passing – Chest | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-018 · Catching & Receiving | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-019 · Hitting the Target | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-020 · Stationary Partner Pass: Bounce & Chest | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-021 · Pivot & Pass | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-022 · Pass to a Moving Player | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-023 · Slide & Pass | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-024 · Recognizing Open Teammates | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-025 · Stationary Form Shooting | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-026 · Using the Backboard | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-027 · Jump Stop Shooting | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-028 · 1-2 Step Shooting | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-029 · Jump, Catch & Land | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-030 · Athletic Stance / Triple Threat | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-031 · Body Control | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-032 · Two-Foot Jump Stop | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-033 · Pivoting Basics | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-034 · Pass & Cut | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-035 · Ball Reversal | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-036 · Drive and Kick (Pass) | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-037 · Give & Go | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-038 · Defensive Stance | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-039 · Defensive Slide | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-040 · Stay Between Man and Basket | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-041 · Tracing the Ball | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-042 · Lay-Up High Five Drill | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-043 · Lay-Up Skips Drill | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-044 · 1-2 Step Lay-Ups | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-045 · Shoot and Follow | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-046 · 2 on 1 Shooting Game | standard | Coachingpunkte, Typische Fehler, Erfahrung, Raum, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-048 · Pass & Cut Decision Game | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-049 · Free Dribble + Whistle Pass | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-050 · Dribble Under Arms + Pivot & Pass | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-051 · Hand-Off from Jump Stop | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-052 · Double-Ball Dribble → Pass | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-053 · Run to That Line | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-054 · Diamond Passing | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-055 · The Chase Game | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-056 · Form Shooting – 1 Hand | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-057 · Decision 1 on 1 | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-058 · Shoot and Follow | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-059 · Defense, I Love It Drill | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-060 · Dribble Relay | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-061 · 3 on 3 Numbers Game | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-062 · Advanced Stationary Control Series | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-063 · Running Pass | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-064 · Closeout to Slide | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-065 · Boxing Out | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-066 · Pursuing the Ball | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-067 · Pass, Cut and Replace | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-068 · Fill the Corner | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Ablauffeld enthält offenen Verifikationsauftrag statt konkreter Durchführung. |
| EX-069 · Game-drill Exploring the Court / Pac Man | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-070 · Visual / Verbal Direction Change | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-071 · Partner Mirror Dribbling | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-072 · Passing Game – Moving & Intercepting | redaktionsscore | Coachingpunkte, Typische Fehler, Erfahrung, Material, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-073 · Open & Decide Drill | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-074 · 3-Second Box Out Game | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-075 · Closeout to Slide | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-076 · Cone Dribbling | nur_belege | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Weder Ablauf noch Evidenztext. |
| EX-077 · 2 on 2 Numbers Game | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. Konkreter Kurzablauf bereits im Evidenztext; noch nicht als Ablauf übernommen. |
| EX-078 · Self-Toss Rebound Drill | vollstaendig | Keine | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-079 · Toss & Get It Drill | vollstaendig | Keine | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-080 · 1 gegen 1 Korblegerverfolgung | vollstaendig | Keine | Folgebesitz nur „gemäß Originalregel“; Regel nicht ausformuliert. Umfang nur variabel. |
| EX-081 · Windows Defensive Slide Drill | vollstaendig | Keine | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-082 · Decision 1 on 1 | vollstaendig | Keine | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-083 · 2 on 2 Full Court Transition Game | vollstaendig | Keine | Ganzfeld/Wechsel beider Seiten, aber Material nennt nur 1 Korb; Quellenklärung nötig. „4+“ wird als exakt 4 gespeichert. |
| EX-084 · Four Corners Game | vollstaendig | Keine | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-085 · Defense, I Love It Drill | vollstaendig | Keine | Minutenwerte falsch aus Umfang/Zahlenfolge abgeleitet; siehe Zeitprüfung. |
| EX-087 · 2-Person Closeout Drill | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-088 · 2 on 2 Closeout | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-089 · Tracing the Ball 2 on 2 Game | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-090 · 3x3 Transition – Basket then Ball | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-091 · Run to That Line | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-092 · Catch a Second Ball Series | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-093 · Circle Reads | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-094 · 2-on-1 Fast Break Game | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-095 · The Pass is Faster Drill | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-096 · Dribble to a Rhythm | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-097 · Throw High / Catch | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-098 · Ich mach’ es wie Du | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-099 · Passen am Reifen | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-100 · Trio mit Ball in der Mitte | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-101 · Basketball Tennis | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-102 · 2 on 2 Surprise | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-103 · Verteidigung von nah und fern | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-105 · Coach Assisted 2 on 2 Small-Sided Game | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-106 · 2 gegen 2 aus der DBB-3x3-Progression | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quelle (Name oder URL), Quellenlink | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. Quellenzuordnung offen; Verifikationsbehauptung ersetzt keine Anleitung. |
| EX-107 · FIBA 3x3 Man-to-Man / Jump-to-the-Ball | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quelle (Name oder URL), Quellenlink | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. Methodikanker, keine eigenständige Originalübung; Quellenzuordnung offen. |
| EX-108 · „Tauscht die „Power““ | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-109 · Zielwürfe mit unterschiedlichen Bällen, Höhen und Distanzen | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-110 · Throw High / Far – variabler Zielwurf | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-111 · „Fühl den Rhythmus“ | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Lernziel/Organisation nur teilweise im Fließtext. |
| EX-112 · „Korbleger – 2er-Rhythmus“ | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Lernziel im Ablauf ausdrücklich benannt, eigenes Lernzielfeld leer. |
| EX-113 · Dribbeln mit Partner und Signalwechsel | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-114 · „Rhythm Dribbling“ | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-115 · 1-on-1 Pivot Pressure | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-116 · 3 on 3 Dictated – Pass & Cut / Ball Screen | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-117 · Shell Drill 4 on 4 | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-118 · Screening Reaction Bursts | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-120 · 3 on 2, 2 on 1 | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-124 · Side Ball Screen Drill | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-125 · Slip Pass Drill | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-126 · Guards: Pick & Roll Situational Shooting | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-127 · 4 on 4 Rebounding | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-128 · 3 on 3 Dictated – Screen the Screener | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-129 · 3 on 3 Dictated – Elbow Pass | kurz | Lernziel, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik, Quellenlink | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-130 · 2 on 1 Bunch Spacing – No Dribble | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-131 · Chaos Rebounding | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-132 · Partner Closeout Shooting | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-133 · 4 on 4 Continuous with Constraints | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-134 · 3 on 3 from Help the Helper | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-135 · Two Halves Scrimmage | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-136 · On Ball Screen – Dribbler Options | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-137 · Rebounding and Defensive Transition | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. Laut Evidenz Querschnittsregel statt isolierter Drill; Kartentyp klären. |
| EX-138 · 3 on 3 Dictated – Down Screen | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-139 · 3 on 3 Dictated – Pick & Roll | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-140 · 3 on 3 No Dribble Game | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-141 · 3 on 3 Continuous | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-142 · 3-Person Pass, Cut and Replace | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-145 · Advantage Numbers Game | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-146 · Decision 1 on 1 | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-147 · 3 on 2 Advantage | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-148 · 3 on 3 No Dribble | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-149 · 11-Person Transition Drill | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-150 · 5 on 1 Build Up | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-151 · Square Rebounding | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-152 · Low-Post Decision 3v3 | kurz | Lernziel, Ablauf, Coachingpunkte, Typische Fehler, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Nur Evidenztext statt eigenem Ablauffeld; teils kurze Handlungsbeschreibung, teils nur Metadaten. |
| EX-153 · 5 on 5 Controlled | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | 4 Minuten und Ganzfeld im Ablauf vorhanden, strukturierte Felder leer. |
| EX-154 · 5 on 5 Situational Play | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-155 · 3 on 3 – Defense Wins | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-156 · 3 on 2 Trailer Game | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-157 · Using a Screen 2 on 1 Game / Tactical Load 2v2 | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | Keine zusätzliche Einzelauffälligkeit in dieser Prüfung; keine fachliche Freigabe. |
| EX-158 · Keep Away Game | kurz | Lernziel, Coachingpunkte, Typische Fehler, Altersfenster, Kompetenz, Erfahrung, Spielerzahl, Raum, Dauer/Umfang, Material, Regression, Progression, Methodik | 5 Personen, 3 gegen 1 plus Wechselrolle im Ablauf vorhanden, Spielerzahlfeld leer. |

## Fehlende numerische Skalen je Karte

| ID | Fehlende Skalenwerte |
|---|---|
| EX-002 | entscheidung, gegnerdruck, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-003 | entscheidung, gegnerdruck, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-004 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-005 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-006 | entscheidung, gegnerdruck, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-008 | entscheidung, gegnerdruck, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-010 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-011 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-012 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-013 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-014 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-015 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-016 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-017 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-018 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-019 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-020 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-021 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-022 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-023 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-024 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-025 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-026 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-027 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-028 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-029 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-030 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-031 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-032 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-033 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-034 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-035 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-036 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-037 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-038 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-039 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-040 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-041 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-042 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-043 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-044 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-045 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-046 | technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-048 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-049 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-050 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-051 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-052 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-053 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-054 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-055 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-056 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-057 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-058 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-059 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-060 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-061 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-062 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-063 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-064 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-065 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-066 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-067 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-068 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-069 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-070 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-071 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-072 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-073 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-074 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-075 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-076 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-077 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-078 | Keine |
| EX-079 | Keine |
| EX-080 | Keine |
| EX-081 | Keine |
| EX-082 | Keine |
| EX-083 | Keine |
| EX-084 | Keine |
| EX-085 | Keine |
| EX-087 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-088 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-089 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-090 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-091 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-092 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-093 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-094 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-095 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-096 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-097 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-098 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-099 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-100 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-101 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-102 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-103 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-105 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-106 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-107 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-108 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-109 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-110 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-111 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-112 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-113 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-114 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-115 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-116 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-117 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-118 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-120 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-124 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-125 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-126 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-127 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-128 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-129 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-130 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-131 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-132 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-133 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-134 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-135 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-136 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-137 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-138 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-139 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-140 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-141 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-142 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-145 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-146 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-147 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-148 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-149 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-150 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-151 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-152 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-153 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-154 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-155 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-156 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-157 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |
| EX-158 | entscheidung, gegnerdruck, technik, spielnaehe, zeitdruck, raumdruck, wahrnehmung, kooperation |

## Aliasprüfung

Aliase werden nicht als zusätzliche Übungen gezählt; Bild und Bibliotheksinhalt folgen der kanonischen Karte. Die Einzelprüfung oben erfasst alle Zielkarten.

| Alias | Kanonische Karte | Ziel/Bild vorhanden |
|---|---|---|
| EX-001 | EX-017 · Stationary Wall Passing – Chest | Ja |
| EX-007 | EX-037 · Give & Go | Ja |
| EX-009 | EX-147 · 3 on 2 Advantage | Ja |
| EX-047 | EX-147 · 3 on 2 Advantage | Ja |
| EX-104 | EX-077 · 2 on 2 Numbers Game | Ja |
| EX-119 | EX-077 · 2 on 2 Numbers Game | Ja |
| EX-121 | EX-149 · 11-Person Transition Drill | Ja |
| EX-122 | EX-134 · 3 on 3 from Help the Helper | Ja |
| EX-123 | EX-139 · 3 on 3 Dictated – Pick & Roll | Ja |
| EX-143 | EX-146 · Decision 1 on 1 | Ja |
| EX-144 | EX-147 · 3 on 2 Advantage | Ja |
