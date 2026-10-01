/* File checker for laser (SVG/DXF) and waterjet (DXF) files. Everything runs in the browser; nothing is uploaded.
   Geometry is reduced to polylines in inches: {pts:[[x,y]...], closed, layer, kind}. */
const Audit = (() => {
  const TOL = 0.003;
  const arcPts = (cx, cy, r, a0, a1) => { let sweep = a1 - a0; while (sweep <= 0) sweep += 2*Math.PI; const n = Math.max(8, Math.ceil(sweep / (Math.PI/24))), p = []; for (let i = 0; i <= n; i++){ const a = a0 + sweep*i/n; p.push([cx + r*Math.cos(a), cy + r*Math.sin(a)]); } return p; };
  function bulgeSeg(p, q, b){
    if (!b) return [q];
    const th = 4*Math.atan(b), dx = q[0]-p[0], dy = q[1]-p[1], c = Math.hypot(dx, dy);
    if (c < 1e-12) return [q];
    const h = c/(2*Math.tan(th/2)), cx = (p[0]+q[0])/2 - dy/c*h, cy = (p[1]+q[1])/2 + dx/c*h, r = Math.hypot(p[0]-cx, p[1]-cy);
    const a0 = Math.atan2(p[1]-cy, p[0]-cx), n = Math.max(4, Math.ceil(Math.abs(th)/(Math.PI/24))), out = [];
    for (let i = 1; i <= n; i++){ const a = a0 + th*i/n; out.push([cx + r*Math.cos(a), cy + r*Math.sin(a)]); }
    out[out.length-1] = q; return out;
  }
  function parseDXF(text){
    const raw = text.split(/\r?\n/), pairs = [];
    for (let i = 0; i + 1 < raw.length; i += 2) pairs.push([parseInt(raw[i].trim(), 10), raw[i+1].trim()]);
    const out = { polys: [], counts: {}, insunits: null, notes: [] };
    let i = 0, section = '';
    const grabEntity = () => { const type = pairs[i][1], codes = []; i++; while (i < pairs.length && pairs[i][0] !== 0){ codes.push(pairs[i]); i++; } return { type, codes }; };
    const val = (codes, c) => { const f = codes.find(x => x[0] === c); return f ? f[1] : undefined; };
    const num = (codes, c, d = 0) => { const v = val(codes, c); return v === undefined ? d : parseFloat(v); };
    while (i < pairs.length){
      const [c, v] = pairs[i];
      if (c === 0 && v === 'SECTION'){ section = pairs[i+1] ? pairs[i+1][1] : ''; i += 2; continue; }
      if (c === 9 && v === '$INSUNITS' && pairs[i+1]){ out.insunits = parseInt(pairs[i+1][1], 10); i += 2; continue; }
      if (section !== 'ENTITIES' || c !== 0){ i++; continue; }
      if (v === 'ENDSEC'){ section = ''; i++; continue; }
      const ent = grabEntity(), k = ent.codes, layer = val(k, 8) || '0';
      out.counts[ent.type] = (out.counts[ent.type] || 0) + 1;
      if (ent.type === 'LINE') out.polys.push({ pts: [[num(k,10), num(k,20)], [num(k,11), num(k,21)]], closed: false, layer, kind: 'line' });
      else if (ent.type === 'CIRCLE'){ const r = num(k,40); out.polys.push({ pts: arcPts(num(k,10), num(k,20), r, 0, 2*Math.PI), closed: true, layer, kind: 'circle', d: 2*r }); }
      else if (ent.type === 'ARC') out.polys.push({ pts: arcPts(num(k,10), num(k,20), num(k,40), num(k,50)*Math.PI/180, num(k,51)*Math.PI/180), closed: false, layer, kind: 'arc' });
      else if (ent.type === 'LWPOLYLINE'){
        const closed = (num(k,70) & 1) === 1, vs = [];
        k.forEach(([cc, vv]) => { if (cc === 10) vs.push({ x: parseFloat(vv), y: 0, b: 0 }); else if (cc === 20 && vs.length) vs[vs.length-1].y = parseFloat(vv); else if (cc === 42 && vs.length) vs[vs.length-1].b = parseFloat(vv); });
        out.polys.push(vertsToPoly(vs, closed, layer));
      } else if (ent.type === 'POLYLINE'){
        const closed = (num(k,70) & 1) === 1, vs = [];
        while (i < pairs.length && pairs[i][1] === 'VERTEX'){ const vt = grabEntity().codes; vs.push({ x: num(vt,10), y: num(vt,20), b: num(vt,42) }); }
        if (i < pairs.length && pairs[i][1] === 'SEQEND') grabEntity();
        out.polys.push(vertsToPoly(vs, closed, layer));
      } else if (ent.type === 'SPLINE'){
        const pts = []; k.forEach(([cc, vv], idx) => { if (cc === 10) pts.push([parseFloat(vv), parseFloat((k[idx+1]||[])[1])]); });
        out.polys.push({ pts, closed: (num(k,70) & 1) === 1, layer, kind: 'spline' }); out.notes.push('spline');
      } else if (ent.type === 'ELLIPSE'){
        const cx = num(k,10), cy = num(k,20), mx = num(k,11), my = num(k,21), ratio = num(k,40,1), t0 = num(k,41,0), t1 = num(k,42,2*Math.PI);
        const a = Math.hypot(mx, my), rot = Math.atan2(my, mx), pts = []; let sw = t1 - t0; if (sw <= 0) sw += 2*Math.PI;
        for (let j = 0; j <= 48; j++){ const t = t0 + sw*j/48, ex = a*Math.cos(t), ey = a*ratio*Math.sin(t); pts.push([cx + ex*Math.cos(rot) - ey*Math.sin(rot), cy + ex*Math.sin(rot) + ey*Math.cos(rot)]); }
        out.polys.push({ pts, closed: Math.abs(sw - 2*Math.PI) < 1e-6, layer, kind: 'ellipse' });
      }
    }
    return out;
  }
  function vertsToPoly(vs, closed, layer){
    if (!vs.length) return { pts: [], closed, layer, kind: 'polyline' };
    const pts = [[vs[0].x, vs[0].y]];
    for (let j = 0; j < vs.length - 1; j++) pts.push(...bulgeSeg([vs[j].x, vs[j].y], [vs[j+1].x, vs[j+1].y], vs[j].b));
    if (closed) pts.push(...bulgeSeg([vs[vs.length-1].x, vs[vs.length-1].y], [vs[0].x, vs[0].y], vs[vs.length-1].b));
    return { pts, closed, layer, kind: 'polyline' };
  }
  // SVG: sample every shape in browser user space, then convert CSS px to inches (96 px = 1 in)
  function parseSVG(text, host){
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml'), root = doc.documentElement, out = { polys: [], counts: {}, notes: [], unitNote: '' };
    if (root.nodeName.toLowerCase() !== 'svg') throw new Error('That file is not an SVG.');
    root.querySelectorAll('script,foreignObject,iframe,image').forEach(n => n.remove());
    root.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => { if (/^on/i.test(a.name) || /href/i.test(a.name)) n.removeAttribute(a.name); }));
    const w = root.getAttribute('width') || '';
    if (!/(in|mm|cm|pt)\s*$/.test(w)) out.unitNote = 'No real-world units on the SVG (width is "' + (w || 'missing') + '"). I assumed 96 px per inch. Inkscape uses 96; Illustrator often uses 72, which would make your parts 33% too big.';
    if (!w){ const vb = (root.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number); if (vb.length === 4){ root.setAttribute('width', vb[2]); root.setAttribute('height', vb[3]); } }
    host.innerHTML = ''; const live = document.importNode(root, true); host.appendChild(live);
    const rootM = live.getScreenCTM().inverse(), vbw = live.viewBox.baseVal && live.viewBox.baseVal.width;
    const k = (live.width.baseVal.value / 96) / (vbw || live.width.baseVal.value);
    const toIn = (el, p) => { const q = p.matrixTransform(rootM.multiply(el.getScreenCTM())); return [q.x*k, -q.y*k]; };
    const sel = 'path,rect,circle,ellipse,line,polyline,polygon,text';
    live.querySelectorAll(sel).forEach(el => {
      const tag = el.tagName.toLowerCase(); out.counts[tag] = (out.counts[tag] || 0) + 1;
      if (tag === 'text'){ return; }
      const stroke = (el.getAttribute('stroke') || getComputedStyle(el).stroke || '').toLowerCase();
      const layer = (el.closest('g[id],g[inkscape\\:label]') || {}).id || el.id || '';
      const total = el.getTotalLength ? el.getTotalLength() : 0; if (!total) return;
      const sample = (a, b) => { const n = Math.max(6, Math.ceil((b - a) / 3)), pts = []; for (let j = 0; j <= n; j++){ const P = el.getPointAtLength(a + (b - a)*j/n); pts.push(toIn(el, P)); } return pts; };
      if (tag === 'path'){
        const d = el.getAttribute('d') || '', subs = d.split(/(?=[Mm])/).filter(s => s.trim());
        let prevLen = 0, acc = '';
        const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path'); el.parentNode.appendChild(tmp);
        subs.forEach(sp => { acc += sp; tmp.setAttribute('d', acc); const L = tmp.getTotalLength(); if (L - prevLen > 1e-6){ const pts = sample(prevLen + 1e-4, L); const closed = /[zZ]\s*$/.test(sp.trim()) || Math.hypot(pts[0][0]-pts[pts.length-1][0], pts[0][1]-pts[pts.length-1][1]) < TOL; out.polys.push({ pts, closed, layer, stroke, kind: 'path' }); } prevLen = L; });
        tmp.remove();
      } else {
        const closed = !['line','polyline'].includes(tag), pts = sample(0, total);
        const poly = { pts, closed, layer, stroke, kind: tag };
        out.polys.push(poly);
      }
    });
    if (out.counts.text) out.notes.push('text');
    return out;
  }
  const len = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0]-pts[i-1][0], p[1]-pts[i-1][1]) : 0, 0);
  const bbox = polys => { const b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; polys.forEach(p => p.pts.forEach(([x, y]) => { b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x); b.y1 = Math.max(b.y1, y); })); return b; };
  // join open pieces by endpoints; returns open ends (degree 1) and component counts
  function connectivity(open){
    const key = p => `${Math.round(p[0]/TOL)},${Math.round(p[1]/TOL)}`, deg = new Map(), adj = new Map(), where = new Map();
    const link = (a, b) => { [a, b].forEach(k => { if (!adj.has(k)) adj.set(k, []); }); adj.get(a).push(b); adj.get(b).push(a); };
    open.forEach(p => { const a = key(p.pts[0]), b = key(p.pts[p.pts.length-1]); [a, b].forEach((k, i) => { deg.set(k, (deg.get(k) || 0) + 1); where.set(k, i ? p.pts[p.pts.length-1] : p.pts[0]); }); link(a, b); });
    const ends = [...deg].filter(([, d]) => d === 1).map(([k]) => where.get(k));
    const seen = new Set(); let loops = 0, chains = 0;
    for (const k of adj.keys()){ if (seen.has(k)) continue; const st = [k]; let odd = false; seen.add(k);
      while (st.length){ const u = st.pop(); if ((deg.get(u) || 0) % 2) odd = true; adj.get(u).forEach(w => { if (!seen.has(w)){ seen.add(w); st.push(w); } }); }
      odd ? chains++ : loops++; }
    return { ends, loops, chains };
  }
  function duplicates(polys){
    const seen = new Map(); let dup = 0; const at = [];
    polys.forEach(p => { for (let j = 1; j < p.pts.length; j++){ const a = p.pts[j-1], b = p.pts[j]; if (Math.hypot(b[0]-a[0], b[1]-a[1]) < 0.02) continue;
      const k = [a, b].map(q => `${q[0].toFixed(3)},${q[1].toFixed(3)}`).sort().join('|'); if (seen.has(k)){ dup++; if (at.length < 30) at.push([(a[0]+b[0])/2, (a[1]+b[1])/2]); } else seen.set(k, 1); } });
    return { dup, at };
  }
  function run(file, text, opts, host){
    const isDXF = /\.dxf$/i.test(file.name), isSVG = /\.svg$/i.test(file.name), R = [], add = (lvl, msg) => R.push({ lvl, msg });
    const M = opts.machine;
    if (!isDXF && !isSVG){ add('fail', 'Send a DXF or SVG file. This checker can\'t read ' + file.name.split('.').pop().toUpperCase() + ' files.'); return { R }; }
    if (M.kind === 'waterjet' && !isDXF) add('fail', 'The waterjet needs a DXF. Export one from your CAD program (see the DXF lesson).');
    let g;
    try { g = isDXF ? parseDXF(text) : parseSVG(text, host); } catch (e) { add('fail', 'Couldn\'t read the file: ' + e.message); return { R }; }
    let scale = 1;
    if (isDXF){
      const u = g.insunits;
      if (u === 1) add('ok', 'Units are inches.');
      else if (u === 4){ scale = 1/25.4; add('ok', 'Units are millimeters. Converted to inches for these checks.'); }
      else if (u === 5){ scale = 1/2.54; add('ok', 'Units are centimeters.'); }
      else { scale = opts.assumeMM ? 1/25.4 : 1; add('warn', `The file doesn't say its units. I read it as ${opts.assumeMM ? 'millimeters' : 'inches'}. Re-export with units set, or change the setting below.`); }
    } else if (g.unitNote) add('warn', g.unitNote);
    g.polys.forEach(p => { p.pts = p.pts.map(([x, y]) => [x*scale, y*scale]); if (p.d) p.d *= isDXF ? scale : 1; });
    g.polys = g.polys.filter(p => p.pts.length > 1);
    if (!g.polys.length){ add('fail', 'No cut geometry found.'); return { R, g }; }
    const unsupported = Object.keys(g.counts).filter(t => ['INSERT','DIMENSION','HATCH','MTEXT','TEXT','SOLID','3DFACE','IMAGE'].includes(t));
    if (unsupported.length) add(M.kind === 'waterjet' ? 'fail' : 'warn', `The file has ${unsupported.join(', ')} entities. Explode blocks, delete dimensions and hatches, and turn text into outlines.`);
    if (g.notes.includes('text')) add('warn', 'The SVG has live text. Convert text to outlines (paths) so the laser computer doesn\'t swap the font.');
    if (g.notes.includes('spline')) add('warn', 'The file has splines. They are checked roughly. If the machine software complains, export with splines as polylines.');
    // material outline
    const all = bbox(g.polys);
    let outline = g.polys.find(p => /material|stock|sheet/i.test(p.layer || ''));
    if (!outline) outline = g.polys.find(p => { if (!p.closed) return false; const b = bbox([p]); return Math.abs(b.x0-all.x0) < TOL && Math.abs(b.y0-all.y0) < TOL && Math.abs(b.x1-all.x1) < TOL && Math.abs(b.y1-all.y1) < TOL; });
    const parts = g.polys.filter(p => p !== outline);
    if (!outline) add('fail', 'No material outline. Draw a rectangle the size of your sheet around your parts, on its own layer named MATERIAL.');
    else {
      const ob = bbox([outline]), ow = ob.x1-ob.x0, oh = ob.y1-ob.y0, pb = bbox(parts.length ? parts : [outline]);
      add('ok', `Material outline found: ${ow.toFixed(2)} × ${oh.toFixed(2)} in.`);
      if (parts.length && (pb.x0 < ob.x0 - TOL || pb.y0 < ob.y0 - TOL || pb.x1 > ob.x1 + TOL || pb.y1 > ob.y1 + TOL)) add('fail', 'Some parts sit outside the material outline.');
      const [bw, bh] = M.bed; const fitsBed = (ow <= bw + TOL && oh <= bh + TOL) || (ow <= bh + TOL && oh <= bw + TOL);
      if (!fitsBed) add('fail', `The material outline is bigger than the ${M.name} bed (${bw} × ${bh} in).`);
      const [kw, kh] = opts.stock; if (kw && !((ow <= kw + TOL && oh <= kh + TOL) || (ow <= kh + TOL && oh <= kw + TOL))) add('warn', `The outline is bigger than the kit sheet (${kw} × ${kh} in). You'll need more material than one kit.`);
    }
    if (M.kind === 'laser' && opts.material === 'aluminum') add('fail', 'Only the waterjet cuts aluminum. Pick the waterjet, or cut this part from plywood or acrylic.');
    if (opts.t > M.maxT + 1e-6) add('fail', `${opts.t} in is too thick for the ${M.name}. Its limit is ${M.maxT} in.`);
    // closed shapes and open ends
    const open = parts.filter(p => !p.closed), conn = connectivity(open), closedCount = parts.filter(p => p.closed).length;
    if (conn.ends.length) add(M.kind === 'waterjet' ? 'fail' : 'warn', `${conn.ends.length} open end${conn.ends.length>1?'s':''} (red circles). Every cut outline should be a closed loop.`);
    else add('ok', 'Every outline is closed.');
    const dup = duplicates(parts);
    if (dup.dup) add('warn', `${dup.dup} doubled line segment${dup.dup>1?'s':''} (orange). The machine will cut them twice, which burns or widens the cut.`);
    else add('ok', 'No doubled lines.');
    // small features
    const minHole = M.kind === 'waterjet' ? opts.t : 0.06;
    const tiny = parts.filter(p => p.closed && (p.d ? p.d : Math.min(bbox([p]).x1-bbox([p]).x0, bbox([p]).y1-bbox([p]).y0)) < minHole - 1e-6);
    if (tiny.length) add(M.kind === 'waterjet' ? 'fail' : 'warn', `${tiny.length} hole${tiny.length>1?'s or features are':' or feature is'} smaller than ${minHole.toFixed(3)} in. ${M.kind === 'waterjet' ? 'Waterjet holes should be at least as wide as the plate is thick.' : 'Very small features may burn away.'}`);
    // time
    const cutLen = parts.reduce((s, p) => s + len(p.pts) + (p.closed ? Math.hypot(p.pts[0][0]-p.pts[p.pts.length-1][0], p.pts[0][1]-p.pts[p.pts.length-1][1]) : 0), 0);
    const pierces = closedCount + conn.loops + conn.chains, mins = (cutLen / opts.speed + pierces * M.pierce) / 60;
    add(mins > M.capMin ? 'fail' : 'ok', `Cut length ${cutLen.toFixed(1)} in, ${pierces} pierce${pierces===1?'':'s'}, about ${mins.toFixed(1)} min at ${opts.speed} in/s. The cap is ${M.capMin} min. This is a rough estimate; the machine's own estimate wins.`);
    return { R, g, outline, parts, ends: conn.ends, dupAt: dup.at, all: bbox(g.polys) };
  }
  function preview(res){
    if (!res || !res.g) return '';
    const b = res.all, pad = Math.max(b.x1-b.x0, b.y1-b.y0) * 0.04 + 0.1, W = b.x1-b.x0+2*pad, H = b.y1-b.y0+2*pad, sw = Math.max(W, H) / 500;
    const tr = ([x, y]) => `${(x-b.x0+pad).toFixed(3)},${(b.y1-y+pad).toFixed(3)}`;
    const pl = (p, col, w) => `<polyline points="${p.pts.map(tr).join(' ')}${p.closed ? ' ' + tr(p.pts[0]) : ''}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
    const dot = (p, col) => { const [x, y] = tr(p).split(','); return `<circle cx="${x}" cy="${y}" r="${sw*6}" fill="none" stroke="${col}" stroke-width="${sw*2}"/>`; };
    return `<svg viewBox="0 0 ${W.toFixed(3)} ${H.toFixed(3)}" role="img" aria-label="Preview of your file">${res.outline ? pl(res.outline, 'var(--ok)', sw*2) : ''}${res.parts.map(p => pl(p, 'var(--ink)', sw*1.4)).join('')}${res.ends.map(e => dot(e, 'var(--red)')).join('')}${res.dupAt.map(e => dot(e, '#E08A00')).join('')}</svg>`;
  }
  return { run, preview, parseDXF };
})();
