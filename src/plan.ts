import modellRoh from "../data/trainingsmodell.json";
import { alleDrills } from "./data";
import type { Drill } from "./types";

export interface Baustein {
  code: string;
  name: string;
  kurz: string;
  funktion: string;
  inhalte: string;
  hebel: string | null;
  intensitaet: number;
  gewicht: number;
}

export interface Pfad {
  id: string;
  name?: string;
  herkunft?: string;
  alter_roh: string;
  alter_von: number | null;
  alter_bis: number | null;
  ziel: string;
  folge: string[];
  individualisierung: string | null;
}

export interface Modell {
  katalogversion: string;
  herkunft: string;
  bausteine: Baustein[];
  pfade: Pfad[];
  referenzdauern: number[];
  altersfaktor: Record<string, Record<string, number>>;
  regeln: {
    bloecke_min: number;
    bloecke_max: number;
    karten_je_schritt: number[];
    organisationsanteil: number;
    block_min_minuten: number;
    alterstoleranz: string[];
    belastung: string;
    eigenstaendigkeit: string;
  };
  quellen: { was: string; wo: string; url?: string; art: string }[];
}

export const modell = modellRoh as unknown as Modell;

export const baustein = (code: string): Baustein =>
  modell.bausteine.find((b) => b.code === code)!;

export interface Block {
  code: string;
  minuten: number;
  kandidaten: Drill[];
  gewaehlt: Drill | null;
}

export interface Rahmen {
  pfadId: string;
  dauer: number;
  altersstufe: number;
}

/* ---------- Zeitverteilung ---------- */

const altersgruppe = (u: number): string => (u <= 10 ? "jung" : u <= 12 ? "mittel" : "alt");

const auf5 = (n: number): number => Math.max(5, Math.round(n / 5) * 5);

/** Die Minuten folgen aus Gewicht × Altersfaktor, nicht aus einer Zeittabelle.
 *  Der Katalog schreibt ausdrücklich keine feste Verteilung vor (56.3). */
export function minutenVerteilen(folge: string[], dauer: number, altersstufe: number): number[] {
  const faktoren = modell.altersfaktor[altersgruppe(altersstufe)] ?? {};
  const netto = dauer * (1 - modell.regeln.organisationsanteil);
  const gewichte = folge.map((c) => baustein(c).gewicht * (faktoren[c] ?? 1));
  const summe = gewichte.reduce((a, b) => a + b, 0);
  const roh = gewichte.map((g) => auf5((netto * g) / summe));

  // Rundungsrest auf den größten Block schieben, damit die Summe stimmt.
  const ziel = auf5(netto);
  let rest = ziel - roh.reduce((a, b) => a + b, 0);
  while (rest !== 0) {
    const i = rest > 0
      ? roh.indexOf(Math.max(...roh))
      : roh.indexOf(Math.max(...roh.filter((m) => m > modell.regeln.block_min_minuten)));
    if (i < 0) break;
    roh[i] = roh[i]! + (rest > 0 ? 5 : -5);
    rest += rest > 0 ? -5 : 5;
  }
  return roh;
}

/* ---------- Kandidaten je Baustein ---------- */

const zahl = (d: Drill, feld: string): number | null => d.skalen[feld]?.wert ?? null;
const codes = (d: Drill) => d.kompetenz.alle;
const hat = (d: Drill, praefix: string) => codes(d).some((c) => c.startsWith(praefix));
const hatCode = (d: Drill, ...cs: string[]) => codes(d).some((c) => cs.includes(c));

const text = (d: Drill): string =>
  `${d.titel} ${d.originaltitel ?? ""} ${d.lernziel ?? ""} ${d.methodik ?? ""}`.toLowerCase();

/** Spielform im Titel, etwa "3 on 2", "2v2", "1 gegen 1". */
function spielform(d: Drill): number | null {
  const m = /(\d)\s*(?:on|vs?|gegen)\s*(\d)/i.exec(`${d.titel} ${d.originaltitel ?? ""}`);
  return m ? Math.max(Number(m[1]), Number(m[2])) : null;
}

type Wertung = (d: Drill) => number;

/* Die Zuordnung Übung → Baustein ist eine redaktionelle Ableitung aus den
   vorhandenen Feldern. Der Katalog vergibt keine Bausteinmarke je Karte. */
const WERTUNG: Record<string, Wertung> = {
  A: (d) => {
    let p = 0;
    if (hat(d, "K")) p += 3;
    if (hatCode(d, "K3", "K7", "K4")) p += 2;
    const gd = zahl(d, "gegnerdruck");
    if (gd === 0) p += 2;
    if (gd !== null && gd >= 2) p -= 2;
    if (hatCode(d, "S4", "S5", "S6", "S7")) p -= 3;
    if (/rhythm|relay|tag|pac man|warm|signal|reaktion|bewegung|agilit|footwork|slide/.test(text(d))) p += 2;
    if (/shooting|wurf|form|lay-?up|free throw|passing – |wall/.test(text(d))) p -= 4;
    if (spielform(d)) p -= 2;
    return p;
  },
  B: (d) => {
    let p = 0;
    if (hat(d, "T")) p += 3;
    if (d.kompetenz.haupt?.startsWith("T")) p += 2;
    const gd = zahl(d, "gegnerdruck");
    if (gd !== null && gd <= 1) p += 2;
    if (spielform(d)) p -= 3;
    if (hat(d, "S") && !hat(d, "T")) p -= 2;
    if (/stationary|form|basics|grundlage|technik/.test(text(d))) p += 2;
    return p;
  },
  C: (d) => {
    let p = 0;
    const ent = zahl(d, "entscheidung");
    if (ent !== null && ent >= 2) p += 3;
    if (hatCode(d, "K2", "K3")) p += 2;
    if (hatCode(d, "S1", "S2", "S3")) p += 2;
    if (spielform(d) === 1) p += 2;
    if (/decision|entscheid|wahrnehm|read|erkennen|closeout|mirror/.test(text(d))) p += 2;
    if (hatCode(d, "S6", "S7")) p -= 2;
    return p;
  },
  D: (d) => {
    let p = 0;
    const sf = spielform(d);
    if (sf !== null && sf >= 2 && sf <= 4) p += 3;
    if (hatCode(d, "S3", "S4", "S5")) p += 2;
    const gd = zahl(d, "gegnerdruck");
    if (gd !== null && gd >= 1) p += 2;
    if (!hat(d, "S") && sf === null) p -= 3;
    if (/small|kleingruppe|advantage|überzahl|2 on|3 on|2v|3v/.test(text(d))) p += 2;
    return p;
  },
  E: (d) => {
    let p = 0;
    if (hatCode(d, "S4", "S5", "S6", "S7")) p += 3;
    const sf = spielform(d);
    if (sf !== null && sf >= 3) p += 2;
    const sn = zahl(d, "spielnaehe");
    if (sn !== null && sn >= 4) p += 2;
    if (/transition|shell|5 on 5|4 on 4|3 on 3|continuous|full court/.test(text(d))) p += 3;
    if (hat(d, "K") && !hat(d, "S")) p -= 3;
    return p;
  },
  F: (d) => {
    let p = 0;
    if (/game|spiel|challenge|relay|numbers|keep away|best/.test(text(d))) p += 3;
    const sn = zahl(d, "spielnaehe");
    if (sn !== null && sn >= 4) p += 2;
    if (spielform(d)) p += 2;
    if (/wettbewerb|scoring|punkte|zeit/.test(text(d))) p += 1;
    if (/stationary|form shooting/.test(text(d))) p -= 3;
    return p;
  },
  G: (d) => {
    let p = 0;
    if (hatCode(d, "T3")) p += 3;
    const gd = zahl(d, "gegnerdruck");
    if (gd === 0) p += 2;
    if (/form shooting|free throw|freiwurf|wall passing|stationary|shoot and follow/.test(text(d))) p += 3;
    if (spielform(d)) p -= 3;
    if (gd !== null && gd >= 2) p -= 3;
    if (hatCode(d, "S6", "S7")) p -= 2;
    return p;
  },
};

const TIEFE_RANG: Record<string, number> = {
  vollstaendig: 3,
  standard: 2,
  redaktionsscore: 2,
  kurz: 1,
  nur_belege: 1,
  nur_titel: 0,
};

/** Liegt die Karte außerhalb des gewählten Altersfensters? Für die Kennzeichnung. */
export const ausserhalbAlter = (d: Drill, u: number): boolean =>
  d.alter.von !== null && d.alter.bis !== null && !(d.alter.von <= u && u <= d.alter.bis);

const passtAlter = (d: Drill, u: number): boolean =>
  d.alter.von === null || d.alter.bis === null || (d.alter.von <= u && u <= d.alter.bis);

/** Kandidaten für einen Baustein, absteigend nach Eignung. */
export function kandidaten(code: string, altersstufe: number, ausgeschlossen: Set<string> = new Set()): Drill[] {
  const werten = WERTUNG[code]!;
  // Der Katalog speichert die Altersstufe als „typisch", nicht als Freigabe.
  // Aktivierung und Ausklang dürfen deshalb aus jüngeren Fenstern kommen.
  const tolerant = modell.regeln.alterstoleranz.includes(code);
  return alleDrills
    .filter((d) => !ausgeschlossen.has(d.id))
    .map((d) => {
      let p = werten(d);
      if (!passtAlter(d, altersstufe)) {
        const juenger = d.alter.bis !== null && d.alter.bis < altersstufe;
        // Aus einem jüngeren Fenster: erlaubt, aber nachrangig und markiert.
        // Aus einem älteren Fenster: nicht anbieten.
        p -= juenger ? (tolerant ? 1 : 3) : 8;
      }
      if (d.alter.von === null) p -= 2;
      p += (TIEFE_RANG[d.dokumentationstiefe] ?? 0) * 0.4;
      return { d, p };
    })
    .filter((x) => x.p >= 3)
    .sort((a, b) => b.p - a.p || a.d.id.localeCompare(b.d.id))
    .map((x) => x.d);
}

/* ---------- Plan ---------- */

export function bloecke(rahmen: Rahmen): Block[] {
  const pfad = modell.pfade.find((p) => p.id === rahmen.pfadId)!;
  const minuten = minutenVerteilen(pfad.folge, rahmen.dauer, rahmen.altersstufe);
  const belegt = new Set<string>();
  return pfad.folge.map((code, i) => {
    const k = kandidaten(code, rahmen.altersstufe, belegt);
    return { code, minuten: minuten[i]!, kandidaten: k, gewaehlt: null };
  });
}

/* Mulberry32 — kleiner Zufallsgenerator mit Startwert, damit dieselbe
   Auswürfelung nachvollziehbar bleibt. */
function zufall(saat: number): () => number {
  let a = saat >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Automatische Auswahl. Nach einem sehr intensiven Block wird eine Karte mit
 *  geringerem Gegnerdruck bevorzugt — die Belastungsregel aus 56.3. */
export function auswuerfeln(rahmen: Rahmen, saat: number): Block[] {
  const wuerfel = zufall(saat);
  const liste = bloecke(rahmen);
  const belegt = new Set<string>();
  let vorherIntensiv = false;

  for (const b of liste) {
    let pool = b.kandidaten.filter((d) => !belegt.has(d.id));
    if (vorherIntensiv) {
      const ruhiger = pool.filter((d) => (d.skalen["gegnerdruck"]?.wert ?? 0) <= 1);
      if (ruhiger.length >= 3) pool = ruhiger;
    }
    const fenster = pool.slice(0, Math.max(4, Math.min(12, pool.length)));
    b.kandidaten = pool;
    b.gewaehlt = fenster.length ? fenster[Math.floor(wuerfel() * fenster.length)]! : null;
    if (b.gewaehlt) belegt.add(b.gewaehlt.id);
    vorherIntensiv = baustein(b.code).intensitaet >= 4;
  }
  return liste;
}

/** Katalog 56.5: zwei Einheiten sind erst unterschiedlich, wenn sich
 *  mindestens zwei Dimensionen ändern. */
export function dimensionen(bl: Block[]): string[] {
  const g = bl.map((b) => b.gewaehlt).filter(Boolean) as Drill[];
  const wert = (f: (d: Drill) => unknown) => JSON.stringify(g.map(f));
  return [
    wert((d) => d.id),
    wert((d) => d.kompetenz.haupt),
    wert((d) => d.spielerzahl.roh),
    wert((d) => d.raum),
    wert((d) => d.skalen["gegnerdruck"]?.wert ?? null),
    wert((d) => d.dauer_min.roh),
  ];
}

export function genugAnders(a: Block[], b: Block[]): boolean {
  const [x, y] = [dimensionen(a), dimensionen(b)];
  return x.filter((v, i) => v !== y[i]).length >= 2;
}

/** Würfelt so lange neu, bis sich die Einheit wirklich unterscheidet. */
export function neuWuerfeln(rahmen: Rahmen, vorher: Block[] | null, start = Date.now()): Block[] {
  let saat = start;
  let versuch = auswuerfeln(rahmen, saat);
  for (let i = 0; vorher && i < 24 && !genugAnders(versuch, vorher); i++) {
    saat = (saat * 1103515245 + 12345) >>> 0;
    versuch = auswuerfeln(rahmen, saat);
  }
  return versuch;
}

/** Prüft die Belastungsfolge eines fertigen Plans. */
export function belastungsbefund(bl: Block[]): string | null {
  const stapel: string[] = [];
  for (let i = 1; i < bl.length; i++) {
    const a = baustein(bl[i - 1]!.code);
    const b = baustein(bl[i]!.code);
    const gdA = bl[i - 1]!.gewaehlt?.skalen["gegnerdruck"]?.wert ?? null;
    const gdB = bl[i]!.gewaehlt?.skalen["gegnerdruck"]?.wert ?? null;
    if (a.intensitaet >= 4 && b.intensitaet >= 4 && (gdA ?? 0) >= 2 && (gdB ?? 0) >= 2) {
      stapel.push(`${a.code}→${b.code}`);
    }
  }
  return stapel.length ? `Zwei intensive Blöcke hintereinander: ${stapel.join(", ")}` : null;
}
