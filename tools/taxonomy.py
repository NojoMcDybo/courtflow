"""Baut data/taxonomy.json aus den Modelltabellen des Katalogs.

Tabellen werden über ihre Kopfzeilensignatur gesucht, nicht über feste
Indizes -- ein Katalog-Update verschiebt sonst stillschweigend alles.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLES = ROOT / "docs" / "quellen" / "catalog-tables.json"
OUT = ROOT / "data" / "taxonomy.json"

FAMILIEN = {"T": "Technik", "K": "Koordination", "S": "Spielfähigkeit / Taktik"}


def load():
    return json.loads(TABLES.read_text(encoding="utf-8"))


def finde(tables, *kopf):
    """Erste Tabelle, deren Kopfzeile mit den angegebenen Spalten beginnt."""
    ziel = [k.lower() for k in kopf]
    for table in tables:
        if not table or not table[0]:
            continue
        header = [str(c).strip().lower() for c in table[0]]
        if header[: len(ziel)] == ziel:
            return table
    return None


def kompetenzen(tables):
    quelle = finde(tables, "code", "kompetenz", "quellenorganisationen")
    deckung = finde(tables, "code", "kompetenz", "n")
    progression = finde(tables, "kompetenz", "u8 – grundlagen")

    prog = {}
    if progression:
        for row in progression[1:]:
            m = re.match(r"([TKS][1-7])\s+(.*)", row[0].strip())
            if m:
                prog[m.group(1)] = {
                    "U8": row[1] if len(row) > 1 else None,
                    "U10": row[2] if len(row) > 2 else None,
                    "U12": row[3] if len(row) > 3 else None,
                }

    stand = {}
    if deckung:
        for row in deckung[1:]:
            code = row[0].strip()
            if re.fullmatch(r"[TKS][1-7]", code):
                stand[code] = {
                    "karten_im_katalog": int(row[2]) if len(row) > 2 and row[2].isdigit() else None,
                    "bewertung_katalog": row[-1] if len(row) > 3 else None,
                }

    out = []
    if quelle:
        for row in quelle[1:]:
            code = row[0].strip()
            if not re.fullmatch(r"[TKS][1-7]", code):
                continue
            out.append({
                "code": code,
                "familie": FAMILIEN[code[0]],
                "name": row[1].strip() if len(row) > 1 else None,
                "quellenorganisationen": [
                    s.strip() for s in re.split(r"[,;]", row[2]) if s.strip()
                ] if len(row) > 2 else [],
                "altersprogression": prog.get(code),
                **stand.get(code, {}),
            })
    return out


def skalen(tables):
    table = finde(tables, "dimension", "skala 0–5")
    if not table:
        return {}
    out = {}
    for row in table[1:]:
        if len(row) < 3:
            continue
        dim = row[0].strip()
        out.setdefault(dim, {"name": dim, "min": 0, "max": 5, "stufen": {}})
        out[dim]["stufen"][row[1].strip()] = row[2].strip()
    return list(out.values())


def merkmalsregister(tables):
    """Welche Merkmale mit welcher Skala erfasst werden -- die verbindliche Liste."""
    out = []
    tab = finde(tables, "merkmal", "skala / ausprägungen", "verwendung")
    if tab:
        for r in tab[1:]:
            if len(r) >= 3 and r[0].strip():
                lo, hi = None, None
                m = re.search(r"(\d+)\s*[–-]\s*(\d+)", r[1])
                if m:
                    lo, hi = int(m.group(1)), int(m.group(2))
                out.append({"merkmal": r[0].strip(), "skala_roh": r[1].strip(),
                            "min": lo, "max": hi, "leitfrage": r[2].strip()})
    tab = finde(tables, "dimension", "niedrige anforderung", "hohe anforderung")
    if tab:
        bekannt = {e["merkmal"].lower() for e in out}
        for r in tab[1:]:
            if len(r) >= 4 and r[0].strip() and r[0].strip().lower() not in bekannt:
                m = re.search(r"(\d+)\s*[–-]\s*(\d+)", r[3])
                out.append({"merkmal": r[0].strip(), "skala_roh": r[3].strip(),
                            "min": int(m.group(1)) if m else None,
                            "max": int(m.group(2)) if m else None,
                            "leitfrage": f"{r[1].strip()} → {r[2].strip()}"})
    return out


def statusleiter(tables):
    table = finde(tables, "status", "bedeutung", "voraussetzung")
    if not table:
        return []
    return [
        {"stufe": r[0].split("–")[0].strip(), "bezeichnung": r[0], "bedeutung": r[1],
         "voraussetzung": r[2]}
        for r in table[1:] if len(r) >= 3
    ]


def quellenregister(tables):
    table = finde(tables, "id", "quelle", "inhaltlicher nutzen")
    if not table:
        return []
    return [
        {"sigel": r[0].strip(), "name": r[1].strip(), "nutzen": r[2].strip(),
         "url": r[3].strip() if len(r) > 3 else None,
         "typ": r[4].strip() if len(r) > 4 else None}
        for r in table[1:] if r and r[0].strip().startswith("Q")
    ]


def aliase(tables):
    table = finde(tables, "alias-id", "canonical_id")
    if not table:
        return {}
    return {r[0].strip(): r[1].strip() for r in table[1:] if len(r) >= 2}


def altersstufen():
    return [{"code": f"U{n}", "alter_bis": n} for n in (8, 10, 12, 14, 16, 18)]


def main():
    tables = load()
    data = {
        "quelle": "Jugendbasketball_Kompetenzkatalog_v3_8_final.docx",
        "katalogversion": "3.8",
        "altersstufen": altersstufen(),
        "kompetenzen": kompetenzen(tables),
        "belastungsskalen": skalen(tables),
        "merkmalsregister": merkmalsregister(tables),
        "statusleiter": statusleiter(tables),
        "quellenregister": quellenregister(tables),
        "aliase": aliase(tables),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Kompetenzen: {len(data['kompetenzen'])}")
    print(f"Belastungsskalen: {len(data['belastungsskalen'])}")
    print(f"Merkmalsregister: {len(data['merkmalsregister'])}")
    print(f"Statusleiter: {len(data['statusleiter'])}")
    print(f"Quellenregister: {len(data['quellenregister'])}")
    print(f"Aliase: {len(data['aliase'])}")
    print(f"geschrieben: {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
