"""Validate retained, untrusted site bytes without executing candidate code."""
import hashlib,json,os,sys,tarfile
from pathlib import Path,PurePosixPath

directory=Path(sys.argv[1])
producer=json.loads(Path(sys.argv[2]).read_text())
expected=os.environ['EXPECTED_SITE_SHA256']
if len(expected)!=64 or any(c not in '0123456789abcdef' for c in expected):raise SystemExit('A real lowercase SHA-256 is required')
archive=directory/'site.tar'
if hashlib.sha256(archive.read_bytes()).hexdigest()!=expected:raise SystemExit('Candidate archive digest mismatch')
release=json.loads((directory/'release.json').read_text())
if release['sourceCommit']!=producer['head_sha'] or release['dirty']:raise SystemExit('Source identity mismatch or dirty source')
if release['acceptanceRevision']!='ff65bc81321762d5fa1404c02e654ba7d13cabb5':raise SystemExit('Unexpected executable contract revision')
if str(release['producerRun'])!=str(producer['id']) or str(release['producerAttempt'])!=str(producer['run_attempt']):raise SystemExit('Producer run/attempt mismatch')
with tarfile.open(archive) as tar:
 members=tar.getmembers()
 if len(members)>1000 or sum(m.size for m in members)>100_000_000:raise SystemExit('Candidate exceeds approved bounds')
 files={}
 for member in members:
  path=PurePosixPath(member.name)
  if path.is_absolute() or '..' in path.parts or member.issym() or member.islnk() or not(member.isdir() or member.isfile()):raise SystemExit('Unsafe archive member')
  if member.isfile():
   key=str(path)
   if key in files:raise SystemExit('Duplicate archive path')
   files[key]=tar.extractfile(member).read()
 inventory=json.loads(files['release-files.json'])
 if len(inventory)!=len(files)-1:raise SystemExit('File inventory does not cover the archive')
 seen=set()
 for item in inventory:
  path=item['path']
  if path in seen or path not in files:raise SystemExit('Duplicate/missing inventory path')
  seen.add(path)
  if hashlib.sha256(files[path]).hexdigest()!=item['sha256'] or len(files[path])!=item['bytes']:raise SystemExit('File inventory digest mismatch')
 if json.loads(files['release.json'])!=release:raise SystemExit('Archive/release metadata mismatch')
print('Verified exact source, producer, archive and complete per-file inventory before cloud authentication.')
