import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('release_policy', Path(__file__).resolve().parents[1] / 'scripts/release_policy.py')
policy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)


class DeliveryPolicyTests(unittest.TestCase):
    def setUp(self):
        self.producer = {
            'repository': {'full_name': 'Acestus/portfolio'}, 'head_repository': {'full_name': 'Acestus/portfolio'},
            'head_branch': 'main', 'head_sha': 'abc', 'event': 'push', 'conclusion': 'success',
            'path': '.github/workflows/Publish-Development.yaml', 'id': 123, 'run_attempt': 1,
        }
        self.evidence = dict(self.producer, event='workflow_dispatch', path='.github/workflows/Promote-Staging.yaml', id=456)
        self.receipt = dict(repository='Acestus/portfolio', stage='staging', archiveSha256='a' * 64,
                            sourceRun='123', sourceAttempt='1', sourceCommit='abc', runId='456', runAttempt='1')

    def check(self):
        policy.check_evidence(self.evidence, self.receipt, self.producer, 'Acestus/portfolio', 'staging', 'a' * 64)

    def test_valid_stage_evidence(self):
        self.check()

    def test_receipt_is_bound_to_candidate_and_stage(self):
        for key in self.receipt:
            with self.subTest(key=key):
                original = self.receipt[key]
                self.receipt[key] = 'wrong'
                with self.assertRaises(ValueError): self.check()
                self.receipt[key] = original

    def test_test_run_cannot_substitute_for_promotion(self):
        self.evidence['path'] = '.github/workflows/Test-Production.yaml'
        with self.assertRaises(ValueError): self.check()

    def test_no_production_gate_bypass(self):
        for stage, operation in [('production', 'publish'), ('production', 'preview'), ('staging', 'restore')]:
            with self.assertRaises(ValueError): policy.evidence_stage(stage, operation)
        self.assertEqual(policy.evidence_stage('production', 'promote'), 'staging')
        self.assertEqual(policy.evidence_stage('production', 'restore'), 'production')

    def test_current_producer_is_limited_to_the_publishing_run(self):
        self.producer['conclusion'] = None
        with self.assertRaises(ValueError): policy.check_source(self.producer, 'Acestus/portfolio')
        policy.check_source(self.producer, 'Acestus/portfolio', allow_current=True, current_run='123')
        with self.assertRaises(ValueError): policy.check_source(self.producer, 'Acestus/portfolio', allow_current=True, current_run='456')

    def test_preview_must_be_current_open_same_repository_pr(self):
        run = dict(self.producer, event='pull_request', path='.github/workflows/Test-PullRequest.yaml', pull_requests=[{'number': 42}])
        pr = {'number': 42, 'state': 'open', 'head': {'sha': 'abc', 'repo': {'full_name': 'Acestus/portfolio'}}}
        policy.check_source(run, 'Acestus/portfolio', preview=True)
        policy.check_pr(run, pr, '42', 'Acestus/portfolio')
        for mutate in [lambda p: p.update(state='closed'), lambda p: p['head'].update(sha='old'),
                       lambda p: p['head']['repo'].update(full_name='foreign/repo')]:
            changed = copy.deepcopy(pr)
            mutate(changed)
            with self.assertRaises(ValueError): policy.check_pr(run, changed, '42', 'Acestus/portfolio')


if __name__ == '__main__': unittest.main()
