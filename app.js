/* ENGR 102 box project app: hash router, progress in localStorage, plan sheet, readiness check. No build step. */
const KEY = 'engr102box.v1';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
const S = Object.assign({ checks:{}, plan:{}, quiz:null, box:null }, load());
const $ = sel => document.querySelector(sel);
const main = $('#main');

document.getElementById('defs').innerHTML = DRAW_DEFS;
$('#draft').textContent = `Rev ${SITE.rev} · ${SITE.date} · ${SITE.status}`;
$('#foot').textContent = `${SITE.shop} · ${SITE.title} · Rev ${SITE.rev}. Your progress is saved in this browser only.`;

function done(id){ const L = LESSONS.find(l => l.id === id); const c = S.checks[id] || []; return { n: c.filter(Boolean).length, of: L.check.length }; }
function lessonDone(id){ const d = done(id); return d.n === d.of; }

function home(){
  const next = LESSONS.find(l => !lessonDone(l.id)) || LESSONS[0];
  const total = LESSONS.length, finished = LESSONS.filter(l => lessonDone(l.id)).length;
  return `<section class="hero">
    <div>
      <p class="eyebrow">ENGR 102 · ${esc(SITE.shop)}</p>
      <h1>Make a box from two materials</h1>
      <p>Design and build one box using at least two materials from the kit list. Use your own design, or start from one of five pre-made designs and make it yours. This guide walks you from the rules to a finished, documented box.</p>
      <ol class="spine" aria-label="Project steps"><li>Learn the rules</li><li>Design</li><li>Plan</li><li>Staff sign-off</li><li>Make</li><li>Document</li></ol>
      <div class="row" style="margin-top:14px"><a class="btn" href="#/lesson/${next.id}">${finished ? 'Continue' : 'Start'}: ${esc(next.title)}</a><a class="btn ghost" href="#/designs">Browse designs</a></div>
    </div>
    <a class="thumb" href="#/design/b3" aria-label="Bandsaw box sample">${D3.b3()}</a>
  </section>
  <h2 style="margin-bottom:10px">Lessons <span class="pill">${finished} of ${total} done</span></h2>
  <ol class="lessons">${LESSONS.map((l, i) => { const d = done(l.id); return `<li><a href="#/lesson/${l.id}"><span class="ln">${i+1}</span><span><span class="lt">${esc(l.title)}</span><br><span class="lm">${esc(l.time)}</span></span><span class="pill ${d.n===d.of?'done':''}">${d.n===d.of?'Done':`${d.n}/${d.of}`}</span></a></li>`; }).join('')}</ol>`;
}

function lesson(id){
  const i = LESSONS.findIndex(l => l.id === id); if (i < 0) return notFound();
  const L = LESSONS[i], prev = LESSONS[i-1], next = LESSONS[i+1], c = S.checks[id] || [];
  return `<article class="read">
    <p class="eyebrow">Lesson ${i+1} of ${LESSONS.length} · ${esc(L.time)}</p>
    <h1>${esc(L.title)}</h1>
    <div class="facts"><div><b>You will</b><ul>${L.goals.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div><div><b>You need</b><ul>${L.need.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div></div>
    <div class="body">${L.body}</div>
    <section class="check" aria-labelledby="ck"><h2 id="ck">Checkpoint</h2>
      ${L.check.map((t,k)=>`<label><input type="checkbox" id="ck-${id}-${k}" data-k="${k}" ${c[k]?'checked':''}><span>${esc(t)}</span></label>`).join('')}
    </section>
    <nav class="pager" aria-label="Lesson">${prev?`<a class="btn ghost" href="#/lesson/${prev.id}">← ${esc(prev.title)}</a>`:'<span></span>'}${next?`<a class="btn" href="#/lesson/${next.id}">${esc(next.title)} →</a>`:`<a class="btn" href="#/">Back to lessons</a>`}</nav>
  </article>`;
}

function designs(){
  return `<p class="eyebrow">Optional starting points</p><h1>${['Zero','One','Two','Three','Four','Five','Six','Seven','Eight'][DESIGNS.length] || DESIGNS.length} pre-made designs</h1>
  <p class="read">Each one is tested to fit the kit and the machines. Change the size, decorate it, or borrow one idea for your own design.</p>
  <div class="grid">${DESIGNS.map(d=>`<a class="dcard" href="#/design/${d.id}"><div class="pic">${D3[d.id]()}</div><div class="txt"><h2><span class="dno">${d.id.toUpperCase()}</span>${esc(d.name)}</h2><p style="margin:0">${esc(d.tag)}</p><div class="chips">${d.machines.map(m=>`<span class="chip">${esc(m)}</span>`).join('')}</div><span class="lm">${esc(d.size)} · ${esc(d.time)}</span></div></a>`).join('')}</div>`;
}

function design(id){
  const d = DESIGNS.find(x => x.id === id); if (!d) return notFound();
  return `<p class="eyebrow"><a href="#/designs">Designs</a> / ${d.id.toUpperCase()}</p>
  <h1><span class="dno">${d.id.toUpperCase()}</span>${esc(d.name)}</h1>
  <p class="read" style="font-size:1.08rem">${esc(d.tag)} ${esc(d.how)}</p>
  <div class="chips">${d.mats.map(m=>`<span class="chip">${esc(m)}</span>`).join('')}<span class="chip">${esc(d.size)} in</span><span class="chip">${esc(d.time)}</span><span class="chip">${esc(d.level)}</span></div>
  <figure class="iso"><div>${D3[d.id]()}</div><figcaption class="lm">Sample, three-quarter view</figcaption></figure>
  <div class="dwg">${D[d.id]()}</div>
  <p class="lm">Dimensions in inches, ±1/32 unless noted. Draft. Build one before trusting every number.</p>
  <div class="two">
    <div><h3>Parts</h3><div class="tw"><table><tr><th>Mark</th><th>Qty</th><th>Part</th><th>Size</th><th>Material</th></tr>${d.parts.map(p=>`<tr><td><b>${esc(p[0])}</b></td><td>${p[1]}</td><td>${esc(p[2])}</td><td class="n">${esc(p[3])}</td><td>${esc(p[4])}</td></tr>`).join('')}</table></div>
      <h3>Make it yours</h3><ul>${d.yours.map(y=>`<li>${esc(y)}</li>`).join('')}</ul></div>
    <div><h3>Build steps</h3><ol>${d.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
      ${d.files ? `<h3>Cut files</h3><p class="row noprint"><button class="btn ghost" id="dl-walls" type="button">Walls DXF (acrylic, 12 × 12)</button><button class="btn ghost" id="dl-plates" type="button">Base and lid DXF (12 × 24)</button></p><p class="lm">Drawn for 3 mm (.118) acrylic with the material outline included. Bolted option: T-slots and screw holes are in the files.</p>` : ''}
      <p class="row noprint" style="margin-top:16px"><button class="btn" id="usedesign">Use this design in my plan</button></p></div>
  </div>`;
}

const PLAN_ROWS = 8;
function plan(){
  const p = S.plan, v = k => esc(p[k] || '');
  const opts = [['own','My own design'], ...DESIGNS.map(d=>[d.id, `${d.id.toUpperCase()} ${d.name}`])];
  return `<p class="eyebrow noprint">Fill it in, print it, bring it to staff</p>
  <h1>My box plan</h1>
  <form class="plan" id="planform" autocomplete="off">
    <div class="fgrid">
      <label>Name<input type="text" id="p-name" value="${v('name')}"></label>
      <label>USC email<input type="text" id="p-email" value="${v('email')}"></label>
      <label>ENGR 102 section<input type="text" id="p-section" value="${v('section')}"></label>
      <label>Design<select id="p-path">${opts.map(([k,t])=>`<option value="${k}" ${p.path===k?'selected':''}>${esc(t)}</option>`).join('')}</select></label>
      <label>Outside size (L × W × H, in)<input type="text" id="p-size" value="${v('size')}"></label>
      <label>Material 1<input type="text" id="p-m1" value="${v('m1')}"></label>
      <label>Material 2<input type="text" id="p-m2" value="${v('m2')}"></label>
    </div>
    <h3>Parts</h3>
    <div class="tw"><table class="ptab"><tr><th>Part</th><th>Qty</th><th>Size</th><th>Material</th><th>Machine</th></tr>
      ${Array.from({length:PLAN_ROWS},(_,r)=>`<tr>${['part','qty','size','mat','mach'].map(f=>`<td><input type="text" id="p-${f}-${r}" aria-label="Row ${r+1} ${f}" value="${v(`${f}-${r}`)}"></td>`).join('')}</tr>`).join('')}
    </table></div>
    <div class="fgrid" style="margin-top:12px">
      <label>Steps, in order<textarea id="p-steps" rows="5">${v('steps')}</textarea></label>
      <label>Hazards and how I'll handle them<textarea id="p-hazards" rows="5">${v('hazards')}</textarea></label>
      <label>File names<textarea id="p-files" rows="5">${v('files')}</textarea></label>
    </div>
    <p class="lm">Readiness check: ${S.quiz ? `${S.quiz.score}/${QUIZ.length}, ${S.quiz.passed?'passed':'not yet passed'}, ${esc(S.quiz.date)}` : 'not taken yet'}</p>
    <div class="sig"><div>Student signature and date</div><div>BFMS staff approval, plan</div><div>BFMS staff check, finished box</div></div>
  </form>
  <div class="row noprint" style="margin-top:16px"><button class="btn" id="printplan">Print plan</button><button class="btn ghost" id="loaddesign">Fill parts from my design</button><span class="lm" id="saved" aria-live="polite"></span></div>`;
}

function check(){
  const r = S.quiz;
  return `<p class="eyebrow">Last lesson</p><h1>Readiness check</h1>
  <p class="read">Get ${QUIZ.length-2} of ${QUIZ.length} right to pass. You can retake it. It doesn't replace your BFMS machine training.</p>
  ${r?`<div class="result ${r.passed?'':'fail'}"><b>Last result: ${r.score}/${QUIZ.length}, ${r.passed?'passed':'not passed yet'}</b> · ${esc(r.date)}</div>`:''}
  <form id="quiz" class="read">${QUIZ.map((q,i)=>`<fieldset class="q" id="q${i}"><legend>${i+1}. ${esc(q.q)}</legend>${q.a.map((a,j)=>`<label><input type="radio" name="q${i}" id="q${i}-${j}" value="${j}"> ${esc(a)}</label>`).join('')}<p class="err" hidden>Choose an answer</p></fieldset>`).join('')}
  <button class="btn" type="submit">Check my answers</button><p class="err" id="qerr" hidden></p></form>`;
}

function notFound(){ return `<h1>Page not found</h1><p><a href="#/">Back to lessons</a></p>`; }

function route(){
  const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
  const [a, b] = parts; let html, nav = 'home';
  if (!a) html = home();
  else if (a === 'lesson') html = lesson(b);
  else if (a === 'designs') { html = designs(); nav = 'designs'; }
  else if (a === 'design') { html = design(b); nav = 'designs'; }
  else if (a === 'plan') { html = plan(); nav = 'plan'; }
  else if (a === 'check') { html = check(); nav = 'check'; }
  else if (a === 'tools' && b === 'box') { html = boxTool(); nav = 'box'; }
  else if (a === 'tools' && b === 'check') { html = checkTool(); nav = 'audit'; }
  else html = notFound();
  main.innerHTML = html;
  document.querySelectorAll('[data-nav]').forEach(n => { if (n.dataset.nav === nav) n.setAttribute('aria-current','page'); else n.removeAttribute('aria-current'); });
  const h1 = main.querySelector('h1'); document.title = (h1 && a ? h1.textContent + ' · ' : '') + SITE.title;
  window.scrollTo(0, 0); main.focus({ preventScroll: true });
  wire(a, b);
}

function wire(a, b){
  if (a === 'lesson') {
    main.querySelectorAll('.check input').forEach(cb => cb.addEventListener('change', () => {
      const arr = S.checks[b] || []; arr[+cb.dataset.k] = cb.checked; S.checks[b] = arr; save();
    }));
    const pk = $('#picker');
    if (pk) pk.addEventListener('submit', e => {
      e.preventDefault();
      const cad = $('#pk1').value, fun = $('#pk2').value, out = $('#pkout');
      if (!cad || !fun) { out.textContent = 'Answer both questions first.'; return; }
      const pick = { laser:'b1', wood:'b3', metal:'b5', mix:'b4' }[fun], d = DESIGNS.find(x => x.id === pick);
      out.innerHTML = cad === 'y'
        ? `Design your own. Borrow ideas from <a href="#/design/${pick}">${esc(d.name)}</a>, then read <a href="#/lesson/cad">Designing your own</a>.`
        : `Start from <a href="#/design/${pick}">${pick.toUpperCase()} ${esc(d.name)}</a> and make it yours.`;
    });
  }
  const cp = $('#copyprompt');
  if (cp) cp.addEventListener('click', () => { const t = $('#aiprompt').textContent; Promise.resolve().then(() => navigator.clipboard.writeText(t)).then(() => cp.textContent = 'Copied', () => { const r = document.createRange(); r.selectNodeContents($('#aiprompt')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); cp.textContent = 'Selected. Press Ctrl+C'; }); });
  if (a === 'tools' && b === 'box') wireBox();
  if (a === 'tools' && b === 'check') wireCheck();
  if (a === 'design') {
    const u = $('#usedesign');
    if (u) u.addEventListener('click', () => { S.plan.path = b; fillFromDesign(b); save(); location.hash = '#/plan'; });
    const w = $('#dl-walls'), pl = $('#dl-plates');
    if (w && pl){
      const r = BoxGen.tslotBox({ L: B6.L, W: B6.W, H: B6.H, t: B6.t, tb: B6.t, assembly: 'tslot' });
      const file = (parts, sw, sh) => BoxGen.dxf(BoxGen.placed(BoxGen.layout(parts, sw, sh, 0.25)), sw, sh);
      w.addEventListener('click', () => download('B6_walls_12x12.dxf', file(r.panels.slice(0, 4), 12, 12), 'application/dxf'));
      pl.addEventListener('click', () => download('B6_base_lid_24x12.dxf', file(r.panels.slice(4), 24, 12), 'application/dxf'));
    }
  }
  if (a === 'plan') {
    const f = $('#planform'), saved = $('#saved');
    f.addEventListener('input', e => { const id = e.target.id; if (!id || !id.startsWith('p-')) return; S.plan[id.slice(2)] = e.target.value; save(); saved.textContent = 'Saved in this browser'; });
    f.addEventListener('submit', e => e.preventDefault());
    $('#printplan').addEventListener('click', () => window.print());
    $('#loaddesign').addEventListener('click', () => {
      const id = $('#p-path').value;
      if (id === 'own') { saved.textContent = 'Pick a pre-made design first, or fill the parts in yourself.'; return; }
      fillFromDesign(id); save(); route();
    });
  }
  if (a === 'check') {
    const f = $('#quiz');
    f.addEventListener('change', e => { const fs = e.target.closest('.q'); if (fs) fs.querySelector('.err').hidden = true; });
    f.addEventListener('submit', e => {
      e.preventDefault();
      let missing = 0, score = 0;
      QUIZ.forEach((q, i) => {
        const fs = $('#q'+i), sel = f.querySelector(`input[name=q${i}]:checked`);
        fs.classList.remove('right','wrong');
        if (!sel) { missing++; fs.querySelector('.err').hidden = false; return; }
        const ok = +sel.value === q.c; if (ok) score++;
        fs.classList.add(ok ? 'right' : 'wrong');
      });
      const err = $('#qerr');
      if (missing) { err.hidden = false; err.textContent = `Answer all questions first (${missing} left).`; return; }
      err.hidden = true;
      S.quiz = { score, passed: score >= QUIZ.length - 2, date: new Date().toLocaleString() };
      if (S.quiz.passed) { S.checks.check = [true]; }
      save();
      const r = document.createElement('div'); r.className = 'result' + (S.quiz.passed ? '' : ' fail');
      r.innerHTML = `<b>${score}/${QUIZ.length}: ${S.quiz.passed ? 'Passed. Show this at your plan sign-off.' : 'Not yet. Review the red questions and try again.'}</b>`;
      f.after(r); r.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function fillFromDesign(id){
  const d = DESIGNS.find(x => x.id === id); if (!d) return;
  const p = S.plan; p.path = id; p.size = d.size;
  p.m1 = p.m1 || d.mats[0]; p.m2 = p.m2 || (d.mats[1] || '');
  d.parts.slice(0, PLAN_ROWS).forEach((x, r) => { p[`part-${r}`] = `${x[0]} ${x[2]}`; p[`qty-${r}`] = String(x[1]); p[`size-${r}`] = x[3]; p[`mat-${r}`] = x[4]; p[`mach-${r}`] = ''; });
  if (!p.steps) p.steps = d.steps.map((s, i) => `${i+1}. ${s}`).join('\n');
}

window.addEventListener('hashchange', route);
route();
