"""Focused regressions for catalog formats that previously lost data."""
import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import normalize


DRILLS = Path(__file__).resolve().parent.parent / "data" / "drills.json"
RAW = Path(__file__).resolve().parent.parent / "docs" / "quellen" / "records-raw.json"


class CatalogNormalizationRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        drills = json.loads(DRILLS.read_text(encoding="utf-8"))
        cls.by_id = {drill["id"]: drill for drill in drills}
        records = json.loads(RAW.read_text(encoding="utf-8"))
        cls.raw_by_id = {record["id"]: record for record in records}

    def raw_field(self, eid, *names):
        fields = self.raw_by_id[eid]["felder"]
        return next(fields[name] for name in names if fields.get(name))

    def test_duration_parser_totals_only_explicit_timed_series(self):
        cases = {
            "EX-054": {"min": 4, "max": 4, "roh": "4 x 1 min"},
            "EX-058": {"min": 6, "max": 6, "roh": "3 x 2 min"},
            "EX-085": {
                "min": 1, "max": 1,
                "roh": "2 × 30 s als Originalangabe; soziale Variation 30–45 s",
            },
        }
        for eid, expected in cases.items():
            raw = self.raw_field(eid, "Dauer/Umfang", "Dauer / Umfang", "Dauer")
            self.assertEqual(normalize.duration_span(raw), expected)

    def test_duration_parser_keeps_untimed_scope_as_raw_text(self):
        for eid in ("EX-055", "EX-056", "EX-057", "EX-060", "EX-084"):
            raw = self.raw_field(eid, "Dauer/Umfang", "Dauer / Umfang", "Dauer")
            self.assertEqual(
                normalize.duration_span(raw),
                {"min": None, "max": None, "roh": raw},
            )

    def test_duration_parser_handles_simple_minute_and_second_ranges(self):
        self.assertEqual(
            normalize.duration_span("4,5 Minuten (3 Serien je Hand mit je 3 × 15 Sekunden)"),
            {"min": 4.5, "max": 4.5, "roh": "4,5 Minuten (3 Serien je Hand mit je 3 × 15 Sekunden)"},
        )
        self.assertEqual(
            normalize.duration_span("6–8 min"),
            {"min": 6, "max": 8, "roh": "6–8 min"},
        )
        self.assertEqual(
            normalize.duration_span("30-45 s"),
            {"min": 0.5, "max": 0.75, "roh": "30-45 s"},
        )
        self.assertEqual(
            normalize.duration_span("4 min je Spiel"),
            {"min": 4, "max": 4, "roh": "4 min je Spiel"},
        )

    def test_player_parser_uses_explicit_group_size_not_other_numbers(self):
        self.assertEqual(
            normalize.player_span("4–5 pro Gruppe"),
            {"min": 4, "max": 5, "roh": "4–5 pro Gruppe"},
        )
        self.assertEqual(
            normalize.player_span("4+ pro Rotation"),
            {"min": 4, "max": None, "roh": "4+ pro Rotation"},
        )
        raw = "5 pro Gruppe (3 Angreifer, 1 Verteidiger, 1 Wechselrolle)"
        self.assertEqual(
            normalize.player_span(raw),
            {"min": 5, "max": 5, "roh": raw},
        )
        self.assertEqual(
            normalize.player_span("Paare"),
            {"min": 2, "max": 2, "roh": "Paare"},
        )

    def test_player_parser_does_not_infer_players_from_team_or_resource_counts(self):
        for raw in (
            "2 Teams",
            "4+ Teams",
            "3 Linien pro Korb; 1 Ball pro Spieler oder geteilt",
            "Gesamtgruppe; alternativ Kleingruppen 3–4",
        ):
            self.assertEqual(
                normalize.player_span(raw),
                {"min": None, "max": None, "roh": raw},
            )

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

    def test_ambiguous_raw_source_labels_require_explicit_research(self):
        aliases = normalize.alias_map()
        findings = normalize.tabellenbefunde()
        source_index = normalize.quellenbelege()
        for eid in ("EX-106", "EX-107"):
            imported = normalize.normalize(
                self.raw_by_id[eid], aliases, findings, source_index)
            self.assertIsNone(imported["quelle"]["name"])
            self.assertIsNone(imported["quelle"]["url"])
            self.assertIsNotNone(self.by_id[eid]["quelle"]["url"])

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
