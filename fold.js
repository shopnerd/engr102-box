/* Fold designer engine: flat pattern, bend plan and finger-brake checks for a folded aluminum tray. Units: inches. No DOM.
   Flat-pattern math matches the B5 tray: K-factor .4, inside bend radius = thickness. Tabs fold off the end walls and
   rivet to the inside of the long walls. Coordinates of the flat pattern: x along the length, y down (drawing order). */
const FoldGen = (() => {
  // VEVOR 12 in box-and-pan brake. Fingers from the listing; depth and finger depth are from a comparable 12 in brake
  // (KAKA W-1220A lists 1.38 max box depth, .47 min flange) until someone measures ours.
  const BRAKE = { fingers: [1, 2, 2, 3, 4], width: 12, depth: 1.38, fingerDepth: 1.25, minFlange: .47 };
  const SHEET = [24, 12], K = .4, CLR = .03, RIVET_D = .161;
  const DEFAULT = { L: 5.25, W: 3.375, H: 1.25, t: .125, corners: 'tabs', tl: .6 };
  const f2 = v => (Math.round(v * 100) / 100).toFixed(2);

  // every finger set as {idx, s}; pick the one that covers the most of `want` without passing `hi`, then fewest fingers
  function pickFingers(fingers, hi, want){
    let best = null;
    for (let m = 1; m < 1 << fingers.length; m++){
      const idx = fingers.map((_, i) => i).filter(i => m >> i & 1), s = idx.reduce((a, i) => a + fingers[i], 0);
      if (s > hi + 1e-9) continue;
      const c = { idx, s, cover: Math.min(s, want - .1) };                      // within .1 counts as covered
      if (!best || c.cover > best.cover + 1e-9 || (Math.abs(c.cover - best.cover) < 1e-9 && (c.s < best.s - 1e-9 || (Math.abs(c.s - best.s) < 1e-9 && idx.length < best.idx.length)))) best = c;
    }
    return best;
  }
  const fingerWords = (fingers, set) => set.idx.map(i => fingers[i]).sort((a, b) => b - a).join(' + ') + (set.idx.length > 1 ? ` = ${set.s} in` : ' in');

  function plan(input, brake = BRAKE){
    const P = Object.assign({}, DEFAULT, input), issues = [], add = (lvl, title, why, fix, step) => issues.push({ lvl, title, why, fix, step });
    let { L, W, H, t } = P; const tabs = P.corners === 'tabs';
    if (![L, W, H, t].every(v => v > 0)) return { error: 'Enter a positive number in every size box.' };
    if (W > L){ [L, W] = [W, L]; add('note', 'Length and width swapped', 'Length is the long side in this plan, so the long walls are the last bends.', ''); }
    const ri = t, OS = ri + t, BA = Math.PI / 2 * (ri + K * t), straight = H - OS, n = straight + BA / 2;
    if (straight <= 0) return { error: `The walls must be taller than ${f2(OS)} in (the bend itself uses that much).` };
    const Ln = L + 2 * H - 2 * (2 * OS - BA), Wn = W + 2 * H - 2 * (2 * OS - BA), e = OS - BA / 2;
    const lx0 = n - e, lx1 = Ln - n + e, ey0 = Wn / 2 - (W - 2 * t) / 2, ey1 = Wn / 2 + (W - 2 * t) / 2;
    const tz0 = OS + .16, tz1 = H - .04, tabLen = tz1 - tz0, tl = tabs ? P.tl : 0;
    const d = z => z - OS + BA / 2, tx0 = n - d(tz1), tx1 = n - d(tz0), rx0 = Ln - tx1, rx1 = Ln - tx0;
    const a = Math.min(.35, tl * .55), dmid = d((tz0 + tz1) / 2);

    // outline, clockwise in drawing coordinates, B5 order
    const T = (xs, y0, y1) => tabs ? xs.map(([x, y]) => [x, y === 'o' ? y1 : y0]) : [];
    const outline = [[lx0, 0], [lx1, 0], [lx1, n], [Ln - n, n], [Ln - n, ey0],
      ...T([[rx0, 'i'], [rx0, 'o'], [rx1, 'o'], [rx1, 'i']], ey0, ey0 - tl), [Ln, ey0], [Ln, ey1],
      ...T([[rx1, 'i'], [rx1, 'o'], [rx0, 'o'], [rx0, 'i']], ey1, ey1 + tl), [Ln - n, ey1], [Ln - n, Wn - n], [lx1, Wn - n], [lx1, Wn], [lx0, Wn], [lx0, Wn - n], [n, Wn - n], [n, ey1],
      ...T([[tx1, 'i'], [tx1, 'o'], [tx0, 'o'], [tx0, 'i']], ey1, ey1 + tl), [0, ey1], [0, ey0],
      ...T([[tx0, 'i'], [tx0, 'o'], [tx1, 'o'], [tx1, 'i']], ey0, ey0 - tl), [n, ey0], [n, n], [lx0, n]];
    const rr = Math.max(.125, t), relief = [[n, n], [Ln - n, n], [Ln - n, Wn - n], [n, Wn - n]].map(([x, y]) => ({ x, y, r: rr }));
    const rivets = tabs ? [[(tx0 + tx1) / 2, ey0 - a], [(tx0 + tx1) / 2, ey1 + a], [(rx0 + rx1) / 2, ey0 - a], [(rx0 + rx1) / 2, ey1 + a],
      [lx0 + t + a, n - dmid], [lx1 - t - a, n - dmid], [lx0 + t + a, Wn - n + dmid], [lx1 - t - a, Wn - n + dmid]].map(([x, y]) => ({ x, y, r: RIVET_D / 2 })) : [];
    const bends = [
      ...(tabs ? [[tx0, tx1, ey0], [tx0, tx1, ey1], [rx0, rx1, ey0], [rx0, rx1, ey1]].map(([x0, x1, y]) => ({ k: 'tab', p: [[x0, y], [x1, y]] })) : []),
      { k: 'end', n: 1, p: [[n, ey0], [n, ey1]] }, { k: 'end', n: 2, p: [[Ln - n, ey0], [Ln - n, ey1]] },
      { k: 'long', n: 3, p: [[n, n], [Ln - n, n]] }, { k: 'long', n: 4, p: [[n, Wn - n], [Ln - n, Wn - n]] }];

    // ---- checks ----
    const F = brake.fingers, steps = [], bad = { tabs: false, ends: false, longs: false };
    const ys = outline.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), blankW = Ln + .5, blankH = y1 - y0 + .5;
    if (!((blankW <= SHEET[0] && blankH <= SHEET[1]) || (blankW <= SHEET[1] && blankH <= SHEET[0])))
      add('fail', "The blank doesn't fit the kit sheet", `The flat blank is ${f2(Ln)} × ${f2(y1 - y0)} in (plus a margin). The kit sheet is ${SHEET[0]} × ${SHEET[1]}.`, 'Make the box smaller or the walls shorter.');
    const bE = W - 2 * t, bL = Ln - 2 * n, longest = Math.max(bE, bL);
    if (longest > brake.width) add('fail', 'Too wide for the brake', `The longest bend is ${f2(longest)} in. The finger brake folds up to ${brake.width} in.`, 'Make the box shorter.');
    else if (t > .1 && longest > 7) add('fail', 'Too much bend for 1/8 aluminum', `Our brake is rated for 20 gauge steel. Soft 1/8 aluminum takes about 1.7 times that force across the full width, so 1/8 bends longer than about 7 in can bend the brake. This one is ${f2(longest)} in.`, 'Use 1/16 aluminum, or keep the box under 7 in long.');
    if (n < brake.minFlange) add('fail', 'Walls too short to grip', `Each wall sticks out only ${f2(n)} in past its bend line. The bending leaf needs about ${brake.minFlange} in to push on.`, `Make the walls taller than about ${f2(brake.minFlange - BA / 2 + OS)} in.`);
    if (H > brake.depth + 1e-9){ bad.longs = true;
      add('fail', 'Too deep for the fingers', `For the last two bends, the end walls are already standing beside the fingers. Walls taller than the fingers (about ${brake.depth} in on this size brake) run into the upper beam the fingers hang from.`, `Make the walls ${brake.depth} in or less. Or bend the long walls only partway on the brake and finish them over a wood block with a mallet. Measure our brake's finger height and change it in the brake settings.`, 'longs'); }
    if (bE - CLR < brake.fingerDepth || L - 2 * t - CLR < brake.fingerDepth){ bad.longs = true;
      add('fail', 'Too narrow for the fingers', `For the last bend, the wall across from it is already up, ${f2(W - 2 * t)} in away. The fingers reach about ${brake.fingerDepth} in back from their edge, so they'd hit that wall.`, 'Make the box wider, or bend that wall by hand over a block.', 'longs'); }

    steps.push({ k: 'prep', title: 'Prepare the blank', text: `Staff waterjet the blank${tabs ? ', tabs and rivet holes' : ''}. Deburr every edge and hole. Mark the inside face with tape; every bend goes up toward it.` });
    const fingerStep = (k, title, want, hi, obstacleWhy, extra) => {
      const set = hi >= 1 - 1e-9 ? pickFingers(F, hi, want) : null, st = { k, title, want, hi, set, extra };
      if (!set){ bad[k] = true; st.text = `No finger set fits. The space is ${f2(Math.max(hi, 0))} in and the smallest finger is ${Math.min(...F)} in.`;
        add('fail', `${title}: no finger fits`, `${obstacleWhy} That leaves ${f2(Math.max(hi, 0))} in for the fingers, and the smallest finger is ${Math.min(...F)} in.`, k === 'tabs' ? 'Make the walls taller so the tabs get longer, or use open corners.' : 'Make the tabs narrower, the box bigger, or use open corners.', k); }
      else {
        set.cover = Math.min(set.s, want); const u = (want - set.cover) / 2; st.u = u;
        const removed = F.map((w, i) => set.idx.includes(i) ? null : w).filter(w => w != null).sort((a, b) => b - a);
        st.removed = removed;
        const keep = set.idx.length === 1 ? (k === 'tabs' ? '' : ' Center it on the bend.') : (k === 'tabs' ? ' Slide them together.' : ' Slide them together, centered on the bend.');
        st.text = `Fingers: ${fingerWords(F, set)}.${removed.length ? ` Take off the ${removed.join(', ')} in finger${removed.length > 1 ? 's' : ''}.` : ' All five fingers stay on.'}${keep}`;
        if (u > 1.1){ bad[k] = true; add('fail', `${title}: the fingers cover too little`, `${obstacleWhy} The fingers that fit cover ${f2(set.cover)} of ${f2(want)} in, leaving ${f2(u)} in loose at each end. That end won't fold cleanly.`, 'Make the tabs narrower or use open corners.', k); }
        else if (u > .3) add('warn', `${title}: ends of the bend are loose`, `The fingers cover ${f2(set.cover)} of ${f2(want)} in, so ${f2(u)} in at each end isn't clamped. Soft aluminum usually follows, but the ends can bow.`, 'After the bend, tap the ends square over a wood block.', k);
      }
      steps.push(st);
    };
    if (tabs){
      if (tabLen < .25){ bad.tabs = true; add('fail', 'No room for tabs', `The walls are too short to fit a tab between the bend and the top edge.`, 'Use open corners, or make the walls taller.', 'tabs'); }
      else fingerStep('tabs', 'Tabs (4 bends)', tabLen, brake.width, 'The finger hangs off the outside edge of the blank and must stop before the long-wall flap.', 'Bend each tab up 90°. They become the inside corners. Let the finger hang off the outside edge so it stops short of the long-wall flap.');
      if (tl < brake.minFlange) add('warn', 'Tabs are narrow for the leaf', `The tabs stick out ${f2(tl)} in. The leaf grips about ${brake.minFlange} in, so it may slip.`, 'Make the tabs wider, or fold them with a hand seamer.', 'tabs');
      if (tl < .45) add('warn', 'Rivet hole close to the tab edge', 'A rivet needs about two hole widths of metal around it, or it tears out.', 'Make the tabs at least .45 in wide.', 'rivets');
    }
    fingerStep('ends', 'End walls (bends 1 and 2)', bE, tabs ? bE - 2 * t - 2 * CLR : bE,
      tabs ? 'The tabs stand up at both ends of this bend, so the fingers have to fit between them.' : 'The fingers can\'t reach past the end-wall flap, or the leaf catches the corners of the long-wall flaps.', 'Bend a little past square for springback.');
    fingerStep('longs', 'Long walls (bends 3 and 4)', bL, L - 2 * t - 2 * tl - 2 * CLR,
      tabs ? 'The end walls and their tabs are already up, so the fingers have to fit between the tabs.' : 'The end walls are already up, so the fingers have to fit between them.', tabs ? 'Each long wall closes against two tabs.' : 'The corners stay open. That\'s fine for a tray.');
    if (tabs) steps.push({ k: 'rivets', title: 'Rivets', text: `Line up the holes and set a 5/32 pop rivet in each corner, head outside. Grip ${t > .1 ? '.188–.250' : '.063–.125'}.` });
    if (!issues.some(i => i.lvl === 'fail')) add('ok', 'Every bend works on the brake', 'The finger sets fit and the blank fits the kit sheet.', '');

    return { L, W, H, t, ri, K, OS, BA, n, Ln, Wn, y0, y1, tabs, tl, tz0, tz1, a, tabLen, outline, relief, rivets, bends, steps, issues, bad, brake };
  }

  // DXF for the waterjet: outline + holes on CUT, material outline on MATERIAL. Bend lines stay off so nothing cuts them.
  function dxf(p){
    const m = .25, fy = y => p.y1 - y + m, pts = p.outline.map(([x, y]) => [x + m, fy(y)]);
    const holes = [...p.relief, ...p.rivets].map(h => ({ c: [+(h.x + m).toFixed(4), +fy(h.y).toFixed(4), h.r] }));
    return BoxGen.dxf([{ pts, holes }], +(p.Ln + 2 * m).toFixed(3), +(p.y1 - p.y0 + 2 * m).toFixed(3));
  }
  return { plan, dxf, BRAKE, DEFAULT, SHEET, f2 };
})();
