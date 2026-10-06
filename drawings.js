/* Spec-sheet drawings, shared with ENGR102-box-spec-sheets.html. Units: inches. */
const DRAW_DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<marker id="ah" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1.8 L10 5 L0 8.2 z" class="ahd"/></marker>
<pattern id="hx" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" class="hxl"/></pattern>
</defs></svg>`;
function V(ox,oy,s){
  const o=[],X=x=>+(ox+x*s).toFixed(1),Y=y=>+(oy+y*s).toFixed(1),L=v=>+(v*s).toFixed(1);
  const a={o,
    rect(x,y,w,h,c='ol',r=0){o.push(`<rect x="${X(x)}" y="${Y(y)}" width="${L(w)}" height="${L(h)}" rx="${L(r)}" class="${c}"/>`)},
    line(x1,y1,x2,y2,c='ol'){o.push(`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="${c}"/>`)},
    poly(p,c='ol'){o.push(`<polygon points="${p.map(([x,y])=>X(x)+','+Y(y)).join(' ')}" class="${c}"/>`)},
    circ(x,y,r,c='ol'){o.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="${L(r)}" class="${c}"/>`)},
    text(x,y,t,c='lbl',an='middle'){o.push(`<text x="${X(x)}" y="${Y(y)}" class="${c}" text-anchor="${an}">${t}</text>`)},
    secRect(x,y,w,h,c){a.rect(x,y,w,h,c);a.rect(x,y,w,h,'hatch')},
    secPoly(p,c){a.poly(p,c);a.poly(p,'hatch')},
    cross(x,y,r){a.line(x-r,y,x+r,y,'ctr');a.line(x,y-r,x,y+r,'ctr')},
    title(x,y,t){o.push(`<text x="${X(x)}" y="${Y(y)}" class="vt">${t}</text>`)},
    dimH(x1,x2,yR,yD,t){const g=yD>yR?1:-1;a.line(x1,yR+g*.05,x1,yD+g*.09,'ext');a.line(x2,yR+g*.05,x2,yD+g*.09,'ext');
      o.push(`<line x1="${X(x1)}" y1="${Y(yD)}" x2="${X(x2)}" y2="${Y(yD)}" class="dim" marker-start="url(#ah)" marker-end="url(#ah)"/>`);
      const w=L(x2-x1);if(w<40)o.push(`<text x="${X(x2)+5}" y="${Y(yD)+4}" class="dt">${t}</text>`);else o.push(`<text x="${(X(x1)+X(x2))/2}" y="${Y(yD)-5}" class="dt" text-anchor="middle">${t}</text>`)},
    dimV(y1,y2,xR,xD,t){const g=xD>xR?1:-1;a.line(xR+g*.05,y1,xD+g*.09,y1,'ext');a.line(xR+g*.05,y2,xD+g*.09,y2,'ext');
      o.push(`<line x1="${X(xD)}" y1="${Y(y1)}" x2="${X(xD)}" y2="${Y(y2)}" class="dim" marker-start="url(#ah)" marker-end="url(#ah)"/>`);
      const h=L(y2-y1);if(h<40)o.push(`<text x="${X(xD)+(g>0?6:-6)}" y="${(Y(y1)+Y(y2))/2+4}" class="dt" text-anchor="${g>0?'start':'end'}">${t}</text>`);
      else o.push(`<text transform="translate(${X(xD)+(g>0?14:-5)},${(Y(y1)+Y(y2))/2}) rotate(-90)" class="dt" text-anchor="middle">${t}</text>`)},
    note(px,py,tx,ty,t){o.push(`<circle cx="${X(px)}" cy="${Y(py)}" r="2.2" class="dot"/><polyline points="${X(px)},${Y(py)} ${X(tx)},${Y(ty)} ${X(tx)+10},${Y(ty)}" class="ldr"/><text x="${X(tx)+13}" y="${Y(ty)+4}" class="lbl">${t}</text>`)},
    balloon(px,py,bx,by,m){if(px!==bx||py!==by)o.push(`<circle cx="${X(px)}" cy="${Y(py)}" r="2.2" class="dot"/><line x1="${X(px)}" y1="${Y(py)}" x2="${X(bx)}" y2="${Y(by)}" class="ldr"/>`);
      o.push(`<circle cx="${X(bx)}" cy="${Y(by)}" r="10" class="bl"/><text x="${X(bx)}" y="${Y(by)+4.5}" class="blt" text-anchor="middle">${m}</text>`)},
    cpl(x,y0,y1,m){a.line(x,y0,x,y1,'ctr');a.line(x,y0,x,y0+.25,'cpl');a.line(x,y1-.25,x,y1,'cpl');a.text(x+.15,y0+.12,m,'vt','start');a.text(x+.15,y1,m,'vt','start')}
  };return a}
function fingers(v,x,y0,y1,w,p){for(let y=y0,i=0;y<y1-1e-6;y+=p,i++)if(i%2===0)v.rect(x,y,w,Math.min(p,y1-y),'wd2')}
function svg(w,h,label,views){return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${views.map(v=>v.o.join('')).join('')}</svg>`}
const D={};

D.b1=()=>{
  const f=V(80,105,60);f.title(0,-.85,'FRONT VIEW');
  f.rect(0,0,8,2.25,'wd');fingers(f,0,0,2.25,.125,.25);fingers(f,7.875,.375,2.25,.125,.25);
  f.line(.125,.25,8,.25,'hid');f.line(.125,.38,8,.38,'hid');f.line(.125,2.125,7.875,2.125,'hid');
  f.dimH(0,8,2.25,2.7,'8.00');f.dimV(0,2.25,0,-.5,'2.25');
  f.note(6.5,.315,6.9,-.45,'LID SLOT, SEE A–A');f.balloon(2.5,1.2,2.5,1.2,'A');
  const t=V(80,360,60);t.title(0,-.62,'TOP VIEW');
  t.rect(0,0,8,3,'wd');t.line(0,.125,8,.125,'thin');t.line(0,2.875,8,2.875,'thin');t.line(.125,.125,.125,2.875,'thin');
  t.rect(.15,.14,7.85,2.72,'ac');t.line(.25,.25,7.875,.25,'hid');t.line(.25,2.75,7.875,2.75,'hid');
  t.rect(1,.5,6,2,'eng');t.text(4,1.62,'ENGRAVE ZONE 6.00 × 2.00');t.circ(7.45,1.5,.3,'eng');t.note(7.45,1.2,6.9,.32,'THUMB PULL Ø.60, ENGRAVED');
  t.cpl(2,-.4,3.4,'A');t.dimV(0,3,0,-.5,'3.00');t.dimH(.15,8,3,3.5,'LID 7.85');t.balloon(.55,1.5,.55,1.5,'G');
  const s=V(720,125,80);s.title(0,-.95,'SECTION A–A');
  s.secRect(0,0,.125,2.25,'wd');s.secRect(2.875,0,.125,2.25,'wd');s.secRect(.125,0,.125,.25,'wd');s.secRect(2.75,0,.125,.25,'wd');
  s.secRect(.125,.38,.125,1.745,'wd');s.secRect(2.75,.38,.125,1.745,'wd');s.secRect(.125,2.125,2.75,.125,'wd');s.rect(.14,.25,2.72,.125,'ac');
  s.dimH(0,3,0,-.45,'3.00');s.dimH(.25,2.75,2.25,2.65,'2.50 INSIDE');s.dimV(0,.25,0,-.4,'.25');
  s.note(.25,.33,.7,.95,'SLOT .130 = LID + .005');
  s.balloon(2.94,1.65,3.4,1.65,'A');s.balloon(2.81,1.1,3.4,1.1,'B');s.balloon(2.81,.12,3.4,.4,'C');s.balloon(2.5,2.19,3.4,2.2,'F');s.balloon(1.6,.33,1.9,1.45,'G');
  return svg(1020,600,'B1 laser pencil box: front view, top view, section A-A',[f,t,s])};

/* Shared shapes. Profiles are [x, z] in inches, counter-clockwise, z up. */
const arcPts=(cx,cz,r,a0,a1,n=10)=>{const p=[];for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180;p.push([cx+r*Math.cos(a),cz+r*Math.sin(a)])}return p};
const bez=(p0,p1,p2,p3,n=14)=>{const p=[];for(let i=1;i<=n;i++){const t=i/n,u=1-t;p.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]])}return p};
const B3=(()=>{
  const outer=[[.75,0],[4.75,0],...arcPts(4.75,.75,.75,-90,0).slice(1),[5.5,2.2],...bez([5.5,2.2],[5.5,3.3],[4.6,3.6],[3.6,3.35]),...bez([3.6,3.35],[2.9,3.18],[2.4,3.1],[1.6,3.3]),...bez([1.6,3.3],[.6,3.55],[0,3.2],[0,2.4]),[0,.75],...arcPts(.75,.75,.75,180,270).slice(1,-1)];
  const R=.625,dr=[[1.325,.7],[4.175,.7],...arcPts(4.175,1.325,R,-90,0).slice(1),...arcPts(4.175,1.875,R,0,90),...arcPts(1.325,1.875,R,90,180),...arcPts(1.325,1.325,R,180,270).slice(0,-1)];
  const core=[[1.325,.7],[4.175,.7],...arcPts(4.175,1.325,R,-90,0).slice(1),...arcPts(4.175,1.875,R,0,90),[4.05,2.5],[4.05,1.7],...arcPts(3.425,1.7,R,0,-90).slice(1),[2.075,1.075],...arcPts(2.075,1.7,R,-90,-180).slice(1),[1.45,2.5],...arcPts(1.325,1.875,R,90,180),...arcPts(1.325,1.325,R,180,270).slice(1,-1)];
  const top=Math.max(...outer.map(p=>p[1]));
  const foot=.25,feet=[[.9,1.65,.35,1.1],[3.85,4.6,.35,1.1],[.9,1.65,2.4,3.15],[3.85,4.6,2.4,3.15]];   // scrap feet, .75 sq × .25
  return {outer,dr,core,top,foot,feet};
})();

D.b2=()=>{
  const f=V(80,105,52);f.title(0,-.95,'FRONT VIEW');
  f.rect(0,0,9,2.5,'wd');
  f.line(0,.25,9,.25,'hid');f.line(0,.375,9,.375,'hid');f.line(0,2.0,9,2.0,'hid');f.line(0,2.25,9,2.25,'hid');
  f.line(.5,0,.5,2.5,'hid');f.line(8.5,.375,8.5,2.5,'hid');
  [[.25,.75],[.25,1.75],[8.75,.75],[8.75,1.75]].forEach(([x,y])=>{f.circ(x,y,.13,'holeF');f.circ(x,y,.07,'ol')});
  f.dimH(0,9,2.5,2.95,'9.00');f.dimV(0,2.5,0,-.55,'2.50');
  f.dimV(1.75,2.5,9,9.5,'.75');f.dimV(0,.75,9,9.5,'.75');
  f.note(6.6,.31,6.2,-.5,'LID GROOVE 1/8 W × 3/16 DP');f.note(4.5,2.12,4.9,3.15,'BOTTOM DADO, SEE A–A');
  f.note(8.75,.75,7.6,1.3,'#6 FH SCREW, 4 EACH END');f.balloon(3,1.2,3,1.2,'A');
  const t=V(80,385,52);t.title(0,-.65,'TOP VIEW');
  t.rect(0,0,9,3,'wd');t.line(0,.5,9,.5,'thin');t.line(0,2.5,9,2.5,'thin');t.line(.5,.5,.5,2.5,'thin');t.line(8.5,.5,8.5,2.5,'thin');
  t.rect(.34,.33,8.66,2.34,'ac');t.cpl(4.5,-.4,3.4,'A');t.dimV(0,3,0,-.55,'3.00');t.dimH(.34,9,3,3.5,'LID 8.66');t.balloon(1.2,1.5,1.2,1.5,'E');
  const Lp=[[0,0],[.5,0],[.5,.25],[.3125,.25],[.3125,.375],[.5,.375],[.5,2.0],[.25,2.0],[.25,2.25],[.5,2.25],[.5,2.5],[0,2.5]];
  const s=V(720,125,80);s.title(0,-.95,'SECTION A–A');
  s.secPoly(Lp,'wd');s.secPoly(Lp.map(([x,y])=>[3-x,y]),'wd');s.secRect(.28,2.0,2.44,.25,'wd');s.rect(.33,.25,2.34,.125,'ac');
  s.dimH(0,3,0,-.45,'3.00');s.dimH(.5,2.5,2.5,2.9,'2.00 INSIDE');s.dimV(0,.25,0,-.4,'.25');s.dimV(2.25,2.5,0,-.4,'.25');
  s.note(.41,.32,.7,.9,'GROOVE 1/8 × 3/16 DP');s.note(.38,2.12,.7,1.6,'DADO 1/4 × 1/4');
  s.balloon(2.8,1.3,3.4,1.3,'A');s.balloon(2.0,2.12,3.4,2.4,'D');s.balloon(1.8,.31,2.0,1.25,'E');
  const d=V(720,455,62);d.title(0,-.75,'DETAIL B, SCREW AT A CORNER (PLAN)');
  d.secRect(0,0,1.7,.5,'wd');d.secRect(0,.5,.5,1.2,'wd');
  d.rect(.18,0,.14,.5,'holeF');d.poly([[.1,0],[.4,0],[.32,.08],[.18,.08]],'holeF');d.rect(.203,.5,.094,1.0,'holeF');
  d.line(.25,-.15,.25,1.6,'ctr');
  d.note(.32,.25,.9,.9,'CLEARANCE 9/64 THRU SIDE');d.note(.4,.02,.9,.45,'COUNTERSINK 82°, HEAD FLUSH');d.note(.297,1.2,.9,1.35,'PILOT 3/32 × 1 DEEP, END GRAIN');
  d.text(1.25,.32,'SIDE','lbl');d.text(.25,1.85,'END','lbl');
  return svg(1020,600,'B2 router-table pencil box: front view, top view, section A-A, screw detail',[f,t,s,d])};

D.b3=()=>{
  const H=3.5,fl=pts=>pts.map(([x,z])=>[x,H-z]);
  const f=V(80,125,64);f.title(0,-1.15,'FRONT VIEW');
  f.poly(fl(B3.outer),'wd');f.poly(fl(B3.dr),'drw');[.9,3.85].forEach(x=>f.rect(x,H,.75,B3.foot,'wd'));f.line(0,H-1.6,.7,H-1.6,'cut');
  f.poly(fl(B3.core),'hid');f.rect(2,H-1.79,1.5,.375,'al',.06);
  f.dimH(0,5.5,H+B3.foot,H+.7,'5.50');f.dimV(H,H+B3.foot,5.5,6.0,'.25');f.balloon(4.45,H+.13,5.15,H+.4,'D');f.dimV(H-B3.top,H,0,-.55,B3.top.toFixed(2)+' MAX');f.dimH(.7,4.8,H-2.5,H-2.95,'4.10');f.dimV(H-2.5,H-.7,4.8,5.95,'1.80');
  f.note(.88,H-.88,1.4,H-.25,'R.625 MIN TYP, 1/4 IN BLADE');f.note(.3,H-1.6,-.25,-.12,'ENTRY KERF, GLUE SHUT');
  f.note(1.6,H-1.35,2.3,-.45,'DRAWER HOLLOW (HIDDEN), CUT FROM THE TOP');
  f.balloon(5.05,H-1.4,5.05,H-1.4,'A');f.balloon(1.0,H-2.15,1.0,H-2.15,'B');f.balloon(3.5,H-1.6,5.05,H-.55,'C');
  const s=V(570,125,64);s.title(0,-1.15,'RIGHT SIDE VIEW');
  s.rect(0,H-B3.top,3.5,B3.top,'wd');[.35,2.4].forEach(y=>s.rect(y,H,.75,B3.foot,'wd'));s.line(3.25,H-B3.top,3.25,H,'cutl');
  s.line(0,H-2.5,3.25,H-2.5,'hid');s.line(0,H-.7,3.25,H-.7,'hid');s.line(.25,H-2.5,.25,H-.7,'cut');s.line(3,H-2.5,3,H-.7,'cut');s.line(.25,H-1.075,3,H-1.075,'hid');
  s.dimH(0,3.5,H+B3.foot,H+.7,'3.50');s.dimH(3.25,3.5,H-B3.top,H-B3.top-.45,'.25 BACK');s.dimH(0,.25,H-2.5,H-2.95,'.25 TYP');
  const g=V(840,150,36);g.title(0,-1.4,'4×4 END GRAIN');
  g.rect(0,0,3.5,3.5,'wd');[.45,.95,1.45].forEach(r=>g.circ(1.75,1.85,r,'thin'));g.circ(1.75,1.85,.06,'dot');
  g.dimH(0,3.5,3.5,3.95,'3.50');g.dimV(0,3.5,3.5,4.0,'3.50');g.text(0,4.75,'CROSSCUT 5.50 LONG (STAFF)','lbl','start');g.text(0,5.15,'PITH FALLS IN THE DRAWER','lbl','start');
  return svg(1020,410,'B3 bandsaw box from 4x4: front view, side view, 4x4 end grain',[f,s,g])};
D.b4=()=>{
  const p=V(90,115,70);p.title(0,-1.05,'TOP VIEW, PLATE');
  p.rect(0,0,6,4,'al',.06);p.rect(.75,.75,2.5,1,'holeF',.06);p.text(2,1.33,'W1','hlab');
  const H=[['H1',.375,.375,.067],['H2',5.625,.375,.067],['H3',.375,3.625,.067],['H4',5.625,3.625,.067],['H5',4.5,1.25,.1405],['H6',1.25,2.9,.125],['H7',2,2.9,.125],['H8',2.75,2.9,.0985]];
  H.forEach(([id,x,y,r])=>{p.circ(x,y,r,'holeF');p.cross(x,y,r+.13);p.text(x+r+.1,y-r-.06,id,'hlab','start')});
  p.text(-.08,-.1,'0,0','dt','end');p.dimH(0,6,4,4.45,'6.00');p.dimV(0,4,0,-.55,'4.00');
  const v=V(615,115,55);v.title(0,-1.05,'FRONT VIEW');
  v.rect(0,.125,6,2.375,'pr');v.rect(0,0,6,.125,'al');
  v.line(.08,.125,.08,2.42,'hid');v.line(5.92,.125,5.92,2.42,'hid');v.line(.08,2.42,5.92,2.42,'hid');
  [.375,5.625].forEach(x=>{v.rect(x-.14,.125,.28,2.3,'hid');v.rect(x-.09,.125,.18,.22,'hid');v.line(x-.033,-.05,x-.033,.32,'hid');v.line(x+.033,-.05,x+.033,.32,'hid')});
  v.rect(1.05,.125,.4,.55,'hid');v.rect(1.8,.125,.4,.55,'hid');v.rect(4.25,.125,.5,.4,'hid');
  v.rect(4.15,-.55,.7,.55,'kn',.06);v.line(1.25,0,1.33,-.42,'ol');v.line(2,0,2.08,-.42,'ol');
  v.dimV(0,2.5,6,6.45,'2.50');v.dimH(0,6,2.5,2.9,'6.00');v.note(3.1,.06,3.3,-.8,'PLATE .125 6061, WATERJET');
  v.note(5.625,1.2,4.3,3.35,'PRINTED CORNER BOSS, 4×');v.balloon(3.1,1.4,3.1,1.4,'B');
  const d=V(640,365,70);d.title(0,-.55,'DETAIL C, INSERT AND SCREW');
  d.secRect(0,.18,1.1,.125,'al');d.secRect(.25,.305,.6,.9,'pr');
  d.rect(.46,.305,.18,.22,'kn');[.33,.39,.45].forEach(y=>d.line(.46,y,.64,y,'thin'));
  d.rect(.517,.06,.066,.42,'ol');d.rect(.45,.03,.2,.15,'ol',.03);d.line(.55,-.1,.55,1.3,'ctr');
  d.note(.64,.4,1.25,.55,'M3 HEAT-SET BRASS INSERT');d.note(.62,.1,1.25,.15,'M3 × 8 BUTTON HEAD');d.note(.85,.9,1.25,.95,'PLA BOSS (BOX STUDIO)');d.note(1.0,.24,1.25,-.25,'PLATE, Ø.134 CLEARANCE');
  return svg(1020,470,'B4 instrument-panel box: plate top view, front view with printed base, insert detail',[p,v,d])};

/* B5 blank: 1/8 1100-O, r ≈ t, bend deduction .225. Tabs on the end walls fold inward and are riveted inside the long walls. */
const B5=(()=>{
  const Ln=7.8,Wn=5.925,n=1.387,lx0=n-.113,lx1=Ln-n+.113,ey0=Wn/2-1.5625,ey1=Wn/2+1.5625,tw=.6,tx0=n-1.35,tx1=n-.3,rx0=Ln-n+.3,rx1=Ln-n+1.35;
  const outline=[[lx0,0],[lx1,0],[lx1,n],[Ln-n,n],[Ln-n,ey0],[rx0,ey0],[rx0,ey0-tw],[rx1,ey0-tw],[rx1,ey0],[Ln,ey0],[Ln,ey1],[rx1,ey1],[rx1,ey1+tw],[rx0,ey1+tw],[rx0,ey1],[Ln-n,ey1],[Ln-n,Wn-n],[lx1,Wn-n],[lx1,Wn],[lx0,Wn],[lx0,Wn-n],[n,Wn-n],[n,ey1],[tx1,ey1],[tx1,ey1+tw],[tx0,ey1+tw],[tx0,ey1],[0,ey1],[0,ey0],[tx0,ey0],[tx0,ey0-tw],[tx1,ey0-tw],[tx1,ey0],[n,ey0],[n,n],[lx0,n]];
  const tabHoles=[[n-.825,ey0-.35],[n-.825,ey1+.35],[Ln-n+.825,ey0-.35],[Ln-n+.825,ey1+.35]];
  const wallHoles=[[n+.347,n-.825],[Ln-n-.347,n-.825],[n+.347,Wn-n+.825],[Ln-n-.347,Wn-n+.825]];
  return {Ln,Wn,n,ey0,ey1,tw,tx0,tx1,rx0,rx1,lx0,lx1,outline,tabHoles,wallHoles};
})();
D.b5=()=>{
  const b=B5,{Ln,Wn,n}=b;
  const fp=V(80,120,56);fp.title(0,-1.05,'FLAT PATTERN, 1/8 1100-O ALUMINUM');
  fp.poly(b.outline,'al');
  [[n,n],[Ln-n,n],[Ln-n,Wn-n],[n,Wn-n]].forEach(([x,y])=>fp.circ(x,y,.125,'holeF'));
  [...b.tabHoles,...b.wallHoles].forEach(([x,y])=>{fp.circ(x,y,.0805,'holeF');fp.cross(x,y,.16)});
  fp.line(n,n,Ln-n,n,'bend');fp.line(n,Wn-n,Ln-n,Wn-n,'bend');fp.line(n,b.ey0,n,b.ey1,'bend');fp.line(Ln-n,b.ey0,Ln-n,b.ey1,'bend');
  [[b.tx0,b.tx1,b.ey0],[b.tx0,b.tx1,b.ey1],[b.rx0,b.rx1,b.ey0],[b.rx0,b.rx1,b.ey1]].forEach(([a,c,y])=>fp.line(a,y,c,y,'bend'));
  fp.text(Ln/2,n/2+.08,'BEND 3 · UP 90°');fp.text(Ln/2,Wn-n/2+.08,'BEND 4 · UP 90°');fp.text(n/2+.05,Wn/2+.08,'BEND 1');fp.text(Ln-n/2-.05,Wn/2+.08,'BEND 2');
  fp.text(Ln/2,Wn/2-.05,'BASE','vt');fp.text(Ln/2,Wn/2+.3,'5.25 × 3.38 OUTSIDE','dt');
  fp.text((b.tx0+b.tx1)/2,b.ey0-.62,'TAB','lbl');
  fp.dimH(0,Ln,Wn,Wn+.45,'7.80');fp.dimV(0,Wn,0,-.55,'5.93');fp.dimH(b.lx0,b.lx1,0,-.4,'5.25');fp.dimV(b.ey0,b.ey1,Ln,Ln+.45,'3.13');
  fp.note(b.tabHoles[0][0],b.tabHoles[0][1],.2,-.35,'Ø.161 RIVET HOLE, 8×');fp.note(n+.08,Wn-n-.08,2.1,Wn-n-.6,'Ø.250 RELIEF, 4×');
  const c=V(640,150,60);c.title(0,-.9,'SECTION, LID ON TRAY');
  c.secRect(0,.25,.125,1.5,'al');c.secRect(3.25,.25,.125,1.5,'al');c.secRect(.125,1.625,3.125,.125,'al');
  c.rect(.125,.6,.125,1.0,'al2');c.rect(3.125,.6,.125,1.0,'al2');
  c.secRect(0,0,3.375,.125,'wd');c.secRect(.2875,.125,2.8,.125,'wd');
  c.dimH(0,3.375,1.75,2.1,'3.38');c.dimV(.25,1.75,3.375,3.85,'1.50');
  c.balloon(3.0,.06,3.7,-.3,'B');c.balloon(2.9,.19,3.7,.25,'C');c.balloon(3.31,1.3,3.7,1.3,'A');
  c.note(.6,.19,.6,.85,'LIP C CLEARS THE CORNER TABS');c.note(.19,1.0,.6,1.25,'TAB BEHIND THE CUT, RIVETED');
  return svg(1020,500,'B5 folded aluminum tray: flat pattern with rivet tabs and lid section',[fp,c])};
/* Three-quarter (isometric) sample views, built from real parts. x runs right-back, y left-front, z up.
   Faces at x-max, y-max and z-max face the viewer. Parts are sorted back to front before drawing. */
const MAT={wood:['wd','wd2','wd3'],floor:['wdf','wd2','wd3'],alu:['al3','al','al2'],acr:['ac','ac2','ac3'],pr:['pr','pr2','pr3']};
function ISO(s=40){
  const o=[],c=Math.cos(Math.PI/6),b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9},parts=[];
  const P=(x,y,z)=>{const X=+((x-y)*c*s).toFixed(1),Y=+(((x+y)*.5-z)*s).toFixed(1);b.x0=Math.min(b.x0,X);b.x1=Math.max(b.x1,X);b.y0=Math.min(b.y0,Y);b.y1=Math.max(b.y1,Y);return [X,Y]};
  const a={o,b,P,
    poly(pts,cls){o.push(`<polygon points="${pts.map(p=>P(...p).join(',')).join(' ')}" class="${cls}"/>`)},
    top(x0,x1,y0,y1,z,cls){a.poly([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],cls)},
    yf(x0,x1,z0,z1,y,cls){a.poly([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],cls)},
    xf(y0,y1,z0,z1,x,cls){a.poly([[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]],cls)},
    circ(cx,cy,r,z,cls){const p=[];for(let k=0;k<24;k++){const t=k/24*2*Math.PI;p.push([cx+r*Math.cos(t),cy+r*Math.sin(t),z])}a.poly(p,cls)},
    cyl(cx,cy,r,z0,h,cls){const p=[];for(let k=0;k<=12;k++){const t=-Math.PI/4+k/12*Math.PI;p.push([cx+r*Math.cos(t),cy+r*Math.sin(t),z0])}for(let k=12;k>=0;k--){const t=-Math.PI/4+k/12*Math.PI;p.push([cx+r*Math.cos(t),cy+r*Math.sin(t),z0+h])}a.poly(p,cls+'2');a.circ(cx,cy,r,z0+h,cls)},
    line(p,q,cls){const A=P(...p),B=P(...q);o.push(`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" class="${cls}"/>`)},
    // a solid part; deco(v) draws details on its visible faces right after it
    part(x0,y0,z0,x1,y1,z1,m,deco){parts.push({x0,y0,z0,x1,y1,z1,m,deco});return a},
    render(){
      const e=1e-6,behind=(A,B)=>A.x1<=B.x0+e||A.y1<=B.y0+e||A.z1<=B.z0+e;
      const n=parts.length,inn=new Array(n).fill(0),out=parts.map(()=>[]);
      for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i!==j&&behind(parts[i],parts[j])&&!behind(parts[j],parts[i])){out[i].push(j);inn[j]++}
      const q=[],order=[];for(let i=0;i<n;i++)if(!inn[i])q.push(i);
      while(q.length){q.sort((i,j)=>i-j);const i=q.shift();order.push(i);out[i].forEach(j=>{if(--inn[j]===0)q.push(j)})}
      if(order.length<n)parts.forEach((_,i)=>{if(!order.includes(i))order.push(i)});
      order.forEach(i=>{const p=parts[i],[t,f,r]=MAT[p.m];
        a.poly([[p.x0,p.y1,p.z0],[p.x1,p.y1,p.z0],[p.x1,p.y1,p.z1],[p.x0,p.y1,p.z1]],f);
        a.poly([[p.x1,p.y0,p.z0],[p.x1,p.y1,p.z0],[p.x1,p.y1,p.z1],[p.x1,p.y0,p.z1]],r);
        a.poly([[p.x0,p.y0,p.z1],[p.x1,p.y0,p.z1],[p.x1,p.y1,p.z1],[p.x0,p.y1,p.z1]],t);
        if(p.deco)p.deco(a,p)});
      return a}
  };return a}
function isoSvg(v,label){v.render();const p=14,b=v.b;return `<svg viewBox="${b.x0-p} ${b.y0-p} ${b.x1-b.x0+2*p} ${b.y1-b.y0+2*p}" role="img" aria-label="${label}">${v.o.join('')}</svg>`}
const fingersOnY=(x0,w,z0,z1,y,step,start)=>v=>{for(let z=z0,i=0;z<z1-1e-6;z+=step,i++)if(i%2===start)v.yf(x0,x0+w,z,Math.min(z+step,z1),y,'wd3')};
const D3={};
D3.b1=()=>{const v=ISO(),L=8,W=3,H=2.25,t=.125,s0=1.87,s1=2.0;
  v.part(t,t,0,L-t,W-t,t,'floor')                                        // bottom
   .part(0,0,0,L,t,H,'wood').part(t,t,t,L-t,2*t,s0,'wood').part(t,t,s1,L-t,2*t,H,'wood')            // back wall: outer, inner lower, inner cap
   .part(0,t,0,t,W-t,H,'wood')                                           // closed end
   .part(L-t,t,0,L,W-t,s0,'wood')                                        // lid-exit end, top at the slot
   .part(t,W-2*t,t,L-t,W-t,s0,'wood').part(t,W-2*t,s1,L-t,W-t,H,'wood')  // front inner lower + cap
   .part(0,W-t,0,L,W,H,'wood',fingersOnY(0,t,0,H,W,.25,0))               // front outer
   .part(2.6,t+.015,s0,L,W-t-.015,s0+.125,'acr')                         // lid, inside the slot
   .part(L,t+.015,s0,10.45,W-t-.015,s0+.125,'acr',v=>v.top(L+.15,10.2,.6,2.4,s0+.125,'eng'));  // lid, slid out past the end
  return isoSvg(v,'B1 laser pencil box with the acrylic lid partly slid out')};
D3.b4=()=>{const v=ISO(),z=2.5;
  v.part(0,0,0,6,4,2.375,'pr',v=>{v.line([0,4,.6],[6,4,.6],'layer');v.line([0,4,1.2],[6,4,1.2],'layer');v.line([0,4,1.8],[6,4,1.8],'layer')})
   .part(0,0,2.375,6,4,z,'alu',v=>{v.top(.75,3.25,.75,1.75,z,'cav');[[.375,.375],[5.625,.375],[.375,3.625],[5.625,3.625]].forEach(([x,y])=>v.circ(x,y,.11,z,'screw'));
     v.circ(2.75,2.9,.1,z,'led');[1.25,2].forEach(x=>{v.circ(x,2.9,.16,z,'kn');v.line([x,2.9,z],[x,3.15,z+.45],'lever')});v.cyl(4.5,1.25,.38,z,.45,'kn')});
  return isoSvg(v,'B4 instrument-panel box with a 3D printed base and aluminum top plate')};
/* Extruded profiles for curved parts (bandsaw box). Profile [x,z] CCW, extruded along y from y0 to y1. */
let ISO_ID=0;
const area2=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1]},0);
function extrude(v,prof,y0,y1,m,hole){
  if(area2(prof)<0)prof=prof.slice().reverse();
  const [tc,fc,rc]=MAT[m],quads=[];
  for(let i=0;i<prof.length;i++){const a=prof[i],b=prof[(i+1)%prof.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=dz/L,nz=-dx/L;
    if(nx+nz<=1e-6)continue;quads.push({a,b,nx,nz,k:(a[0]+b[0])/2+(a[1]+b[1])/2})}
  quads.sort((p,q)=>p.k-q.k).forEach(q=>v.poly([[q.a[0],y0,q.a[1]],[q.b[0],y0,q.b[1]],[q.b[0],y1,q.b[1]],[q.a[0],y1,q.a[1]]],(q.nz>.6?tc:q.nx>.6?rc:fc)+' ns'));
  quads.forEach(q=>v.line([q.a[0],y0,q.a[1]],[q.b[0],y0,q.b[1]],'edge'));
  const vis=i=>{const a=prof[i],b=prof[(i+1)%prof.length],dx=b[0]-a[0],dz=b[1]-a[1];return dz-dx>1e-6};
  prof.forEach((p,i)=>{if(vis((i-1+prof.length)%prof.length)!==vis(i))v.line([p[0],y0,p[1]],[p[0],y1,p[1]],'edge')});
  capPath(v,prof,y1,hole,fc);
}
function capPath(v,prof,y,hole,cls){const d=pts=>'M'+pts.map(([x,z])=>v.P(x,y,z).join(',')).join('L')+'Z';v.o.push(`<path d="${d(prof)}${hole?d(hole):''}" fill-rule="evenodd" class="${cls}"/>`)}
function clipStart(v,prof,y,evenHole){const id='isoc'+(++ISO_ID),d=pts=>'M'+pts.map(([x,z])=>v.P(x,y,z).join(',')).join('L')+'Z';v.o.push(`<clipPath id="${id}"><path d="${d(prof)}${evenHole?d(evenHole):''}" clip-rule="evenodd"/></clipPath><g clip-path="url(#${id})">`)}
function grain(v,x0,x1,y,zs){zs.forEach((z0,k)=>{const p=[];for(let x=x0;x<=x1+1e-6;x+=.1)p.push(v.P(x,y,z0+.05*Math.sin(x*1.7+k*1.3)+.03*Math.sin(x*4.1+k)).join(','));v.o.push(`<polyline points="${p.join(' ')}" class="grain"/>`)})}
D3.b2=()=>{const v=ISO(),L=9,W=3,H=2.5,t=.5,g0=2.125,g1=2.25,screws=y=>v=>[[.25,.75],[.25,1.75],[L-.25,.75],[L-.25,1.75]].forEach(([x,z])=>{const p=[];for(let k=0;k<16;k++){const a=k/16*2*Math.PI;p.push([x+.12*Math.cos(a),y,z+.12*Math.sin(a)])}v.poly(p,'screw')});
  v.part(t,t,.25,L-t,W-t,.5,'floor')
   .part(0,0,0,L,t,H,'wood')
   .part(0,t,0,t,W-t,H,'wood')
   .part(L-t,t,0,L,W-t,g0,'wood')
   .part(0,W-t,0,L,W,H,'wood',screws(W))
   .part(2.3,t,g0,L,W-t,g1,'acr')
   .part(L,.33,g0,10.95,W-.33,g1,'acr');
  return isoSvg(v,'B2 Douglas fir pencil box, screwed corners, lid partly slid out')};
D3.b3=()=>{const v=ISO(),D=3.5,out=1.35,yb=.25+out,yf=3.25+out;
  const zs=[.35,.8,1.25,1.7,2.15,2.6,3.05];
  B3.feet.forEach(([x0,x1,y0,y1])=>boxNow(v,x0,y0,-B3.foot,x1,y1,0,'wood'));
  extrude(v,B3.outer,0,D,'wood',null);                       // body sides; front cap drawn later
  v.o.pop();
  capPath(v,B3.dr,D,null,'cav');                              // the tunnel behind the drawer
  clipStart(v,B3.dr,D);
  extrude(v,B3.dr,yb,yb+.25,'wood');extrude(v,B3.core,yb+.25,D,'wood');
  v.o.push('</g>');
  capPath(v,B3.outer,D,B3.dr,'wd2');clipStart(v,B3.outer,D,B3.dr);grain(v,0,5.5,D,zs);v.o.push('</g>');
  v.line([0,D,1.6],[.7,D,1.6],'thin');
  extrude(v,B3.core,D,yf,'wood');extrude(v,B3.dr,yf,yf+.25,'wood');
  clipStart(v,B3.dr,yf+.25);grain(v,.7,4.8,yf+.25,zs);v.o.push('</g>');
  v.part(2.0,yf+.25,1.42,3.5,yf+.5,1.79,"alu");
  return isoSvg(v,'B3 bandsaw box with a curved body and the drawer pulled out')};
/* General extrusion: profile [u,w] extruded along axis 'x' (u=y, w=z) or 'y' (u=x, w=z). Drawn immediately, no sorting. */
function extrudeA(v,prof,a0,a1,axis,m){
  if(area2(prof)<0)prof=prof.slice().reverse();
  const P3=(u,w,a)=>axis==='x'?[a,u,w]:[u,a,w],[tc,fc,rc]=MAT[m],q=[];
  for(let i=0;i<prof.length;i++){const p=prof[i],r=prof[(i+1)%prof.length],du=r[0]-p[0],dw=r[1]-p[1],L=Math.hypot(du,dw)||1,nu=dw/L,nw=-du/L;
    if(nu+nw<=1e-6)continue;q.push({p,r,nu,nw,k:(p[0]+r[0])/2+(p[1]+r[1])/2})}
  q.sort((s,t)=>s.k-t.k).forEach(s=>v.poly([P3(s.p[0],s.p[1],a0),P3(s.r[0],s.r[1],a0),P3(s.r[0],s.r[1],a1),P3(s.p[0],s.p[1],a1)],(s.nw>.6?tc:s.nu>.6?(axis==='x'?fc:rc):(axis==='x'?fc:rc))+' nsa'));
  q.forEach(s=>v.line(P3(s.p[0],s.p[1],a0),P3(s.r[0],s.r[1],a0),'edge'));
  const vis=i=>{const p=prof[i],r=prof[(i+1)%prof.length];return (r[1]-p[1])-(r[0]-p[0])>1e-6};
  prof.forEach((p,i)=>{if(vis((i-1+prof.length)%prof.length)!==vis(i))v.line(P3(p[0],p[1],a0),P3(p[0],p[1],a1),'edge')});
  v.poly(prof.map(([u,w])=>P3(u,w,a1)),axis==='x'?rc:fc);
}
function boxNow(v,x0,y0,z0,x1,y1,z1,m,deco){const [t,f,r]=MAT[m];
  v.poly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],f);v.poly([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],r);v.poly([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],t);if(deco)deco(v)}
D3.b5=()=>{const v=ISO(),L=5.25,W=3.375,H=1.5,t=.125,ro=.25,ri=.125,lz=3.6,tz0=.41,tz1=1.46,tl=.6;
  // quarter-round bend profile, outer corner at (0,0), turning from the wall (u in 0..t) into the floor
  const bend=[...arcPts(ro,ro,ro,180,270,8),...arcPts(ro,ro,ri,270,180,8)];
  const mir=(p,M)=>p.map(([u,w])=>[M-u,w]);
  const rivets=v2=>[.46,L-.46].forEach(x=>{const p=[];for(let k=0;k<16;k++){const a=k/16*2*Math.PI;p.push([x+.1*Math.cos(a),W,.94+.1*Math.sin(a)])}v2.poly(p,'rivet')});
  extrudeA(v,bend,ro,L-ro,'x','alu');                     // back bend
  boxNow(v,0,0,ro,L,t,H,'alu');                            // back wall, full length
  extrudeA(v,bend,ro,W-ro,'y','alu');                      // left end bend
  boxNow(v,0,t,ro,t,W-t,H,'alu');                          // left end wall, between the long walls
  boxNow(v,ro,ro,0,L-ro,W-ro,t,'alu');                     // floor
  boxNow(v,t,t,tz0,t+tl,2*t,tz1,'alu');boxNow(v,L-t-tl,t,tz0,L-t,2*t,tz1,'alu');   // back tabs, inside
  extrudeA(v,mir(bend,L),ro,W-ro,'y','alu');               // right end bend
  boxNow(v,L-t,t,ro,L,W-t,H,'alu');                        // right end wall
  boxNow(v,t,W-2*t,tz0,t+tl,W-t,tz1,'alu');boxNow(v,L-t-tl,W-2*t,tz0,L-t,W-t,tz1,'alu');  // front tabs
  extrudeA(v,mir(bend,W),ro,L-ro,'x','alu');               // front bend
  boxNow(v,0,W-t,ro,L,W,H,'alu',rivets);                   // front wall with rivet heads
  boxNow(v,.15,.2875,lz,L-.15,W-.2875,lz+.125,'wood');boxNow(v,0,0,lz+.125,L,W,lz+.25,'wood');
  return isoSvg(v,'B5 folded aluminum tray: rounded bends, open relief corners, riveted tabs inside, lid lifted')};
/* B6: all-acrylic T-slot box. Outlines come from BoxGen.tslotBox, the same code that writes the cut files. */
const B6={L:6,W:4,H:3,t:.118,m:.25};
D.b6=()=>{
  const {L,W,H,t,m}=B6,r=BoxGen.tslotBox({L,W,H,t,tb:t,assembly:'tslot'}),BL=L+2*m,BW=W+2*m;
  const flipPts=(pts,h)=>pts.map(([x,y])=>[x,h-y]);
  const f=V(70,120,58);f.title(0,-1.25,'FRONT VIEW, ASSEMBLED');
  const lz=t+H;
  const Y=z=>lz+t-z;
  f.rect(0,Y(lz+t),BL,t,'ac');f.rect(m+t+.02,Y(lz+t)+t,L-2*t-.04,t,'hid');
  f.rect(m,Y(lz),L,H,'ac');f.rect(0,Y(t),BL,t,'ac');
  [L/4,3*L/4].forEach(x=>f.rect(m+x-.25,Y(t),.5,t,'hid'));
  const cx=m+L/2;f.rect(cx-.063,Y(t+.42),.126,.42,'ol');f.rect(cx-.113,Y(t+.32),.226,.1,'nut');
  f.rect(cx-.06,Y(t+.47),.12,.47,'hid');f.rect(cx-.11,Y(0)-0,.22,.06,'ol');
  f.dimH(0,BL,Y(0),Y(0)+.45,BL.toFixed(2));f.dimH(m,m+L,Y(lz),Y(lz+t)-.4,L.toFixed(2)+' WALLS');f.dimV(Y(lz+t),Y(0),0,-.55,(lz+t).toFixed(2));
  f.note(cx+.11,Y(t+.27),cx+1.0,Y(t+1.3),'M3 NUT IN T-SLOT, SCREW FROM BELOW');f.note(m+L/4,Y(t/2),m+L/4-.6,Y(-.35),'TAB IN BASE SLOT');
  const fw=r.panels[0],sw=r.panels[2];
  const a=V(560,110,52);a.title(0,-.8,'FRONT / BACK WALL, AS CUT (2)');a.poly(flipPts(fw.pts,H),'ac');
  a.dimH(0,L,H+t,H+t+.4,L.toFixed(2));a.dimV(0,H,L,L+.4,H.toFixed(2));a.dimH(L/4-.25,L/4+.25,H,H-.35,'.50');a.text(L/2,H+.42,'T-SLOT','lbl');
  const b=V(560,350,52);b.title(0,-.8,'SIDE WALL, AS CUT (2)');b.poly(flipPts(sw.pts,H),'ac');
  b.dimH(0,W,H+t,H+t+.4,W.toFixed(2));b.dimV(0,H,W,W+.4,H.toFixed(2));
  const p=V(70,430,46);p.title(0,-.6,'BASE, TOP VIEW');const base=r.panels[4];
  p.poly(flipPts(base.pts,BW),'ac');base.holes.forEach(h=>h.c?p.circ(h.c[0],BW-h.c[1],h.c[2],'holeF'):p.poly(flipPts(h.pts,BW),'holeF'));
  p.dimH(0,BL,BW,BW+.45,BL.toFixed(2));p.dimV(0,BW,0,-.5,BW.toFixed(2));p.note(m+L/2,BW-(m+t/2),m+L/2+.5,BW-(m+t/2)-.7,'Ø.130 M3 CLEARANCE, 4×');
  const d=V(790,430,200);d.title(0,-.12,'DETAIL D, T-SLOT');const s0=.063,n0=.113;
  d.poly([[0,0],[.6,0],[.6,.5],[.3+s0,.5],[.3+s0,.28],[.3+n0,.28],[.3+n0,.18],[.3+s0,.18],[.3+s0,.08],[.3-s0,.08],[.3-s0,.18],[.3-n0,.18],[.3-n0,.28],[.3-s0,.28],[.3-s0,.5],[0,.5]],'ac');
  d.rect(0,.5,.6,t,'ac');d.rect(.3-n0+.006,.185,.214,.09,'nut');d.rect(.3-.05,.1,.1,.5+t-.1,'hid');d.rect(.3-.1,.5+t,.2,.05,'ol');
  d.text(0,.5+t+.22,'STEM .126 W × .42 DEEP','dt','start');d.text(0,.5+t+.34,'NUT POCKET .226 × .10, AT .22','dt','start');d.text(0,.5+t+.46,'M3 × 12 SCREW + M3 NUT','dt','start');
  return svg(1020,680,'B6 acrylic T-slot box: assembled front view, walls as cut, base, T-slot detail',[f,a,b,p,d])};
D3.b6=()=>{const v=ISO(),{L,W,H,t,m}=B6,BL=L+2*m,BW=W+2*m,c=.02,lz=t+H+1.1;
  const nutY=v2=>{const x=m+L/2;v2.yf(x-.113,x+.113,t+.22,t+.32,m+W,'nut')},nutX=v2=>{const y=m+W/2;v2.xf(y-.113,y+.113,t+.22,t+.32,m+L,'nut')};
  const fingersF=v2=>{const n=5,s=H/n;for(let i=0;i<n;i++)if(i%2===1){v2.yf(m,m+t,t+i*s,t+(i+1)*s,m+W,'ac3');v2.yf(m+L-t,m+L,t+i*s,t+(i+1)*s,m+W,'ac3')}};
  v.part(0,0,0,BL,BW,t,'acr')
   .part(m,m,t,m+L,m+t,t+H,'acr').part(m,m+t,t,m+t,m+W-t,t+H,'acr')
   .part(m+L-t,m+t,t,m+L,m+W-t,t+H,'acr',nutX)
   .part(m,m+W-t,t,m+L,m+W,t+H,'acr',v2=>{fingersF(v2);nutY(v2)})
   .part(m+t+c,m+t+c,lz,m+L-t-c,m+W-t-c,lz+t,'acr').part(0,0,lz+t,BL,BW,lz+2*t,'acr');
  return isoSvg(v,'B6 clear acrylic box with T-slot nuts, lid lifted')};
