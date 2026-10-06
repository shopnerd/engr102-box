/* 3D sample models: drag to turn, one slider either opens the drawer (home page) or explodes the parts (design pages).
   Three.js loads from a CDN on demand; if it can't, the SVG three-quarter view stays. Built from the same numbers as drawings.js.
   Model coordinates match the drawings' iso views: x right, y toward the front, z up, inches. Each part carries an
   explode vector `ex`; parts marked `dr` ride the drawer. */
const Box3D = (() => {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
  let stop = () => {};
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#999';
  const ring = (cx, cy, r, n = 24) => Array.from({ length: n }, (_, k) => [cx + r * Math.cos(k / n * 2 * Math.PI), cy + r * Math.sin(k / n * 2 * Math.PI)]);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  /* Part builders. Everything is added to `parts` with an explode vector. */
  function kit(T){
    const ink = new T.LineBasicMaterial({ color: css('--ink'), transparent: true, opacity: .8 });
    const std = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: css(c), roughness: .85, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, side: T.DoubleSide }, o));
    const M = { wood: std('--wood'), wood2: std('--wood2'), wood3: std('--wood3'), cav: std('--cav'), pr: std('--print', { roughness: .6 }),
      alu: std('--alu', { roughness: .35, metalness: .55 }), steel: std('--alu2', { roughness: .3, metalness: .7 }), brass: new T.MeshStandardMaterial({ color: '#C9A13B', roughness: .3, metalness: .8 }),
      acr: std('--acr', { transparent: true, opacity: .55, roughness: .15, depthWrite: false }), red: std('--red', { roughness: .4 }), knob: std('--ink', { roughness: .5 }) };
    const parts = [], V2 = p => p.map(([a, b]) => new T.Vector2(a, b));
    const shape = (pts, holes = []) => { const s = new T.Shape(V2(pts)); holes.forEach(h => s.holes.push(new T.Path(V2(h)))); return s; };
    const ext = (s, d) => new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 });
    const extras = [], mk = (geo, m, edge = 25) => { const o = new T.Mesh(geo, M[m]); if (edge) o.add(new T.LineSegments(new T.EdgesGeometry(geo, edge), ink)); return o; };
    const add = (geo, m, pos, o = {}) => {
      const mesh = geo.isObject3D ? geo : mk(geo, m);
      mesh.position.copy(pos); mesh.userData = { base: pos.clone(), ex: new T.Vector3(...to3(o.ex || [0, 0, 0])), dr: !!o.dr };
      parts.push(mesh); return mesh;
    };
    const to3 = ([x, y, z]) => [x, z, y];                      // model (x, y-front, z-up) -> three (x, y-up, z-front)
    // #6 flat-head wood screw, 1-1/4 long: head, cross recess, threads. Built pointing down -Y from the head top at 0.
    const screwObj = () => {
      const p = [[0, 0], [.131, 0], [.131, -.012], [.069, -.08], [.069, -.36]];
      for (let h = -.36; h > -1.12; h -= .055) p.push([.048, h - .02], [.069, h - .055]);
      p.push([.03, -1.2], [0, -1.25]);
      const g = new T.Group(); g.add(mk(new T.LatheGeometry(V2(p), 20), 'steel', 50));
      [0, Math.PI / 2].forEach(a => { const c = new T.Mesh(new T.BoxGeometry(.17, .05, .028), M.cav); c.rotation.y = a; c.position.y = -.02; g.add(c); });
      return g;
    };
    return { T, M, ink, parts, extras, mk, raw: o => (extras.push(o), o),
      // screw with its head flush at model (x, y, z), pointing +y (dir 1) or -y (dir -1)
      screw(x, y, z, dir, o){ const sc = screwObj(); sc.rotation.x = -dir * Math.PI / 2; return add(sc, null, new T.Vector3(x, z, y), o); },
      // countersink cone surface in the face at y, narrowing toward +dir
      csink(x, y, z, r0, r1, d, dir, m, o){ const g = new T.LatheGeometry(V2([[r0, 0], [r1, -d]]), 20); g.rotateX(-dir * Math.PI / 2); return add(mk(g, m, 0), null, new T.Vector3(x, z, y), o); },
      // dark disc on a face at y facing +y (dir 1) or -y (dir -1): pilot holes
      disc(x, y, z, r, dir, o){ const g = new T.CircleGeometry(r, 16); if (dir < 0) g.rotateY(Math.PI); return add(mk(g, 'cav', 0), null, new T.Vector3(x, z, y), o); },
      // profile [x, z] extruded from front-to-back depth y0..y1
      slab(prof, y0, y1, m, o = {}){ return add(ext(shape(prof, o.holes), y1 - y0), m, new T.Vector3(0, 0, y0), o); },
      // profile [y, z] extruded along x from x0..x1
      slabX(prof, x0, x1, m, o = {}){ const g = ext(shape(prof), x1 - x0); g.rotateY(-Math.PI / 2); return add(g, m, new T.Vector3(x1, 0, 0), o); },
      // outline [x, y] extruded up from z0..z1 (plates with holes)
      plate(pts, z0, z1, m, o = {}){ const fl = p => p.map(([x, y]) => [x, -y]); const g = ext(shape(fl(pts), (o.holes || []).map(fl)), z1 - z0); g.rotateX(-Math.PI / 2); return add(g, m, new T.Vector3(0, z0, 0), o); },
      box(x0, y0, z0, x1, y1, z1, m, o){ const g = new T.BoxGeometry(x1 - x0, z1 - z0, y1 - y0); return add(g, m, new T.Vector3((x0 + x1) / 2, (z0 + z1) / 2, (y0 + y1) / 2), o); },
      // cylinder; axis 'z' (up) or 'y' (front-back)
      cyl(cx, cy, cz, r, h, axis, m, o){ const g = new T.CylinderGeometry(r, r, h, 20); if (axis === 'y') g.rotateX(Math.PI / 2); return add(g, m, new T.Vector3(cx, cz, cy), o); }
    };
  }

  /* One builder per design. Return { open } for a drawer distance when the model has one. */
  const MODELS = {
    b1(k){ const L = 8, W = 3, H = 2.25, t = .125, s0 = 1.87, s1 = 2.0;
      k.box(t, t, 0, L - t, W - t, t, 'wood2', { ex: [0, 0, -1] });                               // bottom
      k.box(0, 0, 0, L, t, H, 'wood', { ex: [0, -1.4, 0] });                                        // back outer
      k.box(t, t, t, L - t, 2 * t, s0, 'wood', { ex: [0, -.8, 0] }); k.box(t, t, s1, L - t, 2 * t, H, 'wood', { ex: [0, -.8, 0] });
      k.box(0, t, 0, t, W - t, H, 'wood', { ex: [-1.2, 0, 0] });                                    // closed end
      k.box(L - t, t, 0, L, W - t, s0, 'wood', { ex: [1.2, 0, 0] });                                // lid-exit end
      k.box(t, W - 2 * t, t, L - t, W - t, s0, 'wood', { ex: [0, .8, 0] }); k.box(t, W - 2 * t, s1, L - t, W - t, H, 'wood', { ex: [0, .8, 0] });
      k.box(0, W - t, 0, L, W, H, 'wood', { ex: [0, 1.4, 0] });                                     // front outer
      k.box(t + .01, t + .015, s0, L, W - t - .015, s1, 'acr', { ex: [2.2, 0, .9] });               // lid slides out the end
    },
    b2(k){ const L = 9, W = 3, H = 2.5, t = .5, g0 = 2.125, g1 = 2.25, cs = .07, rC = .135, rH = .07, rP = .047;
      const at = [[.25, .75], [.25, 1.75], [L - .25, .75], [L - .25, 1.75]], side = rect(0, 0, L, H);
      // side = countersink layer + clearance-hole layer. Ends stay put; sides and screws slide straight out so they line up.
      const sideWithHoles = (face, dir) => { const ex = [0, -dir * 1.7, 0], inner = face + dir * cs, far = face + dir * t;
        k.slab(side, Math.min(face, inner), Math.max(face, inner), 'wood', { holes: at.map(([x, z]) => ring(x, z, rC, 20)), ex });
        k.slab(side, Math.min(inner, far), Math.max(inner, far), 'wood', { holes: at.map(([x, z]) => ring(x, z, rH, 16)), ex });
        at.forEach(([x, z]) => { k.csink(x, face, z, rC, rH, cs, dir, 'wood3', { ex }); k.screw(x, face, z, dir, { ex: [0, -dir * 3.4, 0] }); });
      };
      k.box(t, t, .25, L - t, W - t, .5, 'wood2', { ex: [0, 0, -1.1] });                            // ply bottom in the dado
      sideWithHoles(0, 1); sideWithHoles(W, -1);
      k.box(0, t, 0, t, W - t, H, 'wood'); k.box(L - t, t, 0, L, W - t, g0, 'wood');                // ends
      at.forEach(([x, z]) => { k.disc(x, t - .002, z, rP, -1); k.disc(x, W - t + .002, z, rP, 1); }); // pilot holes in the end grain
      k.box(.34, .33, g0, L, W - .33, g1, 'acr', { ex: [2.4, 0, 1.2] });
    },
    b3(k){ const D = 3.5, f = B3.foot;
      k.slab(B3.outer, 0, .25, 'wood2', { ex: [0, -1.6, 0] });                                      // back slice
      k.slab(B3.outer, .25, D, 'wood', { holes: [B3.dr] });                                         // body
      k.slab(B3.dr, .25, .5, 'wood2', { dr: 1, ex: [0, -.95, 0] });                                 // drawer back
      k.slab(B3.core, .5, 3.25, 'wood', { dr: 1, ex: [0, 2.6, 0] });                                // hollowed core
      k.slab(B3.dr, 3.25, D, 'wood2', { dr: 1, ex: [0, 3.4, 0] });                                  // drawer front
      k.box(2, D, 1.42, 3.5, D + .25, 1.79, 'alu', { dr: 1, ex: [0, 4.1, 0] });                     // pull
      B3.feet.forEach(([x0, x1, y0, y1]) => k.box(x0, y0, -f, x1, y1, 0, 'wood3', { ex: [0, 0, -.8] }));
      return { open: 2.6 };
    },
    b4(k){ const L = 6, Wd = 4, zb = 2.375, z = 2.5, w = .1, bosses = [[.375, .375], [L - .375, .375], [.375, Wd - .375], [L - .375, Wd - .375]];
      k.plate(rect(0, 0, L, Wd), 0, w, 'pr');                                                       // printed floor
      k.plate(rect(0, 0, L, Wd), w, zb, 'pr', { holes: [rect(w, w, L - w, Wd - w)] });              // printed walls
      bosses.forEach(([x, y]) => { k.cyl(x, y, (w + zb) / 2, .24, zb - w, 'z', 'pr');
        k.cyl(x, y, zb - .1, .1, .2, 'z', 'brass', { ex: [0, 0, .7] });                             // heat-set insert
        k.cyl(x, y, z + .045, .15, .09, 'z', 'steel', { ex: [0, 0, 2.6] }); });                     // button-head screw
      const holes = [rect(.75, .75, 3.25, 1.75), ...bosses.map(([x, y]) => ring(x, y, .065, 12)), ring(4.5, 1.25, .19), ...[1.25, 2].map(x => ring(x, 2.9, .12, 12)), ring(2.75, 2.9, .1, 12)];
      k.plate(rect(0, 0, L, Wd), zb, z, 'alu', { holes, ex: [0, 0, 1.6] });                         // waterjet plate
      k.plate(rect(.6, .6, 3.4, 1.9), zb - .125, zb, 'acr', { ex: [0, 0, 1.0] });                   // window behind the plate
      k.cyl(4.5, 1.25, z + .22, .38, .45, 'z', 'knob', { ex: [0, 0, 2.2] });
      [1.25, 2].forEach(x => { k.cyl(x, 2.9, z + .05, .16, .1, 'z', 'steel', { ex: [0, 0, 2.2] }); k.cyl(x, 2.9, z + .3, .035, .45, 'z', 'steel', { ex: [0, 0, 2.2] }); });
      k.cyl(2.75, 2.9, z + .08, .1, .16, 'z', 'red', { ex: [0, 0, 2.2] });                          // LED
    },
    b5(k){ const T = k.T, L = 5.25, W = 3.375, H = 1.5, t = .125, ro = .25, ri = .125, tz0 = .41, tz1 = 1.46, tl = .6;
      // Slider: lid lifts and rivets pull, then the blank unfolds in reverse build order: long walls, end walls, tabs.
      // Works in three's frame (X right, Y up, Z front). Each wall hangs off a floor edge through a bend whose neutral
      // length stays constant, so the flat state comes out at the real blank size.
      const rn = ri + t / 2, s = rn * Math.PI / 2, Lw = H - ro, root = k.raw(new T.Group());
      const boxG = (x0, x1, y0, y1, z0, z1) => new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      const holeDisc = (x, y, z, up) => { const g = new T.CircleGeometry(.08, 16); g.rotateX(up ? -Math.PI / 2 : Math.PI / 2); const o = k.mk(g, 'cav', 0); o.position.set(x, y, z); return o; };
      root.add(k.mk(boxG(ro, L - ro, 0, t, ro, W - ro), 'alu'));                                  // floor
      const bendPts = th => { const kap = Math.max(th, 1e-4) / s, out = [], inn = [];
        for (let i = 0; i <= 12; i++) { const f = kap * s * i / 12, pz = Math.sin(f) / kap, py = (1 - Math.cos(f)) / kap, cz = -Math.sin(f), cy = Math.cos(f);
          out.push([pz - cz * t / 2, py - cy * t / 2]); inn.push([pz + cz * t / 2, py + cy * t / 2]); }
        return { pts: [...out, ...inn.reverse()], end: [Math.sin(kap * s) / kap, (1 - Math.cos(kap * s)) / kap] }; };
      // hinge frame: local X along the edge, Z outward from the floor, Y up (the inside face)
      const flap = (px, pz, rotY, bl, wl) => {
        const h = new T.Group(); h.position.set(px, t / 2, pz); h.rotation.y = rotY; root.add(h);
        const bend = new T.Mesh(new T.BufferGeometry(), k.M.alu), bE = new T.LineSegments(new T.BufferGeometry(), k.ink); bend.add(bE); h.add(bend);
        const wall = new T.Group(); h.add(wall); wall.add(k.mk(boxG(-wl / 2, wl / 2, -t / 2, t / 2, 0, Lw), 'alu'));
        return { wall, set(th){ const b = bendPts(th), g = new T.ExtrudeGeometry(new T.Shape(b.pts.map(([a, c]) => new T.Vector2(a, c))), { depth: bl, bevelEnabled: false });
          g.rotateY(-Math.PI / 2); g.translate(bl / 2, 0, 0);
          bend.geometry.dispose(); bend.geometry = g; bE.geometry.dispose(); bE.geometry = new T.EdgesGeometry(g, 25);
          wall.position.set(0, b.end[1], b.end[0]); wall.rotation.x = -th; } };
      };
      const longs = [flap(L / 2, ro, Math.PI, L - 2 * ro, L), flap(L / 2, W - ro, 0, L - 2 * ro, L)];
      const ends = [flap(ro, W / 2, -Math.PI / 2, W - 2 * ro, W - 2 * t), flap(L - ro, W / 2, Math.PI / 2, W - 2 * ro, W - 2 * t)];
      const hw = (W - 2 * t) / 2, rz = .94 - ro, rx = L / 2 - .46, tabs = [], rivets = [];
      ends.forEach(e => [1, -1].forEach(sg => {                                                   // corner tabs fold off the end walls
        const tg = new T.Group(); tg.position.set(sg * hw, -t / 2, 0); e.wall.add(tg);
        tg.add(k.mk(boxG(sg > 0 ? 0 : -tl, sg > 0 ? tl : 0, 0, t, tz0 - ro, tz1 - ro), 'alu'));
        tg.add(holeDisc(sg * (.46 - t), -.002, rz, false), holeDisc(sg * (.46 - t), t + .002, rz, true));
        tabs.push([tg, sg]); }));
      longs.forEach(l => [1, -1].forEach(sg => {                                                  // rivet holes + pop rivets, head outside
        l.wall.add(holeDisc(sg * rx, -t / 2 - .002, rz, false), holeDisc(sg * rx, t / 2 + .002, rz, true));
        const r = new T.Group(); r.position.set(sg * rx, 0, rz);
        r.add(k.mk(new T.CylinderGeometry(.155, .155, .04, 20).translate(0, -t / 2 - .02, 0), 'steel'), k.mk(new T.CylinderGeometry(.078, .078, .32, 14).translate(0, .1, 0), 'steel'));
        l.wall.add(r); rivets.push(r); }));
      const lid = new T.Group(); root.add(lid);
      lid.add(k.mk(boxG(.2875, L - .2875, H - .125, H, .2875, W - .2875), 'wood'), k.mk(boxG(0, L, H, H + .125, 0, W), 'wood2'));
      const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }, Q = Math.PI / 2;
      return { update(v){
        const p1 = sm(v / .3), pl = sm((v - .3) / .3), pe = sm((v - .55) / .3), pt = sm((v - .8) / .2);
        lid.position.y = 2 * p1; rivets.forEach(r => r.position.y = -.9 * p1);
        longs.forEach(l => l.set(Q * (1 - pl))); ends.forEach(e => e.set(Q * (1 - pe)));
        tabs.forEach(([tg, sg]) => tg.rotation.z = sg * Q * (1 - pt));
      } };
    }
  };

  /* mode: 'drawer' (needs model.open) or 'explode'. slider: <input type=range 0..100>. */
  async function mount(box, slider, id, mode){
    stop();
    if (!MODELS[id]) return;
    let T; try { T = await import(THREE_URL); } catch { return; }          // offline: keep the SVG
    if (!box.isConnected) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const W = () => box.clientWidth, H = () => Math.round(box.clientWidth * .78);
    let r; try { r = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }  // no WebGL: keep the SVG
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(W(), H());
    const el = r.domElement;
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Sample box 3D model. Drag to turn it.');
    el.style.touchAction = 'pan-y'; el.style.cursor = 'grab'; el.style.display = 'block';
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(28, W() / H(), .1, 200);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a7a66, 1.7));
    const sun = new T.DirectionalLight(0xffffff, 1.4); sun.position.set(4, 9, 6); scene.add(sun);

    const k = kit(T), info = MODELS[id](k) || {}, g = new T.Group();
    k.parts.forEach(p => g.add(p)); k.extras.forEach(o => g.add(o));
    const set = v => { k.parts.forEach(p => { const u = p.userData;
      p.position.copy(u.base);
      if (mode === 'drawer') { if (u.dr) p.position.z += info.open * v; }
      else p.position.addScaledVector(u.ex, v); });
      if (mode !== 'drawer' && info.update) info.update(v); };
    // fit the camera to the fully open/exploded model so nothing leaves the frame while sliding
    const bb = new T.Box3(); set(0); bb.setFromObject(g); set(1); bb.union(new T.Box3().setFromObject(g));
    const ctr = bb.getCenter(new T.Vector3()), rad = bb.getBoundingSphere(new T.Sphere()).radius;
    g.position.copy(ctr).negate();
    const spin = new T.Group(); spin.add(g); spin.rotation.set(.15, -.6, 0); scene.add(spin);
    const fit = () => { const d = rad / Math.sin(cam.fov * Math.PI / 360) * (cam.aspect < 1 ? .95 / cam.aspect : .8); cam.position.set(0, d * .32, d * .95); cam.lookAt(0, 0, 0); };
    fit();

    const draw = () => r.render(scene, cam);
    const onSlide = () => { set(slider.value / 100); draw(); };
    slider.addEventListener('input', onSlide);
    let drag = null, idle = !reduce, raf = 0, last = 0;
    el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ry: spin.rotation.y, rx: spin.rotation.x }; idle = false; el.style.cursor = 'grabbing'; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!drag) return; spin.rotation.y = drag.ry + (e.clientX - drag.x) * .01; spin.rotation.x = Math.max(-.4, Math.min(1.2, drag.rx + (e.clientY - drag.y) * .006)); draw(); });
    const up = () => { drag = null; el.style.cursor = 'grab'; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    function tick(t){
      if (!box.isConnected) return stop();
      if (idle) { spin.rotation.y += Math.min(t - last, 50) * .00022; draw(); }
      last = t; raf = requestAnimationFrame(tick);
    }
    const ro = new ResizeObserver(() => { r.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); fit(); draw(); });
    box.replaceChildren(el); ro.observe(box);
    const ctl = slider.closest('.v3dctl'); if (ctl) ctl.hidden = false;
    onSlide(); raf = requestAnimationFrame(tick);
    stop = () => { cancelAnimationFrame(raf); ro.disconnect(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); r.dispose(); stop = () => {}; };
  }
  return { mount, has: id => !!MODELS[id] };
})();
