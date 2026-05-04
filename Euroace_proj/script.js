const DB='euroace_fichas';
const esc=s=>s?String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):'';
function dbGet(){try{return JSON.parse(localStorage.getItem(DB))||[]}catch{return[]}}
function dbSet(d){localStorage.setItem(DB,JSON.stringify(d))}
function sc(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
function initScroll(){
 const pb=document.getElementById('pb'),bt=document.getElementById('btop');
 window.addEventListener('scroll',()=>{
 const sy=window.scrollY,dh=document.documentElement.scrollHeight-window.innerHeight;
 pb.style.width=(dh>0?sy/dh*100:0)+'%';
 bt.classList.toggle('vis',sy>400);
 },{passive:true});
}
function animCount(el,target){
 let v=0;const step=target/60;
 const t=setInterval(()=>{v+=step;if(v>=target){el.textContent=target+(target>20?'+':'');clearInterval(t)}else el.textContent=Math.floor(v)},16);
}
function initCounters(){
 const s=document.getElementById('sec-about');let done=false;
 new IntersectionObserver(e=>{
 if(e[0].isIntersecting&&!done){done=true;
 animCount(document.getElementById('c1'),27);
 animCount(document.getElementById('c2'),dbGet().length||8);
 animCount(document.getElementById('c3'),100);
 animCount(document.getElementById('c4'),71);
 }
 },{threshold:.3}).observe(s);
}
function showToast(msg,col='#22c55e'){
 const t=document.getElementById('toast');t.textContent=msg;t.style.background=col;
 t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);
}
function openAdm(){document.getElementById('overlay').classList.add('open')}
function closeAdm(){document.getElementById('overlay').classList.remove('open')}
function showV(id){document.querySelectorAll('.av').forEach(v=>v.classList.remove('act'));document.getElementById(id).classList.add('act')}
function doLogin(){
 const u=document.getElementById('lu').value.trim(),p=document.getElementById('lp').value;
 const err=document.getElementById('lerr');
 if(u==='admin'&&p==='1234'){err.classList.remove('show');showV('vf')}
 else{err.classList.add('show');document.getElementById('lp').value=''}
}
function doLogout(){showV('vl');document.getElementById('lu').value='';document.getElementById('lp').value=''}
function addIng(q='',p=''){
 const c=document.getElementById('irows'),d=document.createElement('div');d.className='dr';
 d.innerHTML=`<input type="text" placeholder="Qtd." value="${esc(q)}"/><input type="text" placeholder="Produto" value="${esc(p)}"/><button class="rmb" onclick="rmRow(this)"></button>`;
 c.appendChild(d);d.querySelector('input').focus();
}
function rmRow(btn){if(document.querySelectorAll('#irows .dr').length>1)btn.closest('.dr').remove()}
function addStep(txt=''){
 const c=document.getElementById('srows'),idx=c.querySelectorAll('.sr2').length+1,d=document.createElement('div');
 d.className='sr2';d.innerHTML=`<div class="sn2">${idx}</div><input type="text" placeholder="Descreva o passo..." value="${esc(txt)}"/><button class="rmb" onclick="rmStep(this)"></button>`;
 c.appendChild(d);d.querySelector('input').focus();
}
function rmStep(btn){if(document.querySelectorAll('#srows .sr2').length>1){btn.closest('.sr2').remove();document.querySelectorAll('#srows .sn2').forEach((n,i)=>n.textContent=i+1)}}
function doSave(){
 const pr=document.getElementById('fp').value.trim(),pa=document.getElementById('fpa').value.trim();
 if(!pr||!pa){showToast('Nome do Prato e País são obrigatórios','#f59e0b');return}
 const ings=[];
 document.querySelectorAll('#irows .dr').forEach(r=>{const ins=r.querySelectorAll('input');const q=ins[0].value.trim(),p=ins[1].value.trim();if(q||p)ings.push({q,p})});
 const steps=[];
 document.querySelectorAll('#srows .sr2 input').forEach(i=>{const t=i.value.trim();if(t)steps.push(t)});
 const ficha={id:Date.now(),prato:pr,pais:pa,porcoes:document.getElementById('fpo').value||'100',tempo:document.getElementById('ft').value.trim(),escola:document.getElementById('fe').value.trim(),ings,steps,material:document.getElementById('fm').value.trim(),data:new Date().toLocaleDateString('pt-PT')};
 const all=dbGet();all.unshift(ficha);dbSet(all);
 renderFichas();resetForm();closeAdm();showToast('Ficha guardada com sucesso!');
}
function resetForm(){
 ['fp','ft','fe','fm'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
 document.getElementById('fpa').value='';document.getElementById('fpo').value='100';
 document.getElementById('irows').innerHTML=`<div class="dr"><input type="text" placeholder="Qtd."/><input type="text" placeholder="Produto"/><button class="rmb" onclick="rmRow(this)"></button></div>`;
 document.getElementById('srows').innerHTML=`<div class="sr2"><div class="sn2">1</div><input type="text" placeholder="Descreva o passo..."/><button class="rmb" onclick="rmStep(this)"></button></div>`;
}
function renderFichas(){
 const grid=document.getElementById('fg');grid.innerHTML='';
 const data=dbGet();
 if(!data.length){
 grid.innerHTML=`<div class="empty"><div style="font-size:3rem;opacity:.3"></div><p style="margin-top:.5rem">Ainda não há fichas.<br>Use o painel Admin para adicionar.</p></div>`;
 return;
 }
 data.forEach((f,idx)=>{
 // Ingredientes rows
 const ingRows=(f.ings&&f.ings.length)
 ? f.ings.map(i=>`<tr class="ing-row"><td>${esc(i.q)}</td><td>${esc(i.p)}</td></tr>`).join('')
 : `<tr class="ing-row"><td colspan="2" style="color:#aaa;font-style:italic;text-align:center">–</td></tr>`;

 // Passos rows
 const stepRows=(f.steps&&f.steps.length)
 ? f.steps.map((s,i)=>`<tr class="step-row"><td>${i+1}</td><td>${esc(s)}</td></tr>`).join('')
 : `<tr class="step-row"><td>–</td><td style="color:#aaa;font-style:italic">–</td></tr>`;

 const card=document.createElement('article');
 card.className='fcard';
 card.innerHTML=`
 <div class="fcard-escola">
 <span>${esc(f.escola||'EuroACE')}</span>
 <span class="fcard-nr">Nº ${String(idx+1).padStart(2,'0')} &nbsp;|&nbsp; ${esc(f.pais)}</span>
 </div>

 <table class="ftable">
 <thead>
 <tr><th colspan="2">FICHA TÉCNICA — SHOWCOOKING</th></tr>
 </thead>
 <tbody>
 <!-- Nome do prato -->
 <tr class="row-prato">
 <td>Nome do Prato</td>
 <td>${esc(f.prato)}</td>
 </tr>
 <!-- Meta: porções / preparação / país -->
 <tr class="row-meta">
 <td class="meta-key">Nº Porções (Pax)</td>
 <td class="meta-val">${esc(String(f.porcoes))}</td>
 </tr>
 <tr class="row-meta">
 <td class="meta-key">Tempo de Preparação</td>
 <td class="meta-val">${esc(f.tempo||'–')}</td>
 </tr>
 <tr class="row-meta">
 <td class="meta-key">País / Região</td>
 <td class="meta-val">${esc(f.pais)}</td>
 </tr>
 <tr class="row-meta">
 <td class="meta-key">Data</td>
 <td class="meta-val">${esc(f.data)}</td>
 </tr>

 <!-- Secção Ingredientes -->
 <tr class="section-header"><td colspan="2">INGREDIENTES</td></tr>
 <tr class="ing-head"><th>Quantidade</th><th>Produto</th></tr>
 ${ingRows}

 <!-- Secção Preparação -->
 <tr class="section-header"><td colspan="2">PREPARAÇÃO / CONFEÇÃO</td></tr>
 ${stepRows}

 <!-- Secção Material -->
 <tr class="section-header"><td colspan="2">MATERIAL NECESSÁRIO</td></tr>
 <tr class="mat-row">
 <td>Material</td>
 <td>${esc(f.material||'–')}</td>
 </tr>
 </tbody>
 </table>

 <div class="fcard-actions">
 <button class="btn-print" onclick="printFicha(${f.id})"> Imprimir</button>
 <button class="rem-btn" onclick="removeF(${f.id})"> Remover</button>
 </div>`;
 grid.appendChild(card);
 });
}

function printFicha(id){
 const f=dbGet().find(x=>x.id===id);
 if(!f)return;
 const ingRows=(f.ings&&f.ings.length)?f.ings.map(i=>`<tr><td style="border:1px solid #999;padding:6px 8px">${esc(i.q)}</td><td style="border:1px solid #999;padding:6px 8px">${esc(i.p)}</td></tr>`).join(''):''
 const stepRows=(f.steps&&f.steps.length)?f.steps.map((s,i)=>`<tr><td style="border:1px solid #999;padding:6px 8px;text-align:center;font-weight:700;background:#4a5a8a;color:#fff">${i+1}</td><td style="border:1px solid #999;padding:6px 8px">${esc(s)}</td></tr>`).join(''):''
 const w=window.open('','_blank');
 w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Ficha – ${esc(f.prato)}</title>
 <style>body{font-family:Arial,sans-serif;padding:2cm;color:#111}h2{text-align:center;color:#4a5a8a;border-bottom:2px solid #4a5a8a;padding-bottom:.5rem;margin-bottom:1.5rem}
 table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
 th{background:#4a5a8a;color:#fff;padding:8px;font-size:.8rem;letter-spacing:1px;text-transform:uppercase;border:1px solid #999}
 .sec{background:#4a5a8a;color:#fff;font-weight:700;font-size:.8rem;letter-spacing:2px;text-transform:uppercase;padding:6px 8px;border:1px solid #999;text-align:center}
 .lbl{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;background:#f0f0f0;border:1px solid #999;padding:6px 8px}
 .val{padding:6px 8px;border:1px solid #999}
 </style></head><body>
 <h2>FICHA TÉCNICA — SHOWCOOKING<br><small style="font-size:.9rem">${esc(f.escola||'EuroACE')}</small></h2>
 <table>
 <tr><td class="lbl">Nome do Prato</td><td class="val" style="font-weight:700;font-size:1.05rem">${esc(f.prato)}</td></tr>
 <tr><td class="lbl">País / Região</td><td class="val">${esc(f.pais)}</td></tr>
 <tr><td class="lbl">Nº Porções (Pax)</td><td class="val">${esc(String(f.porcoes))}</td></tr>
 <tr><td class="lbl">Tempo de Preparação</td><td class="val">${esc(f.tempo||'–')}</td></tr>
 </table>
 <table>
 <tr><td class="sec" colspan="2">INGREDIENTES</td></tr>
 <tr><th>Quantidade</th><th>Produto</th></tr>
 ${ingRows}
 </table>
 <table>
 <tr><td class="sec" colspan="2">PREPARAÇÃO / CONFEÇÃO</td></tr>
 ${stepRows}
 </table>
 <table>
 <tr><td class="sec" colspan="2">MATERIAL NECESSÁRIO</td></tr>
 <tr><td class="val" colspan="2">${esc(f.material||'–')}</td></tr>
 </table>
 </body></html>`);
 w.document.close();w.print();
}
function removeF(id){if(!confirm('Remover esta ficha?'))return;dbSet(dbGet().filter(f=>f.id!==id));renderFichas();showToast('Ficha removida.','#ef4444')}
renderFichas();initScroll();initCounters();
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAdm()});

// ── REGISTO PÚBLICO ──
const DB_PENDING='euroace_pending';
function dbGetPending(){try{return JSON.parse(localStorage.getItem(DB_PENDING))||[]}catch{return[]}}
function dbSetPending(d){localStorage.setItem(DB_PENDING,JSON.stringify(d))}

// Update the Nº display based on total fichas count
function updateRegNr(){
  const total=dbGet().length+dbGetPending().length;
  document.getElementById('reg-nr-display').textContent='Nº '+String(total+1).padStart(2,'0');
}
updateRegNr();

function regRmIng(btn){
  const rows=document.querySelectorAll('#reg-irows .ing-grid');
  if(rows.length>1)btn.closest('.ing-grid').remove();
}
function regAddIng(){
  const c=document.getElementById('reg-irows'),d=document.createElement('div');
  d.className='ing-grid';
  d.innerHTML='<input type="text" placeholder="Qtd."/><input type="text" placeholder="Produto"/><button class="rmb" onclick="regRmIng(this)">x</button>';
  c.appendChild(d);d.querySelector('input').focus();
}
function regRmStep(btn){
  const rows=document.querySelectorAll('#reg-srows .step-grid');
  if(rows.length>1){btn.closest('.step-grid').remove();regRenumberSteps();}
}
function regAddStep(){
  const c=document.getElementById('reg-srows'),idx=c.querySelectorAll('.step-grid').length+1,d=document.createElement('div');
  d.className='step-grid';
  d.innerHTML='<div class="step-num">'+idx+'</div><input type="text" placeholder="Descreva o passo..."/><button class="rmb" onclick="regRmStep(this)">x</button>';
  c.appendChild(d);d.querySelector('input').focus();
}
function regRenumberSteps(){
  document.querySelectorAll('#reg-srows .step-num').forEach((n,i)=>n.textContent=i+1);
}
function regSubmit(){
  const prato=document.getElementById('reg-prato').value.trim();
  const pais=document.getElementById('reg-pais').value.trim();
  if(!prato||!pais){showToast('Nome do Prato e País são obrigatórios','#f59e0b');return;}
  const ings=[];
  document.querySelectorAll('#reg-irows .ing-grid').forEach(r=>{
    const ins=r.querySelectorAll('input');
    const q=ins[0].value.trim(),p=ins[1].value.trim();
    if(q||p)ings.push({q,p});
  });
  const steps=[];
  document.querySelectorAll('#reg-srows .step-grid input').forEach(i=>{
    const t=i.value.trim();if(t)steps.push(t);
  });
  const ficha={
    id:Date.now(),
    prato,pais,
    porcoes:document.getElementById('reg-porcoes').value||'100',
    forma:document.getElementById('reg-forma').value.trim(),
    tempo:document.getElementById('reg-tempo').value.trim(),
    escola:document.getElementById('reg-escola').value.trim(),
    ings,steps,
    material:document.getElementById('reg-material').value.trim(),
    data:new Date().toLocaleDateString('pt-PT'),
    pendente:true
  };
  const pending=dbGetPending();pending.unshift(ficha);dbSetPending(pending);
  document.getElementById('reg-form-wrap').style.display='none';
  document.getElementById('reg-success').classList.add('show');
  showToast('Ficha submetida! Aguarda aprovação.');
}

// Admin: show pending count badge
function renderPendingBadge(){
  const n=dbGetPending().length;
  const btn=document.getElementById('btn-adm');
  let badge=document.getElementById('pending-badge');
  if(n>0){
    if(!badge){badge=document.createElement('span');badge.id='pending-badge';badge.style.cssText='background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;margin-left:.2rem';btn.appendChild(badge);}
    badge.textContent=n;
  } else if(badge){badge.remove();}
}
renderPendingBadge();

function showPending(){
  showV('vp');
  const list=document.getElementById('pending-list');
  const pending=dbGetPending();
  // update count
  const cnt=document.getElementById('adm-pend-count');
  if(cnt)cnt.textContent=pending.length>0?'('+pending.length+')':'';
  if(!pending.length){
    list.innerHTML='<p style="font-size:.85rem;color:var(--mid);text-align:center;padding:2rem">Nenhuma ficha pendente.</p>';
    return;
  }
  list.innerHTML=pending.map((f,i)=>`
    <div style="border:1.5px solid #bcc8e8;border-radius:10px;margin-bottom:1rem;overflow:hidden">
      <div style="background:linear-gradient(90deg,#4a5a8a,#6a7aaa);color:#fff;padding:.5rem 1rem;font-size:.72rem;font-weight:700;letter-spacing:1px;display:flex;justify-content:space-between;align-items:center;text-transform:uppercase">
        <span>${esc(f.escola||'—')}</span>
        <span style="background:#c9a000;color:#1a1000;padding:.15rem .5rem;border-radius:4px;font-size:.65rem">${esc(f.pais)}</span>
      </div>
      <div style="padding:.75rem 1rem;font-size:.85rem">
        <strong style="font-family:Georgia,serif;font-size:1rem">${esc(f.prato)}</strong>
        <div style="color:var(--mid);font-size:.75rem;margin-top:.2rem">${esc(f.data)} &nbsp;|&nbsp; ${esc(f.porcoes)} pax &nbsp;|&nbsp; ${esc(f.tempo||'—')}</div>
        ${f.forma?'<div style="color:var(--mid);font-size:.75rem">Forma: '+esc(f.forma)+'</div>':''}
        <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
          <button onclick="approvePending(${f.id})" style="padding:.3rem .8rem;background:#22c55e;color:#fff;border:none;border-radius:6px;font-size:.75rem;font-weight:700;cursor:pointer">Aprovar</button>
          <button onclick="rejectPending(${f.id})" style="padding:.3rem .8rem;background:#fee2e2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;font-size:.75rem;font-weight:700;cursor:pointer">Rejeitar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function approvePending(id){
  const pending=dbGetPending();
  const f=pending.find(x=>x.id===id);
  if(!f)return;
  delete f.pendente;
  const all=dbGet();all.unshift(f);dbSet(all);
  dbSetPending(pending.filter(x=>x.id!==id));
  renderFichas();renderPendingBadge();showPending();
  showToast('Ficha aprovada e publicada!');
}
function rejectPending(id){
  if(!confirm('Rejeitar e eliminar esta ficha?'))return;
  dbSetPending(dbGetPending().filter(x=>x.id!==id));
  renderPendingBadge();showPending();
  showToast('Ficha rejeitada.','#ef4444');
}