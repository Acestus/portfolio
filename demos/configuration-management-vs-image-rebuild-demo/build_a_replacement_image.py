from pathlib import Path
import tempfile
scratch=tempfile.TemporaryDirectory()
old=Path(scratch.name,"image-v1")
new=Path(scratch.name,"image-v2")
old.write_text("workers=2")
new.write_text("workers=4")
print("Previous:",old.read_text(),"Selected:",new.read_text())
