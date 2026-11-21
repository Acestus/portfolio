"""Create independent local Git repositories from the video demo fixtures."""
import argparse
from pathlib import Path
import shutil
import subprocess
import tempfile

source = Path(__file__).resolve().parents[1] / "demos"
names = sorted(path.name for path in source.iterdir() if path.is_dir())
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("demo", choices=["all", *names])
parser.add_argument("destination", nargs="?", default="/tmp/acestus-video-demos")
args = parser.parse_args()
parent = Path(args.destination).expanduser().resolve()
selected = names if args.demo == "all" else [args.demo]

for name in selected:
    target = parent / name
    if target.exists() or target.is_symlink():
        parser.error(f"Already exists: {target}")

parent.mkdir(parents=True, exist_ok=True)
for name in selected:
    target = parent / name
    with tempfile.TemporaryDirectory(prefix=".seed-", dir=parent) as scratch:
        checkout = Path(scratch) / name
        shutil.copytree(source / name, checkout)
        subprocess.run(["git", "init", "--quiet", "-b", "main"], cwd=checkout, check=True)
        subprocess.run(["git", "add", "."], cwd=checkout, check=True)
        subprocess.run(
            ["git", "-c", "user.name=Acestus Demo", "-c", "user.email=demo@example.invalid",
             "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "Seed the demo"],
            cwd=checkout, check=True,
        )
        checkout.rename(target)
    print(target)
