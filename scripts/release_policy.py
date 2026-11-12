"""Deployment pipeline provenance and stage evidence; never executes candidate code."""
import json
import os
from pathlib import Path
import sys


def require(condition, message):
    if not condition:
        raise ValueError(message)


def same_repository(run, repository):
    require(run['repository']['full_name'] == repository
            and run['head_repository']['full_name'] == repository, 'Foreign repository')


def check_source(run, repository, *, preview=False, allow_current=False, current_run=''):
    same_repository(run, repository)
    workflow = 'Test-PullRequest' if preview else 'Publish-Development'
    require(run['path'] == f'.github/workflows/{workflow}.yaml', 'Unexpected producer workflow')
    require(run['event'] == ('pull_request' if preview else 'push'), 'Unexpected producer event')
    if not preview:
        require(run['head_branch'] == 'main', 'Source must be main')
    current = not preview and allow_current and str(run['id']) == current_run and run['conclusion'] is None
    require(run['conclusion'] == 'success' or current, 'Producer has not passed qualification')


def check_pr(run, pr, number, repository):
    require(number.isascii() and number.isdecimal(), 'Invalid PR number')
    require(str(pr['number']) == number and pr['state'] == 'open', 'PR is not open')
    require(pr['head']['repo']['full_name'] == repository, 'Fork previews need a separate trust policy')
    require(pr['head']['sha'] == run['head_sha'], 'Stale PR candidate')
    require(any(str(p['number']) == number for p in run['pull_requests']), 'Candidate belongs to another PR')


def evidence_stage(stage, operation):
    gates = {
        ('development', 'publish'): None, ('pull-request', 'preview'): None,
        ('development', 'test'): 'development', ('staging', 'promote'): 'development',
        ('production', 'promote'): 'staging', ('production', 'restore'): 'production',
        ('production', 'test'): 'production',
    }
    require((stage, operation) in gates, 'Unsupported delivery stage/operation')
    return gates[stage, operation]


def check_evidence(run, receipt, producer, repository, stage, checksum):
    same_repository(run, repository)
    require(run['head_branch'] == 'main' and run['conclusion'] == 'success', 'Evidence did not pass on main')
    workflows = {'development': ['Publish-Development'], 'staging': ['Promote-Staging'],
                 'production': ['Promote-Production', 'Restore-Production']}[stage]
    require(run['path'] in [f'.github/workflows/{name}.yaml' for name in workflows], 'Unexpected evidence workflow')
    require(run['event'] == ('push' if stage == 'development' else 'workflow_dispatch'), 'Unexpected evidence event')
    expected = {
        'repository': repository, 'stage': stage, 'archiveSha256': checksum,
        'sourceRun': str(producer['id']), 'sourceAttempt': str(producer['run_attempt']),
        'sourceCommit': producer['head_sha'], 'runId': str(run['id']), 'runAttempt': str(run['run_attempt']),
    }
    for key, value in expected.items():
        require(receipt[key] == value, 'Evidence does not identify this tested release: ' + key)


def check_gate(producer, checksum):
    stage, operation = os.environ['DELIVERY_STAGE'], os.environ['DELIVERY_OPERATION']
    repository = os.environ['GITHUB_REPOSITORY']
    if stage == 'pull-request':
        check_pr(producer, json.loads(Path('pull-request.json').read_text()), os.environ['PR_NUMBER'], repository)
    expected_stage = evidence_stage(stage, operation)
    if expected_stage:
        check_evidence(json.loads(Path('evidence-run.json').read_text()),
                       json.loads(Path('evidence/receipt.json').read_text()), producer, repository,
                       expected_stage, checksum)


def write_receipt():
    release = json.loads(Path('candidate/release.json').read_text())
    receipt = {
        'repository': os.environ['GITHUB_REPOSITORY'], 'stage': os.environ['DELIVERY_STAGE'],
        'archiveSha256': os.environ['EXPECTED_SITE_SHA256'], 'sourceRun': str(release['producerRun']),
        'sourceAttempt': str(release['producerAttempt']), 'sourceCommit': release['sourceCommit'],
        'runId': os.environ['GITHUB_RUN_ID'], 'runAttempt': os.environ['GITHUB_RUN_ATTEMPT'],
        'siteUrl': os.environ['DELIVERY_SITE_URL'].rstrip('/'),
    }
    Path('receipt').mkdir(exist_ok=True)
    Path('receipt/receipt.json').write_text(json.dumps(receipt))


if __name__ == '__main__':
    if sys.argv[1:] != ['receipt']:
        raise SystemExit('Usage: release_policy.py receipt')
    write_receipt()
