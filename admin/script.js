/* ============ THEME (in-memory; respects system preference) ============ */
const root = document.documentElement;
const sunPath = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const moonPath = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const themeBtn = document.getElementById('themeBtn');
let dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme(){ root.setAttribute('data-theme', dark ? 'dark':'light'); themeBtn.innerHTML = dark ? sunPath : moonPath; }
applyTheme();
themeBtn.addEventListener('click', ()=>{ dark = !dark; applyTheme(); });

/* ============ NAV scroll + mobile ============ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', ()=> nav.classList.toggle('scrolled', window.scrollY > 20));
const mm = document.getElementById('mobileMenu'), ov = document.getElementById('overlay');
function closeMenu(){ mm.classList.remove('open'); ov.classList.remove('open'); }
document.getElementById('hamb').addEventListener('click', ()=>{ mm.classList.add('open'); ov.classList.add('open'); });
document.getElementById('mClose').addEventListener('click', closeMenu);
ov.addEventListener('click', closeMenu);
mm.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeMenu));

/* ============ Counters ============ */
function animateCounter(el){
  const target = +el.dataset.target, suffix = el.dataset.suffix || '', span = el.querySelector('span');
  let cur = 0; const step = target/60;
  const t = setInterval(()=>{ cur += step; if(cur>=target){cur=target; clearInterval(t);}
    let v = Math.floor(cur); span.textContent = v>=1000 ? (v/1000).toFixed(v>=100000?0:1).replace('.0','')+'k' : v;
    if(cur===target) span.textContent = (target>=1000? (target/1000)+'k':target);
    span.parentNode.lastChild.nodeType; el.childNodes[el.childNodes.length-1]; }, 22);
  // ensure suffix
  el.insertAdjacentText('beforeend', '');
}
/* simpler robust counter */
function runCounters(){
  document.querySelectorAll('.num[data-target]').forEach(el=>{
    if(el.dataset.done) return; el.dataset.done = 1;
    const target = +el.dataset.target, suffix = el.dataset.suffix||'';
    const span = el.querySelector('span'); let cur=0; const dur=1400, t0=performance.now();
    function tick(now){ const p=Math.min((now-t0)/dur,1); const v=Math.floor(target*(1-Math.pow(1-p,3)));
      span.textContent = v>=1000 ? (v/1000)+'k'.replace('1.6k','') : v;
      if(v>=1000){ span.textContent = (v/1000)%1===0 ? (v/1000)+'k' : (v/1000).toFixed(1)+'k'; }
      el.lastChild.textContent = suffix;
      if(p<1) requestAnimationFrame(tick); else { span.textContent = (target>=1000?(target/1000)+'k':target); el.lastChild.textContent=suffix; } }
    el.appendChild(document.createTextNode(suffix));
    requestAnimationFrame(tick);
  });
}

/* ============ Reveal on scroll ============ */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in');
    if(e.target.classList.contains('hero')||e.target.querySelector('.num')) runCounters();
    io.unobserve(e.target); } });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{ el.style.transitionDelay = (i%4*70)+'ms'; io.observe(el); });
setTimeout(runCounters, 400);

/* ============ NOTES DATA ============ */
const notes = [
  {s:'Anatomy', y:'Year 1', t:'The Brachial Plexus Simplified', d:'Roots to branches with a memory map and clinical injury patterns.'},
  {s:'Physiology', y:'Year 1', t:'The Cardiac Cycle in 7 Steps', d:'Pressure-volume changes, valves and heart sounds made intuitive.'},
  {s:'Pharmacology', y:'Year 2', t:'Beta-Blockers: One Table', d:'Selectivity, indications and side effects in a single high-yield grid.'},
  {s:'Pathology', y:'Year 3', t:'Mechanisms of Cell Injury', d:'Reversible vs irreversible injury with the key morphological clues.'},
  {s:'Biochemistry', y:'Year 1', t:'Glycolysis Without the Pain', d:'Ten steps, key enzymes and the clinical conditions tied to each.'},
  {s:'Physiology', y:'Year 2', t:'Acid-Base Balance Decoded', d:'A foolproof approach to ABG interpretation with worked examples.'},
  {s:'Pharmacology', y:'Year 3', t:'Antibiotics by Mechanism', d:'Cell wall, protein synthesis and DNA inhibitors organised visually.'},
  {s:'Anatomy', y:'Year 1', t:'Cranial Nerves Made Easy', d:'Functions, foramina and lesions for all twelve, with mnemonics.'},
];
const subjColors = {Anatomy:'#e0524e',Physiology:'#0ea394',Pharmacology:'#15a06b',Pathology:'#d9a441',Biochemistry:'#0ea394'};
function renderNotes(filter='all', q=''){
  const grid = document.getElementById('notesGrid'); grid.innerHTML='';
  notes.filter(n=> (filter==='all'||n.s===filter||n.y===filter) && (n.t.toLowerCase().includes(q)||n.d.toLowerCase().includes(q)))
  .forEach(n=>{
    const c = subjColors[n.s]||'#0ea394';
    const el = document.createElement('div'); el.className='note';
    el.innerHTML = `<div class="meta"><span class="subj" style="color:${c};background:color-mix(in srgb,${c} 14%,transparent)">${n.s}</span><span class="yr">${n.y}</span></div>
      <h4>${n.t}</h4><p>${n.d}</p>
      <div class="foot"><a class="dl" href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12M7 11l5 4 5-4M5 21h14"/></svg> Download PDF</a>
      <button class="bm" aria-label="Bookmark"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button></div>`;
    el.querySelector('.bm').addEventListener('click', e=> e.currentTarget.classList.toggle('saved'));
    grid.appendChild(el);
  });
  if(!grid.children.length) grid.innerHTML='<p style="color:var(--muted);text-align:center;grid-column:1/-1;">No notes match — try another search.</p>';
}
renderNotes();
let curFilter='all';
document.getElementById('noteFilters').addEventListener('click', e=>{
  if(!e.target.classList.contains('chip')) return;
  document.querySelectorAll('#noteFilters .chip').forEach(c=>c.classList.remove('active'));
  e.target.classList.add('active'); curFilter = e.target.dataset.f;
  renderNotes(curFilter, document.getElementById('noteSearch').value.toLowerCase());
});
document.getElementById('noteSearch').addEventListener('input', e=> renderNotes(curFilter, e.target.value.toLowerCase()));

/* ============ ILLUSTRATIONS ============ */
const systems = [
  {n:'Cardiovascular', c:'#e0524e', svg:'<path d="M50 88S12 62 12 36C12 20 24 12 34 12c8 0 14 6 16 11 2-5 8-11 16-11 10 0 22 8 22 24 0 26-38 52-38 52z" fill="currentColor"/>'},
  {n:'Respiratory', c:'#0ea394', svg:'<path d="M50 14v30M38 44c-12 2-22 14-22 30 0 8 4 12 10 12s10-6 10-16V44zM62 44c12 2 22 14 22 30 0 8-4 12-10 12s-10-6-10-16V44z" fill="none" stroke="currentColor" stroke-width="4"/>'},
  {n:'Nervous', c:'#d9a441', svg:'<circle cx="50" cy="36" r="22" fill="none" stroke="currentColor" stroke-width="4"/><path d="M50 58v30M50 88c-6 0-10-4-12-8M50 88c6 0 10-4 12-8M42 30c4-4 12-4 16 0M40 42c6 4 14 4 20 0" fill="none" stroke="currentColor" stroke-width="4"/>'},
  {n:'Digestive', c:'#15a06b', svg:'<path d="M40 12v16c0 6-10 8-10 20s14 14 14 24-8 12-8 16" fill="none" stroke="currentColor" stroke-width="4"/><path d="M60 12c0 14-16 10-16 26" fill="none" stroke="currentColor" stroke-width="4"/>'},
  {n:'Renal', c:'#0ea394', svg:'<path d="M36 20c12 0 18 12 18 28S46 80 34 80c-8 0-12-8-12-16 0-6 4-10 4-16s-4-10-4-16 6-12 14-12z" fill="currentColor"/><path d="M64 20c-12 0-18 12-18 28" fill="none" stroke="currentColor" stroke-width="4" opacity=".5"/>'},
  {n:'Endocrine', c:'#d9a441', svg:'<circle cx="50" cy="50" r="10" fill="currentColor"/><circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" stroke-width="3" opacity=".5"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="2" opacity=".3"/>'},
  {n:'Musculoskeletal', c:'#e0524e', svg:'<path d="M30 18a8 8 0 1 0 0 16M30 26h40M70 18a8 8 0 1 1 0 16M30 66a8 8 0 1 0 0 16M30 74h40M70 66a8 8 0 1 1 0 16M40 30v40M60 30v40" fill="none" stroke="currentColor" stroke-width="4"/>'},
  {n:'Reproductive', c:'#0ea394', svg:'<circle cx="50" cy="34" r="18" fill="none" stroke="currentColor" stroke-width="4"/><path d="M50 52v28M38 68h24" fill="none" stroke="currentColor" stroke-width="4"/>'},
  {n:'Cell Biology', c:'#15a06b', svg:'<circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="14" fill="currentColor"/><circle cx="34" cy="40" r="4" fill="currentColor"/><circle cx="66" cy="60" r="5" fill="currentColor"/>'},
];
const illGrid = document.getElementById('illGrid');
systems.forEach(s=>{
  const el = document.createElement('div'); el.className='ill';
  el.innerHTML = `<div class="art" style="color:${s.c}"><svg viewBox="0 0 100 100">${s.svg}</svg></div>
    <div class="actions">
      <button title="Zoom"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M11 8v6M8 11h6"/></svg></button>
      <button title="Download"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 3v12M7 11l5 4 5-4M5 21h14"/></svg></button>
      <button title="Bookmark"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button>
    </div>
    <div class="ov"></div><div class="label">${s.n} System</div>`;
  illGrid.appendChild(el);
});

/* ============ YOUTUBE ============ */
const vids = [
  {c:'Pharmacology', t:'Paracetamol & Why It Kills the Liver', d:'9:14', col:'#15a06b'},
  {c:'Endocrinology', t:'Diabetes: A Protective Mechanism Gone Wrong', d:'12:40', col:'#0ea394'},
  {c:'Anatomy', t:'The Brachial Plexus You\'ll Never Forget', d:'7:52', col:'#e0524e'},
  {c:'Physiology', t:'How the Kidney Actually Works', d:'10:05', col:'#d9a441'},
  {c:'Pathology', t:'Inflammation in 10 Minutes', d:'10:33', col:'#0ea394'},
  {c:'Clinical', t:'Reading an ECG From Scratch', d:'14:18', col:'#e0524e'},
];
const ytGrid = document.getElementById('ytGrid');
vids.forEach(v=>{
  const el = document.createElement('div'); el.className='vid';
  el.innerHTML = `<div class="thumb" style="background:linear-gradient(135deg,${v.col},var(--navy))">
      <svg class="bg" viewBox="0 0 300 170" preserveAspectRatio="none"><path d="M0 90h60l15-40 25 80 18-100 22 130 16-70h128" stroke="#fff" stroke-width="2" fill="none"/></svg>
      <div class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
      <span class="dur">${v.d}</span></div>
    <div class="body"><span class="cat">${v.c}</span><h4>${v.t}</h4>
      <div class="v-meta">LANS MED · Watch now</div></div>`;
  ytGrid.appendChild(el);
});

/* ============ BLOG ============ */
const posts = [
  {c:'Clinical Pearls', t:'5 Clinical Signs Every Student Must Know', d:'Quick, high-yield bedside signs that separate strong clinicians from the rest.', col:'#0ea394'},
  {c:'Medical School Tips', t:'How to Study Anatomy Without Burning Out', d:'A sustainable, spaced-repetition system for mastering anatomy in your first year.', col:'#e0524e'},
  {c:'Pharmacology', t:'The Smart Way to Memorise Drug Side Effects', d:'Stop rote-learning. Group drugs by mechanism and the side effects make sense.', col:'#15a06b'},
];
const blogGrid = document.getElementById('blogGrid');
posts.forEach(p=>{
  const el = document.createElement('div'); el.className='post';
  el.innerHTML = `<div class="top" style="background:linear-gradient(135deg,${p.col},var(--navy))">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M4 5h16M4 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5M8 9h8M8 13h6"/></svg></div>
    <div class="body"><span class="cat" style="color:${p.col}">${p.c}</span><h4>${p.t}</h4><p>${p.d}</p>
      <a class="read" href="#">Read article <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>`;
  blogGrid.appendChild(el);
});

/* ============ MCQ ENGINE ============ */
/* banks is "let" (not const) so the CMS loader in cms-content.js can replace
   these demo questions with your real MCQ Bank when content/mcqs.json has entries. */
let banks = {
  Pharmacology: [
    {q:'Which beta-blocker is most cardioselective (β1) and thus preferred in asthmatics when a beta-blocker is needed?', o:['Propranolol','Bisoprolol','Carvedilol','Labetalol'], a:1, e:'Bisoprolol is highly β1-selective. Non-selective agents like propranolol can trigger bronchospasm via β2 blockade.'},
    {q:'A patient on warfarin starts a new antibiotic and the INR rises sharply. Which mechanism is most likely?', o:['Enzyme induction (CYP)','Enzyme inhibition (CYP)','Increased renal clearance','Reduced GI absorption'], a:1, e:'Many antibiotics inhibit CYP enzymes, reducing warfarin metabolism and raising INR — a classic interaction.'},
    {q:'Which drug class is first-line for reducing mortality in chronic heart failure with reduced ejection fraction?', o:['Calcium channel blockers','ACE inhibitors','Loop diuretics alone','Class I antiarrhythmics'], a:1, e:'ACE inhibitors reduce mortality in HFrEF. Diuretics relieve symptoms but do not improve survival on their own.'},
    {q:'The "first-pass effect" most significantly reduces the bioavailability of drugs given by which route?', o:['Intravenous','Sublingual','Oral','Transdermal'], a:2, e:'Orally administered drugs pass through the liver before reaching systemic circulation, lowering bioavailability.'},
  ],
  Physiology: [
    {q:'During which phase of the cardiac cycle are all four heart valves closed?', o:['Rapid ejection','Isovolumetric contraction','Atrial systole','Reduced filling'], a:1, e:'In isovolumetric contraction, ventricular pressure rises with no volume change — all valves are shut.'},
    {q:'Which part of the nephron is responsible for the majority of glucose reabsorption?', o:['Proximal convoluted tubule','Loop of Henle','Distal tubule','Collecting duct'], a:0, e:'~100% of filtered glucose is reabsorbed in the PCT via SGLT2/SGLT1 cotransporters.'},
    {q:'A rise in arterial CO₂ primarily stimulates ventilation by acting on which receptors?', o:['Peripheral chemoreceptors only','Central chemoreceptors via CSF H⁺','Stretch receptors','Baroreceptors'], a:1, e:'CO₂ crosses the blood-brain barrier, lowers CSF pH, and central chemoreceptors drive increased ventilation.'},
    {q:'Which hormone increases plasma calcium by acting on bone, kidney and (indirectly) gut?', o:['Calcitonin','Parathyroid hormone','Insulin','Aldosterone'], a:1, e:'PTH raises serum calcium via bone resorption, renal reabsorption and activation of vitamin D.'},
  ],
  Pathology: [
    {q:'Which type of necrosis is characteristic of tuberculosis?', o:['Coagulative','Caseous','Liquefactive','Fat'], a:1, e:'Caseous ("cheese-like") necrosis is the hallmark of TB granulomas.'},
    {q:'Reversible cell injury is best characterised by which early ultrastructural change?', o:['Nuclear fragmentation','Cellular swelling','Karyolysis','Mitochondrial rupture'], a:1, e:'Cellular (hydropic) swelling from failed ion pumps is the earliest, reversible sign of injury.'},
    {q:'Which cell is the hallmark of Hodgkin lymphoma?', o:['Reed-Sternberg cell','Plasma cell','Langhans giant cell','Foam cell'], a:0, e:'The binucleate Reed-Sternberg cell ("owl-eye" appearance) is diagnostic of Hodgkin lymphoma.'},
    {q:'Caseating granulomas with acid-fast bacilli most strongly suggest which organism?', o:['Treponema pallidum','Mycobacterium tuberculosis','Salmonella typhi','Staphylococcus aureus'], a:1, e:'Acid-fast bacilli within caseating granulomas point to M. tuberculosis.'},
  ],
};
let curTopic='Pharmacology', qi=0, score=0, answered=false, timer=null, timeLeft=30;
const qText=document.getElementById('qText'), optsEl=document.getElementById('options'),
  expl=document.getElementById('explain'), qCount=document.getElementById('qCount'),
  scorePill=document.getElementById('scorePill'), nextBtn=document.getElementById('nextBtn'),
  progFill=document.getElementById('progFill'), timeVal=document.getElementById('timeVal'),
  mcqTimer=document.getElementById('mcqTimer'), mcqBody=document.getElementById('mcqBody');
const keys=['A','B','C','D'];
function startTimer(){
  clearInterval(timer); timeLeft=30; timeVal.textContent='0:30'; mcqTimer.classList.remove('low');
  timer=setInterval(()=>{ timeLeft--; const m=Math.floor(timeLeft/60), s=timeLeft%60;
    timeVal.textContent=`${m}:${s<10?'0':''}${s}`; if(timeLeft<=10) mcqTimer.classList.add('low');
    if(timeLeft<=0){ clearInterval(timer); if(!answered) lockAnswer(-1); } },1000);
}
function loadQ(){
  const bank=banks[curTopic]; const q=bank[qi]; answered=false; nextBtn.disabled=true;
  qCount.textContent=`Question ${qi+1} of ${bank.length}`;
  qText.textContent=q.q; expl.classList.remove('show'); expl.innerHTML='';
  progFill.style.width=`${(qi/bank.length)*100}%`;
  optsEl.innerHTML='';
  q.o.forEach((opt,i)=>{
    const b=document.createElement('button'); b.className='opt';
    b.innerHTML=`<span class="key">${keys[i]}</span><span>${opt}</span>`;
    b.addEventListener('click',()=>{ if(!answered) lockAnswer(i); });
    optsEl.appendChild(b);
  });
  scorePill.textContent=`Score: ${score} / ${qi}`;
  startTimer();
}
function lockAnswer(chosen){
  answered=true; clearInterval(timer);
  const bank=banks[curTopic]; const q=bank[qi]; const opts=optsEl.querySelectorAll('.opt');
  opts.forEach((o,i)=>{ o.classList.add('locked');
    if(i===q.a) o.classList.add('correct');
    if(i===chosen && chosen!==q.a) o.classList.add('wrong'); });
  if(chosen===q.a) score++;
  expl.innerHTML=`<b>${chosen===q.a?'✓ Correct.':'Explanation:'}</b> ${q.e}`; expl.classList.add('show');
  scorePill.textContent=`Score: ${score} / ${qi+1}`;
  progFill.style.width=`${((qi+1)/bank.length)*100}%`;
  nextBtn.disabled=false;
  nextBtn.textContent = qi+1 >= bank.length ? 'See Results' : 'Next →';
}
nextBtn.addEventListener('click',()=>{
  const bank=banks[curTopic];
  if(qi+1>=bank.length){ showResult(); } else { qi++; loadQ(); }
});
function showResult(){
  clearInterval(timer);
  const bank=banks[curTopic]; const pct=Math.round(score/bank.length*100);
  let msg = pct>=75?'Excellent work — exam ready!':pct>=50?'Good effort — keep reviewing.':'Keep going — every rep counts.';
  mcqBody.innerHTML=`<div class="mcq-result">
    <div class="big">${pct}%</div><h3>${msg}</h3>
    <p>You scored ${score} out of ${bank.length} on ${curTopic}. Full bank includes timed quizzes, analytics & leaderboards.</p>
    <button class="btn btn-primary" id="retry">Try Again</button></div>`;
  document.getElementById('retry').addEventListener('click', restart);
}
function restart(){
  qi=0; score=0;
  mcqBody.innerHTML=`<div class="q-count" id="qCount"></div><div class="q-text" id="qText"></div>
    <div class="options" id="options"></div><div class="explain" id="explain"></div>
    <div class="mcq-foot"><span class="score-pill" id="scorePill"></span>
    <button class="btn btn-primary btn-sm" id="nextBtn" disabled>Next →</button></div>`;
  bindMcqRefs(); loadQ();
}
function bindMcqRefs(){
  window.qText=document.getElementById('qText');
}
document.getElementById('mcqTopics').addEventListener('click',e=>{
  if(!e.target.classList.contains('chip')) return;
  document.querySelectorAll('#mcqTopics .chip').forEach(c=>c.classList.remove('active'));
  e.target.classList.add('active'); curTopic=e.target.dataset.topic; restart();
});
/* re-grab refs after restart via simple reload approach */
const _origLoadQ = loadQ;
loadQ = function(){
  const bank=banks[curTopic]; const q=bank[qi]; answered=false;
  const _qCount=document.getElementById('qCount'),_qText=document.getElementById('qText'),
    _opts=document.getElementById('options'),_expl=document.getElementById('explain'),
    _score=document.getElementById('scorePill'),_next=document.getElementById('nextBtn');
  _next.disabled=true;
  _qCount.textContent=`Question ${qi+1} of ${bank.length}`; _qText.textContent=q.q;
  _expl.classList.remove('show'); _expl.innerHTML=''; progFill.style.width=`${(qi/bank.length)*100}%`;
  _opts.innerHTML='';
  q.o.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='opt';
    b.innerHTML=`<span class="key">${keys[i]}</span><span>${opt}</span>`;
    b.addEventListener('click',()=>{ if(!answered) doLock(i); }); _opts.appendChild(b); });
  _score.textContent=`Score: ${score} / ${qi}`; startTimer();
};
function doLock(chosen){
  answered=true; clearInterval(timer);
  const bank=banks[curTopic]; const q=bank[qi];
  const _opts=document.getElementById('options').querySelectorAll('.opt');
  const _expl=document.getElementById('explain'), _score=document.getElementById('scorePill'), _next=document.getElementById('nextBtn');
  _opts.forEach((o,i)=>{ o.classList.add('locked'); if(i===q.a)o.classList.add('correct'); if(i===chosen&&chosen!==q.a)o.classList.add('wrong'); });
  if(chosen===q.a) score++;
  _expl.innerHTML=`<b>${chosen===q.a?'✓ Correct.':'Explanation:'}</b> ${q.e}`; _expl.classList.add('show');
  _score.textContent=`Score: ${score} / ${qi+1}`; progFill.style.width=`${((qi+1)/bank.length)*100}%`;
  _next.disabled=false; _next.textContent = qi+1>=bank.length?'See Results':'Next →';
}
lockAnswer = doLock;
/* wire next button (delegated) */
mcqBody.addEventListener('click', e=>{
  if(e.target.id==='nextBtn'){ const bank=banks[curTopic];
    if(qi+1>=bank.length) showResult(); else { qi++; loadQ(); } }
});
loadQ();

/* ============ FORMS (no backend — demo feedback) ============ */
/* ============ FORMS — Netlify Forms (AJAX, keeps inline success UX) ============
   Submissions appear in your Netlify dashboard (Forms tab) once deployed — no
   account or setup needed. To use Formspree instead: add action="https://formspree.io/f/YOUR_ID"
   to each <form> and remove the fetch lines below so the browser posts directly. */
function encodeForm(d){ return Object.keys(d).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(d[k])).join('&'); }

const newsForm=document.getElementById('newsForm');
newsForm.addEventListener('submit',e=>{
  e.preventDefault();
  const em=document.getElementById('newsEmail');
  if(!em.value || !em.value.includes('@')){ em.style.outline='2px solid #04221d'; em.focus(); return; }
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:encodeForm({'form-name':'newsletter',email:em.value})}).catch(()=>{});
  newsForm.style.display='none'; document.getElementById('newsOk').style.display='block';
});

const contactForm=document.getElementById('contactForm');
contactForm.addEventListener('submit',e=>{
  e.preventDefault();
  const fd=new FormData(contactForm), obj={}; fd.forEach((v,k)=>obj[k]=v);
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:encodeForm(obj)}).catch(()=>{});
  document.getElementById('formOk').classList.add('show'); contactForm.reset();
  window.scrollTo({top:document.getElementById('formOk').getBoundingClientRect().top+window.scrollY-120,behavior:'smooth'});
});

/* ============================================================================
   CMS HOOK — lets /admin content (content/mcqs.json) feed the MCQ engine.
   Called by cms-content.js only when you've added real questions in the admin.
   If no CMS questions exist, the demo questions above are used unchanged.
   ============================================================================ */
window.LANSMED = window.LANSMED || {};
window.LANSMED.loadMCQs = function (cmsBanks) {
  if (!cmsBanks || !Object.keys(cmsBanks).length) return;   // nothing to load -> keep demo
  banks = cmsBanks;                                          // replace the question set
  const topics = Object.keys(banks);
  // Rebuild the topic buttons from the CMS topics (the click handler is on the
  // #mcqTopics container, so replacing the buttons inside it keeps it working).
  const tc = document.getElementById('mcqTopics');
  if (tc) {
    tc.innerHTML = topics
      .map((t, i) => `<button class="chip${i === 0 ? ' active' : ''}" data-topic="${t}">${t}</button>`)
      .join('');
  }
  curTopic = topics[0];
  restart();   // reset and render the first CMS question
};
