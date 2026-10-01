/* Tool pages: laser box designer and file checker. Loaded after app.js helpers ($, esc, S, save, main). */
function download(name, text, type){
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const BOX_DEFAULT = { L: 7, W: 4, H: 3, inside: 'outside', t: 0.118, kerf: 0.006, finger: 0.5, top: 'lid', text: '', sw: 24, sh: 12 };
function boxTool(){
  const o = Object.assign({}, BOX_DEFAULT, S.box || {}), f = (id, label, v, step, extra = '') => `<label>${label}<input type="number" id="bx-${id}" value="${v}" step="${step}" min="0" inputmode="decimal" ${extra}></label>`;
  return `<p class="eyebrow">Tool</p><h1>Laser box designer</h1>
  <p class="read">A finger-jointed box laid out on your sheet, with the material outline already in the file. Change the numbers, look at the layout, then download a DXF or SVG. Run it through the <a href="#/tools/check">file checker</a> before you cut.</p>
  <div class="toolgrid">
    <form id="boxform" class="plan" autocomplete="off">
      <div class="fgrid">
        ${f('L','Length (in)',o.L,'0.125')}${f('W','Width (in)',o.W,'0.125')}${f('H','Height (in)',o.H,'0.125')}
        <label>Sizes are<select id="bx-inside"><option value="outside" ${o.inside==='outside'?'selected':''}>Outside</option><option value="inside" ${o.inside==='inside'?'selected':''}>Inside</option></select></label>
        ${f('t','Material thickness (in)',o.t,'0.001')}${f('kerf','Kerf (in)',o.kerf,'0.001')}${f('finger','Finger width (in)',o.finger,'0.05')}
        <label>Top<select id="bx-top"><option value="closed" ${o.top==='closed'?'selected':''}>Closed</option><option value="open" ${o.top==='open'?'selected':''}>Open</option><option value="lid" ${o.top==='lid'?'selected':''}>Loose lid with a lip</option></select></label>
        <label>Engrave on top or lid<input type="text" id="bx-text" value="${esc(o.text)}" maxlength="30"></label>
        ${f('sw','Sheet width (in)',o.sw,'0.5')}${f('sh','Sheet height (in)',o.sh,'0.5')}
      </div>
      <p class="lm">Thickness: measure your sheet. "1/8" ply is often .118. Kerf: start at .006 and adjust after a test cut.</p>
    </form>
    <div>
      <div class="dwg sheetview" id="bxview"></div>
      <p id="bxmsg" class="lm" aria-live="polite"></p>
      <div class="tw"><table id="bxlist"></table></div>
      <div class="row noprint" style="margin-top:12px"><button class="btn" id="bxdxf" type="button">Download DXF</button><button class="btn ghost" id="bxsvg" type="button">Download SVG</button></div>
      <p class="lm">Red lines cut. Blue is engraving (SVG only). Green is the material outline; don't cut it.</p>
    </div>
  </div>`;
}
function wireBox(){
  const ids = Object.keys(BOX_DEFAULT), get = () => { const o = {}; ids.forEach(k => { const el = $('#bx-' + k); o[k] = el.type === 'number' ? parseFloat(el.value) : el.value; }); return o; };
  let current = null;
  const render = () => {
    const o = get(), msg = $('#bxmsg');
    const bad = ['L','W','H','t','finger','sw','sh'].find(k => !(o[k] > 0)) || (!(o.kerf >= 0) && 'kerf');
    if (bad){ msg.textContent = 'Enter a positive number in every size box.'; msg.className = 'err'; return; }
    if (o.t > 0.26){ msg.textContent = 'Thickness is over 1/4. The kit only has 1/8 and 1/4 sheet.'; msg.className = 'err'; return; }
    if (o.inside === 'outside' && Math.min(o.L, o.W, o.H) < 4 * o.t){ msg.textContent = 'The box is too small for that thickness.'; msg.className = 'err'; return; }
    S.box = o; save();
    const b = BoxGen.build({ ...o, inside: o.inside === 'inside' }), lay = BoxGen.layout(b.panels, o.sw, o.sh, 0.25), parts = BoxGen.placed(lay);
    current = { parts, o };
    $('#bxview').innerHTML = BoxGen.svg(parts, o.sw, o.sh, true).replace(/ width="[^"]*" height="[^"]*"/, '');
    msg.className = lay.fits ? 'lm' : 'err';
    msg.textContent = lay.fits ? `Outside size ${b.X.toFixed(3)} × ${b.Y.toFixed(3)} × ${b.Z.toFixed(3)} in. Everything fits on the ${o.sw} × ${o.sh} sheet.` : `It doesn't fit on a ${o.sw} × ${o.sh} sheet. Make the box smaller or the sheet bigger.`;
    $('#bxlist').innerHTML = '<tr><th>Panel</th><th>Size (in)</th></tr>' + b.panels.map(p => `<tr><td>${p.name}</td><td class="n">${p.w.toFixed(3)} × ${p.h.toFixed(3)}</td></tr>`).join('');
  };
  $('#boxform').addEventListener('input', render);
  $('#boxform').addEventListener('submit', e => e.preventDefault());
  const name = () => `box_${current.o.L}x${current.o.W}x${current.o.H}`;
  $('#bxdxf').addEventListener('click', () => current && download(name() + '.dxf', BoxGen.dxf(current.parts, current.o.sw, current.o.sh), 'application/dxf'));
  $('#bxsvg').addEventListener('click', () => current && download(name() + '.svg', BoxGen.svg(current.parts, current.o.sw, current.o.sh, false), 'image/svg+xml'));
  render();
}
function checkTool(){
  const m = Object.entries(MACHINES).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
  return `<p class="eyebrow">Tool</p><h1>File checker</h1>
  <p class="read">Check a laser or waterjet file before you bring it to the machine. It looks for the problems that waste material and machine time. Your file stays on your computer.</p>
  <div class="toolgrid">
    <form id="ckform" class="plan" autocomplete="off">
      <div class="fgrid">
        <label>Machine<select id="ck-m">${m}</select></label>
        <label>Material<select id="ck-mat"><option value="ply">Plywood</option><option value="acrylic">Acrylic</option><option value="aluminum">Aluminum</option></select></label>
        <label>Thickness<select id="ck-t"><option value="0.125">1/8</option><option value="0.25">1/4</option></select></label>
        <label>Kit sheet (in)<input type="text" id="ck-stock" value="24 x 12"></label>
        <label>Cut speed (in/s)<input type="number" id="ck-speed" step="0.05" min="0.01" value="0.5"></label>
        <label class="inline"><input type="checkbox" id="ck-mm"> Read files with no units as millimeters</label>
      </div>
      <label class="drop" for="ck-file">Choose a DXF or SVG file<input type="file" id="ck-file" accept=".dxf,.svg"></label>
      <p class="lm" id="ck-note"></p>
    </form>
    <div><ul class="results" id="ck-out"><li class="lm">Choose a file to check it.</li></ul><div class="dwg sheetview" id="ck-view"></div>
      <p class="lm">Green: material outline. Red circles: open ends. Orange circles: doubled lines.</p></div>
  </div>
  <div id="svghost" aria-hidden="true" style="position:absolute;left:-99999px;top:0;width:10px;height:10px;overflow:hidden"></div>`;
}
function wireCheck(){
  let file = null, text = '';
  const setSpeed = () => { const M = MACHINES[$('#ck-m').value], key = `${M.kind}-${$('#ck-mat').value}-${$('#ck-t').value}`; if (SPEEDS[key]) $('#ck-speed').value = SPEEDS[key];
    $('#ck-note').textContent = M.confirm ? `Bed ${M.bed[0]} × ${M.bed[1]} in, up to ${M.maxT} in thick. Draft numbers; staff will confirm.` : ''; };
  const run = () => {
    if (!file) return;
    const M = MACHINES[$('#ck-m').value], st = $('#ck-stock').value.split(/[x×,\s]+/).map(parseFloat).filter(n => n > 0);
    const res = Audit.run(file, text, { machine: M, material: $('#ck-mat').value, t: parseFloat($('#ck-t').value), stock: st.length === 2 ? st : [0, 0], speed: parseFloat($('#ck-speed').value) || 0.5, assumeMM: $('#ck-mm').checked }, $('#svghost'));
    const icon = { ok: '✓', warn: '!', fail: '✕' }, worst = res.R.some(r => r.lvl === 'fail') ? 'fail' : res.R.some(r => r.lvl === 'warn') ? 'warn' : 'ok';
    $('#ck-out').innerHTML = `<li class="sum ${worst}"><b>${esc(file.name)}: ${worst === 'ok' ? 'ready to cut' : worst === 'warn' ? 'check the warnings' : 'fix the red items first'}</b></li>` + res.R.map(r => `<li class="${r.lvl}"><span class="ic" aria-hidden="true">${icon[r.lvl]}</span><span><span class="sr">${r.lvl === 'ok' ? 'OK' : r.lvl === 'warn' ? 'Warning' : 'Problem'}: </span>${esc(r.msg)}</span></li>`).join('');
    $('#ck-view').innerHTML = Audit.preview(res);
  };
  $('#ck-file').addEventListener('change', e => { file = e.target.files[0]; if (!file) return; file.text().then(t => { text = t; run(); }); });
  $('#ckform').addEventListener('input', e => { if (['ck-m','ck-mat','ck-t'].includes(e.target.id)) setSpeed(); run(); });
  $('#ckform').addEventListener('submit', e => e.preventDefault());
  setSpeed();
}
