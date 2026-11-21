"""Remove development playback fixtures from the production site package."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys


root = Path(sys.argv[1])
shutil.rmtree(root / "videos" / "playback-sample", ignore_errors=True)
for asset in (root / "media" / "videos").glob("playback-sample-*"):
    asset.unlink()

listing = root / "videos" / "index.html"
if listing.exists():
    html, removed = re.subn(
        r"<article class=video-card><a class=video-card-image href=/videos/playback-sample/.*?</article>",
        "", listing.read_text(), count=1, flags=re.DOTALL,
    )
    if removed != 1:
        raise SystemExit("Expected exactly one playback sample card in the production videos listing.")
    listing.write_text(html)

item = re.compile(r"<item><title>Video playback sample</title>.*?</item>", re.DOTALL)
for feed in (root / "index.xml", root / "videos" / "index.xml"):
    if feed.exists() and "playback-sample" in feed.read_text():
        feed.write_text(item.sub("", feed.read_text(), count=1))

sitemap = root / "sitemap.xml"
if sitemap.exists():
    xml, removed = re.subn(
        r"<url><loc>https://acestus\.com/videos/playback-sample/</loc>.*?</url>",
        "", sitemap.read_text(), count=1, flags=re.DOTALL,
    )
    if removed != 1:
        raise SystemExit("Expected the playback sample URL in the production sitemap.")
    sitemap.write_text(xml)

inventory = [
    {
        "path": path.relative_to(root).as_posix(),
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size,
    }
    for path in sorted(root.rglob("*"))
    if path.is_file() and path.name != "release-files.json"
]
(root / "release-files.json").write_text(json.dumps(inventory, separators=(",", ":")))

if any("playback-sample" in path.read_text(errors="ignore") for path in root.rglob("*") if path.is_file()):
    raise SystemExit("A playback sample reference remains in the production site package.")
