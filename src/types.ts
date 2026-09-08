export type Skala = { wert: number | null; skala: number | null; roh: string } | null;

export type Spanne = { min: number | null; max: number | null; roh: string | null };

export type Dokumentationstiefe =
  | "vollstaendig"
  | "standard"
  | "redaktionsscore"
  | "kurz"
  | "nur_belege"
  | "nur_titel";

export interface Drill {
  id: string;
  kanonische_id: string;
  ist_alias: boolean;
  titel: string;
  evidenz: string | null;
  originaltitel: string | null;
  lernziel: string | null;
  ablauf: string | null;
  coachingpunkte: string | null;
  typische_fehler: string | null;
  kompetenz: { haupt: string | null; alle: string[]; roh: string | null };
  alter: { von: number | null; bis: number | null; roh: string | null };
  empfohlene_stufe: string | null;
  erfahrung: string | null;
  spielerzahl: Spanne;
  raum: string | null;
  dauer_min: Spanne;
  material: string | null;
  regression: string | null;
  progression: string | null;
  methodik: string | null;
  skalen: Record<string, Skala>;
  quelle: { name: string | null; url: string | null; video_status: string | null };
  qa: {
    stufe: string | null;
    note: string | null;
    pruefstatus: string | null;
    scoreprofil: string | null;
    bewertung: { roh: string; note: string | null } | null;
    redaktionsstatus: string | null;
    publish_ready: boolean | null;
    score: Record<string, number | string> | null;
  };
  dokumentationstiefe: Dokumentationstiefe;
  belege: Record<string, string | number>[];
  redaktionsnotiz: string | null;
  herkunft: { generation?: string; abschnitt?: string | null; kontext?: string | null };
}

export interface Kompetenz {
  code: string;
  familie: string;
  name: string | null;
  quellenorganisationen: string[];
  altersprogression: Record<string, string | null> | null;
  karten_im_katalog?: number | null;
  bewertung_katalog?: string | null;
}

export interface Taxonomie {
  quelle: string;
  katalogversion: string;
  altersstufen: { code: string; alter_bis: number }[];
  kompetenzen: Kompetenz[];
  merkmalsregister: { merkmal: string; skala_roh: string; min: number | null; max: number | null; leitfrage: string }[];
  statusleiter: { stufe: string; bezeichnung: string; bedeutung: string; voraussetzung: string }[];
  quellenregister: { sigel: string; name: string; nutzen: string; url: string | null; typ: string | null }[];
  aliase: Record<string, string>;
}

export interface Filter {
  suche: string;
  altersstufe: number | null;
  familie: string | null;
  kompetenz: string | null;
  tiefe: Dokumentationstiefe | null;
  nurMitQuelle: boolean;
}
