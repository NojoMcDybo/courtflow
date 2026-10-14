"""Belegbindung, Schutz unveränderter Metadaten und reproduzierbare Redaktion."""
import json
import unittest
from copy import deepcopy

import normalize


class RedaktionTests(unittest.TestCase):
    def setUp(self):
        self.drill = {"id": "EX-900", "titel": "Test", "ist_alias": False,
                      "ablauf": None, "evidenz": "Unveränderte Evidenz",
                      "qa": {"publish_ready": None}, "belege": []}
        self.beleg = "EX-900: Zwei Spieler passen sich den Ball zu."
        self.edit = {"version": 1, "stand": "2026-10-01", "karten": [{
            "id": "EX-900", "titel": "Test",
            "beleg": {"datei": "docs/quellen/catalog-extracted.txt", "text": self.beleg},
            "felder": {"ablauf": {"vorher": None,
                                  "de": "Zu zweit hin und her passen.",
                                  "en": "Pass back and forth in pairs."}},
        }]}

    def apply(self):
        return normalize.redaktion_anwenden([self.drill], self.edit, self.beleg)

    def test_verified_edit_preserves_source_and_qa_without_mutating_input(self):
        original = deepcopy(self.drill)
        result = self.apply()[0]
        self.assertEqual(result["ablauf"], "Zu zweit hin und her passen.")
        self.assertEqual(result["evidenz"], original["evidenz"])
        self.assertEqual(result["qa"], original["qa"])
        self.assertEqual(result["belege"][0]["katalogbeleg"], self.beleg)
        self.assertEqual(self.drill, original)

    def test_missing_source_or_changed_source_field_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Katalogbeleg"):
            normalize.redaktion_anwenden([self.drill], self.edit, "Anderer Beleg")
        self.drill["ablauf"] = "Eine neuere Anleitung."
        with self.assertRaisesRegex(ValueError, "Quelldaten geändert"):
            self.apply()

    def test_existing_evidence_from_another_card_is_rejected(self):
        other = "EX-901: Zwei Spieler werfen auf den Korb."
        self.edit["karten"][0]["beleg"]["text"] = other
        with self.assertRaisesRegex(ValueError, "gehört nicht zu dieser Karte"):
            normalize.redaktion_anwenden([self.drill], self.edit, self.beleg + "\n" + other)

    def test_shared_id_prefix_and_exact_title_are_bound_to_their_cards(self):
        shared = "EX-138/139: Zwei getrennte Aufgaben."
        for eid in ("EX-138", "EX-139"):
            self.assertTrue(normalize.beleg_passt_zur_karte(shared, eid, "Test"))
        self.assertFalse(normalize.beleg_passt_zur_karte(shared + " Vgl. EX-900.", "EX-900", "Test"))
        title = 'Jr. NBA Rookie Practice 7 dokumentiert das „Test“: Zwei Spieler passen.'
        self.assertTrue(normalize.beleg_passt_zur_karte(title, "EX-900", "Test"))
        self.assertFalse(normalize.beleg_passt_zur_karte(title, "EX-901", "Andere Übung"))
        self.assertFalse(normalize.beleg_passt_zur_karte('Eine Notiz erwähnt „Test“.', "EX-900", "Test"))

    def test_alias_wrong_title_and_duplicate_id_are_rejected(self):
        self.drill["ist_alias"] = True
        with self.assertRaisesRegex(ValueError, "Kartenzuordnung"):
            self.apply()
        self.drill["ist_alias"] = False
        self.drill["titel"] = "Andere Übung"
        with self.assertRaisesRegex(ValueError, "Kartenzuordnung"):
            self.apply()
        self.drill["titel"] = "Test"
        self.edit["karten"].append(deepcopy(self.edit["karten"][0]))
        with self.assertRaisesRegex(ValueError, "Kartenzuordnung"):
            self.apply()

    def test_protected_fields_and_missing_translation_are_rejected(self):
        self.edit["karten"][0]["felder"]["qa"] = {"vorher": None, "de": "x", "en": "x"}
        with self.assertRaisesRegex(ValueError, "Feldauswahl"):
            self.apply()
        del self.edit["karten"][0]["felder"]["qa"]
        self.edit["karten"][0]["felder"]["ablauf"]["en"] = " "
        with self.assertRaisesRegex(ValueError, "Text fehlt"):
            self.apply()

    def test_real_catalog_edits_reproduce_data_and_have_translations(self):
        read = lambda path: json.loads(path.read_text(encoding="utf-8"))
        raw = read(normalize.RAW)
        befunde = normalize.tabellenbefunde()
        raw += normalize.nur_tabellenkarten(befunde, {r["id"] for r in raw})
        aliases, quellen = normalize.alias_map(), normalize.quellenbelege()
        base = [normalize.normalize(r, aliases, befunde, quellen) for r in raw]
        editorial = read(normalize.REDAKTION)
        result = normalize.redaktion_anwenden(
            base, editorial, normalize.EXTRACTED.read_text(encoding="utf-8"))
        researched = normalize.recherchen_anwenden(result)
        corrected = normalize.ablaufplatzhalter_entfernen(
            researched, read(normalize.ABLAUFPLATZHALTER))
        final = normalize.recherche_anwenden(
            corrected, read(normalize.RECHERCHE_12), read(normalize.RECHERCHE_BELEGE_12),
            redaktion_pfad=normalize.RECHERCHE_12,
            belege_pfad=normalize.RECHERCHE_BELEGE_12)
        unbelegt = read(normalize.UNBELEGTE_ABLAEUFE)
        final = normalize.unbelegte_ablaeufe_kennzeichnen(final, unbelegt)
        round13 = read(normalize.RECHERCHE_13)
        final = normalize.recherche_anwenden(
            final, round13, read(normalize.RECHERCHE_BELEGE_13),
            redaktion_pfad=normalize.RECHERCHE_13,
            belege_pfad=normalize.RECHERCHE_BELEGE_13)
        round14 = read(normalize.RECHERCHE_14)
        final = normalize.recherche_anwenden(
            final, round14, read(normalize.RECHERCHE_BELEGE_14),
            redaktion_pfad=normalize.RECHERCHE_14,
            belege_pfad=normalize.RECHERCHE_BELEGE_14)
        round15 = read(normalize.RECHERCHE_15)
        final = normalize.recherche_anwenden(
            final, round15, read(normalize.RECHERCHE_BELEGE_15),
            redaktion_pfad=normalize.RECHERCHE_15,
            belege_pfad=normalize.RECHERCHE_BELEGE_15)
        round16 = read(normalize.RECHERCHE_16)
        final = normalize.recherche_anwenden(
            final, round16, read(normalize.RECHERCHE_BELEGE_16),
            redaktion_pfad=normalize.RECHERCHE_16,
            belege_pfad=normalize.RECHERCHE_BELEGE_16)
        round17 = read(normalize.RECHERCHE_17)
        final = normalize.recherche_anwenden(
            final, round17, read(normalize.RECHERCHE_BELEGE_17),
            redaktion_pfad=normalize.RECHERCHE_17,
            belege_pfad=normalize.RECHERCHE_BELEGE_17)
        round18 = read(normalize.RECHERCHE_18)
        final = normalize.recherche_anwenden(
            final, round18, read(normalize.RECHERCHE_BELEGE_18),
            redaktion_pfad=normalize.RECHERCHE_18,
            belege_pfad=normalize.RECHERCHE_BELEGE_18)
        round19 = read(normalize.RECHERCHE_19)
        final = normalize.recherche_anwenden(
            final, round19, read(normalize.RECHERCHE_BELEGE_19),
            redaktion_pfad=normalize.RECHERCHE_19,
            belege_pfad=normalize.RECHERCHE_BELEGE_19)
        round20 = read(normalize.RECHERCHE_20)
        final = normalize.recherche_anwenden(
            final, round20, read(normalize.RECHERCHE_BELEGE_20),
            redaktion_pfad=normalize.RECHERCHE_20,
            belege_pfad=normalize.RECHERCHE_BELEGE_20)
        round21 = read(normalize.RECHERCHE_21)
        final = normalize.recherche_anwenden(
            final, round21, read(normalize.RECHERCHE_BELEGE_21),
            redaktion_pfad=normalize.RECHERCHE_21,
            belege_pfad=normalize.RECHERCHE_BELEGE_21)
        final = normalize.metadatenkorrektur_anwenden(
            final, read(normalize.METADATENKORREKTUR))
        round22 = read(normalize.RECHERCHE_22)
        final = normalize.recherche_anwenden(
            final, round22, read(normalize.RECHERCHE_BELEGE_22),
            redaktion_pfad=normalize.RECHERCHE_22,
            belege_pfad=normalize.RECHERCHE_BELEGE_22)
        self.assertEqual(sorted(final, key=lambda d: d["id"]), read(normalize.OUT))
        self.assertTrue(all(next(d for d in corrected if d["id"] == f"EX-{number:03}")["ablauf"] is None
                            for number in range(62, 69)))
        self.assertIsNotNone(next(d for d in final if d["id"] == "EX-067")["ablauf"])
        by_id = {d["id"]: d for d in result}
        for d in base:
            for key in ("evidenz", "alter", "kompetenz", "qa", "quelle", "dokumentationstiefe"):
                self.assertEqual(d[key], by_id[d["id"]][key], (d["id"], key))
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        for entry in editorial["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in read(normalize.RECHERCHE_12)["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round13["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round14["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round15["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round16["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round17["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round18["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round19["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round20["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round21["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in round22["karten"]:
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        for entry in unbelegt["karten"]:
            card = next(d for d in final if d["id"] == entry["id"])
            if entry["id"] not in {x["id"] for x in round21["karten"]}:
                self.assertIsNone(card["ablauf"])
            self.assertEqual(card["evidenz"], entry["pruefhinweis_de"])
            if entry["id"] not in {x["id"] for x in round21["karten"]}:
                self.assertEqual(card["quelle"]["url"], entry["quellen_url"])
            self.assertEqual(translations[entry["pruefhinweis_de"]], entry["pruefhinweis_en"])
        self.assertEqual(by_id["EX-153"]["dauer_min"]["min"], 4)
        self.assertEqual(by_id["EX-158"]["spielerzahl"]["min"], 5)
        self.assertIsNone(by_id["EX-153"]["alter"]["von"])
        by_final = {d["id"]: d for d in final}
        self.assertEqual(by_final["EX-106"]["alter"]["von"], 10)
        self.assertIsNotNone(by_final["EX-106"]["ablauf"])
        self.assertIsNotNone(by_final["EX-107"]["ablauf"])
        self.assertEqual(by_final["EX-098"]["kompetenz"]["alle"],
                         ["K2", "K5", "K6", "T1", "T3"])


class RechercheTests(unittest.TestCase):
    def setUp(self):
        read = lambda path: json.loads(path.read_text(encoding="utf-8"))
        raw = read(normalize.RAW)
        befunde = normalize.tabellenbefunde()
        raw += normalize.nur_tabellenkarten(befunde, {r["id"] for r in raw})
        aliases, quellen = normalize.alias_map(), normalize.quellenbelege()
        self.base = [normalize.normalize(r, aliases, befunde, quellen) for r in raw]
        self.edits = read(normalize.RECHERCHE)
        self.sources = read(normalize.RECHERCHE_BELEGE)

    def apply(self):
        return normalize.recherche_anwenden(self.base, self.edits, self.sources)

    def test_research_preserves_unedited_records_metadata_and_original_evidence(self):
        original = deepcopy(self.base)
        result = {d["id"]: d for d in self.apply()}
        entries = {e["id"]: e for e in self.edits["karten"]}
        for d in self.base:
            after = result[d["id"]]
            if d["id"] not in entries:
                self.assertEqual(d, after)
                continue
            allowed = set(entries[d["id"]]["felder"]) | {"quelle", "belege"}
            for key in d.keys() - allowed:
                self.assertEqual(d[key], after[key], (d["id"], key))
            self.assertEqual(after["belege"][:-1], d["belege"])
            self.assertEqual(after["quelle"]["video_status"], d["quelle"]["video_status"])
        self.assertEqual(self.base, original)
        self.assertEqual(result["EX-013"]["dauer_min"]["min"], 1)
        self.assertEqual(result["EX-014"]["dauer_min"]["min"], 4)
        self.assertIsNone(result["EX-015"]["dauer_min"]["min"])
        self.assertIsNone(result["EX-038"]["spielerzahl"]["min"])
        translations = json.loads((normalize.ROOT / "src/locales/drills.en.json").read_text(encoding="utf-8"))
        for entry in entries.values():
            for text in entry["felder"].values():
                self.assertEqual(translations[text["de"]], text["en"])

    def test_cross_card_or_unknown_source_and_unverified_fields_are_rejected(self):
        for source_id in (self.edits["karten"][1]["beleg_id"], "missing"):
            with self.subTest(source_id=source_id):
                edits = deepcopy(self.edits)
                edits["karten"][0]["beleg_id"] = source_id
                with self.assertRaisesRegex(ValueError, "Recherchebeleg"):
                    normalize.recherche_anwenden(self.base, edits, self.sources)
        self.sources["belege"][0]["felder"].remove("ablauf")
        with self.assertRaisesRegex(ValueError, "Recherchebeleg"):
            self.apply()

    def test_changed_title_alias_and_duplicate_card_are_rejected(self):
        for key, value in (("titel", "Andere Karte"), ("ist_alias", True)):
            base = deepcopy(self.base)
            next(d for d in base if d["id"] == "EX-013")[key] = value
            with self.assertRaisesRegex(ValueError, "Kartenzuordnung"):
                normalize.recherche_anwenden(base, self.edits, self.sources)
        self.edits["karten"].append(deepcopy(self.edits["karten"][0]))
        with self.assertRaisesRegex(ValueError, "Kartenzuordnung"):
            self.apply()

    def test_changed_source_metadata_or_content_is_rejected(self):
        for key, value, message in (("quelle", {}, "Quellenzuordnung"), ("ablauf", "Neu", "Quelldaten")):
            base = deepcopy(self.base)
            next(d for d in base if d["id"] == "EX-013")[key] = value
            with self.assertRaisesRegex(ValueError, message):
                normalize.recherche_anwenden(base, self.edits, self.sources)

    def test_invalid_or_duplicate_source_registry_is_rejected(self):
        source = self.sources["belege"][0]
        for key, value in (("url", "javascript:alert(1)"), ("url", "https://example.org/"), ("abschnitt", "")):
            sources = deepcopy(self.sources)
            sources["belege"][0][key] = value
            with self.assertRaisesRegex(ValueError, "Primärquellenangabe"):
                normalize.recherche_anwenden(self.base, self.edits, sources)
        self.sources["belege"].append(deepcopy(source))
        with self.assertRaisesRegex(ValueError, "Doppelte"):
            self.apply()


class RechercheRundeDreiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        read = lambda path: json.loads(path.read_text(encoding="utf-8"))
        raw = read(normalize.RAW)
        befunde = normalize.tabellenbefunde()
        raw += normalize.nur_tabellenkarten(befunde, {r["id"] for r in raw})
        aliases, quellen = normalize.alias_map(), normalize.quellenbelege()
        base = [normalize.normalize(r, aliases, befunde, quellen) for r in raw]
        base = normalize.redaktion_anwenden(base, read(normalize.REDAKTION),
                                            normalize.EXTRACTED.read_text(encoding="utf-8"))
        cls.base = normalize.recherche_anwenden(base, read(normalize.RECHERCHE),
                                              read(normalize.RECHERCHE_BELEGE))
        cls.edits = read(normalize.RECHERCHE_03)
        cls.sources = read(normalize.RECHERCHE_BELEGE_03)

    def test_third_round_preserves_prior_work_and_uses_its_own_provenance(self):
        original = deepcopy(self.base)
        result = {d["id"]: d for d in normalize.recherche_anwenden(
                self.base, self.edits, self.sources,
                redaktion_pfad=normalize.RECHERCHE_03,
                belege_pfad=normalize.RECHERCHE_BELEGE_03)}
        changed = {d["id"] for d in self.base if d != result[d["id"]]}
        self.assertEqual(changed, {"EX-004", "EX-005", "EX-030", "EX-032", "EX-033",
                                   "EX-035", "EX-041", "EX-073", "EX-074", "EX-076"})
        entries = {e["id"]: e for e in self.edits["karten"]}
        translations = json.loads((normalize.ROOT / "src/locales/drills.en.json").read_text(encoding="utf-8"))
        for before in self.base:
            after = result[before["id"]]
            if before["id"] not in changed:
                self.assertEqual(before, after)
                continue
            permitted = set(entries[before["id"]]["felder"]) | {"quelle", "belege"}
            for key in before.keys() - permitted:
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertEqual(before["belege"], after["belege"][:-1])
            self.assertEqual(after["belege"][-1]["redaktion"], "docs/redaktion/karten-runde-03.json")
            self.assertEqual(after["belege"][-1]["recherche"], "docs/quellen/karten-recherche-runde-03.json")
            self.assertEqual(before["quelle"]["video_status"], after["quelle"]["video_status"])
            for value in entries[before["id"]]["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(self.base, original)
        self.assertEqual(result["EX-073"]["spielerzahl"]["min"], 4)
        self.assertIsNone(result["EX-073"]["spielerzahl"]["max"])
        self.assertEqual(result["EX-076"]["dauer_min"]["min"], 3)
        for eid in ("EX-005", "EX-032", "EX-033", "EX-035"):
            self.assertIsNone(result[eid]["dauer_min"]["min"])

    def test_only_exact_official_practice_routes_are_accepted(self):
        for invalid in ("https://jr.nba.com/basketball-practice-plans/starter/page/13/",
                        "https://jr.nba.com/basketball-practice-plans/rookie/unverified/",
                        "https://jr.nba.com/basketball-practice-plans/starter/?source=other"):
            sources = deepcopy(self.sources)
            sources["belege"][0]["url"] = invalid
            with self.subTest(url=invalid), self.assertRaisesRegex(ValueError, "Primärquellenangabe"):
                normalize.recherche_anwenden(self.base, self.edits, sources)


class RechercheRundeVierTests(unittest.TestCase):
    def test_fourth_round_preserves_metadata_and_non_time_quantities(self):
        RechercheRundeDreiTests.setUpClass()
        prior = RechercheRundeDreiTests
        base = normalize.recherche_anwenden(
            prior.base, prior.edits, prior.sources,
            redaktion_pfad=normalize.RECHERCHE_03,
            belege_pfad=normalize.RECHERCHE_BELEGE_03)
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        edits = read(normalize.RECHERCHE_04)
        entries = {e["id"]: e for e in edits["karten"]}
        original = deepcopy(base)
        result = {d["id"]: d for d in normalize.recherche_anwenden(
            base, edits, read(normalize.RECHERCHE_BELEGE_04),
            redaktion_pfad=normalize.RECHERCHE_04,
            belege_pfad=normalize.RECHERCHE_BELEGE_04)}
        changed = {d["id"] for d in base if d != result[d["id"]]}
        self.assertEqual(changed, {"EX-010", "EX-025", "EX-026", "EX-048"})
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        for before in base:
            after = result[before["id"]]
            if before["id"] not in changed:
                self.assertEqual(before, after)
                continue
            permitted = set(entries[before["id"]]["felder"]) | {"quelle", "belege"}
            for key in before.keys() - permitted:
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertEqual(before["belege"], after["belege"][:-1])
            self.assertEqual(after["belege"][-1]["redaktion"], "docs/redaktion/karten-runde-04.json")
            self.assertEqual(after["belege"][-1]["recherche"], "docs/quellen/karten-recherche-runde-04.json")
            self.assertEqual(before["quelle"]["video_status"], after["quelle"]["video_status"])
            for value in entries[before["id"]]["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(base, original)
        self.assertIsNone(result["EX-010"]["dauer_min"]["min"])
        self.assertIsNone(result["EX-025"]["dauer_min"]["min"])
        self.assertEqual(result["EX-026"]["dauer_min"]["min"], 1)
        self.assertEqual(result["EX-048"]["spielerzahl"]["min"], 2)
        self.assertIsNone(result["EX-048"]["spielerzahl"]["max"])


class RechercheRundeFuenfTests(unittest.TestCase):
    def test_fiba_activities_remain_card_bound_and_preserve_prior_records(self):
        RechercheRundeDreiTests.setUpClass()
        prior = RechercheRundeDreiTests
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        base = normalize.recherche_anwenden(
            prior.base, prior.edits, prior.sources,
            redaktion_pfad=normalize.RECHERCHE_03,
            belege_pfad=normalize.RECHERCHE_BELEGE_03)
        base = normalize.recherche_anwenden(
            base, read(normalize.RECHERCHE_04), read(normalize.RECHERCHE_BELEGE_04),
            redaktion_pfad=normalize.RECHERCHE_04,
            belege_pfad=normalize.RECHERCHE_BELEGE_04)
        edits, sources = read(normalize.RECHERCHE_05), read(normalize.RECHERCHE_BELEGE_05)
        result = {d["id"]: d for d in normalize.recherche_anwenden(
            base, edits, sources, redaktion_pfad=normalize.RECHERCHE_05,
            belege_pfad=normalize.RECHERCHE_BELEGE_05)}
        entries = {e["id"]: e for e in edits["karten"]}
        changed = {d["id"] for d in base if d != result[d["id"]]}
        self.assertEqual(changed, {"EX-049", "EX-050", "EX-051", "EX-052"})
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        for before in base:
            after = result[before["id"]]
            if before["id"] not in changed:
                self.assertEqual(before, after)
                continue
            allowed = set(entries[before["id"]]["felder"]) | {"quelle", "belege"}
            for key in before.keys() - allowed:
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertEqual(before["belege"], after["belege"][:-1])
            self.assertEqual(after["belege"][-1]["redaktion"], "docs/redaktion/karten-runde-05.json")
            self.assertEqual(after["belege"][-1]["recherche"], "docs/quellen/karten-recherche-runde-05.json")
            self.assertEqual(before["quelle"]["video_status"], after["quelle"]["video_status"])
            self.assertIsNone(after["dauer_min"]["min"])
            for value in entries[before["id"]]["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(result["EX-050"]["spielerzahl"]["min"], 2)
        self.assertEqual(result["EX-051"]["spielerzahl"]["max"], 2)
        bad = deepcopy(sources)
        bad["belege"][0]["url"] = "https://assets.fiba.basketball/other.pdf"
        with self.assertRaisesRegex(ValueError, "Primärquellenangabe"):
            normalize.recherche_anwenden(base, edits, bad)


class RechercheRundeSechsTests(unittest.TestCase):
    def test_original_drills_and_revised_source_keep_catalog_evidence(self):
        RechercheRundeDreiTests.setUpClass()
        prior = RechercheRundeDreiTests
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        base = normalize.recherche_anwenden(
            prior.base, prior.edits, prior.sources,
            redaktion_pfad=normalize.RECHERCHE_03,
            belege_pfad=normalize.RECHERCHE_BELEGE_03)
        for redaktion, belege in ((normalize.RECHERCHE_04, normalize.RECHERCHE_BELEGE_04),
                                  (normalize.RECHERCHE_05, normalize.RECHERCHE_BELEGE_05)):
            base = normalize.recherche_anwenden(
                base, read(redaktion), read(belege),
                redaktion_pfad=redaktion, belege_pfad=belege)
        edits = read(normalize.RECHERCHE_06)
        entries = {e["id"]: e for e in edits["karten"]}
        result = {d["id"]: d for d in normalize.recherche_anwenden(
            base, edits, read(normalize.RECHERCHE_BELEGE_06),
            redaktion_pfad=normalize.RECHERCHE_06,
            belege_pfad=normalize.RECHERCHE_BELEGE_06)}
        self.assertEqual({d["id"] for d in base if d != result[d["id"]]},
                         {"EX-002", "EX-003", "EX-006", "EX-008", "EX-077"})
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        for before in base:
            after = result[before["id"]]
            if before["id"] not in entries:
                self.assertEqual(before, after)
                continue
            permitted = set(entries[before["id"]]["felder"]) | {"quelle", "belege"}
            for key in before.keys() - permitted:
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertEqual(before["evidenz"], after["evidenz"])
            self.assertEqual(before["belege"], after["belege"][:-1])
            self.assertEqual(after["belege"][-1]["recherche"],
                             "docs/quellen/karten-recherche-runde-06.json")
            for value in entries[before["id"]]["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(result["EX-006"]["dauer_min"]["min"], 6)
        for eid in ("EX-002", "EX-003", "EX-008", "EX-077"):
            self.assertIsNone(result[eid]["dauer_min"]["min"])
        self.assertEqual(result["EX-077"]["spielerzahl"]["min"], 4)
        self.assertIsNone(result["EX-077"]["spielerzahl"]["max"])
        self.assertIn("/rookie/page/7/", result["EX-077"]["quelle"]["url"])


class RechercheRundeSiebenTests(unittest.TestCase):
    def test_dbb_pdf_sources_do_not_turn_video_timecodes_into_duration(self):
        RechercheRundeDreiTests.setUpClass()
        prior = RechercheRundeDreiTests
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        base = normalize.recherche_anwenden(
            prior.base, prior.edits, prior.sources,
            redaktion_pfad=normalize.RECHERCHE_03,
            belege_pfad=normalize.RECHERCHE_BELEGE_03)
        for redaktion, belege in ((normalize.RECHERCHE_04, normalize.RECHERCHE_BELEGE_04),
                                  (normalize.RECHERCHE_05, normalize.RECHERCHE_BELEGE_05),
                                  (normalize.RECHERCHE_06, normalize.RECHERCHE_BELEGE_06)):
            base = normalize.recherche_anwenden(
                base, read(redaktion), read(belege),
                redaktion_pfad=redaktion, belege_pfad=belege)
        edits, sources = read(normalize.RECHERCHE_07), read(normalize.RECHERCHE_BELEGE_07)
        result = {d["id"]: d for d in normalize.recherche_anwenden(
            base, edits, sources, redaktion_pfad=normalize.RECHERCHE_07,
            belege_pfad=normalize.RECHERCHE_BELEGE_07)}
        self.assertEqual({d["id"] for d in base if d != result[d["id"]]},
                         {"EX-011", "EX-012"})
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        for before in base:
            after = result[before["id"]]
            if before["id"] not in {"EX-011", "EX-012"}:
                self.assertEqual(before, after)
                continue
            self.assertEqual(before["belege"], after["belege"][:-1])
            for key in before.keys() - (set(next(e for e in edits["karten"] if e["id"] == before["id"])["felder"])
                                        | {"quelle", "belege"}):
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertIsNone(after["dauer_min"]["min"])
            self.assertEqual(after["quelle"]["video_status"], before["quelle"]["video_status"])
            self.assertEqual(after["belege"][-1]["recherche"],
                             "docs/quellen/karten-recherche-runde-07.json")
            for value in next(e for e in edits["karten"] if e["id"] == before["id"])["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(result["EX-011"]["spielerzahl"]["min"], 5)
        self.assertIsNone(result["EX-012"]["spielerzahl"]["min"])
        self.assertIn("1:14:00", sources["belege"][1]["abschnitt"])
        bad = deepcopy(sources)
        bad["belege"][0]["url"] = "https://www.basketball-bund.de/anderes.pdf"
        with self.assertRaisesRegex(ValueError, "Primärquellenangabe"):
            normalize.recherche_anwenden(base, edits, bad)


class RechercheRundeAchtTests(unittest.TestCase):
    def test_skill_anchors_use_only_their_bound_original_activity(self):
        RechercheRundeDreiTests.setUpClass()
        prior = RechercheRundeDreiTests
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        base = normalize.recherche_anwenden(
            prior.base, prior.edits, prior.sources,
            redaktion_pfad=normalize.RECHERCHE_03,
            belege_pfad=normalize.RECHERCHE_BELEGE_03)
        for redaktion, belege in ((normalize.RECHERCHE_04, normalize.RECHERCHE_BELEGE_04),
                                  (normalize.RECHERCHE_05, normalize.RECHERCHE_BELEGE_05),
                                  (normalize.RECHERCHE_06, normalize.RECHERCHE_BELEGE_06),
                                  (normalize.RECHERCHE_07, normalize.RECHERCHE_BELEGE_07)):
            base = normalize.recherche_anwenden(
                base, read(redaktion), read(belege),
                redaktion_pfad=redaktion, belege_pfad=belege)
        edits, sources = read(normalize.RECHERCHE_08), read(normalize.RECHERCHE_BELEGE_08)
        result = {d["id"]: d for d in normalize.recherche_anwenden(
            base, edits, sources, redaktion_pfad=normalize.RECHERCHE_08,
            belege_pfad=normalize.RECHERCHE_BELEGE_08)}
        expected = {"EX-018", "EX-019", "EX-020", "EX-039"}
        self.assertEqual({d["id"] for d in base if d != result[d["id"]]}, expected)
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        entries = {e["id"]: e for e in edits["karten"]}
        for before in base:
            after = result[before["id"]]
            if before["id"] not in expected:
                self.assertEqual(before, after)
                continue
            allowed = set(entries[before["id"]]["felder"]) | {"quelle", "belege"}
            for key in before.keys() - allowed:
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertEqual(before["belege"], after["belege"][:-1])
            self.assertEqual(before["quelle"]["video_status"], after["quelle"]["video_status"])
            self.assertEqual(after["belege"][-1]["recherche"],
                             "docs/quellen/karten-recherche-runde-08.json")
            for value in entries[before["id"]]["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(result["EX-018"]["spielerzahl"]["min"], 4)
        self.assertEqual(result["EX-019"]["dauer_min"]["min"], 2)
        self.assertIsNone(result["EX-020"]["dauer_min"]["min"])
        self.assertEqual(result["EX-039"]["dauer_min"]["min"], 4)


class RechercheRundeNeunTests(unittest.TestCase):
    def test_original_drills_gain_bilingual_instructions_without_qa_change(self):
        RechercheRundeDreiTests.setUpClass()
        prior = RechercheRundeDreiTests
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        base = normalize.recherche_anwenden(
            prior.base, prior.edits, prior.sources,
            redaktion_pfad=normalize.RECHERCHE_03,
            belege_pfad=normalize.RECHERCHE_BELEGE_03)
        for redaktion, belege in ((normalize.RECHERCHE_04, normalize.RECHERCHE_BELEGE_04),
                                  (normalize.RECHERCHE_05, normalize.RECHERCHE_BELEGE_05),
                                  (normalize.RECHERCHE_06, normalize.RECHERCHE_BELEGE_06),
                                  (normalize.RECHERCHE_07, normalize.RECHERCHE_BELEGE_07),
                                  (normalize.RECHERCHE_08, normalize.RECHERCHE_BELEGE_08)):
            base = normalize.recherche_anwenden(
                base, read(redaktion), read(belege),
                redaktion_pfad=redaktion, belege_pfad=belege)
        edits, sources = read(normalize.RECHERCHE_09), read(normalize.RECHERCHE_BELEGE_09)
        result = {d["id"]: d for d in normalize.recherche_anwenden(
            base, edits, sources, redaktion_pfad=normalize.RECHERCHE_09,
            belege_pfad=normalize.RECHERCHE_BELEGE_09)}
        expected = {e["id"] for e in edits["karten"]}
        self.assertEqual(len(expected), 8)
        self.assertEqual({d["id"] for d in base if d != result[d["id"]]}, expected)
        translations = read(normalize.ROOT / "src/locales/drills.en.json")
        for before in base:
            after = result[before["id"]]
            if before["id"] not in expected:
                self.assertEqual(before, after)
                continue
            entry = next(e for e in edits["karten"] if e["id"] == before["id"])
            allowed = set(entry["felder"]) | {"quelle", "belege"}
            for key in before.keys() - allowed:
                self.assertEqual(before[key], after[key], (before["id"], key))
            self.assertEqual(before["belege"], after["belege"][:-1])
            self.assertEqual(before["quelle"]["video_status"], after["quelle"]["video_status"])
            self.assertEqual(after["belege"][-1]["recherche"],
                             "docs/quellen/karten-recherche-runde-09.json")
            for value in entry["felder"].values():
                self.assertEqual(translations[value["de"]], value["en"])
        self.assertEqual(result["EX-105"]["dauer_min"]["min"], 8)
        self.assertEqual(result["EX-132"]["dauer_min"]["min"], 3)
        self.assertIsNone(result["EX-133"]["dauer_min"]["min"])
        self.assertIsNone(result["EX-140"]["dauer_min"]["min"])
        self.assertEqual(result["EX-147"]["dauer_min"]["min"], 6)


if __name__ == "__main__":
    unittest.main()
