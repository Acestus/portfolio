const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
try {
  const htmlPath = 'resources/public/helicopter.html';
  const mainPath = 'resources/public/js/helicopter/main.js';
  const html = fs.readFileSync(htmlPath, 'utf8');
  const main = fs.readFileSync(mainPath, 'utf8');
  const inlined = html.replace(/<script src="\/js\/helicopter\/main.js"><\/script>/, `<script>\n${main}\n</script>`);
  const vConsole = new VirtualConsole();
  vConsole.on('log', (...args) => { console.log('[console.log]', ...args); });
  vConsole.on('error', (err) => { console.error('[console.error]', err && err.stack ? err.stack : err); });
  vConsole.on('warn', (...args) => { console.warn('[console.warn]', ...args); });
  const dom = new JSDOM(inlined, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vConsole, url: 'http://localhost/' });
  // Wait for a short period to let scripts run
  setTimeout(() => {
    try {
      // Dump #app innerHTML length and first 500 chars for inspection
      const app = dom.window.document.getElementById('app');
      if (!app) console.log('[RESULT] no #app element');
      else {
        const html = app.innerHTML || '';
        console.log('[RESULT] #app innerHTML length:', html.length);
        console.log('[RESULT] snippet:', html.slice(0, 500));
      }
    } catch (e) { console.error('[ERROR]', e && e.stack ? e.stack : e); }
    // Also capture any runtime errors attached to window
    if (dom.window && dom.window.__LAST_ERROR) console.error('[LAST_ERROR]', dom.window.__LAST_ERROR);
    process.exit(0);
  }, 1500);
} catch (e) {
  console.error('Script failed:', e && e.stack ? e.stack : e);
  process.exit(2);
}
