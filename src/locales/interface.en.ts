export const interfaceEnglish: Record<string, string> = {
  "Bild vergrößern ↗": "Enlarge image ↗",
  "CourtFlow — Übungsbibliothek Jugendbasketball": "CourtFlow — Youth basketball drill library",
  "Sprache": "Language", "Deutsch": "German", "Englisch": "English",
  "Hell": "Light", "Dunkel": "Dark", "Zur Startseite": "Home",
  "Bereiche": "Sections", "Drill-Liste": "Drill library", "Trainingsaufbau": "Training builder",
  "Automatischer Plan": "Automatic plan", "mit Quelle": "with sources", "Block für Block": "Block by block",
  "du wählst die Übungen": "you choose the drills", "Rahmen rein, Einheit raus": "Set your preferences, get a session",
  "jedes Mal neu": "a fresh selection every time", "noch nicht gebaut": "coming soon",
  "01 / Bibliothek": "01 / Library", "Bibliothek": "Library", "Training bauen ↗": "Build a session ↗",
  "Übung suchen …": "Search drills …", "Übungen durchsuchen": "Search drills", "Alles anzeigen": "Show all",
  "Weitere Filter": "More filters", "Familie": "Category", "Alle Bereiche": "All categories",
  "Belegtiefe": "Documentation level", "Alle Belegtiefen": "All documentation levels", "Mit Quelle": "With sources", "Testbilder": "Test images",
  "Übungen entdecken": "Discover drills", "Thema und Alter wählen. Passende Übungen öffnen.": "Choose a topic and age group. Explore matching drills.",
  "Abdeckung": "Coverage", "Sortierung": "Sort order", "Name A–Z": "Name A–Z", "Alter aufsteigend": "Age: youngest first",
  "Alter offen": "Age unspecified", "Übung ohne Kurztitel": "Drill without a short title", "Ansehen": "View",
  "Ablauf offen": "Instructions pending",
  "Alle Übungen": "All drills", "aktiv": "active", "Thema": "Topic",
  "Illustration der Fertigkeit, nicht des genauen Übungsablaufs.": "Illustration of the skill, not the exact drill setup.",
  "Übungsvideo": "Drill video", "Video laden und abspielen ▶": "Load and play video ▶",
  "Auf YouTube öffnen ↗": "Open on YouTube ↗",
  "Falls der Player das Video nicht abspielt, den YouTube-Link oder die Originalquelle prüfen.": "If the player cannot play the video, check the YouTube link or the original source.",
  "Hier gibt es noch keine passende Übung.": "No matching drills yet.", "Andere Zelle wählen oder Filter zurücksetzen.": "Choose another cell or reset the filters.",
  "Zahlen: Übungen je Altersstufe · – keine Übung": "Numbers: drills per age group · – no drills",
  "Kompetenzkatalog v3.8 · Quellen und Belegangaben in den Übungsdetails.": "Skills catalogue v3.8 · Sources and documentation in the drill details.",
  "Übungsdetails": "Drill details", "Schließen": "Close", "Lernziel": "Learning goal", "Ablauf": "Instructions",
  "Kein gesicherter Übungsablauf dokumentiert.": "No verified drill instructions documented.",
  "Quellenhinweis": "Source note",
  "Coachingpunkte": "Coaching points", "Typische Fehler": "Common mistakes", "Regression": "Make it easier", "Progression": "Make it harder",
  "Alter": "Age", "Kompetenz": "Skill", "Dauer": "Duration", "Spieler": "Players", "Raum": "Space",
  "Material": "Equipment", "Methodik": "Method", "Erfahrung": "Experience", "Merkmale": "Characteristics", "Quelle": "Source",
  "Entscheidung": "Decision-making", "Gegnerdruck": "Defensive pressure", "Technik": "Technique", "Spielnähe": "Game realism",
  "Zeitdruck": "Time pressure", "Raumdruck": "Space pressure", "Wahrnehmung": "Perception", "Kooperation": "Cooperation",
  "keine im Katalog hinterlegt": "Not provided in the catalogue", "vollständig erfasst": "fully documented", "Standarddatensatz": "standard record",
  "mit Redaktionsscore": "with editorial rating", "Kurzerfassung": "brief record", "nur Prüfnotiz": "review note only", "nur Titel": "title only",
  "Koordination": "Coordination", "Spielfähigkeit": "Game skills", "Spielfähigkeit / Taktik": "Game skills / tactics", "Athletik": "Athleticism", "Spielkompetenz": "Game skills",
  "Passen/Fangen": "Passing/catching", "Werfen/Abschluss": "Shooting/finishing", "Fußarbeit": "Footwork",
  "Individualverteidigung": "Individual defense", "Gleichgewicht": "Balance", "Orientierung": "Spatial awareness",
  "Reaktion": "Reaction", "Rhythmus": "Rhythm", "Differenzierung": "Movement precision", "Kopplung": "Movement coordination",
  "Agilität": "Agility", "1v1 Angriff": "1v1 offense", "1v1 Verteidigung": "1v1 defense", "Off-Ball/Freilaufen": "Off-ball movement",
  "Zusammenspiel": "Team play", "Übungen": "drills", "Übung": "drill",
  "Paare": "Pairs", "Paare / 3er": "Pairs / groups of 3", "Paare / Dreier": "Pairs / groups of 3",
  "2 Teams": "2 teams", "4+ Teams": "4+ teams", "4er-Gruppen": "Groups of 4", "4+ pro Diamond": "4+ per diamond",
  "2-3 Spiele": "2–3 games", "3-5 min + Variationen": "3–5 min + variations",
  "3/3 sobald live gespielt wird": "3/3 once play is live",
  "U10–U12; U10 vereinfacht": "U10–U12; simplified for U10",
  "U10–U12; U8 als Vorstufe denkbar": "U10–U12; a preparatory version for U8 is conceivable",
  "U10–U12; U8 nur redaktionell vereinfacht": "U10–U12; U8 simplification is editorial only",
  "U8-U12 / anpassbar": "U8–U12 / adaptable",
};

export function interfacePattern(text: string, translate: (text: string) => string): string | null {
  let m: RegExpMatchArray | null;
  if ((m = text.match(/^(\d+) Übung(?:en)?$/))) return `${m[1]} ${m[1] === "1" ? "drill" : "drills"}`;
  if ((m = text.match(/^Saison (.+) · Kinder- und Jugendbasketball · (\d+) Übungen · (\d+) mit Quelle · (\d+) offen$/)))
    return `Season ${m[1]} · Youth basketball · ${m[2]} drills · ${m[3]} with sources · ${m[4]} pending`;
  if ((m = text.match(/^Grundlage: Kompetenzkatalog v(.+) · Beschreibungen sind Eigenformulierungen mit Link auf das Original$/)))
    return `Based on skills catalogue v${m[1]} · Descriptions are paraphrased, with links to the originals`;
  if ((m = text.match(/^(\d+) ohne Altersangabe · unter „Alles anzeigen“\.$/))) return `${m[1]} with no age specified · under “Show all”.`;
  if ((m = text.match(/^Übungsabdeckung: (.+)$/))) return `Drill coverage: ${translate(m[1]!)}`;
  if ((m = text.match(/^(.+), U(\d+): (\d+) Übung(?:en)?$/))) return `${translate(m[1]!)}, U${m[2]}: ${m[3]} ${m[3] === "1" ? "drill" : "drills"}`;
  if ((m = text.match(/^(.+) auswählen$/))) return `Select ${translate(m[1]!)}`;
  if ((m = text.match(/^(.+) entfernen$/))) return `Remove ${translate(m[1]!)}`;
  if ((m = text.match(/^Katalogerfassung: ([^·]+?)( — leere Felder sind bisher nicht dokumentiert)?$/)))
    return `Catalog record: ${translate(m[1]!)}${m[2] ? " — blank fields have not yet been documented" : ""}`;
  if ((m = text.match(/^Bewertung (.+)$/))) return `Rating ${translate(m[1]!)}`;
  if ((m = text.match(/^Dublette zu (.+)$/))) return `Duplicate of ${m[1]}`;
  if ((m = text.match(/^Übungsvideo: (.+)$/))) return `Drill video: ${m[1]}`;
  if ((m = text.match(/^Videozuordnung: (.+) ↗$/))) return `Video source: ${m[1]} ↗`;
  if ((m = text.match(/^([TKS]\d+) (.+)$/))) return `${m[1]} ${translate(m[2]!)}`;
  return null;
}
