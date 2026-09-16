"""Normalisiert die Rohdatensätze auf ein Zielschema.

Vier Erfassungsgenerationen liegen im Katalog nebeneinander. Sie werden auf
ein gemeinsames Schema abgebildet, ohne Lücken zu füllen: was nicht
dokumentiert ist, bleibt null und wird über `dokumentationstiefe` sichtbar.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "docs" / "quellen" / "records-raw.json"
TABLES = ROOT / "docs" / "quellen" / "catalog-tables.json"
EXTRACTED = ROOT / "docs" / "quellen" / "catalog-extracted.txt"
OUT = ROOT / "data" / "drills.json"

CODE = re.compile(r"\b([TKS])([1-7])\b")
AGE = re.compile(r"U(\d{1,2})")
NUM = re.compile(r"(\d+(?:[.,]\d+)?)")


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
    nums = [int(n) for n in AGE.findall(value)]
    if not nums:
        return {"von": None, "bis": None, "roh": value.strip()}
    return {"von": min(nums), "bis": max(nums), "roh": value.strip()}


def span(value, unit_hint=None):
    """'6–8 min' -> {min:6, max:8, roh:...}; nicht auflösbar -> nur roh."""
    if not value:
        return {"min": None, "max": None, "roh": None}
    nums = [float(n.replace(",", ".")) for n in NUM.findall(value)]
    lo = hi = None
    if nums:
        lo, hi = min(nums), max(nums)
        lo = int(lo) if lo.is_integer() else lo
        hi = int(hi) if hi.is_integer() else hi
    return {"min": lo, "max": hi, "roh": value.strip()}


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
        "spielerzahl": span(g("Spielerzahl", "Spieler")),
        "raum": g("Raum", "Feld") if g("Raum", "Feld") != "Inhalt" else g("Raum"),
        "dauer_min": span(g("Dauer/Umfang", "Dauer / Umfang", "Dauer")),
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
