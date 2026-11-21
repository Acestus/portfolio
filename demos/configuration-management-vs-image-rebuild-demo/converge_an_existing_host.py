from pathlib import Path
import tempfile
scratch=tempfile.TemporaryDirectory()
config=Path(scratch.name,"settings")
apply=lambda: False if config.exists() and config.read_text()=="workers=4" else bool(config.write_text("workers=4"))
changes=[apply(),apply()]
print("Changed:",changes)
assert changes==[True,False]
