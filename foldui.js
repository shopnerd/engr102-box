/* Fold designer page: inputs → FoldGen.plan → flat pattern, bend plan with finger setups, brake checks, 3D fold animation.
   Loaded after tools.js (download) and app.js helpers ($, esc, S, save). */
const FOLD_PRESETS = [
  { name: 'Works: tray with tabs', o: { L: 5.25, W: 3.375, H: 1.25, t: .125, corners: 'tabs', tl: .6 } },
  { name: 'Works: open corners', o: { L: 6, W: 4, H: 1.25, t: .0625, corners: 'open', tl: .6 } },
  { name: 'B5 as drawn (1.50 tall)', o: { L: 5.25, W: 3.375, H: 1.5, t: .125, corners: 'tabs', tl: .6 } },
  { name: 'Too narrow', o: { L: 5, W: 1.5, H: 1, t: .0625, corners: 'tabs', tl: .5 } },
  { name: 'Tabs too wide', o: { L: 4, W: 3, H: 1.25, t: .0625, corners: 'tabs', tl: 1.5 } },
  { name: 'Too long for 1/8', o: { L: 9, W: 4, H: 1, t: .125, corners: 'tabs', tl: .6 } },
];
const FOLD_BRAKE = () => Object.assign({}, FoldGen.BRAKE, S.foldBrake || {});

function foldTool(){
  const o = Object.assign({}, FoldGen.DEFAULT, S.fold || {}), B = FOLD_BRAKE();
  const num = (id, label, v, step) => `<label>${label}<input type="number" id="fd-${id}" value="${v}" step="${step}" min="0" inputmode="decimal"></label>`;
  return `<p class="eyebrow">Tool</p><h1>Fold designer</h1>
  <p class="read">Design a folded aluminum tray. You get the flat pattern for the waterjet, the bend order, and which fingers go on the brake for each bend. If a bend can't be made on our finger brake, it tells you why. Drag the Fold slider to watch it fold.</p>
  <div class="row noprint" style="margin:6px 0 4px">${FOLD_PRESETS.map((p, i) => `<button type="button" class="btn ghost sm" data-preset="${i}">${esc(p.name)}</button>`).join('')}</div>
  <div class="toolgrid">
    <form id="foldform" class="plan" autocomplete="off">
      <div class="fgrid">
        ${num('L', 'Length, outside (in)', o.L, '0.125')}${num('W', 'Width, outside (in)', o.W, '0.125')}${num('H', 'Height (in)', o.H, '0.125')}
        <label>Aluminum<select id="fd-t"><option value="0.0625" ${o.t < .1 ? 'selected' : ''}>1/16 1100-O</option><option value="0.125" ${o.t > .1 ? 'selected' : ''}>1/8 1100-O</option></select></label>
        <label>Corners<select id="fd-corners"><option value="tabs" ${o.corners === 'tabs' ? 'selected' : ''}>Tabs + pop rivets</option><option value="open" ${o.corners === 'open' ? 'selected' : ''}>Open (relief holes only)</option></select></label>
        ${num('tl', 'Tab width (in)', o.tl, '0.05')}
      </div>
      <details class="brakeset"><summary>Brake settings</summary>
        <p class="lm">Fingers: ${B.fingers.join(', ')} in (12 in total). The two numbers below come from a similar 12 in brake. Measure ours and fix them here.</p>
        <div class="fgrid">
          <label>Finger height, max box depth (in)<input type="number" id="fb-depth" value="${B.depth}" step="0.05" min="0.25"></label>
          <label>Finger reach back from the edge (in)<input type="number" id="fb-fingerDepth" value="${B.fingerDepth}" step="0.05" min="0.25"></label>
        </div>
      </details>
      <p class="lm">Sizes are outside sizes. Inside bend radius = the metal thickness.</p>
    </form>
    <div>
      <figure class="iso v3d" style="margin:0;max-width:none">
        <div class="v3dbox" id="fd3d"><p class="lm" style="padding:20px">Loading the 3D model…</p></div>
        <div class="v3dctl" hidden><label for="fds">Fold</label><input type="range" id="fds" min="0" max="100" value="100"><span class="lm" id="fdstep">Drag the box to turn it</span></div>
      </figure>
      <ul class="results" id="fdissues" style="margin-top:12px"></ul>
    </div>
  </div>
  <h2 style="margin-top:28px">Flat pattern</h2>
  <div class="dwg" id="fdflat"></div>
  <p class="lm" id="fdsize"></p>
  <div class="row noprint"><button class="btn" id="fddxf" type="button">Download DXF for the waterjet</button><button class="btn ghost" id="fdprint" type="button">Print the plan</button></div>
  <p class="lm">The DXF has the cut outline, the holes and the material outline. Bend lines are left out so the waterjet can't cut them. Scribe them from the printed plan.</p>
  <h2 style="margin-top:28px">Bend plan</h2>
  <ol class="foldsteps" id="fdsteps"></ol>
  <section class="read" style="margin-top:28px">
    <h2>How the fingers work</h2>
    <p>A box-and-pan brake clamps the metal under a row of removable fingers. Ours has five: 1, 2, 2, 3 and 4 in, 12 in in all. The bending leaf only folds what's under the fingers' front edge.</p>
    <p>For the first bends, nothing stands up yet, so long fingers are fine. Every bend after that has walls or tabs already standing at its ends, and the fingers have to fit between them. Take off the fingers you don't need and slide the rest together, centered on the bend. The plan above lists which fingers stay on for each bend.</p>
    <p>That's why the bend order matters. Small tabs go first, then the end walls, then the long walls. The long walls go last because they have the most room between the end walls. If the order is wrong, a finger set can't fit and the last wall can't be folded.</p>
    <p>Three things the brake can't do:</p>
    <ul>
      <li><b>Walls taller than the fingers.</b> For the last bends, the walls already standing hit the beam the fingers hang from.</li>
      <li><b>Boxes narrower than the fingers reach.</b> For the last bend, the wall across from it hits the back of the fingers.</li>
      <li><b>Gaps narrower than the smallest finger.</b> The smallest finger is 1 in. Wide tabs eat into the space between them.</li>
    </ul>
    <p>When the designer says a bend won't work, change the size, narrow the tabs, or switch to open corners.</p>
  </section>`;
}

function foldFlatSvg(p){
  const H = p.y1 - p.y0, s = Math.min(860 / p.Ln, 400 / H, 80), w = 1020, h = Math.round(H * s + 150);
  const v = V((w - p.Ln * s) / 2, 70 - p.y0 * s, s);
  v.title(0, p.y0 - 55 / s, 'FLAT PATTERN, ' + (p.t > .1 ? '1/8' : '1/16') + ' 1100-O ALUMINUM, INSIDE FACE UP');
  v.poly(p.outline, 'al');
  p.relief.forEach(c => v.circ(c.x, c.y, c.r, 'holeF')); p.rivets.forEach(c => { v.circ(c.x, c.y, c.r, 'holeF'); v.cross(c.x, c.y, c.r * 2); });
  p.bends.forEach(b => { v.line(b.p[0][0], b.p[0][1], b.p[1][0], b.p[1][1], 'bend');
    const mx = (b.p[0][0] + b.p[1][0]) / 2, my = (b.p[0][1] + b.p[1][1]) / 2, vert = b.p[0][0] === b.p[1][0];
    if (b.k === 'tab') v.text(mx, my + (my < p.Wn / 2 ? .3 : -.14), 'T', 'hlab');
    else v.text(mx + (vert ? (mx < p.Ln / 2 ? -.3 : .3) : 0), my + (vert ? .05 : (my < p.Wn / 2 ? -.15 : .32)), String(b.n), 'lbl'); });
  v.text(p.Ln / 2, p.Wn / 2, 'BASE', 'vt'); v.text(p.Ln / 2, p.Wn / 2 + 24 / s, `${FoldGen.f2(p.L)} × ${FoldGen.f2(p.W)} × ${FoldGen.f2(p.H)} OUTSIDE`, 'dt');
  v.dimH(0, p.Ln, p.y1, p.y1 + 34 / s, FoldGen.f2(p.Ln)); v.dimV(p.y0, p.y1, 0, -40 / s, FoldGen.f2(H));
  return svg(w, h, 'Flat pattern with bend lines, relief holes and rivet holes', [v]);
}

// one bend setup: the 12 in finger row, which fingers stay on, the bend, and what stands at its ends
function fingerSvg(p, st){
  const F = p.brake.fingers, s = 52, w = 12 * s + 120, h = 172, x0 = 60, cx = x0 + 6 * s, o = [];
  const R = (x, y, ww, hh, c, extra = '') => o.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${Math.max(ww, 0).toFixed(1)}" height="${hh}" class="${c}" ${extra}/>`);
  const Tx = (x, y, t, c = 'dt', an = 'middle') => o.push(`<text x="${x.toFixed(1)}" y="${y}" class="${c}" text-anchor="${an}">${t}</text>`);
  R(x0, 10, 12 * s, 10, 'wd3'); Tx(x0 - 6, 19, 'BEAM', 'hlab', 'end');
  if (st.set){
    let x = cx - st.set.s * s / 2;
    st.set.idx.map(i => F[i]).sort((a, b) => b - a).forEach(f => { R(x, 22, f * s - 2, 30, 'al'); Tx(x + f * s / 2, 42, f + ' in', 'lbl'); x += f * s; });
    const off = st.removed || []; let ox = x0 + 12 * s - off.reduce((a, f) => a + f * s * .45 + 4, 0);
    if (off.length) Tx(ox - 6, 162, 'OFF:', 'hlab', 'end');
    off.forEach(f => { R(ox, 150, f * s * .45, 14, 'ol', 'stroke-dasharray="3 2" fill="none"'); Tx(ox + f * s * .225, 146, f, 'hlab'); ox += f * s * .45 + 4; });
  } else Tx(cx, 42, 'NO FINGER SET FITS', 'lbl');
  // the bend line and the loose ends
  const bl = st.want * s, bx = cx - bl / 2;
  o.push(`<line x1="${bx.toFixed(1)}" y1="62" x2="${(bx + bl).toFixed(1)}" y2="62" class="bend"/>`); Tx(cx, 80, `BEND ${FoldGen.f2(st.want)} IN`);
  if (st.set && st.u > .01){ const u = st.u * s; [bx, bx + bl - u].forEach(x => R(x, 57, u, 10, 'warnz')); Tx(cx, 96, `${FoldGen.f2(st.u)} in loose at each end`, 'dt'); }
  // obstacles: tabs or standing walls at the ends of the space
  if (st.k !== 'tabs' && st.hi < 12){ const hx = st.hi / 2 * s + 2 * .03 * s;
    [cx - hx, cx + hx].forEach((x, i) => { o.push(`<line x1="${x.toFixed(1)}" y1="22" x2="${x.toFixed(1)}" y2="70" class="cutl"/>`); });
    const lab = st.k === 'longs' && !p.tabs ? 'END WALL' : 'TAB';
    Tx(cx - hx - 5, 36, lab, 'hlab', 'end'); Tx(cx + hx + 5, 36, lab, 'hlab', 'start');
    Tx(cx, 116, `${FoldGen.f2(Math.max(st.hi, 0))} in between the ${lab === 'TAB' ? 'tabs' : 'end walls'}`, 'dt'); }
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Finger setup for ${esc(st.title)}">${o.join('')}</svg>`;
}

function wireFold(){
  const ids = ['L', 'W', 'H', 't', 'corners', 'tl'], rot = { x: .35, y: -.6, idle: true };
  let current = null, timer = 0, phases = [];
  const get = () => { const o = {}; ids.forEach(k => { const el = $('#fd-' + k); o[k] = el.tagName === 'SELECT' && k === 'corners' ? el.value : parseFloat(el.value); }); return o; };
  const brake = () => { const b = FOLD_BRAKE(); ['depth', 'fingerDepth'].forEach(k => { const v = parseFloat($('#fb-' + k).value); if (v > 0) b[k] = v; }); return b; };
  const icon = { ok: '✓', warn: '!', fail: '✕', note: 'i' };
  const stepNow = () => {                                            // which plan step the Fold slider is on
    if (!current || !phases.length) return;
    const f = $('#fds').value / 100, u = 1 - f, name = f >= .999 ? 'done' : f <= .001 ? 'flat' : phases[Math.min(phases.length - 1, Math.floor(u * phases.length))];
    main.querySelectorAll('#fdsteps li').forEach(li => li.classList.toggle('now', li.dataset.k === name));
    const st = current.steps.find(x => x.k === name);
    $('#fdstep').textContent = name === 'flat' ? 'Flat blank. Slide right to fold.' : name === 'done' ? 'Folded. Drag the box to turn it.' : `Now: ${st ? st.title : name}`;
  };
  const render = () => {
    const o = get(), b = brake(), p = FoldGen.plan(o, b), msg = $('#fdissues');
    if (p.error){ msg.innerHTML = `<li class="fail"><span class="ic">✕</span><span>${esc(p.error)}</span></li>`; return; }
    S.fold = o; S.foldBrake = { depth: b.depth, fingerDepth: b.fingerDepth }; save(); current = p;
    $('#fd-tl').closest('label').style.opacity = o.corners === 'tabs' ? 1 : .4;
    const order = { fail: 0, warn: 1, note: 2, ok: 3 };
    msg.innerHTML = p.issues.slice().sort((a, c) => order[a.lvl] - order[c.lvl]).map(i => `<li class="${i.lvl === 'note' ? '' : i.lvl}"><span class="ic">${icon[i.lvl]}</span><span><b>${esc(i.title)}.</b> ${esc(i.why)}${i.fix ? ` <i>${esc(i.fix)}</i>` : ''}</span></li>`).join('');
    $('#fdflat').innerHTML = foldFlatSvg(p);
    $('#fdsize').textContent = `Blank ${FoldGen.f2(p.Ln)} × ${FoldGen.f2(p.y1 - p.y0)} in. Bend allowance ${p.BA.toFixed(3)} in per bend (K .4, inside radius ${p.ri} in). ${p.tabs ? '4 relief holes, 8 rivet holes Ø.161.' : '4 relief holes.'}`;
    $('#fdsteps').innerHTML = p.steps.map(st => { const iss = p.issues.filter(i => i.step === st.k && i.lvl !== 'ok');
      return `<li data-k="${st.k}" class="${iss.some(i => i.lvl === 'fail') ? 'bad' : ''}"><h3>${esc(st.title)}</h3><p>${esc(st.text)}${st.extra ? ' ' + esc(st.extra) : ''}</p>
        ${st.want ? `<div class="fsv">${fingerSvg(p, st)}</div>` : ''}${iss.map(i => `<p class="${i.lvl === 'fail' ? 'err' : 'lm'}">${icon[i.lvl]} ${esc(i.title)}</p>`).join('')}</li>`; }).join('');
    Box3D.mount($('#fd3d'), $('#fds'), 'fold', 'fold', { rot, P: { ...p, rivets: p.tabs, lid: false } }).then(info => { phases = (info && info.phases) || []; stepNow(); });
  };
  $('#foldform').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 200); });
  $('#foldform').addEventListener('submit', e => e.preventDefault());
  $('#fds').addEventListener('input', stepNow);
  main.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
    const o = FOLD_PRESETS[+btn.dataset.preset].o;
    ids.forEach(k => { $('#fd-' + k).value = k === 't' ? String(o[k]) : o[k]; }); render();
  }));
  $('#fddxf').addEventListener('click', () => current && download(`fold_${current.L}x${current.W}x${current.H}.dxf`, FoldGen.dxf(current), 'application/dxf'));
  $('#fdprint').addEventListener('click', () => window.print());
  render();
}
