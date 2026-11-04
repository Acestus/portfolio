import hashlib,io,json,os,subprocess,sys,tarfile,tempfile,unittest
from pathlib import Path

VERIFIER=Path(__file__).with_name('verify_candidate.py')

class CandidateVerificationTests(unittest.TestCase):
 def run_candidate(self, *, source='fixture-source', extra=None, tamper=False):
  with tempfile.TemporaryDirectory() as folder:
   root=Path(folder)
   release={'sourceCommit':source,'dirty':False,'acceptanceRevision':'0439dcb52bf850fbec2c75feb164c286452c529f','producerRun':'123','producerAttempt':'1'}
   files={'release.json':json.dumps(release).encode(),'index.html':b'<h1>Synthetic candidate</h1>'}
   inventory=[{'path':p,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)} for p,b in files.items()]
   files['release-files.json']=json.dumps(inventory).encode()
   if extra:files.update(extra)
   archive=root/'site.tar'
   with tarfile.open(archive,'w') as tar:
    for name,body in files.items():
     info=tarfile.TarInfo(name);info.size=len(body);tar.addfile(info,io.BytesIO(body))
   digest=hashlib.sha256(archive.read_bytes()).hexdigest()
   if tamper:archive.write_bytes(archive.read_bytes()+b'tampered')
   (root/'release.json').write_text(json.dumps(release))
   (root/'producer.json').write_text(json.dumps({'head_sha':'fixture-source','id':123,'run_attempt':1}))
   return subprocess.run([sys.executable,str(VERIFIER),str(root),str(root/'producer.json')],env={**os.environ,'EXPECTED_SITE_SHA256':digest},capture_output=True,text=True)
 def test_complete_matching_candidate_is_valid(self):self.assertEqual(0,self.run_candidate().returncode)
 def test_archive_tampering_blocks(self):self.assertIn('digest mismatch',self.run_candidate(tamper=True).stderr)
 def test_wrong_source_blocks(self):self.assertIn('Source identity mismatch',self.run_candidate(source='different-fixture-source').stderr)
 def test_path_traversal_blocks_even_with_matching_archive_hash(self):self.assertIn('Unsafe archive member',self.run_candidate(extra={'../escape':b'fixture'}).stderr)
 def test_uninventoried_file_blocks(self):self.assertIn('inventory does not cover',self.run_candidate(extra={'extra.txt':b'fixture'}).stderr)

if __name__=='__main__':unittest.main()
