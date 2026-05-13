export function init(){
  const root = document.getElementById('spa-root');
  if(!root) return;
  root.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = 'M365 Administration (Demo)';
  h.style.color = '#00ff41';
  root.appendChild(h);

  const p = document.createElement('p');
  p.style.color = '#cfe';
  p.textContent = 'Entra & Intune configuration · Job-title driven access packages · JML workflows · Role/PIM mapping (mock data)';
  root.appendChild(p);

  const list = document.createElement('div');
  list.style.display = 'grid';
  list.style.gridTemplateColumns = 'repeat(auto-fit,minmax(220px,1fr))';
  list.style.gap = '12px';

  const cards = [
    {title:'Access Package: Cloud Admin', desc:'Role: Cloud Admin; Owners: IT; Approvals: 2-step'},
    {title:'JML: New Hire Flow', desc:'Auto-provision baseline licenses and groups on hire'},
    {title:'PIM Mapping', desc:'Critical roles scheduled for time-limited elevation'},
    {title:'Intune Policy: Enforce MFA', desc:'Rollout to corp devices; monitoring enabled'}
  ];

  cards.forEach(c=>{
    const card = document.createElement('div');
    card.style.padding='12px';
    card.style.background='#021020';
    card.style.border='1px solid rgba(0,255,65,0.06)';
    card.style.borderRadius='8px';
    const t = document.createElement('div'); t.textContent = c.title; t.style.fontWeight='700'; t.style.color='#00d4ff';
    const d = document.createElement('div'); d.textContent = c.desc; d.style.marginTop='8px'; d.style.color='#9fd';
    card.appendChild(t); card.appendChild(d); list.appendChild(card);
  });

  root.appendChild(list);

  const foot = document.getElementById('status');
  if(foot) foot.textContent = 'Demo loaded (static)';
}
