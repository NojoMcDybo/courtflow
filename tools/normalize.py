"""Normalisiert die Rohdatensätze auf ein Zielschema.

Vier Erfassungsgenerationen liegen im Katalog nebeneinander. Sie werden auf
ein gemeinsames Schema abgebildet. Belegte redaktionelle Ergänzungen folgen
als eigene Schritte; Unbelegtes bleibt null. `dokumentationstiefe` beschreibt
weiterhin die ursprüngliche Erfassung im Katalog.
"""
import json
import re
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "docs" / "quellen" / "records-raw.json"
TABLES = ROOT / "docs" / "quellen" / "catalog-tables.json"
EXTRACTED = ROOT / "docs" / "quellen" / "catalog-extracted.txt"
OUT = ROOT / "data" / "drills.json"
REDAKTION = ROOT / "docs" / "redaktion" / "karten-runde-01.json"
RECHERCHE = ROOT / "docs" / "redaktion" / "karten-runde-02.json"
RECHERCHE_BELEGE = ROOT / "docs" / "quellen" / "karten-recherche-2026-10-02.json"
RECHERCHE_03 = ROOT / "docs" / "redaktion" / "karten-runde-03.json"
RECHERCHE_BELEGE_03 = ROOT / "docs" / "quellen" / "karten-recherche-runde-03.json"
RECHERCHE_04 = ROOT / "docs" / "redaktion" / "karten-runde-04.json"
RECHERCHE_BELEGE_04 = ROOT / "docs" / "quellen" / "karten-recherche-runde-04.json"
RECHERCHE_05 = ROOT / "docs" / "redaktion" / "karten-runde-05.json"
RECHERCHE_BELEGE_05 = ROOT / "docs" / "quellen" / "karten-recherche-runde-05.json"
RECHERCHE_06 = ROOT / "docs" / "redaktion" / "karten-runde-06.json"
RECHERCHE_BELEGE_06 = ROOT / "docs" / "quellen" / "karten-recherche-runde-06.json"
RECHERCHE_07 = ROOT / "docs" / "redaktion" / "karten-runde-07.json"
RECHERCHE_BELEGE_07 = ROOT / "docs" / "quellen" / "karten-recherche-runde-07.json"
RECHERCHE_08 = ROOT / "docs" / "redaktion" / "karten-runde-08.json"
RECHERCHE_09 = ROOT / "docs" / "redaktion" / "karten-runde-09.json"
RECHERCHE_10 = ROOT / "docs" / "redaktion" / "karten-runde-10.json"
RECHERCHE_BELEGE_08 = ROOT / "docs" / "quellen" / "karten-recherche-runde-08.json"
RECHERCHE_BELEGE_09 = ROOT / "docs" / "quellen" / "karten-recherche-runde-09.json"
RECHERCHE_BELEGE_10 = ROOT / "docs" / "quellen" / "karten-recherche-runde-10.json"
RECHERCHE_11 = ROOT / "docs" / "redaktion" / "karten-runde-11.json"
RECHERCHE_BELEGE_11 = ROOT / "docs" / "quellen" / "karten-recherche-runde-11.json"
RECHERCHE_12 = ROOT / "docs" / "redaktion" / "karten-runde-12.json"
RECHERCHE_13 = ROOT / "docs" / "redaktion" / "karten-runde-13.json"
RECHERCHE_14 = ROOT / "docs" / "redaktion" / "karten-runde-14.json"
RECHERCHE_BELEGE_14 = ROOT / "docs" / "quellen" / "karten-recherche-runde-14.json"
RECHERCHE_15 = ROOT / "docs" / "redaktion" / "karten-runde-15.json"
RECHERCHE_BELEGE_15 = ROOT / "docs" / "quellen" / "karten-recherche-runde-15.json"
RECHERCHE_16 = ROOT / "docs" / "redaktion" / "karten-runde-16.json"
RECHERCHE_BELEGE_16 = ROOT / "docs" / "quellen" / "karten-recherche-runde-16.json"
RECHERCHE_17 = ROOT / "docs" / "redaktion" / "karten-runde-17.json"
RECHERCHE_BELEGE_17 = ROOT / "docs" / "quellen" / "karten-recherche-runde-17.json"
RECHERCHE_18 = ROOT / "docs" / "redaktion" / "karten-runde-18.json"
RECHERCHE_BELEGE_18 = ROOT / "docs" / "quellen" / "karten-recherche-runde-18.json"
RECHERCHE_19 = ROOT / "docs" / "redaktion" / "karten-runde-19.json"
RECHERCHE_BELEGE_19 = ROOT / "docs" / "quellen" / "karten-recherche-runde-19.json"
RECHERCHE_20 = ROOT / "docs" / "redaktion" / "karten-runde-20.json"
RECHERCHE_BELEGE_20 = ROOT / "docs" / "quellen" / "karten-recherche-runde-20.json"
RECHERCHE_21 = ROOT / "docs" / "redaktion" / "karten-runde-21.json"
RECHERCHE_BELEGE_21 = ROOT / "docs" / "quellen" / "karten-recherche-runde-21.json"
RECHERCHE_22 = ROOT / "docs" / "redaktion" / "karten-runde-22.json"
RECHERCHE_BELEGE_22 = ROOT / "docs" / "quellen" / "karten-recherche-runde-22.json"
RECHERCHE_BELEGE_12 = ROOT / "docs" / "quellen" / "karten-recherche-runde-12.json"
RECHERCHE_BELEGE_13 = ROOT / "docs" / "quellen" / "karten-recherche-runde-13.json"
ABLAUFPLATZHALTER = ROOT / "docs" / "redaktion" / "karten-ablaufplatzhalter-2026-10-04.json"
UNBELEGTE_ABLAEUFE = ROOT / "docs" / "redaktion" / "karten-unbelegte-ablaeufe-2026-10-05.json"
METADATENKORREKTUR = ROOT / "docs" / "redaktion" / "karten-metadatenkorrektur-2026-10-06.json"

CODE = re.compile(r"\b([TKS])([1-7])\b")
AGE = re.compile(r"U(\d{1,2})")


def txt(value):
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def codes(*values):
    found = []
    for value in values:
        if not value:
            continue
        for fam, num in CODE.findall(str(value)):
            code = f"{fam}{num}"
            if code not in found:
                found.append(code)
    return found


def age_window(value):
    if not value:
        return {"von": None, "bis": None, "roh": None}
    # Eine ausdrücklich nur denkbare Vorstufe erweitert das typische Alter
    # nicht automatisch auf die jüngere Stufe (EX-106).
    primary = re.split(r";\s*U\d{1,2}\s+als\s+Vorstufe\s+denkbar", value, maxsplit=1)[0]
    nums = [int(n) for n in AGE.findall(primary)]
    if not nums:
        return {"von": None, "bis": None, "roh": value.strip()}
    return {"von": min(nums), "bis": max(nums), "roh": value.strip()}


def _number(value):
    number = float(value.replace(",", "."))
    return int(number) if number.is_integer() else number


def duration_span(value):
    """Zeitangaben in Minuten; Umfang ohne Zeiteinheit bleibt ausschließlich roh."""
    if not value:
        return {"min": None, "max": None, "roh": None}
    raw = value.strip()
    # Nach dem Semikolon stehen im Katalog eigenständige Varianten. Deren Zeit
    # darf nicht mit der Dauer der Grundform zu einer künstlichen Spanne werden.
    primary = raw.split(";", 1)[0]
    unit = r"(?P<unit>min(?:uten?)?|s(?:ek(?:unden?)?)?)\.?"
    number = r"\d+(?:[.,]\d+)?"

    # Ein vorangestellter Gesamtwert gilt auch dann, wenn die Klammer eine
    # kleinere Teilserie mit eigener Zeiteinheit erklärt.
    total = re.match(rf"(?P<total>{number})\s*{unit}\b", primary, re.I)
    if total:
        minutes = _number(total.group("total"))
        if total.group("unit").lower().startswith("s"):
            minutes = _number(str(minutes / 60))
        return {"min": minutes, "max": minutes, "roh": raw}

    series = re.search(
        rf"(?P<count>{number})\s*[x×]\s*(?P<lo>{number})"
        rf"(?:\s*[–-]\s*(?P<hi>{number}))?\s*{unit}\b",
        primary, re.I)
    if series:
        factor = _number(series.group("count"))
        lo = factor * _number(series.group("lo"))
        hi = factor * _number(series.group("hi") or series.group("lo"))
        unit_name = series.group("unit").lower()
        if unit_name.startswith("s"):
            lo, hi = lo / 60, hi / 60
        lo, hi = _number(str(lo)), _number(str(hi))
        return {"min": lo, "max": hi, "roh": raw}

    simple = re.search(
        rf"(?P<lo>{number})(?:\s*[–-]\s*(?P<hi>{number}))?\s*{unit}\b",
        primary, re.I)
    if simple:
        lo = _number(simple.group("lo"))
        hi = _number(simple.group("hi") or simple.group("lo"))
        unit_name = simple.group("unit").lower()
        if unit_name.startswith("s"):
            lo, hi = lo / 60, hi / 60
        lo, hi = _number(str(lo)), _number(str(hi))
        return {"min": lo, "max": hi, "roh": raw}
    return {"min": None, "max": None, "roh": raw}


def player_span(value):
    """Nur ausdrücklich angegebene Spieler- oder Gruppengrößen numerisch lesen."""
    if not value:
        return {"min": None, "max": None, "roh": None}
    raw = value.strip()
    match = re.fullmatch(r"(\d+)\s*[–-]\s*(\d+)(?:\s+pro\s+(?:Gruppe|Rotation|Diamond|Ball))?", raw, re.I)
    if match:
        return {"min": int(match.group(1)), "max": int(match.group(2)), "roh": raw}
    match = re.fullmatch(r"(\d+)\+", raw)
    if match:
        return {"min": int(match.group(1)), "max": None, "roh": raw}
    match = re.match(r"^(\d+)(\+)?\s+pro\s+(?:Gruppe|Rotation|Diamond|Ball)\b", raw, re.I)
    if match:
        amount = int(match.group(1))
        return {"min": amount, "max": None if match.group(2) else amount, "roh": raw}
    match = re.match(r"^(\d+)er-(?:Gruppen|Paare)\b", raw, re.I)
    if match:
        amount = int(match.group(1))
        return {"min": amount, "max": amount, "roh": raw}
    if re.fullmatch(r"Paare", raw, re.I):
        return {"min": 2, "max": 2, "roh": raw}
    return {"min": None, "max": None, "roh": raw}


def scale(value):
    """'2/5' -> {wert:2, skala:5}; '0/3 Originalbasis; 2/3 kompetitiv' -> Basiswert."""
    if not value:
        return None
    m = re.search(r"(\d+)\s*/\s*(\d+)", value)
    if m:
        return {"wert": int(m.group(1)), "skala": int(m.group(2)), "roh": value.strip()}
    m = re.match(r"^\s*(\d+)\s*(?:[–-]\s*(\d+))?\s*$", value)
    if m:
        wert = int(m.group(1))
        return {"wert": wert, "skala": 5, "roh": value.strip()}
    return {"wert": None, "skala": None, "roh": value.strip()}


def parse_kurzform(lines):
    """Generation A: 'Quelle: X | URL', 'Arbeitsalter: .. | Technik: n | Spielnähe: n', ..."""
    out = {}
    for line in lines:
        for part in line.split("|"):
            if ":" not in part:
                if part.strip().startswith("http"):
                    out["url"] = part.strip()
                continue
            key, _, value = part.partition(":")
            key = key.strip().lower()
            value = value.strip()
            if key.startswith("http"):
                out["url"] = part.strip()
            elif value.startswith("//") or key in {"https", "http"}:
                out["url"] = part.strip()
            else:
                out[key] = value
    for line in lines:
        m = re.search(r"https?://\S+", line)
        if m and "url" not in out:
            out["url"] = m.group(0)
    return out


ID_HEADERS = {"id", "alias-id", "karte", "kartenid"}
KOMP_KEYS = ("kompetenz", "kompetenzen", "primärkompetenz(en)", "schwerpunkt",
             "kompetenzbezug", "hauptkompetenz")
ALTER_KEYS = ("arbeitsalter", "arbeitsalter*", "alter", "altersbereich",
              "alters-/erfahrungsfenster")
QA_KEYS = ("qa", "qa-status", "status")
QUELLE_KEYS = ("quelle", "primärquelle", "originalquelle", "quellenseite", "url")
NOTIZ_KEYS = ("entscheidung", "redaktionelle entscheidung", "kernbegründung",
              "kurznotiz", "arbeitsnotiz", "redaktioneller hinweis",
              "redaktionelle begründung", "geprüfte merkmale")


def titel_aus_feldern(fields):
    """Bevorzugt die explizite Titelspalte einer Kandidatentabelle."""
    for key in ("Übung", "Übung / Format", "Übung/Format", "Format", "Karte"):
        if fields.get(key):
            return fields[key].strip()
    return None


def tabellenbefunde():
    """Zeilenweise Befunde aus den Review-Tabellen, nach Übungs-ID."""
    tables = json.loads(TABLES.read_text(encoding="utf-8"))
    befunde = {}
    for index, table in enumerate(tables):
        if len(table) < 2 or not table[0]:
            continue
        header = [str(c).strip().lower() for c in table[0]]
        if header[0] not in ID_HEADERS or header[:2] == ["alias-id", "canonical_id"]:
            continue
        for row in table[1:]:
            if not row or not str(row[0]).strip().startswith("EX-"):
                continue
            ids = re.findall(r"EX-\d{3}", str(row[0]))
            entry = {header[i]: str(row[i]).strip()
                     for i in range(min(len(header), len(row))) if str(row[i]).strip()}
            entry["_tabelle"] = index
            for eid in ids:
                befunde.setdefault(eid, []).append(entry)
    return befunde


def aus_befunden(befunde, keys):
    for entry in befunde:
        for key in keys:
            if entry.get(key):
                return entry[key]
    return None


def quellenbelege():
    """Per-ID-Evidenzzeilen mit expliziter Quelle/URL aus dem DOCX-Export."""
    index = {}
    if not EXTRACTED.exists():
        return index
    for raw_line in EXTRACTED.read_text(encoding="utf-8").splitlines():
        line = re.sub(r"^\d+:\s*", "", raw_line).strip()
        prefix = re.match(r"^EX-(\d{3})(?:\s*/\s*(?:EX-)?(\d{3}))?\s*[–:]", line)
        if not prefix:
            continue
        ids = [f"EX-{prefix.group(1)}"]
        if prefix.group(2):
            ids.append(f"EX-{prefix.group(2)}")
        if "Quelle:" not in line and "Quellen:" not in line and not re.search(r"https?://", line):
            continue
        for eid in ids:
            index.setdefault(eid, []).append(line)
    return index


SOURCE_LABEL = re.compile(
    r"\b(Jr\.?\s*NBA(?:\s+(?:Rookie|Starter|All-Star|MVP)(?:\s+(?:Practice(?:\s+Plans)?|P\d+|\d+))?)?"
    r"|FIBA/WABC(?:\s+(?:Mini-Basketball Coaches Manual|Level\s+\d))?"
    r"|DBB(?:[-\s]+(?:Easybasket(?:-Handbuch)?|Jugend-Minileitfaden|3x3 Stundenbilder|Grundschulwoche|Leitfaden))?)",
    re.I,
)


def quelle_aus_belegen(lines):
    """Liest nur explizit genannte Quellen aus einer Karten-Evidenzzeile."""
    for line in lines:
        urls = list(dict.fromkeys(u.rstrip(".,;)") for u in re.findall(r"https?://\S+", line)))
        # Gemeinsame Belegzeilen mit mehreren URLs geben keine eindeutige
        # Zuordnung einer einzelnen URL zur jeweiligen Karte vor.
        url = urls[0] if len(urls) == 1 else None
        named = re.search(r"\bQuelle[n]?\s*:\s*([^\n]+?)(?=\s+https?://|\s+QA\b|$)", line,
                          re.I)
        name = named.group(1).strip(" .,;:") if named else None
        if name and name.startswith("http"):
            name = None
        if not name:
            label = SOURCE_LABEL.search(line)
            name = label.group(1).strip() if label else None
        if name or url:
            return name, url, line
    return None, None, None


def quelle_aus_titel(titel):
    """Nur explizite Sätze 'Quelle dokumentiert das „exakter Titel“'."""
    if not EXTRACTED.exists() or not titel:
        return None, None, None
    lines = [re.sub(r"^\d+:\s*", "", line).strip()
             for line in EXTRACTED.read_text(encoding="utf-8").splitlines()]
    pattern = re.compile(r'^(.*?)\s+dokumentiert\s+(?:das|die|den)\s+[„"]'
                         + re.escape(titel) + r'[“"]', re.I)
    for line in lines:
        match = pattern.match(line)
        if match and SOURCE_LABEL.match(match.group(1)):
            return match.group(1).strip(), None, line
    return None, None, None


def ablauf_aus_evidenz(rec, titel):
    """Explizite 'Titel: Durchführung'-Absätze, ohne QA- und Quellenmetadaten."""
    match = re.match(re.escape(titel) + r"\s*:\s*(.+)", rec["titel"], re.S)
    if not match:
        return None
    text = re.split(r"\s+(?:Quelle[n]?|QA|Kompetenz|Arbeitsalter|Entscheidung)\s*:",
                    match.group(1), maxsplit=1)[0].strip()
    return text if len(text) > 80 else None


def alias_map():
    tables = json.loads(TABLES.read_text(encoding="utf-8"))
    mapping = {}
    for table in tables:
        if not table or not table[0]:
            continue
        header = [str(c).strip().lower() for c in table[0]]
        if header[:2] == ["alias-id", "canonical_id"]:
            for row in table[1:]:
                if len(row) >= 2 and row[0].startswith("EX-"):
                    mapping[row[0].strip()] = row[1].strip()
    return mapping


def titel_und_evidenz(rec):
    """Bullet-Einträge tragen Titel und Evidenztext in einer Zeile."""
    titel = rec["titel"].strip()
    evidenz = None
    if rec["stil"] and not rec["stil"].startswith("Heading") and ":" in titel:
        kopf, _, rest = titel.partition(":")
        if len(rest.strip()) > 80:
            titel, evidenz = kopf.strip(), rest.strip()
    if rec["fliesstext"]:
        zusatz = " ".join(rec["fliesstext"]).strip()
        evidenz = f"{evidenz} {zusatz}".strip() if evidenz else zusatz
    return titel.strip(" –—-"), evidenz


def quelle_saeubern(value):
    """Quellenangaben aus Fliesstext enthalten oft Befund und URL im selben Satz."""
    if not value:
        return None
    value = re.split(r"https?://", value)[0]
    value = re.split(r"(?:Quellenbefund|QA:|Direkter Videonachweis|Video:)", value)[0]
    value = value.replace("\n", " ").strip(" .,;:–—-")
    return value or None


EVIDENZ_KEYS = ("Kompetenz", "Kompetenzen", "Kompetenzbezug", "Arbeitsalter", "Alter",
                "Altersbereich", "Quelle", "Originalquelle", "QA", "QA-Status",
                "Spielnähe", "Technik", "Entscheidung", "Dauer", "Spielerzahl")
EVIDENZ_RE = re.compile(
    r"\b(" + "|".join(EVIDENZ_KEYS) + r")\s*:\s*(.+?)(?=\s+\b(?:" +
    "|".join(EVIDENZ_KEYS) + r")\s*:|\.\s|$)", re.S)


def evidenz_felder(text):
    """Bullet-Karten tragen ihre Metadaten als 'Kompetenz: K4/T1.' im Fliesstext."""
    if not text:
        return {}
    out = {}
    for key, value in EVIDENZ_RE.findall(text):
        key = key.lower()
        value = value.strip().strip(".;,")
        if key not in out and value:
            out[key] = value
    return out


def normalize(rec, aliases, befunde_index, quellen_index):
    f = rec["felder"]
    befunde = befunde_index.get(rec["id"], [])
    flow = rec["fliesstext"]
    kurz = parse_kurzform(flow) if not f else {}

    structured_fields = ("Ablauf", "Lernziel", "Zielkompetenz", "Material", "Coachingpunkte",
                         "Progression", "Regression", "Methodik")
    if "QA-Status" in f:
        gen, tiefe = "D", "vollstaendig"
    elif "Redaktionsscore (Q/D/A/P/E/O/V)" in f:
        gen, tiefe = "C", "redaktionsscore"
    elif f and any(f.get(key) for key in structured_fields):
        gen, tiefe = "B", "standard"
    else:
        # Candidate tables document only title/tags. They are not a complete
        # card merely because extraction has turned the row into fields.
        gen, tiefe = "A", None  # nach Evidenzlage unten entschieden

    def g(*keys):
        for k in keys:
            if f.get(k):
                return f[k].strip()
        return None

    haupt_roh = g("Hauptkompetenz", "Kompetenz", "Hauptbereich", "Kompetenzen")
    sek_roh = g("Unter-/Sekundärkompetenzen", "Kompetenzen")
    ev = evidenz_felder(rec["titel"] + " " + " ".join(rec["fliesstext"]))
    komp_kurz = (kurz.get("kompetenzbezug") or aus_befunden(befunde, KOMP_KEYS)
                 or ev.get("kompetenz") or ev.get("kompetenzen"))
    alle = codes(haupt_roh, sek_roh, komp_kurz)

    belegg_name, belegg_url, belegg_text = quelle_aus_belegen(
        quellen_index.get(rec["id"], []))
    source_fields = [g("Originalquelle"), g("Quelle")]
    quelle_name = next((value for value in source_fields if value and not value.startswith("http")), None)
    quelle_name = (quelle_name or kurz.get("quelle") or aus_befunden(befunde, QUELLE_KEYS)
                   or ev.get("originalquelle") or ev.get("quelle") or belegg_name)
    url = (g("Original-URL")
           or next((value for value in source_fields if value and value.startswith("http")), None)
           or kurz.get("url"))
    if quelle_name and quelle_name.startswith("http") and not url:
        url, quelle_name = quelle_name, None

    redaktionsstatus = g("Redaktionsstatus")
    publish_ready = None
    if redaktionsstatus:
        publish_ready = "publish-ready" in redaktionsstatus.lower()

    score = None
    raw_score = g("Redaktionsscore (Q/D/A/P/E/O/V)")
    if raw_score:
        score = {k: int(v) for k, v in re.findall(r"([QDAPEOV])\s*=\s*(\d)", raw_score)}
        score["roh"] = raw_score

    stufe = None
    roh_status = g("Status")
    if roh_status and re.match(r"^S\d", roh_status.strip()):
        stufe = roh_status.strip()
    gesamt = aus_befunden(befunde, ("gesamt / status",))
    bewertung = None
    if gesamt:
        m = re.search(r"/\s*([A-D])\b", gesamt)
        bewertung = {"roh": gesamt, "note": m.group(1) if m else None}

    canonical = aliases.get(rec["id"])
    titel, evidenz = titel_und_evidenz(rec)
    table_title = titel_aus_feldern(f) or aus_befunden(befunde, TITEL_KEYS)
    # IDs wurden im wachsenden Katalog teils neu verwendet (EX-053/054).
    # Ein plausibler Titel der Feldkarte hat Vorrang vor älteren Review-Zeilen.
    # Die Titelspalte repariert nur QA/Fließtext oder einen am Doppelpunkt
    # abgeschnittenen Titel, z. B. 'Guards: Pick & Roll Situational Shooting'.
    if table_title and (titel.startswith("QA ") or len(titel) > 180
                        or table_title.startswith(titel + ":")):
        titel = table_title
    if not belegg_name:
        belegg_name, belegg_url, belegg_text = quelle_aus_titel(titel)
    # Bei frühen Bullet-Karten steht die Quelle direkt vor der Durchführung:
    # 'Titel: FIBA/WABC – ...'. Markenwörter im Titel/QA-Text reichen nicht.
    source_body = rec["titel"].partition(":")[2].strip()
    title_source = SOURCE_LABEL.match(source_body) if not rec["titel"].startswith("QA ") else None
    # Some early two-column cards carry the URL under Originalquelle and a
    # shortened provider label ("Jr") under Quelle. Prefer the explicit
    # per-ID evidence label in that case.
    if belegg_name and (not quelle_name or quelle_name.casefold() in {"jr", "nba", "fiba", "dbb"}):
        quelle_name = belegg_name
    if not quelle_name and title_source:
        quelle_name = title_source.group(1).strip()
    if belegg_text and not evidenz:
        evidenz = belegg_text
    if tiefe is None:
        tiefe = "kurz" if evidenz else ("nur_belege" if befunde else "nur_titel")
        gen = "A" if evidenz else "E"

    if evidenz and not url:
        urls = list(dict.fromkeys(u.rstrip(".,;)") for u in re.findall(r"https?://\S+", evidenz)))
        if len(urls) == 1:
            url = urls[0]
    if belegg_url and not url:
        url = belegg_url

    return {
        "id": rec["id"],
        "kanonische_id": canonical or rec["id"],
        "ist_alias": canonical is not None,
        "titel": titel,
        "evidenz": evidenz,
        "originaltitel": g("Originaltitel"),
        "lernziel": g("Lernziel", "Zielkompetenz"),
        "ablauf": g("Ablauf") or ablauf_aus_evidenz(rec, titel),
        "coachingpunkte": g("Coachingpunkte"),
        "typische_fehler": g("Typische Fehler"),
        "kompetenz": {
            "haupt": (codes(haupt_roh) or alle or [None])[0],
            "alle": alle,
            "roh": haupt_roh or komp_kurz,
        },
        "alter": age_window(
            g("Altersbereich", "Alters-/Erfahrungsfenster", "Alters-/Erfahrungsstufe")
            or kurz.get("arbeitsalter")
            or aus_befunden(befunde, ALTER_KEYS)
            or ev.get("arbeitsalter") or ev.get("altersbereich") or ev.get("alter")
        ),
        "empfohlene_stufe": age_window(g("Empfohlene Stufe"))["roh"],
        "erfahrung": g("Erfahrungsniveau"),
        "spielerzahl": player_span(g("Spielerzahl", "Spieler")),
        "raum": g("Raum", "Feld") if g("Raum", "Feld") != "Inhalt" else g("Raum"),
        "dauer_min": duration_span(g("Dauer/Umfang", "Dauer / Umfang", "Dauer")),
        "material": g("Material"),
        "regression": g("Regression"),
        "progression": g("Progression"),
        "methodik": g("Methodik", "Methodikprofil"),
        "skalen": {
            "entscheidung": scale(g("Entscheidungsschwierigkeit", "Entscheidungsgrad")),
            "gegnerdruck": scale(g("Gegnerdruck")),
            "technik": scale(g("Technikschwierigkeit") or kurz.get("technik")),
            "spielnaehe": scale(g("Spielnähe") or kurz.get("spielnähe")),
            "zeitdruck": scale(g("Zeitdruck")),
            "raumdruck": scale(g("Raumdruck")),
            "wahrnehmung": scale(g("Wahrnehmungsanforderung")),
            "kooperation": scale(g("Kooperationsgrad")),
        },
        "quelle": {
            "name": quelle_saeubern(quelle_name),
            "url": url,
            "video_status": g("Video-Status", "Video"),
        },
        "qa": {
            "stufe": stufe,
            "note": g("QA-Status") or aus_befunden(befunde, QA_KEYS) or ev.get("qa"),
            "pruefstatus": aus_befunden(befunde, ("prüfstatus",)),
            "scoreprofil": aus_befunden(befunde, ("scoreprofil", "d/e/g/s*", "d/e/g/s")),
            "bewertung": bewertung,
            "redaktionsstatus": redaktionsstatus,
            "publish_ready": publish_ready,
            "score": score,
        },
        "dokumentationstiefe": tiefe,
        "belege": [{"tabelle": e["_tabelle"],
                    **{k: v for k, v in e.items() if k != "_tabelle"}} for e in befunde],
        "redaktionsnotiz": aus_befunden(befunde, NOTIZ_KEYS),
        "herkunft": {
            "generation": gen,
            "abschnitt": rec["abschnitt"],
            "kontext": rec["kontext_abschnitt"],
            "quelldokument": "Jugendbasketball_Kompetenzkatalog_v3_8_final.docx",
        },
    }


TITEL_KEYS = ("übung", "übung / format", "format", "karte", "übung/format")


def beleg_passt_zur_karte(text, eid, titel):
    """Beleg muss die ID am Anfang oder den exakten Übungstitel zuordnen."""
    prefix = re.match(r"^EX-(\d{3})(?:\s*/\s*(?:EX-)?(\d{3}))?\s*[–:]", text)
    if prefix:
        return eid in {f"EX-{number}" for number in prefix.groups() if number}
    # Ein früher Katalogabsatz nennt statt einer ID die Quelle und den
    # wörtlichen Titel. Eine beliebige Titelerwähnung im Fließtext genügt nicht.
    exact_title = re.match(
        r'^(.*?)\s+dokumentiert\s+(?:das|die|den)\s+[„"]'
        + re.escape(titel) + r'[“"]\s*:', text)
    return bool(exact_title and SOURCE_LABEL.match(exact_title.group(1)))


def redaktionsfelder_anwenden(d, felder):
    """Nur Inhaltsfelder mit unverändertem Ausgangswert und zwei Sprachfassungen."""
    erlaubt = {"ablauf", "lernziel", "coachingpunkte", "typische_fehler",
               "regression", "progression", "material", "raum",
               "dauer_min", "spielerzahl"}
    eid = d["id"]
    if not felder or not set(felder) <= erlaubt:
        raise ValueError(f"{eid}: nicht erlaubte oder leere Feldauswahl")
    for feld, text in felder.items():
        vorher = d[feld]["roh"] if feld in {"dauer_min", "spielerzahl"} else d[feld]
        if vorher != text["vorher"]:
            raise ValueError(f"{eid}/{feld}: Quelldaten geändert; Redaktion erneut prüfen")
        if not text["de"].strip() or not text["en"].strip():
            raise ValueError(f"{eid}/{feld}: deutscher oder englischer Text fehlt")
        if feld == "dauer_min":
            d[feld] = duration_span(text["de"])
        elif feld == "spielerzahl":
            d[feld] = player_span(text["de"])
        else:
            d[feld] = text["de"]


def redaktion_anwenden(drills, redaktion, quelltext):
    """Belegte Eigenformulierungen nach dem Import reproduzierbar einspielen.

    Titel, vorheriger Feldwert und exakter Katalogbeleg sichern jede Änderung
    gegen veraltete Zuordnungen ab. Alter, Quellen und QA sind keine editierbaren
    Felder dieses Schritts. Die ursprüngliche Evidenz bleibt erhalten.
    """
    if redaktion.get("version") != 1:
        raise ValueError("Unbekanntes Redaktionsformat")
    result = deepcopy(drills)
    by_id = {d["id"]: d for d in result}
    gesehen = set()
    for entry in redaktion["karten"]:
        eid = entry["id"]
        d = by_id.get(eid)
        if eid in gesehen or d is None or d["ist_alias"] or d["titel"] != entry["titel"]:
            raise ValueError(f"{eid}: ungültige oder veraltete Kartenzuordnung")
        gesehen.add(eid)
        beleg = entry["beleg"]
        if (beleg["datei"] != "docs/quellen/catalog-extracted.txt"
                or not beleg["text"].strip() or beleg["text"] not in quelltext):
            raise ValueError(f"{eid}: Katalogbeleg nicht wiedergefunden")
        if not beleg_passt_zur_karte(beleg["text"], eid, d["titel"]):
            raise ValueError(f"{eid}: Katalogbeleg gehört nicht zu dieser Karte")
        redaktionsfelder_anwenden(d, entry["felder"])
        d["belege"].append({
            "redaktion": "docs/redaktion/karten-runde-01.json",
            "stand": redaktion["stand"],
            "felder": ", ".join(entry["felder"]),
            "katalogbeleg": beleg["text"],
        })
    return result


def recherche_anwenden(drills, redaktion, belege, *, redaktion_pfad=RECHERCHE,
                      belege_pfad=RECHERCHE_BELEGE):
    """Manuell geprüfte Primärquellen ergänzen; keine automatische QA-Aufwertung.

    Das separate Rechercheprotokoll bindet jede Quelle an Karten-ID, Titel und
    belegte Felder. Es dokumentiert die Prüfung, ersetzt sie aber nicht.
    """
    if redaktion.get("version") != 1 or belege.get("version") != 1:
        raise ValueError("Unbekanntes Rechercheformat")
    result = deepcopy(drills)
    by_id = {d["id"]: d for d in result}
    sources = {b["id"]: b for b in belege["belege"]}
    if len(sources) != len(belege["belege"]):
        raise ValueError("Doppelte Recherchebeleg-ID")
    gesehen = set()
    for entry in redaktion["karten"]:
        eid = entry["id"]
        d = by_id.get(eid)
        if eid in gesehen or d is None or d["ist_alias"] or d["titel"] != entry["titel"]:
            raise ValueError(f"{eid}: ungültige oder veraltete Kartenzuordnung")
        gesehen.add(eid)
        beleg = sources.get(entry["beleg_id"])
        if (not beleg or beleg["karten_id"] != eid or beleg["karten_titel"] != d["titel"]
                or not set(entry["felder"]) <= set(beleg["felder"])):
            raise ValueError(f"{eid}: Recherchebeleg gehört nicht zu Karte oder Feldern")
        url = urlparse(beleg["url"])
        offizielle_praxis = (url.netloc == "jr.nba.com" and re.fullmatch(
            r"/basketball-practice-plans/(?:rookie|starter|all-star|mvp)/(?:page/(?:[1-9]|1[0-2])/)?",
            url.path))
        fiba_handbuch = (url.netloc == "assets.fiba.basketball" and url.path ==
            "/image/upload/documents-corporate-wabc-coaching-manual-mini-basketball-eng.pdf")
        fiba_level_1 = (url.netloc == "assets.fiba.basketball" and url.path ==
            "/image/upload/documents-corporate-wabc-coaching-level-manuals-level-1-eng.pdf")
        fiba_activities = (url.netloc == "assets.fiba.basketball" and url.path ==
            "/image/upload/documents-corporate-wabc-start-coaching-eng-activities-book.pdf")
        fiba_facilitator = (url.netloc == "assets.fiba.basketball" and url.path ==
            "/image/upload/documents-corporate-wabc-start-coaching-eng-facilitator-handbook.pdf")
        fiba_3x3 = (url.netloc == "fiba3x3.com" and url.path ==
            "/docs/wabc-3x3-players-guide.pdf")
        dbb_videokatalog = (url.netloc == "www.basketball-bund.de" and url.path ==
            "/wp-content/uploads/sites/2/2022/02/Videokatalog-Minibasketball.pdf")
        dbb_stundenbilder = (url.netloc == "www.basketball-bund.de" and url.path ==
            "/wp-content/uploads/sites/2/2021/09/3x3-Stundenbilder_web_19.pdf")
        dbb_easybasket = (url.netloc == "www.basketball-bund.de" and url.path ==
            "/wp-content/uploads/sites/2/2024/03/DBB_Jugend_Easybasket-Handbuch.pdf")
        dbb_stationsschilder = (url.netloc == "www.basketball-bund.de" and url.path ==
            "/wp-content/uploads/sites/2/2024/09/DBB_Grundschulwoche_Stationsschilder.pdf")
        dbb_minileitfaden = (url.netloc == "www.basketball-bund.de" and url.path ==
            "/wp-content/uploads/sites/2/2022/07/DBB_Jugend_Minileitfaden.pdf")
        if (url.scheme != "https" or not (offizielle_praxis or fiba_handbuch or fiba_level_1 or fiba_activities or fiba_facilitator or fiba_3x3 or dbb_videokatalog or dbb_stundenbilder or dbb_easybasket or dbb_stationsschilder or dbb_minileitfaden)
                or url.query or url.fragment
                or not all(beleg[k].strip() for k in ("name", "abschnitt", "abgerufen"))):
            raise ValueError(f"{eid}: ungültige Primärquellenangabe")
        if d["quelle"] != entry["quelle_vorher"]:
            raise ValueError(f"{eid}: Quellenzuordnung geändert; Recherche erneut prüfen")
        redaktionsfelder_anwenden(d, entry["felder"])
        d["quelle"] = {**d["quelle"], "name": beleg["name"], "url": beleg["url"]}
        d["belege"].append({
            "redaktion": redaktion_pfad.relative_to(ROOT).as_posix(),
            "recherche": belege_pfad.relative_to(ROOT).as_posix(),
            "beleg_id": beleg["id"], "stand": beleg["abgerufen"],
            "felder": ", ".join(entry["felder"]),
            "quelle": beleg["name"], "url": beleg["url"], "abschnitt": beleg["abschnitt"],
        })
    return result


def recherchen_anwenden(drills):
    """Geprüfte Rechercherunden chronologisch mit ihrer eigenen Herkunft laden."""
    for redaktion_pfad, belege_pfad in (
            (RECHERCHE, RECHERCHE_BELEGE), (RECHERCHE_03, RECHERCHE_BELEGE_03),
            (RECHERCHE_04, RECHERCHE_BELEGE_04),
            (RECHERCHE_05, RECHERCHE_BELEGE_05),
            (RECHERCHE_06, RECHERCHE_BELEGE_06),
            (RECHERCHE_07, RECHERCHE_BELEGE_07),
            (RECHERCHE_08, RECHERCHE_BELEGE_08),
            (RECHERCHE_09, RECHERCHE_BELEGE_09),
            (RECHERCHE_10, RECHERCHE_BELEGE_10),
            (RECHERCHE_11, RECHERCHE_BELEGE_11)):
        drills = recherche_anwenden(
            drills, json.loads(redaktion_pfad.read_text(encoding="utf-8")),
            json.loads(belege_pfad.read_text(encoding="utf-8")),
            redaktion_pfad=redaktion_pfad, belege_pfad=belege_pfad)
    return drills


def ablaufplatzhalter_entfernen(drills, korrektur):
    """Reine Prüfhinweise aus dem Ablauffeld nehmen, ohne den Rohbeleg zu verlieren."""
    if korrektur.get("version") != 1:
        raise ValueError("Unbekanntes Korrekturformat")
    result = deepcopy(drills)
    by_id = {d["id"]: d for d in result}
    ids = [entry["id"] for entry in korrektur["karten"]]
    if len(ids) != len(set(ids)) or set(ids) != {f"EX-{n:03}" for n in range(62, 69)}:
        raise ValueError("Ungültige Ablaufplatzhalter-Zuordnung")
    for entry in korrektur["karten"]:
        d = by_id[entry["id"]]
        if (d["ist_alias"] or d["titel"] != entry["titel"]
                or d["ablauf"] != entry["ablauf_vorher"]
                or not d["evidenz"]):
            raise ValueError(f"{entry['id']}: Ablaufplatzhalter geändert; erneut prüfen")
        d["ablauf"] = None
        d["belege"].append({
            "redaktion": ABLAUFPLATZHALTER.relative_to(ROOT).as_posix(),
            "stand": korrektur["stand"],
            "befund": entry["grund"],
            "vorheriger_pruefhinweis": entry["ablauf_vorher"],
        })
    return result


def unbelegte_ablaeufe_kennzeichnen(drills, korrektur):
    """Nicht belegte Ablaufschilderungen entfernen und den Prüfstand anzeigen."""
    if korrektur.get("version") != 1:
        raise ValueError("Unbekanntes Korrekturformat")
    result = deepcopy(drills)
    by_id = {d["id"]: d for d in result}
    ids = [entry["id"] for entry in korrektur["karten"]]
    if len(ids) != len(set(ids)) or set(ids) != {
            "EX-016", "EX-022", "EX-023", "EX-028", "EX-040",
            "EX-062", "EX-064", "EX-066", "EX-068", "EX-075"}:
        raise ValueError("Ungültige Zuordnung unbelegter Abläufe")
    for entry in korrektur["karten"]:
        d = by_id[entry["id"]]
        if (d["ist_alias"] or d["titel"] != entry["titel"]
                or d["ablauf"] != entry["ablauf_vorher"]
                or d["evidenz"] != entry["evidenz_vorher"]
                or d["quelle"] != entry["quelle_vorher"]):
            raise ValueError(f"{entry['id']}: Kartentext geändert; erneut prüfen")
        d["ablauf"] = None
        d["evidenz"] = entry["pruefhinweis_de"]
        d["quelle"]["name"] = entry.get("quellen_name", d["quelle"]["name"])
        d["quelle"]["url"] = entry["quellen_url"]
        d["belege"].append({
            "redaktion": UNBELEGTE_ABLAEUFE.relative_to(ROOT).as_posix(),
            "stand": korrektur["stand"],
            "befund": entry["grund"],
            "vorheriger_ablauf": entry["ablauf_vorher"],
            "url": entry["quellen_url"],
        })
    return result


def metadatenkorrektur_anwenden(drills, korrektur):
    """Nach einer inhaltlichen Korrektur veraltete Kompetenzzuordnungen berichtigen."""
    if korrektur.get("version") != 1:
        raise ValueError("Unbekanntes Metadatenkorrekturformat")
    result = deepcopy(drills)
    by_id = {d["id"]: d for d in result}
    for entry in korrektur["karten"]:
        d = by_id[entry["id"]]
        if (d["titel"] != entry["titel"] or d["ist_alias"]
                or d["kompetenz"] != entry["kompetenz_vorher"]
                or not d["ablauf"].startswith(entry["ablauf_beginnt_mit"])):
            raise ValueError(f"{entry['id']}: Kompetenzkorrektur erneut prüfen")
        d["kompetenz"] = entry["kompetenz_neu"]
        d["belege"].append({
            "redaktion": METADATENKORREKTUR.relative_to(ROOT).as_posix(),
            "stand": korrektur["stand"], "befund": entry["grund"],
            "url": entry["quelle"],
        })
    return result


def nur_tabellenkarten(befunde_index, vorhandene):
    """IDs, die nur in Review-Tabellen auftauchen, aber keinen eigenen Abschnitt haben.

    Sie wegzulassen würde Aliasziele ins Leere zeigen lassen und die Abdeckung
    beschönigen; sie werden deshalb als Datensätze mit Tiefe 'nur_belege' geführt.
    """
    out = []
    for eid, befunde in sorted(befunde_index.items()):
        if eid in vorhandene:
            continue
        titel = aus_befunden(befunde, TITEL_KEYS) or eid
        out.append({
            "id": eid, "titel": titel, "abschnitt": None, "stil": "Tabellenzeile",
            "kontext_abschnitt": f"Review-Tabelle {befunde[0]['_tabelle']}",
            "felder": {}, "zusatztabellen": [], "fliesstext": [],
        })
    return out


def main():
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    aliases = alias_map()
    befunde_index = tabellenbefunde()
    quellen_index = quellenbelege()
    raw += nur_tabellenkarten(befunde_index, {r["id"] for r in raw})
    drills = [normalize(r, aliases, befunde_index, quellen_index) for r in raw]
    drills = redaktion_anwenden(
        drills, json.loads(REDAKTION.read_text(encoding="utf-8")),
        EXTRACTED.read_text(encoding="utf-8"))
    drills = recherchen_anwenden(drills)
    drills = ablaufplatzhalter_entfernen(
        drills, json.loads(ABLAUFPLATZHALTER.read_text(encoding="utf-8")))
    # Runde 12 ergänzt eine der zuvor bereinigten Karten erst nach der Korrektur.
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_12.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_12.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_12, belege_pfad=RECHERCHE_BELEGE_12)
    drills = unbelegte_ablaeufe_kennzeichnen(
        drills, json.loads(UNBELEGTE_ABLAEUFE.read_text(encoding="utf-8")))
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_13.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_13.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_13, belege_pfad=RECHERCHE_BELEGE_13)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_14.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_14.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_14, belege_pfad=RECHERCHE_BELEGE_14)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_15.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_15.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_15, belege_pfad=RECHERCHE_BELEGE_15)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_16.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_16.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_16, belege_pfad=RECHERCHE_BELEGE_16)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_17.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_17.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_17, belege_pfad=RECHERCHE_BELEGE_17)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_18.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_18.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_18, belege_pfad=RECHERCHE_BELEGE_18)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_19.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_19.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_19, belege_pfad=RECHERCHE_BELEGE_19)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_20.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_20.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_20, belege_pfad=RECHERCHE_BELEGE_20)
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_21.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_21.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_21, belege_pfad=RECHERCHE_BELEGE_21)
    drills = metadatenkorrektur_anwenden(
        drills, json.loads(METADATENKORREKTUR.read_text(encoding="utf-8")))
    drills = recherche_anwenden(
        drills, json.loads(RECHERCHE_22.read_text(encoding="utf-8")),
        json.loads(RECHERCHE_BELEGE_22.read_text(encoding="utf-8")),
        redaktion_pfad=RECHERCHE_22, belege_pfad=RECHERCHE_BELEGE_22)
    drills.sort(key=lambda d: d["id"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(drills, ensure_ascii=False, indent=1), encoding="utf-8")

    from collections import Counter
    tiefe = Counter(d["dokumentationstiefe"] for d in drills)
    print(f"normalisiert: {len(drills)}")
    print("Dokumentationstiefe:", dict(tiefe))
    print("Aliaskarten:", sum(1 for d in drills if d["ist_alias"]))
    print("publish-ready ausgewiesen:", sum(1 for d in drills if d["qa"]["publish_ready"]))
    print("ohne Kompetenzcode:", [d["id"] for d in drills if not d["kompetenz"]["alle"]])
    print("ohne Altersfenster:", [d["id"] for d in drills if d["alter"]["von"] is None])
    print(f"geschrieben: {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
