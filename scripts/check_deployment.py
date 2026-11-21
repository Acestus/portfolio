"""Read-only live check for the guide page at the selected deployment stage."""
import os
from pathlib import Path
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


GUIDE_PATH = 'docs/bicep-github-actions-trunk/index.html'


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(url):
    try:
        with build_opener(NoRedirect).open(Request(url, headers={'Cache-Control': 'no-cache'}), timeout=15) as response:
            return response.status, response.read()
    except HTTPError as response:
        return response.code, b''


def check(base, candidate):
    status, body = fetch(base.rstrip('/') + '/' + GUIDE_PATH)
    if status != 200 or body != (candidate / GUIDE_PATH).read_bytes():
        raise ValueError('Live Bicep guide does not match the retained candidate')


def main():
    base = os.environ['PORTFOLIO_SITE_URL'].rstrip('/')
    if urlsplit(base).scheme != 'https' or not urlsplit(base).netloc:
        raise SystemExit('PORTFOLIO_SITE_URL must be HTTPS')
    candidate = Path(sys.argv[1])
    for attempt in range(1, 13):
        try:
            check(base, candidate)
            print('Live Bicep guide matches the retained candidate.')
            return
        except (ValueError, URLError, TimeoutError) as error:
            print(f'Guide check {attempt}/12: {error}', file=sys.stderr)
            if attempt == 12:
                raise SystemExit(1)
            time.sleep(5)


if __name__ == '__main__':
    main()
