export function init(){
  const root = document.getElementById('spa-root');
  fetch('/static/mock/pricing.json').then(r=>r.json()).then(data=>{
    const container = document.createElement('div');
    container.style.color = '#dfefff';
    const servicesDiv = document.createElement('div');
    servicesDiv.style.display = 'grid';
    servicesDiv.style.gridTemplateColumns = '1fr 1fr';
    servicesDiv.style.gap = '12px';

    const selections = {};

    data.services.forEach(svc=>{
      const box = document.createElement('div');
      box.style.padding='8px'; box.style.background='#041020'; box.style.borderRadius='6px';
      const title = document.createElement('div'); title.textContent = svc.name; title.style.fontWeight='600';
      const sel = document.createElement('select');
      svc.skus.forEach(sk=>{
        const opt = document.createElement('option'); opt.value = sk.id; opt.textContent = `${sk.id} — $${sk.cost}/mo`; sel.appendChild(opt);
      });
      sel.addEventListener('change',()=>{ selections[svc.name]=sel.value; recompute(); });
      // default
      selections[svc.name]=svc.skus[0].id;
      box.appendChild(title); box.appendChild(sel); servicesDiv.appendChild(box);
    });

    const controls = document.createElement('div');
    controls.style.marginTop='12px';
    controls.innerHTML = `
      <label>JML scenario: <select id="jml-sel"><option value="none">none</option><option value="hire">hire</option><option value="transfer">transfer</option><option value="leave">leave</option></select></label>
      <button id="export-btn" style="margin-left:12px">Export JSON</button>
      <div id="total" style="margin-top:8px;font-family:monospace"></div>
    `;

    container.appendChild(servicesDiv);
    container.appendChild(controls);
    root.innerHTML=''; root.appendChild(container);

    function recompute(){
      let total = 0;
      data.services.forEach(svc=>{
        const sku = svc.skus.find(s=>s.id===selections[svc.name]);
        if(sku) total += sku.cost;
      });
      const jml = document.getElementById('jml-sel').value;
      const mult = (data.jml_impact && data.jml_impact[jml]) ? data.jml_impact[jml].cost_multiplier : 1.0;
      const adjusted = (total * mult).toFixed(2);
      document.getElementById('total').textContent = `Total: $${total}/mo  (adjusted: $${adjusted}/mo)`;
    }

    document.getElementById('jml-sel').addEventListener('change', recompute);
    document.getElementById('export-btn').addEventListener('click', ()=>{
      const out = { selections, jml: document.getElementById('jml-sel').value, timestamp: Date.now() };
      const blob = new Blob([JSON.stringify(out,null,2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'pricing-scenario.json'; a.click();
      URL.revokeObjectURL(url);
    });

    recompute();
  });
}
