import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('check_deployment', Path(__file__).resolve().parents[1] / 'scripts/check_deployment.py')
live = importlib.util.module_from_spec(spec)
spec.loader.exec_module(live)


class LiveChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.responses = []
        for path in ('release.json', 'resume/index.html', 'portfolio/index.html', 'articles/index.html', 'downloads/william-weeks-balconi-resume.pdf'):
            target = self.root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(path.encode())
            self.responses.append((200, path.encode()))
        self.responses += [(404, b'')] * 3

    def check(self):
        with patch.object(live, 'fetch', side_effect=self.responses):
            live.check('https://example.test', self.root)

    def test_expected_release_is_valid(self): self.check()

    def test_stale_bytes_rejected(self):
        for index in range(5):
            previous = self.responses[index]
            self.responses[index] = (200, b'stale')
            with self.assertRaises(ValueError): self.check()
            self.responses[index] = previous

    def test_unknown_and_private_paths_are_not_homepage_fallbacks(self):
        for index in range(5, 8):
            previous = self.responses[index]
            self.responses[index] = (200, b'homepage')
            with self.assertRaises(ValueError): self.check()
            self.responses[index] = previous


if __name__ == '__main__': unittest.main()
