export function init(){
  const root = document.getElementById('spa-root');
  fetch('/static/mock/m365.json').then(r=>r.json()).then(data=>{
    const container = document.createElement('div');
    container.style.color = '#dfefff';

    const title = document.createElement('h3'); title.textContent = 'Job Title → Access Packages';
    const select = document.createElement('select'); select.style.marginRight='8px';
    Object.keys(data.job_titles).forEach(jt=>{
      const o = document.createElement('option'); o.value = jt; o.textContent = jt; select.appendChild(o);
    });
    const show = document.createElement('div'); show.style.marginTop='10px';

    const workflows = document.createElement('div'); workflows.style.marginTop='16px';
    workflows.innerHTML = '<strong>JML Workflows</strong><br>';
    Object.keys(data.jml_workflows).forEach(w=>{
      const btn = document.createElement('button'); btn.textContent = w; btn.style.marginRight='8px';
      btn.addEventListener('click', ()=>{
        alert('Workflow ' + w + ':\n' + data.jml_workflows[w].steps.join('\n'));
      });
      workflows.appendChild(btn);
    });

    const groupsDiv = document.createElement('div'); groupsDiv.style.marginTop='12px';

    function update(){
      const jt = select.value; const cfg = data.job_titles[jt];
      show.innerHTML = `<div>Access Packages: <pre style="display:inline;white-space:pre-wrap">${JSON.stringify(cfg.access_packages)}</pre></div>`;
      // find groups that have roles matching packages—mock heuristic
      const matched = Object.keys(data.entra_groups).filter(g=> data.entra_groups[g].roles && data.entra_groups[g].roles.length>0);
      groupsDiv.innerHTML = '<div>Entra groups (mock): ' + matched.join(', ') + '</div>';
    }

    container.appendChild(title); container.appendChild(select); container.appendChild(show); container.appendChild(groupsDiv); container.appendChild(workflows);
    root.innerHTML=''; root.appendChild(container);
    select.addEventListener('change', update);
    update();
  });
}
