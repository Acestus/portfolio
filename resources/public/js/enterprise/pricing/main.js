export function init(){
  const root = document.getElementById('spa-root');
  if(!root) return;
  root.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = 'Pricing Optimizer (Demo)';
  h.style.color = '#00ff41';
  root.appendChild(h);

  const p = document.createElement('p');
  p.style.color = '#cfe';
  p.textContent = 'SKU selection · Tagging & naming · JML-aware cost impacts · Scenario compare (mock data)';
  root.appendChild(p);

  const btn = document.createElement('button'); btn.textContent = 'Run simple scenario'; btn.style.marginTop='12px'; btn.onclick = ()=>{
    const out = document.createElement('pre'); out.style.color = "#cfe"; out.style.padding='8px'; out.textContent = 'Scenario: Turn off SKU-A for 30% savings (mock)';
    root.appendChild(out);
  };
  root.appendChild(btn);
  const foot = document.getElementById('status');
  if(foot) foot.textContent = 'Demo loaded (static)';
}
