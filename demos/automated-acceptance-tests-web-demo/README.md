# Automated acceptance tests for a web workflow

[Read the portfolio guide](https://acestus.com/docs/video-automated-acceptance-tests-web/).

Use Node.js and npm. From the demo repo, run the setup line once. Run one line at a time in fish.

~~~fish
npm install; and npx playwright install chromium
~~~

## 1. Show the browser action

Point out the search interaction and expected results region.

~~~fish
rg -n 'getByRole|toBeVisible' search.spec.js
~~~

## 2. Run the browser check

Run the focused Playwright test against the demo HTML. To record a failure, change the matching result string in search.html and rerun.

~~~fish
npx playwright test search.spec.js --reporter=line
~~~

## 3. Trace it into CI

Find the browser test invocation and evidence upload.

~~~fish
rg -n 'playwright|upload-artifact' .github/workflows/acceptance.yml
~~~
