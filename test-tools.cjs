// node test-tools.cjs : box designer → DXF → file checker round trip
const fs=require('fs'),vm=require('vm');const ctx={console,Math,esc:s=>s};vm.createContext(ctx);
for(const f of ['boxgen.js','audit.js'])vm.runInContext(fs.readFileSync(f,'utf8')+'\nthis.BoxGen=typeof BoxGen!=="undefined"?BoxGen:this.BoxGen;this.Audit=typeof Audit!=="undefined"?Audit:this.Audit;',ctx);
const {BoxGen,Audit}=ctx;let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
for(const top of ['closed','open','lid']){
  const o={L:4,W:3,H:2,t:.125,kerf:0,finger:.5,inside:false,top,text:'HI'};
  const b=BoxGen.build(o);
  // area check: front panel polygon area vs nominal
  const area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2);
  b.panels.forEach(p=>{const xs=p.pts.map(q=>q[0]),ys=p.pts.map(q=>q[1]);ok(Math.min(...xs)>=-1e-9&&Math.max(...xs)<=p.w+1e-9&&Math.min(...ys)>=-1e-9&&Math.max(...ys)<=p.h+1e-9,`${top} ${p.name} inside its ${p.w}x${p.h} box (area ${area(p.pts).toFixed(3)})`)});
  // volume check: sum of panel areas*t should equal box shell volume (closed) when kerf 0
  if(top==='closed'){const V=b.panels.reduce((s,p)=>s+area(p.pts),0)*o.t, shell=4*3*2-(4-.25)*(3-.25)*(2-.25);ok(Math.abs(V-shell)<1e-6,`closed box panels fill the shell exactly (${V.toFixed(4)} vs ${shell.toFixed(4)})`);}
  if(top==='open'){const V=b.panels.reduce((s,p)=>s+area(p.pts),0)*o.t, shell=4*3*2-(4-.25)*(3-.25)*(2-.125);ok(Math.abs(V-shell)<1e-6,`open box panels fill the shell exactly (${V.toFixed(4)} vs ${shell.toFixed(4)})`);}
  const lay=BoxGen.layout(b.panels,24,12,.25);ok(lay.fits,`${top} fits a 24x12 sheet`);
  const parts=BoxGen.placed(lay),d=BoxGen.dxf(parts,24,12);
  const res=Audit.run({name:'box.dxf'},d,{machine:{kind:'laser',name:'red laser',bed:[32,18],maxT:.25,pierce:.2,capMin:15},t:.125,stock:[24,12],speed:.5,assumeMM:false},null);
  res.R.forEach(r=>console.log('   ',r.lvl,r.msg));ok(!res.R.some(r=>r.lvl==='fail'),`${top} DXF passes the checker`);
}
// broken file: open line, no outline, mm
const bad=['0','SECTION','2','ENTITIES','0','LINE','8','0','10','0','20','0','11','10','21','0','0','LINE','8','0','10','10','20','0','11','10','21','10','0','ENDSEC','0','EOF'].join('\n');
const r2=Audit.run({name:'bad.dxf'},bad,{machine:{kind:'waterjet',name:'waterjet',bed:[48,48],maxT:2,pierce:3,capMin:10},t:.125,stock:[0,0],speed:.5,assumeMM:false},null);
r2.R.forEach(r=>console.log('   ',r.lvl,r.msg));ok(r2.R.filter(r=>r.lvl==='fail').length>=1,'broken file fails');
// bulge: LWPOLYLINE full circle from two bulge-1 arcs, r=1
const circ=['0','SECTION','2','ENTITIES','0','LWPOLYLINE','8','P','90','2','70','1','10','-1','20','0','42','1','10','1','20','0','42','1','0','ENDSEC','0','EOF'].join('\n');
const g=Audit.parseDXF(circ);const pts=g.polys[0].pts;const rr=pts.map(p=>Math.hypot(p[0],p[1]));ok(Math.max(...rr)<1.0001&&Math.min(...rr)>0.9999,'bulge arcs land on the circle');

// T-slot box: walls interlock exactly at the corners; base slots match the tabs; DXF passes the checker
{
  const t=.118, o={L:6,W:4,H:3,t,tb:t,assembly:'tslot'};
  const r=BoxGen.tslotBox(o), area=pts=>Math.abs(pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2);
  const walls=r.panels.slice(0,4), wallVol=walls.reduce((s,p)=>s+area(p.pts),0)*t;
  // expected: wall shell volume + 8 tabs (0.5 x tb x t each) - 4 T-slots (stem + nut pocket areas) x t
  const slotA=.126*(.42)+(.226-.126)*.1, shell=(6*4-(6-2*t)*(4-2*t))*3, expect=shell+8*.5*t*t-4*slotA*t;
  ok(Math.abs(wallVol-expect)<1e-6,`T-slot walls tile the shell (${wallVol.toFixed(5)} vs ${expect.toFixed(5)})`);
  const lay=BoxGen.layout(walls,12,12,.25); ok(lay.fits,'acrylic walls fit a 12x12 sheet');
  const lay2=BoxGen.layout(r.panels.slice(4),24,12,.25); ok(lay2.fits,'base, lid and lip fit a 24x12 sheet');
  for(const [name,lay_,sw,sh] of [['walls',lay,12,12],['plates',lay2,24,12]]){
    const d=BoxGen.dxf(BoxGen.placed(lay_),sw,sh);
    const res=Audit.run({name:name+'.dxf'},d,{machine:{kind:'laser',name:'laser',bed:[32,18],maxT:.25,pierce:.2,capMin:15},material:'acrylic',t:.125,stock:[sw,sh],speed:.4,assumeMM:false},null);
    res.R.forEach(x=>console.log('   ',x.lvl,x.msg));ok(!res.R.some(x=>x.lvl==='fail'),`T-slot ${name} DXF passes the checker`);
  }
}
process.exit(fail?1:0);
