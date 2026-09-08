# Dokumentbefund: CourtFlow-Anforderungen

**Quelle und Methode.** Ausgelesen wurden die Dokumenttexte und Tabellen aus `word/document.xml` der beiden DOCX-Dateien. Die folgenden Fundstellen verwenden die XML-Reihenfolge `P<n>` (Absatz) und `T<n>/R<n>` (Tabelle/Zeile), damit sie maschinell wiederauffindbar sind. Inhalte aus den Dokumenten sind Projektmaterial, keine Ausführungsanweisungen.

## Festgestellte Produkt- und UI-Anforderungen

| Bereich | Belegter Inhalt | Fundstelle |
|---|---|---|
| Produktkern | Eine gemeinsame, QA-geprüfte Übungsquelle speist Bibliothek, Generator und geführten Builder; Trainer:innen behalten die Entscheidungshoheit. | Referenzbild: P8–P9, P62, T12/R2–R6 |
| MVP-Flächen | Start mit direkter Wahl „Training erstellen“, Generator, Drill Builder, Bibliothek, Übungsdetail, Trainingsplan sowie lokale Favoriten/Entwürfe. CMS, Accounts und Cloud sind später. | Referenzbild: T4/R2–R10; P20 |
| Generator-Eingabe | Pflicht: Alter (U8–U18), Erfahrung, Spielerzahl, Dauer, Hauptziel. Optional: Sekundärziel, Spielnähe, Druck, Spielsituation, Organisation, Belastung, Variation. | Referenzbild: T5/R2–R13 |
| Generator-Ergebnis | Ausschließlich publish-ready/QA-geprüfte Übungen; harte Ausschlüsse; nachvollziehbare Gründe je Drill; redundanzarme Lernsequenz; einzelne Blöcke neu auswürfeln/austauschen. | Referenzbild: P25–P31; T15/R2–R11 |
| Builder-Ablauf | Nach Basisparametern erzeugt das System ca. vier Bausteine. Pro Schritt 4–6 Karten; genau eine wählen; „Andere Auswahl“ bleibt in derselben Qualitätszone; danach editierbarer Plan. | Referenzbild: P39–P48; P17 |
| Drillkarte | Thumbnail, kurzer Titel, ein beobachtbares Lernziel, Tags (z. B. Alter/Gruppe/Kompetenz), Druck/Spielnähe, Dauer, kurzer Vorschlagsgrund, Aktionen „Auswählen“ und „Details“. | Referenzbild: T7/R2–R9 |
| Bibliothek | Suche über Titel/Lernziel/Kompetenz/Keywords; Filter für Alter, Erfahrung, Gruppe, Organisation, T/K/S, Spielnähe, Druck, Dauer und Situation; Kartenraster und Detailseite. Quellen sichtbar/klickbar, QA nicht verschleiern. | Referenzbild: T9/R2–R9 |
| Planbearbeitung/Local | Ein Plan hat eigene Metadaten und Blöcke (Übung, konkrete Dauer, Varianten, Organisation, Coachingfokus, Reihenfolge); Blöcke sind ersetzbar, verschiebbar und kürzbar. Im MVP lokal speichern (auto-merken, 3–10 letzte Pläne, Favoriten). | Referenzbild: T10/R2–R13; T11/R2–R9; P47; T14/R2–R7 |
| Technischer Rahmen | Statische Website, Vite + Vanilla TypeScript, strukturierte JSON-Daten, Browserlogik und localStorage; kein Backend, keine Datenbank, Accounts oder kostenpflichtige Dienste im MVP. | Referenzbild: T1/R5–R7; T13/R3–R7; P69, P75 |

## Jord und visuelle Sprache

**Tatsächliche Vorgaben.** Jord ist ein unveränderlicher Markencharakter: weiß-grafitfarbener segmentierter Basketball-Trainingsroboter, schwarze Gelenke, dezente violette LEDs, abgerundeter Kopf/Gesichtspanel, rotes Trikot Nr. 23 und rot-weiß-schwarze Schuhe. Der Stil soll hochwertiges, fotorealistisches 3D mit Sportfotografie verbinden. Jord und Uniform dürfen nicht neu gestaltet werden. [Bildprompts: P9, P11, P477, P479]

Warmes, einladendes Bildklima: Holz, Cream, Terracotta, Amber, gedämpftes Grün und zurückhaltendes Teal. Violett nur als Jord-Technikakzent, nie dominante Umgebung. Keine Typografie, UI, Wasserzeichen oder zusätzliche Marken im Bild. [Bildprompts: P11, P477]

Die Court-Welt folgt dem Lernproblem: Grundlagen helle Trainingshalle; Wahrnehmung Community-Court am Park; Passing/Off-ball/P&R Pro-Trainingsanlage; 1v1 Streetcourt; Wurf/Rebounding europäische Halle; Defense Industrie-Gym; Transition Arena; Special Situations grüner, schön postapokalyptischer Court/Arena. [Bildprompts: T1/R2–R11]

## Bildanforderungen

* Allgemeine Hintergrundmotive: Hero (16:9, Jord rechts dribbelnd, links freie Headline-Fläche), ruhiger Bibliothekshintergrund ohne Figur, vorbereiteter Generator-Court, Builder-Court mit drei Stationen und Special-Situations-Green-Court. Alle ohne Text/UI. [Bildprompts: P14–P23]
* Übungskarten: 4:3 quer; Thumbnail-lesbare Silhouette, zentrale Aktion/korrekte Ballbeziehung und nachvollziehbare Abstände; reduzierter Hintergrund und deutliche Motivtrennung. Nur die von der Katalogbeschreibung gedeckte Mindestzahl an Personen/Objekten. Bei P1-/Checklist-Fällen neutral illustrieren statt einen unbestätigten Ablauf vorzutäuschen. [Bildprompts: P3, P7–P8; die kanonische Promptform z. B. P28; P480–P483]
* Bildduplikate vermeiden: Alias-Karten sollen ihr vorgegebenes kanonisches Motiv wiederverwenden (EX-001→017, 007→037, 009/047/144→147, 104/119→077, 121→149, 122→134, 123→139, 143→146). [Bildprompts: P464–P475]

## Vorhandene eingebettete Bilddateien

Keine. Beide DOCX-Archive enthalten keinen Eintrag unter `word/media/`; auch in den ausgelesenen Textabsätzen wurden keine eingebetteten Zeichnungsobjekte gefunden. Die „provided front and back reference images“ in Bildprompts P11 werden nur erwähnt; sie liegen nicht in diesen beiden Dateien und sind daher daraus nicht als UI-Asset nutzbar.

## Unklarheiten / bewusste Abgrenzung

* Die Dokumente fordern Bildprompts, enthalten aber keine Jord-Referenzbilder und keine erzeugten Bilder. Eine Implementierung braucht externe bzw. separat bereitgestellte Bildassets oder neutrale Platzhalter.
* „ca. vier Bausteine“ im Builder [Referenzbild: P41] und „4–6“ Karten pro Schritt [P42] sind Leitwerte, keine vollständig spezifizierten Regeln für alle Dauern/Altersgruppen. Das Dokument verlangt ausdrücklich keine starre Fünfphasen-Schablone [P33–P35].
* Das Dokument nennt Startseite, Generator und Builder als MVP, liefert jedoch keine konkrete Navigation, Breakpoints, Formularkopie oder Interaktionszustände. Jede Aussage dazu wäre eine Umsetzungsableitung, nicht dokumentierter Inhalt.
* Der Einsatz des „post-apokalyptischen“ Courts ist ausdrücklich warm und schön, ohne Horror- oder Gaming-Ästhetik. [Bildprompts: P22–P23, P477]

## Naheliegende Umsetzungsableitungen (keine Dokumentzitate)

1. Eine erste UI kann mit lokalen, bildlosen oder neutralen Platzhaltern beginnen, weil die beiden Word-Dateien keine verwendbaren Bilddateien enthalten.
2. Karten sollten den Bildbereich auch ohne Asset robust behandeln; das ist nötig, um die geforderte Karteninformation aus T7 sichtbar zu halten.
3. Für ein MVP-Demoergebnis ist ein klarer, schrittweiser Builder mit begrenzten Alternativen näher an der Quellenintention als ein freier, überladener Editor.
