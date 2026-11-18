#!/usr/bin/env python3
"""End-to-end checks for the two CLIs other waves call.

Runs the real commands as subprocesses, exactly as W2/W5 invoke them, so
a broken weights file, a missing search index, or a traceback fails here
instead of inside a design run.

    python3 tools/design-gate/test_design_gate.py
    python3 -m unittest tools.design_gate.test_design_gate   # or pytest
"""
import json
import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
# testdata/, not fixtures/: fixtures/ is regenerated wholesale by
# gen_fixtures.py and would delete this file.
FIXTURE = os.path.join(HERE, 'testdata', 'option-cards.html')
SCORE = os.path.join(HERE, 'score.py')
PATTERNS = os.path.join(HERE, 'patterns.py')
INDEX_META = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                          'index', 'meta.json')


def run(args, expect=0):
    p = subprocess.run([sys.executable] + args, capture_output=True,
                       text=True, cwd=ROOT)
    if p.returncode != expect:
        raise AssertionError(
            f"{' '.join(args)} exited {p.returncode}\n"
            f"--- stdout ---\n{p.stdout[-2000:]}\n"
            f"--- stderr ---\n{p.stderr[-2000:]}")
    return p.stdout


class ScoreCli(unittest.TestCase):
    def test_scores_every_option_on_a_page(self):
        out = run([SCORE, 'score', FIXTURE, '--site-type', 'services',
                   '--page-type', 'service-detail'])
        self.assertIn('d1:', out)
        self.assertIn('d2:', out)
        self.assertIn('d3:', out)
        self.assertNotIn('Traceback', out)

    def test_json_shape_and_bounds(self):
        out = run([SCORE, 'score', FIXTURE, '--site-type', 'services',
                   '--page-type', 'service-detail', '--json'])
        res = json.loads(out)
        self.assertEqual(len(res['options']), 3)
        for opt in res['options']:
            self.assertGreaterEqual(opt['score'], 0)
            self.assertLessEqual(opt['score'], 100)
            self.assertTrue(opt['sections'])
            for sec in opt['sections']:
                self.assertGreaterEqual(sec['score'], 0)
                self.assertLessEqual(sec['score'], 100)
                self.assertIsInstance(sec['reasons'], list)

    def test_stale_weights_file_fails_loudly_not_with_a_traceback(self):
        """A weights file from an older feature set used to KeyError."""
        import tempfile
        bad = {'pattern_fit': 0.5, 'ps': 0.3, 'rule_pass': 0.2}
        with tempfile.NamedTemporaryFile('w', suffix='.json',
                                         delete=False) as f:
            json.dump(bad, f)
            path = f.name
        try:
            p = subprocess.run(
                [sys.executable, SCORE, 'score', FIXTURE, '--site-type',
                 'services', '--page-type', 'service-detail',
                 '--weights', path], capture_output=True, text=True,
                cwd=ROOT)
        finally:
            os.unlink(path)
        self.assertNotEqual(p.returncode, 0)
        self.assertNotIn('Traceback', p.stderr)
        self.assertIn('not produced by the scorer', p.stderr)

    def test_valid_weights_file_is_accepted(self):
        import tempfile
        sys.path.insert(0, HERE)
        import score
        good = {k: round(v, 3) for k, v in score.DEFAULT_WEIGHTS.items()}
        with tempfile.NamedTemporaryFile('w', suffix='.json',
                                         delete=False) as f:
            json.dump(good, f)
            path = f.name
        try:
            out = run([SCORE, 'score', FIXTURE, '--site-type', 'services',
                       '--page-type', 'service-detail', '--weights', path,
                       '--json'])
        finally:
            os.unlink(path)
        self.assertEqual(len(json.loads(out)['options']), 3)

    def test_no_weights_file_is_shipped(self):
        """The scorer runs on its prior; fitted coefficients live in the
        study, not in the tool directory."""
        self.assertFalse(
            os.path.exists(os.path.join(HERE, 'score-weights.json')),
            'a stale score-weights.json is present — it is not loaded by '
            'default and its keys are not guaranteed to match')


class PatternsCli(unittest.TestCase):
    def test_index_exists(self):
        self.assertTrue(os.path.isfile(INDEX_META),
                        'search index missing — run patterns.py index')
        meta = json.load(open(INDEX_META))
        self.assertGreaterEqual(len(meta['patterns']), 50)

    def test_search_returns_a_pattern(self):
        out = run([PATTERNS, 'search', 'saas pricing page', '--k', '3'])
        self.assertIn('pattern-', out)
        self.assertIn('# saas pricing page', out)

    def test_search_json_and_filters(self):
        out = run([PATTERNS, 'search', 'pricing tiers', '--k', '5',
                   '--section', 'pricing', '--json'])
        res = json.loads(out)
        self.assertTrue(res['results'])
        for r in res['results']:
            self.assertEqual(r['section_type'], 'pricing')
            self.assertTrue(r['id'].startswith('pattern-'))

    def test_lookup_lists_compositions(self):
        out = run([PATTERNS, 'lookup', '--section', 'hero'])
        self.assertIn('pattern-', out)


if __name__ == '__main__':
    unittest.main(verbosity=2)
