/* Laser box designer: finger-jointed box → panels laid out on a sheet with a material outline → SVG / DXF.
   Units: inches. Corner ownership: front/back own the vertical corners; sides and bottom/top are recessed there. */
const BoxGen = (() => {
  function fingerCount(span, f){ let n = Math.max(1, Math.floor(span / f)); if (n % 2 === 0) n--; return Math.max(n, span >= 3 * 0.25 ? 3 : 1); }
  // pieces for one edge: [s0, s1, depth]; type 'A' = out at ends of the pattern, 'B' = in; margin = recessed ends
  function edgePieces(len, j, type, t){
    if (!j) return [[0, len, 0]];
    const m = j.margin, span = len - 2 * m, seg = span / j.n, out = [];
    if (m > 0) out.push([0, m, t]);
    for (let i = 0; i < j.n; i++){ const isOut = (i % 2 === 0) === (type === 'A'); out.push([m + i * seg, m + (i + 1) * seg, isOut ? 0 : t]); }
    if (m > 0) out.push([len - m, len, t]);
    return out;
  }
  // panel w×h, edges [bottom, right, top, left] each {j, type} or null; returns closed CCW polygon (y up)
  function panel(w, h, edges, t){
    const corners = [[0,0],[w,0],[w,h],[0,h]], dirs = [[1,0],[0,1],[-1,0],[0,-1]], ins = [[0,1],[-1,0],[0,-1],[1,0]];
    const lens = [w, h, w, h], P = edges.map((e, k) => edgePieces(lens[k], e && e.j, e && e.type, t));
    const pts = [];
    for (let k = 0; k < 4; k++){
      const prev = (k + 3) % 4, c = corners[k], dp = P[prev][P[prev].length - 1][2], d0 = P[k][0][2];
      pts.push([c[0] + ins[prev][0]*dp + ins[k][0]*d0, c[1] + ins[prev][1]*dp + ins[k][1]*d0]);
      const pc = P[k];
      for (let i = 1; i < pc.length; i++){
        const s = pc[i][0], a = pc[i-1][2], b = pc[i][2]; if (a === b) continue;
        pts.push([c[0] + dirs[k][0]*s + ins[k][0]*a, c[1] + dirs[k][1]*s + ins[k][1]*a]);
        pts.push([c[0] + dirs[k][0]*s + ins[k][0]*b, c[1] + dirs[k][1]*s + ins[k][1]*b]);
      }
    }
    return pts;
  }
  // grow an orthogonal CCW polygon outward by k (kerf / 2)
  function offset(pts, k){
    if (!k) return pts; const n = pts.length;
    const nrm = (a, b) => { const dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx, dy) || 1; return [dy/L, -dx/L]; };
    return pts.map((p, i) => { const a = nrm(pts[(i-1+n)%n], p), b = nrm(p, pts[(i+1)%n]); return [p[0] + (a[0]+b[0])*k, p[1] + (a[1]+b[1])*k]; });
  }
  function build(o){
    const t = o.t, X = o.inside ? o.L + 2*t : o.L, Y = o.inside ? o.W + 2*t : o.W, Z = o.inside ? o.H + 2*t : o.H;
    const closed = o.top === 'closed';
    const J = s => ({ margin: 0, n: fingerCount(s, o.finger) });
    const FS = J(Z), FB = J(X), FT = closed ? J(X) : null;
    const SB = { margin: t, n: fingerCount(Y - 2*t, o.finger) }, ST = closed ? { margin: t, n: SB.n } : null;
    const P = [];
    const add = (name, w, h, edges, extra) => P.push({ name, w, h, pts: offset(panel(w, h, edges, t), o.kerf/2), ...extra });
    const front = [{ j:FB, type:'A' }, { j:FS, type:'A' }, FT ? { j:FT, type:'A' } : null, { j:FS, type:'A' }];
    const side = [{ j:SB, type:'A' }, { j:FS, type:'B' }, ST ? { j:ST, type:'A' } : null, { j:FS, type:'B' }];
    const bot = [{ j:FB, type:'B' }, { j:SB, type:'B' }, { j:FB, type:'B' }, { j:SB, type:'B' }];
    add('Front', X, Z, front); add('Back', X, Z, front); add('Left', Y, Z, side); add('Right', Y, Z, side);
    add('Bottom', X, Y, bot);
    if (closed) add('Top', X, Y, bot, { engrave: o.text });
    if (o.top === 'lid'){
      const c = 0.02;
      add('Lid', X, Y, [null,null,null,null], { engrave: o.text });
      add('Lid lip', X - 2*t - 2*c, Y - 2*t - 2*c, [null,null,null,null]);
    }
    return { X, Y, Z, panels: P };
  }
  const bboxOf = p => { const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; };
  // shelf packing on the sheet, gap g, starting at margin g; uses each part's real outline (tabs included)
  function layout(panels, sw, sh, g){
    const items = panels.map((p, i) => { const b = bboxOf(p); return { p, i, b, w: b.x1 - b.x0, h: b.y1 - b.y0 }; }).sort((a, b) => b.h - a.h);
    let x = g, y = g, rowH = 0, fits = true;
    for (const it of items){
      if (x + it.w + g > sw){ x = g; y += rowH + g; rowH = 0; }
      it.x = x; it.y = y; x += it.w + g; rowH = Math.max(rowH, it.h);
      if (it.x + it.w > sw - g + 1e-9 || it.y + it.h > sh - g + 1e-9) fits = false;
    }
    return { items, fits };
  }
  const f4 = v => +v.toFixed(4);
  function placed(lay){ return lay.items.map(it => { const dx = it.x - it.b.x0, dy = it.y - it.b.y0, mv = ([px, py]) => [f4(px + dx), f4(py + dy)];
    return { name: it.p.name, engrave: it.p.engrave, cx: it.x + it.w/2, cy: it.y + it.h/2, pts: it.p.pts.map(mv),
      holes: (it.p.holes || []).map(h => h.c ? { c: [f4(h.c[0] + dx), f4(h.c[1] + dy), h.c[2]] } : { pts: h.pts.map(mv) }) }; }); }
  function svg(parts, sw, sh, preview){
    const flipY = v => f4(sh - v), poly = pts => pts.map(([x, y]) => `${x},${flipY(y)}`).join(' ');
    const sw2 = preview ? 0.02 : 0.001, cut = `fill="none" stroke="#FF0000" stroke-width="${sw2}"`;
    const body = parts.map(p => `<polygon points="${poly(p.pts)}" fill="${preview?'var(--wood)':'none'}" stroke="#FF0000" stroke-width="${sw2}"/>` +
      (p.holes || []).map(h => h.c ? `<circle cx="${h.c[0]}" cy="${flipY(h.c[1])}" r="${h.c[2]}" ${preview ? `fill="var(--sheet)" stroke="#FF0000" stroke-width="${sw2}"` : cut}/>` : `<polygon points="${poly(h.pts)}" ${preview ? `fill="var(--sheet)" stroke="#FF0000" stroke-width="${sw2}"` : cut}/>`).join('') +
      (preview ? `<text x="${f4(p.cx)}" y="${flipY(p.cy)}" font-size="0.32" text-anchor="middle" fill="currentColor" font-family="sans-serif">${p.name}</text>` : '') +
      (p.engrave ? `<text x="${f4(p.cx)}" y="${flipY(p.cy) + (preview ? .45 : 0)}" font-size="0.4" text-anchor="middle" fill="#0000FF" font-family="sans-serif">${esc(p.engrave)}</text>` : '')).join('\n');
    const outline = `<rect id="MATERIAL" x="0" y="0" width="${sw}" height="${sh}" fill="none" stroke="#00A000" stroke-width="${preview?0.03:0.001}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}in" height="${sh}in" viewBox="0 0 ${sw} ${sh}">\n<g id="MATERIAL-outline">${outline}</g>\n<g id="CUT">\n${body}\n</g>\n</svg>`;
  }
  function dxf(parts, sw, sh){
    const L = [], e = (c, v) => L.push(String(c), String(v));
    e(0,'SECTION'); e(2,'HEADER'); e(9,'$ACADVER'); e(1,'AC1009'); e(9,'$INSUNITS'); e(70,1); e(0,'ENDSEC');
    e(0,'SECTION'); e(2,'TABLES'); e(0,'TABLE'); e(2,'LAYER'); e(70,2);
    [['CUT',1],['MATERIAL',3]].forEach(([n,c]) => { e(0,'LAYER'); e(2,n); e(70,0); e(62,c); e(6,'CONTINUOUS'); });
    e(0,'ENDTAB'); e(0,'ENDSEC'); e(0,'SECTION'); e(2,'ENTITIES');
    const pl = (pts, layer) => { e(0,'POLYLINE'); e(8,layer); e(66,1); e(70,1); e(10,0); e(20,0); e(30,0);
      pts.forEach(([x, y]) => { e(0,'VERTEX'); e(8,layer); e(10,f4(x)); e(20,f4(y)); e(30,0); }); e(0,'SEQEND'); e(8,layer); };
    pl([[0,0],[sw,0],[sw,sh],[0,sh]], 'MATERIAL');
    parts.forEach(p => { pl(p.pts, 'CUT'); (p.holes || []).forEach(h => { if (h.c){ e(0,'CIRCLE'); e(8,'CUT'); e(10,h.c[0]); e(20,h.c[1]); e(30,0); e(40,h.c[2]); } else pl(h.pts, 'CUT'); }); });
    e(0,'ENDSEC'); e(0,'EOF');
    return L.join('\r\n');
  }
  // panel from edge profiles: each edge is [[s, d], ...] with s along the edge (0..len) and d the inward depth (negative = sticks out)
  function panelProfiles(w, h, edges){
    const corners = [[0,0],[w,0],[w,h],[0,h]], dirs = [[1,0],[0,1],[-1,0],[0,-1]], ins = [[0,1],[-1,0],[0,-1],[1,0]], pts = [];
    for (let k = 0; k < 4; k++){
      const prev = (k + 3) % 4, c = corners[k], dp = edges[prev][edges[prev].length - 1][1], d0 = edges[k][0][1];
      pts.push([c[0] + ins[prev][0]*dp + ins[k][0]*d0, c[1] + ins[prev][1]*dp + ins[k][1]*d0]);
      edges[k].slice(1, -1).forEach(([s, d]) => pts.push([c[0] + dirs[k][0]*s + ins[k][0]*d, c[1] + dirs[k][1]*s + ins[k][1]*d]));
    }
    return pts.filter((p, i, a) => { const q = a[(i + a.length - 1) % a.length]; return Math.hypot(p[0]-q[0], p[1]-q[1]) > 1e-9; });
  }
  const piecesToProfile = pcs => pcs.flatMap(([s0, s1, d]) => [[s0, d], [s1, d]]);
  /* T-slot box: four walls finger-jointed at the corners, standing on a bigger base plate. Each wall has two tabs into
     slots in the base and one M3 T-slot (screw from below, nut in the wall). Lift-off lid with a lip. Units: inches. */
  const M3 = { hole: 0.13, stem: 0.126, nutW: 0.226, nutH: 0.1, nutAt: 0.22, depth: 0.42 };
  function tslotBottom(len, t, tabs, slot, tb){
    // bottom edge profile: tabs stick down by tb (d = -tb), the T-slot cuts up into the wall (d > 0)
    const P = [[0, 0]], tw = 0.5, add = (s, d) => P.push([s, d]);
    const feats = [...tabs.map(c => ({ c, k: 'tab' })), ...(slot ? [{ c: slot, k: 'slot' }] : [])].sort((a, b) => a.c - b.c);
    feats.forEach(f => {
      if (f.k === 'tab'){ add(f.c - tw/2, 0); add(f.c - tw/2, -tb); add(f.c + tw/2, -tb); add(f.c + tw/2, 0); }
      else { const s = M3.stem/2, n = M3.nutW/2; add(f.c - s, 0); add(f.c - s, M3.nutAt); add(f.c - n, M3.nutAt); add(f.c - n, M3.nutAt + M3.nutH); add(f.c - s, M3.nutAt + M3.nutH); add(f.c - s, M3.depth); add(f.c + s, M3.depth); add(f.c + s, M3.nutAt + M3.nutH); add(f.c + n, M3.nutAt + M3.nutH); add(f.c + n, M3.nutAt); add(f.c + s, M3.nutAt); add(f.c + s, 0); }
    });
    P.push([len, 0]); return P;
  }
  function tslotBox(o){
    const { L, W, H, t, tb = t, m = 0.25, finger = 0.5, assembly = 'tslot', text = '' } = o, c = 0.02;
    const nV = fingerCount(H, finger), JV = { margin: 0, n: nV };
    const bolts = assembly === 'tslot';
    const flat = len => [[0, 0], [len, 0]];
    const vert = type => piecesToProfile(edgePieces(H, JV, type, t));
    const frontTabs = [L/4, 3*L/4], sideTabs = [W/4, 3*W/4];
    const wall = (name, len, type, tabs) => ({ name, pts: panelProfiles(len, H, [tslotBottom(len, t, tabs, bolts ? len/2 : null, tb), vert(type), flat(len), vert(type)]) });
    const P = [wall('Front', L, 'A', frontTabs), wall('Back', L, 'A', frontTabs), wall('Left', W, 'B', sideTabs), wall('Right', W, 'B', sideTabs)];
    const BL = L + 2*m, BW = W + 2*m, k = 0.004, slots = [], holes = [];
    const rect = (x0, y0, x1, y1) => ({ pts: [[x0 - k, y0 - k], [x1 + k, y0 - k], [x1 + k, y1 + k], [x0 - k, y1 + k]] });
    frontTabs.forEach(x => { slots.push(rect(m + x - .25, m, m + x + .25, m + t)); slots.push(rect(m + x - .25, m + W - t, m + x + .25, m + W)); });
    sideTabs.forEach(y => { slots.push(rect(m, m + y - .25, m + t, m + y + .25)); slots.push(rect(m + L - t, m + y - .25, m + L, m + y + .25)); });
    if (bolts) [[m + L/2, m + t/2], [m + L/2, m + W - t/2], [m + t/2, m + W/2], [m + L - t/2, m + W/2]].forEach(([x, y]) => holes.push({ c: [x, y, M3.hole/2] }));
    P.push({ name: 'Base', pts: [[0,0],[BL,0],[BL,BW],[0,BW]], holes: [...slots, ...holes] });
    P.push({ name: 'Lid', pts: [[0,0],[BL,0],[BL,BW],[0,BW]], engrave: text });
    const lw = L - 2*t - 2*c, lh = W - 2*t - 2*c;
    P.push({ name: 'Lid lip', pts: [[0,0],[lw,0],[lw,lh],[0,lh]] });
    return { panels: P, base: [BL, BW], lip: [lw, lh] };
  }
  return { build, layout, placed, svg, dxf, tslotBox };
})();
