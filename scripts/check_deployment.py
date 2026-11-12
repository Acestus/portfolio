"""Read-only live checks against the exact retained professional-site package."""
import json
import os
from pathlib import Path
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


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
    for path in ('release.json', 'resume/index.html', 'portfolio/index.html', 'articles/index.html',
                 'downloads/william-weeks-balconi-resume.pdf'):
        status, body = fetch(base + '/' + path)
        if status != 200 or body != (candidate / path).read_bytes():
            raise ValueError('Live bytes do not match the retained candidate: ' + path)
    for path in ('/this-route-must-not-exist-cicd', '/api/events', '/household/calendar'):
        status, _ = fetch(base + path)
        if status != 404:
            raise ValueError('Expected a real 404: ' + path)


def main():
    base = os.environ['PORTFOLIO_SITE_URL'].rstrip('/')
    if urlsplit(base).scheme != 'https' or not urlsplit(base).netloc:
        raise SystemExit('PORTFOLIO_SITE_URL must be HTTPS')
    candidate = Path(sys.argv[1])
    for attempt in range(1, 13):
        try:
            check(base, candidate)
            print('Live release, canonical pages, PDF bytes and 404 boundaries verified. Independent acceptance remains required.')
            return
        except (ValueError, URLError, TimeoutError) as error:
            print(f'Live check {attempt}/12: {error}', file=sys.stderr)
            if attempt == 12: raise SystemExit(1)
            time.sleep(5)


if __name__ == '__main__': main()
