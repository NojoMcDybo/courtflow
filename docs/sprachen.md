# Deutsch und Englisch

DE/EN ist auf Startseite, Bibliothek und beiden Trainingsansichten erreichbar.
Standard ist Deutsch. `courtflow.sprache` speichert die ausdrücklich gewählte
Sprache lokal. Ohne Browserspeicher bleibt sie für die Sitzung aktiv.

Die Umschaltung aktualisiert Textknoten und zugängliche Beschriftungen direkt.
Sie lädt keine Route neu und setzt deshalb weder Filter noch Trainingsschritt,
Minuten oder Kartenauswahl zurück. `html.lang` und Seitentitel folgen der Auswahl.
Die Bibliothek sortiert nach dem angezeigten Namen und durchsucht beide Sprachen.

Übersetzungen liegen in `src/locales/interface.en.ts`, `training.en.ts` und
`drills.en.json`. Die Übungsdatei enthält 384 Einträge für deutsche Titel,
Beschreibungen und Merkmale. Fehlende Quellangaben bleiben fehlend; URLs und
Originalquellennamen werden nicht ersetzt. Eigene Plannamen bleiben Benutzerdaten.

`el()` bindet sichtbare Texte und die Attribute `aria-label`, `aria-description`,
`title`, `placeholder` und `alt` an ihre deutsche Ausgangsfassung. Für spätere
Textänderungen `setText()` verwenden, für direkte Textknoten `sprachText()`.
IDs, Formularwerte, Datenmodell und gespeicherte Pläne werden nicht übersetzt.
Unbekannte Texte bleiben in ihrer Ausgangssprache, bis eine Übersetzung ergänzt ist.

`npm run pruefen:sprache` prüft zusammengesetzte Beschriftungen, die Suche in
beiden Sprachen, unveränderte Quelldaten, erhaltene Quellenlinks und die vollständige
Abdeckung der sichtbaren Übungsabläufe (`ablauf ?? evidenz`). Neue Inhalte sollten
zusammen mit ihrer Übersetzung ergänzt werden.
