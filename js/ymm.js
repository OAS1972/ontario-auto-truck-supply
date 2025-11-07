async function loadYMM(){
  const res = await fetch('./assets/ymm.json');
  const data = await res.json();
  return data;
}

function unique(arr){return Array.from(new Set(arr))}

function populateSelect(select, values, placeholder){
  select.innerHTML = `<option value="">${placeholder}</option>` + values.map(v=>`<option value="${v}">${v}</option>`).join('');
}

async function initYMM(){
  const data = await loadYMM();
  const yearSel = document.getElementById('year');
  const makeSel = document.getElementById('make');
  const modelSel = document.getElementById('model');
  const results = document.getElementById('results');

  const years = unique(data.map(x=>x.year)).sort((a,b)=>b-a);
  populateSelect(yearSel, years, 'Year');

  yearSel.addEventListener('change', ()=>{
    const makes = unique(data.filter(x=> String(x.year)===yearSel.value).map(x=>x.make)).sort();
    populateSelect(makeSel, makes, 'Make');
    populateSelect(modelSel, [], 'Model');
    results.innerHTML = '';
  });

  makeSel.addEventListener('change', ()=>{
    const models = unique(data.filter(x=> String(x.year)===yearSel.value && x.make===makeSel.value).map(x=>x.model)).sort();
    populateSelect(modelSel, models, 'Model');
    results.innerHTML = '';
  });

  modelSel.addEventListener('change', ()=>{
    const match = data.find(x=> String(x.year)===yearSel.value && x.make===makeSel.value && x.model===modelSel.value);
    if(!match){results.innerHTML='';return;}
    const rows = Object.entries(match.parts).map(([k,v])=>`<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join('');
    results.innerHTML = `<table>${rows}</table>`;
  });

  // Enable anchor jump behavior for Find My Parts
  const jumpBtn = document.getElementById('jump');
  if(jumpBtn){
    jumpBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const el = document.getElementById('find');
      if(el){ el.scrollIntoView({behavior:'instant', block:'start'}); }
    });
  }
}

document.addEventListener('DOMContentLoaded', initYMM);