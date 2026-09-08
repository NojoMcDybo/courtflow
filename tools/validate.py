"""Prüfstand für data/drills.json und data/taxonomy.json.

Jede Regel hat einen Selbsttest gegen eine bekannt gute und eine bekannt
schlechte Eingabe. Eine Prüfung ohne Selbsttest besteht immer und ist damit
wertlos -- `--selbsttest` läuft deshalb vor jeder Datenprüfung.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRILLS = ROOT / "data" / "drills.json"
TAXONOMY = ROOT / "data" / "taxonomy.json"

ID_FORM = re.compile(r"^EX-\d{3}$")


def befund(regel, id_, text):
    return {"regel": regel, "id": id_, "text": text}


# --- Regeln -----------------------------------------------------------------

def r_id_form(drills, tax):
    return [befund("id-form", d["id"], "ID entspricht nicht EX-NNN")
            for d in drills if not ID_FORM.match(d["id"])]


def r_id_eindeutig(drills, tax):
    seen, out = set(), []
    for d in drills:
        if d["id"] in seen:
            out.append(befund("id-eindeutig", d["id"], "ID doppelt vergeben"))
        seen.add(d["id"])
    return out


def r_alias_ziel(drills, tax):
    ids = {d["id"] for d in drills}
    aliase = {d["id"] for d in drills if d["ist_alias"]}
    out = []
    for d in drills:
        if not d["ist_alias"]:
            continue
        ziel = d["kanonische_id"]
        if ziel not in ids:
            out.append(befund("alias-ziel", d["id"], f"kanonische ID {ziel} existiert nicht"))
        elif ziel in aliase:
            out.append(befund("alias-ziel", d["id"], f"{ziel} ist selbst ein Alias"))
        elif ziel == d["id"]:
            out.append(befund("alias-ziel", d["id"], "Alias zeigt auf sich selbst"))
    return out


def r_kompetenzcode(drills, tax):
    gueltig = {k["code"] for k in tax["kompetenzen"]}
    out = []
    for d in drills:
        for code in d["kompetenz"]["alle"]:
            if code not in gueltig:
                out.append(befund("kompetenzcode", d["id"], f"unbekannter Code {code}"))
    return out


def r_altersfenster(drills, tax):
    out = []
    for d in drills:
        von, bis = d["alter"]["von"], d["alter"]["bis"]
        if von is None:
            continue
        if von > bis:
            out.append(befund("altersfenster", d["id"], f"von {von} > bis {bis}"))
        if not (6 <= von <= 18 and 6 <= bis <= 18):
            out.append(befund("altersfenster", d["id"], f"U{von}–U{bis} ausserhalb U6–U18"))
    return out


def r_skalenbereich(drills, tax):
    grenzen = {}
    for m in tax["merkmalsregister"]:
        key = m["merkmal"].lower()
        if m["min"] is not None:
            grenzen[key] = (m["min"], m["max"])
    zuordnung = {
        "entscheidung": "entscheidungsschwierigkeit",
        "gegnerdruck": "gegnerdruck",
        "technik": "technikschwierigkeit",
        "spielnaehe": "spielnähe",
        "zeitdruck": "zeitdruck",
        "raumdruck": "raumdruck",
        "wahrnehmung": "wahrnehmungsanforderung",
        "kooperation": "kooperationsgrad",
    }
    out = []
    for d in drills:
        for feld, wert in d["skalen"].items():
            if not wert or wert.get("wert") is None:
                continue
            lo, hi = grenzen.get(zuordnung.get(feld, ""), (None, None))
            if lo is None:
                continue
            if not (lo <= wert["wert"] <= hi):
                out.append(befund("skalenbereich", d["id"],
                                  f"{feld}={wert['wert']} ausserhalb {lo}–{hi}"))
    return out


def r_quelle_belegt(drills, tax):
    """Öffentliche Site: jede Karte muss ihre Herkunft nachweisen können."""
    return [befund("quelle-belegt", d["id"], "weder Quellenname noch URL")
            for d in drills if not d["quelle"]["name"] and not d["quelle"]["url"]]


def r_publish_ready_vollstaendig(drills, tax):
    """Was der Generator ausspielen darf, muss durchführbar beschrieben sein."""
    pflicht = ("lernziel", "ablauf")
    out = []
    for d in drills:
        if not d["qa"]["publish_ready"]:
            continue
        fehlend = [f for f in pflicht if not d[f]]
        if not d["alter"]["von"]:
            fehlend.append("alter")
        if not d["kompetenz"]["haupt"]:
            fehlend.append("kompetenz")
        if fehlend:
            out.append(befund("publish-ready", d["id"],
                              "publish-ready, aber ohne " + ", ".join(fehlend)))
    return out


def r_tiefe_deckt_felder(drills, tax):
    """'vollstaendig' darf nicht behaupten, was nicht dasteht."""
    out = []
    for d in drills:
        if d["dokumentationstiefe"] != "vollstaendig":
            continue
        for feld in ("lernziel", "ablauf", "coachingpunkte"):
            if not d[feld]:
                out.append(befund("tiefe", d["id"],
                                  f"als vollstaendig geführt, aber {feld} fehlt"))
    return out


REGELN = [r_id_form, r_id_eindeutig, r_alias_ziel, r_kompetenzcode, r_altersfenster,
          r_skalenbereich, r_quelle_belegt, r_publish_ready_vollstaendig,
          r_tiefe_deckt_felder]


# --- Selbsttest -------------------------------------------------------------

def karte(**kwargs):
    basis = {
        "id": "EX-001", "kanonische_id": "EX-001", "ist_alias": False,
        "titel": "T", "evidenz": None, "originaltitel": None, "lernziel": "L",
        "ablauf": "A", "coachingpunkte": "C", "typische_fehler": None,
        "kompetenz": {"haupt": "T1", "alle": ["T1"], "roh": "T1"},
        "alter": {"von": 8, "bis": 10, "roh": "U8–U10"},
        "empfohlene_stufe": None, "erfahrung": None,
        "spielerzahl": {"min": None, "max": None, "roh": None}, "raum": None,
        "dauer_min": {"min": 6, "max": 8, "roh": "6–8 min"}, "material": None,
        "regression": None, "progression": None, "methodik": None,
        "skalen": {k: None for k in ("entscheidung", "gegnerdruck", "technik",
                                     "spielnaehe", "zeitdruck", "raumdruck",
                                     "wahrnehmung", "kooperation")},
        "quelle": {"name": "Q", "url": "https://example.org", "video_status": None},
        "qa": {"stufe": None, "note": None, "pruefstatus": None, "scoreprofil": None,
               "bewertung": None, "redaktionsstatus": None, "publish_ready": True,
               "score": None},
        "dokumentationstiefe": "vollstaendig", "belege": [], "redaktionsnotiz": None,
        "herkunft": {},
    }
    basis.update(kwargs)
    return basis


TAX_TEST = {
    "kompetenzen": [{"code": "T1"}, {"code": "S4"}],
    "merkmalsregister": [{"merkmal": "Gegnerdruck", "min": 0, "max": 3},
                         {"merkmal": "Technikschwierigkeit", "min": 1, "max": 5}],
}

FAELLE = [
    (r_id_form, karte(), karte(id="EX-1")),
    (r_id_eindeutig, [karte(), karte(id="EX-002")], [karte(), karte()]),
    (r_alias_ziel,
     [karte(), karte(id="EX-002", ist_alias=True, kanonische_id="EX-001")],
     [karte(id="EX-002", ist_alias=True, kanonische_id="EX-999")]),
    (r_kompetenzcode, karte(), karte(kompetenz={"haupt": "T9", "alle": ["T9"], "roh": "T9"})),
    (r_altersfenster, karte(), karte(alter={"von": 14, "bis": 10, "roh": "x"})),
    (r_skalenbereich,
     karte(skalen={**karte()["skalen"], "gegnerdruck": {"wert": 2, "skala": 3, "roh": "2/3"}}),
     karte(skalen={**karte()["skalen"], "gegnerdruck": {"wert": 7, "skala": 3, "roh": "7/3"}})),
    (r_quelle_belegt, karte(),
     karte(quelle={"name": None, "url": None, "video_status": None})),
    (r_publish_ready_vollstaendig, karte(), karte(lernziel=None)),
    (r_tiefe_deckt_felder, karte(), karte(coachingpunkte=None)),
]


def selbsttest():
    fehler = []
    for regel, gut, schlecht in FAELLE:
        gut = gut if isinstance(gut, list) else [gut]
        schlecht = schlecht if isinstance(schlecht, list) else [schlecht]
        if regel(gut, TAX_TEST):
            fehler.append(f"{regel.__name__}: schlägt bei gültiger Eingabe an")
        if not regel(schlecht, TAX_TEST):
            fehler.append(f"{regel.__name__}: erkennt den bekannten Fehler nicht")
    getestet = {r.__name__ for r, _, _ in FAELLE}
    for regel in REGELN:
        if regel.__name__ not in getestet:
            fehler.append(f"{regel.__name__}: kein Selbsttest vorhanden")
    return fehler


# --- Abdeckung --------------------------------------------------------------

def abdeckung(drills, tax):
    codes = [k["code"] for k in tax["kompetenzen"]]
    stufen = [8, 10, 12, 14, 16, 18]
    matrix = {c: {f"U{s}": 0 for s in stufen} for c in codes}
    for d in drills:
        von, bis = d["alter"]["von"], d["alter"]["bis"]
        if von is None:
            continue
        for code in d["kompetenz"]["alle"]:
            if code not in matrix:
                continue
            for s in stufen:
                if von <= s <= bis:
                    matrix[code][f"U{s}"] += 1
    return matrix


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--matrix", action="store_true", help="Abdeckungsmatrix ausgeben")
    args = ap.parse_args()

    fehler = selbsttest()
    print(f"Selbsttest: {len(FAELLE)} Regeln geprüft, {len(fehler)} Probleme")
    for f in fehler:
        print(f"  ! {f}")
    if fehler:
        sys.exit(2)

    drills = json.loads(DRILLS.read_text(encoding="utf-8"))
    tax = json.loads(TAXONOMY.read_text(encoding="utf-8"))

    befunde = []
    for regel in REGELN:
        befunde += regel(drills, tax)

    print(f"\nDatensätze: {len(drills)}   Befunde: {len(befunde)}")
    nach_regel = {}
    for b in befunde:
        nach_regel.setdefault(b["regel"], []).append(b)
    for regel, items in sorted(nach_regel.items()):
        print(f"\n[{regel}] {len(items)}")
        for b in items[:12]:
            print(f"   {b['id']}: {b['text']}")
        if len(items) > 12:
            print(f"   ... {len(items) - 12} weitere")

    if args.matrix:
        print("\nAbdeckung Kompetenz × Altersstufe")
        matrix = abdeckung(drills, tax)
        stufen = ["U8", "U10", "U12", "U14", "U16", "U18"]
        print("      " + "".join(s.rjust(6) for s in stufen))
        for code, row in matrix.items():
            zellen = "".join((str(row[s]) if row[s] else "·").rjust(6) for s in stufen)
            print(f"{code:<6}{zellen}")
        leer = [c for c, r in matrix.items() if sum(r.values()) == 0]
        if leer:
            print(f"\nohne jede Karte: {', '.join(leer)}")

    sys.exit(1 if befunde else 0)


if __name__ == "__main__":
    main()
