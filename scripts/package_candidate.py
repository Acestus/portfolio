"""Retain the already tested public directory without rebuilding it."""
import hashlib
from pathlib import Path
import shutil
import tarfile

root = Path(__file__).resolve().parents[1]
output = root / 'artifacts'
output.mkdir(exist_ok=True)
archive = output / 'site.tar'
with tarfile.open(archive, 'w') as tar:
    for path in sorted((root / 'public').iterdir()):
        tar.add(path, arcname=path.name)
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(output / 'site.tar.sha256').write_text(digest + '  site.tar\n')
for name in ('release.json', 'release-files.json'):
    shutil.copy2(root / 'public' / name, output / name)
print('Archive SHA-256:', digest)
