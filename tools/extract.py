"""Extraktion der Übungsdatensätze aus dem Kompetenzkatalog (DOCX).

Reproduzierbar: liest ausschliesslich die Primärquelle unter docs/quellen/
und schreibt Rohdatensätze nach docs/quellen/records-raw.json.
Keine Interpretation, keine Feldumbenennung -- das macht normalize.py.
"""
import json
import re
import sys
from pathlib import Path

import docx
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "quellen" / "Jugendbasketball_Kompetenzkatalog_v3_8_final.docx"
OUT = ROOT / "docs" / "quellen" / "records-raw.json"

EX_HEADING = re.compile(r"^(?:(\d+(?:\.\d+)*)\s+)?(EX-\d{3})\s*[–—-]\s*(.+)$")
SECTION_HEADING = re.compile(r"^(\d+(?:\.\d+)*)\s+(.+)$")


def iter_body(document):
    """Absätze und Tabellen in Dokumentreihenfolge."""
    body = document.element.body
    for child in body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(child, document)
        elif child.tag.endswith("}tbl"):
            yield Table(child, document)


def table_rows(table):
    rows = []
    for row in table.rows:
        cells = []
        seen = set()
        for cell in row.cells:
            if id(cell._tc) in seen:  # horizontal gemergte Zellen nicht doppeln
                continue
            seen.add(id(cell._tc))
            cells.append("\n".join(p.text.strip() for p in cell.paragraphs).strip())
        rows.append(cells)
    return rows


def as_fields(rows):
    """Zweispaltige Tabelle -> Feldwörterbuch. Sonst None."""
    if not rows or any(len(r) != 2 for r in rows):
        return None
    fields = {}
    for key, value in rows:
        key = key.strip()
        if not key:
            continue
        if key in fields and fields[key] != value:
            fields[key] += "\n" + value
        else:
            fields[key] = value.strip()
    return fields


def main():
    if not SRC.exists():
        sys.exit(f"Quelle fehlt: {SRC}")
    document = docx.Document(str(SRC))

    records = []
    current = None
    section = None

    for item in iter_body(document):
        if isinstance(item, Paragraph):
            text = item.text.strip()
            if not text:
                continue
            match = EX_HEADING.match(text)
            if match:
                current = {
                    "id": match.group(2),
                    "titel": match.group(3).strip(),
                    "abschnitt": match.group(1),
                    "stil": item.style.name,
                    "kontext_abschnitt": section,
                    "felder": {},
                    "zusatztabellen": [],
                    "fliesstext": [],
                }
                records.append(current)
                continue
            heading = SECTION_HEADING.match(text)
            if heading and item.style.name.startswith("Heading"):
                section = text
                current = None  # Datensatz endet an der nächsten Überschrift
                continue
            if current is not None:
                current["fliesstext"].append(text)
        else:
            if current is None:
                continue
            rows = table_rows(item)
            fields = as_fields(rows)
            if fields and not current["felder"]:
                current["felder"] = fields
            elif fields:
                for key, value in fields.items():
                    current["felder"].setdefault(key, value)
            else:
                current["zusatztabellen"].append(rows)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")

    with_fields = [r for r in records if r["felder"]]
    print(f"Datensätze gefunden: {len(records)}")
    print(f"davon mit Feldtabelle: {len(with_fields)}")
    print(f"eindeutige IDs: {len({r['id'] for r in records})}")
    print(f"geschrieben: {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
