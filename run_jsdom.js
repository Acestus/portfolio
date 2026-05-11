const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const fs = require('fs');
const execSync = require('child_process').execSync;

(async ()=>{
  try {
    const url = 'http://localhost:8000/';
    const resHtml = execSync('curl -s http://localhost:8000/').toString();
    const dom = new JSDOM(resHtml, {url, runScripts: 'dangerously', resources: 'usable'});
    dom.window.addEventListener('error', e => { console.error('ERROR:', e.message); });
    dom.window.addEventListener('load', ()=>{ console.log('load event'); });
    setTimeout(()=>{
      console.log('Title:', dom.window.document.title);
      const app = dom.window.document.querySelector('#app');
      console.log('App innerHTML length:', app ? app.innerHTML.length : null);
      const scripts = Array.from(dom.window.document.querySelectorAll('script')).map(s=>s.src||s.textContent.slice(0,80));
      console.log('Scripts:', scripts);
      fs.writeFileSync('portfolio_dom.html', dom.serialize());
      dom.window.close();
    }, 2000);
  } catch(e){
    console.error('RUN ERROR', e);
    process.exit(1);
  }
})();
