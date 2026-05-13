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

  // Interactive SKU toggle UI
  const container = document.createElement('div');
  container.style.marginTop = '12px';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '12px';

  const label = document.createElement('label');
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = true; // SKU-A enabled by default
  checkbox.id = 'sku-a-enabled';
  const span = document.createElement('span');
  span.textContent = ' SKU-A enabled';
  span.style.marginLeft = '8px';
  span.style.color = '#cfe';
  label.appendChild(checkbox);
  label.appendChild(span);
  container.appendChild(label);

  // Baseline mock cost
  const baseline = 1000; // dollars per month (mock)
  const costInfo = document.createElement('div');
  costInfo.style.color = '#cfe';
  costInfo.textContent = `Estimated baseline monthly cost: $${baseline}`;
  container.appendChild(costInfo);

  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply scenario';
  applyBtn.style.marginLeft = '8px';
  applyBtn.onclick = ()=>{
    const enabled = checkbox.checked;
    const out = document.getElementById('pricing-out');
    const savingsRate = enabled ? 0.0 : 0.30; // 30% savings when SKU-A is turned off
    const newCost = Math.round(baseline * (1 - savingsRate));
    if(enabled){
      out.textContent = `SKU-A is ON. Estimated monthly cost: $${newCost}`;
    } else {
      out.textContent = `SKU-A is OFF. Estimated monthly cost: $${newCost} (approx ${Math.round(savingsRate*100)}% savings)`;
    }
  };
  container.appendChild(applyBtn);

  root.appendChild(container);

  const out = document.createElement('pre');
  out.id = 'pricing-out';
  out.style.color = '#cfe';
  out.style.padding = '8px';
  out.style.marginTop = '12px';
  out.textContent = 'No scenario applied';
  root.appendChild(out);

  const foot = document.getElementById('status');
  if(foot) foot.textContent = 'Demo loaded (interactive)';
}
