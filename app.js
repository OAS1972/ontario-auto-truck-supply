
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

async function loadCSV(path){
  const res = await fetch(path + "?v=" + Date.now());
  const text = await res.text();
  return parseCSV(text);
}

function parseCSV(str){
  const rows = [];
  let i=0, field='', row=[], inQuotes=false;
  while(i<str.length){
    const c = str[i];
    if(c === '"'){
      if(inQuotes && str[i+1] === '"'){ field+='"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if(c === ',' && !inQuotes){
      row.push(field); field='';
    } else if((c === '\n' || c === '\r') && !inQuotes){
      if(field.length || row.length){ row.push(field); rows.push(row); }
      field=''; row=[];
      if(c === '\r' && str[i+1] === '\n') i++;
    } else {
      field += c;
    }
    i++;
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows;
}

function uniqueSorted(arr){
  return [...new Set(arr)].filter(Boolean).sort((a,b)=> (a+"").localeCompare(b+""));
}

function populateSelect(select, values, placeholder){
  select.innerHTML = "";
  const opt = document.createElement("option");
  opt.value = ""; opt.textContent = placeholder;
  select.appendChild(opt);
  values.forEach(v => {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    select.appendChild(o);
  });
}

let YMM_DATA = [];
let HEAD = [];

async function initYMM(){
  const rows = await loadCSV("./data/ymm.csv");
  HEAD = rows.shift();
  YMM_DATA = rows.map(r => Object.fromEntries(HEAD.map((h,i)=>[h,r[i]])));
  populateSelect($('#year'), uniqueSorted(YMM_DATA.map(r=>r.Year)).reverse(), "Year");
  populateSelect($('#make'), uniqueSorted(YMM_DATA.map(r=>r.Make)), "Make");
  populateSelect($('#model'), uniqueSorted(YMM_DATA.map(r=>r.Model)), "Model");
  populateSelect($('#engine'), uniqueSorted(YMM_DATA.map(r=>r.Engine)), "Engine");
  populateSelect($('#category'), uniqueSorted(YMM_DATA.map(r=>r.Category)), "Category");
}

function searchYMM(){
  const year = $('#year').value;
  const make = $('#make').value;
  const model = $('#model').value;
  const engine = $('#engine').value;
  const cat = $('#category').value;
  const results = YMM_DATA.filter(r =>
    (!year || r.Year===year) &&
    (!make || r.Make===make) &&
    (!model || r.Model===model) &&
    (!engine || r.Engine===engine) &&
    (!cat || r.Category===cat)
  );
  const tbody = $('#results-body');
  tbody.innerHTML = "";
  if(results.length === 0){
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 7;
    td.textContent = "No results yet. Try loosening a filter or add rows to data/ymm.csv";
    tr.appendChild(td); tbody.appendChild(tr);
    return;
  }
  results.forEach(r=>{
    const tr = document.createElement('tr');
    ["Year","Make","Model","Engine","Category","PartNumber","Notes"].forEach((k)=>{
      const td = document.createElement('td');
      td.textContent = r[k] || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initYMM();
  $('#search').addEventListener('click', searchYMM);
});
