const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
try {
  const htmlPath = 'resources/public/helicopter.html';
  const mainPath = 'resources/public/js/helicopter/main.js';
  let html = fs.readFileSync(htmlPath, 'utf8');
  const main = fs.readFileSync(mainPath, 'utf8');
  const diag = `\n<script>\nwindow.__DIAG_ERRORS = [];\nwindow.addEventListener('error', e => { try { console.error('[PAGE_ERROR]', e.error ? (e.error.stack||e.error) : e.message); window.__DIAG_ERRORS.push(String(e.error||e.message)); } catch(err){ console.error('diag err', err); } });\nwindow.addEventListener('unhandledrejection', e => { try { console.error('[UNHANDLED_REJECTION]', e.reason && e.reason.stack ? e.reason.stack : e.reason); window.__DIAG_ERRORS.push(String(e.reason)); } catch(err){ console.error('diag err', err); } });\nconsole.log('[DIAG] Diagnostic hook installed');\n</script>\n`;
  html = html.replace(/<script src=\"\/js\/helicopter\/main.js\"><\/script>/, diag + `<script>\n${main}\n</script>`);
  const vConsole = new VirtualConsole();
  vConsole.on('log', (...args) => { console.log('[console.log]', ...args); });
  vConsole.on('error', (err) => { console.error('[console.error]', err && err.stack ? err.stack : err); });
  vConsole.on('warn', (...args) => { console.warn('[console.warn]', ...args); });
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vConsole, url: 'http://localhost/' });
  setTimeout(() => {
    try {
      const app = dom.window.document.getElementById('app');
      if (!app) console.log('[RESULT] no #app element');
      else {
        const html = app.innerHTML || '';
        console.log('[RESULT] #app innerHTML length:', html.length);
        console.log('[RESULT] snippet:', html.slice(0, 500));
      }
      if (dom.window.__DIAG_ERRORS && dom.window.__DIAG_ERRORS.length) console.error('[PAGE_ERRORS]', dom.window.__DIAG_ERRORS);
    } catch (e) { console.error('[ERROR]', e && e.stack ? e.stack : e); }
    process.exit(0);
  }, 2000);
} catch (e) {
  console.error('Script failed:', e && e.stack ? e.stack : e);
  process.exit(2);
}
