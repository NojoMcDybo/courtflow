"""Focused regressions for catalog formats that previously lost data."""
import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import normalize


DRILLS = Path(__file__).resolve().parent.parent / "data" / "drills.json"


class CatalogNormalizationRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        drills = json.loads(DRILLS.read_text(encoding="utf-8"))
        cls.by_id = {drill["id"]: drill for drill in drills}

    def test_candidate_table_replaces_qa_sentence_as_title(self):
        drill = self.by_id["EX-104"]
        self.assertEqual(drill["titel"], "2 on 2 Numbers Game")
        self.assertEqual(drill["kompetenz"]["alle"], ["S7", "S2", "S4"])
        self.assertEqual(drill["alter"]["roh"], "U8–U10")
        self.assertEqual(drill["dokumentationstiefe"], "kurz")

    def test_url_and_source_label_are_both_preserved(self):
        source = self.by_id["EX-053"]["quelle"]
        self.assertEqual(self.by_id["EX-053"]["titel"], "Run to That Line")
        self.assertEqual(self.by_id["EX-054"]["titel"], "Diamond Passing")
        self.assertEqual(source["name"], "Jr. NBA Starter P1")
        self.assertEqual(source["url"], "https://jr.nba.com/basketball-practice-plans/starter/")

    def test_exact_evidence_recovers_full_jr_nba_label(self):
        self.assertNotEqual(self.by_id["EX-126"]["quelle"]["name"], "Jr")
        self.assertIn("Jr", self.by_id["EX-126"]["quelle"]["name"])
        self.assertEqual(self.by_id["EX-126"]["titel"],
                         "Guards: Pick & Roll Situational Shooting")

    def test_exact_evidence_populates_rebounding_sequence(self):
        sequence = self.by_id["EX-127"]["ablauf"]
        self.assertIn("fünf aufeinanderfolgende defensive Rebounds", sequence)
        self.assertIn("Wettbewerb", sequence)
        self.assertNotIn("Quelle:", sequence)
        self.assertNotIn("QA:", sequence)

    def test_ambiguous_source_labels_stay_open(self):
        for eid in ("EX-106", "EX-107"):
            self.assertIsNone(self.by_id[eid]["quelle"]["name"])
            self.assertIsNone(self.by_id[eid]["quelle"]["url"])

    def test_shared_evidence_does_not_assign_first_of_two_urls(self):
        name, url, _ = normalize.quelle_aus_belegen([
            "EX-143/144: Jr. NBA Starter dokumentiert zwei Formen. Quellen: "
            "https://example.org/a und https://example.org/b . QA A."
        ])
        self.assertEqual(name, "Jr. NBA Starter")
        self.assertIsNone(url)

    def test_title_matching_requires_explicit_source_assignment(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "catalog.txt"
            source.write_text(
                '1: Irgendwo steht Jr. NBA und der Titel Pass & Cut.\n'
                '2: Jr. NBA Rookie Practice 5 dokumentiert das „Exakte Übung“.\n',
                encoding="utf-8")
            with patch.object(normalize, "EXTRACTED", source):
                self.assertEqual(normalize.quelle_aus_titel("Pass & Cut"), (None, None, None))
                self.assertEqual(normalize.quelle_aus_titel("Exakte Übung")[0],
                                 "Jr. NBA Rookie Practice 5")

    def test_id_mentions_inside_evidence_do_not_receive_its_source(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "catalog.txt"
            source.write_text(
                '1: EX-138/139: Jr. NBA MVP; anders als EX-127. Quelle: https://example.org/ .\n',
                encoding="utf-8")
            with patch.object(normalize, "EXTRACTED", source):
                self.assertEqual(set(normalize.quellenbelege()), {"EX-138", "EX-139"})


if __name__ == "__main__":
    unittest.main()
