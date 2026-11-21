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
        self.guide = self.root / live.GUIDE_PATH
        self.guide.parent.mkdir(parents=True)
        self.guide.write_bytes(b'expected guide bytes')

    def test_only_the_guide_is_requested_and_matches(self):
        with patch.object(live, 'fetch', return_value=(200, b'expected guide bytes')) as fetch:
            live.check('https://example.test/', self.root)
        fetch.assert_called_once_with('https://example.test/' + live.GUIDE_PATH)

    def test_stale_guide_bytes_are_rejected(self):
        with patch.object(live, 'fetch', return_value=(200, b'stale')):
            with self.assertRaisesRegex(ValueError, 'guide'):
                live.check('https://example.test', self.root)

    def test_missing_guide_is_rejected(self):
        with patch.object(live, 'fetch', return_value=(404, b'')):
            with self.assertRaisesRegex(ValueError, 'guide'):
                live.check('https://example.test', self.root)


if __name__ == '__main__':
    unittest.main()
