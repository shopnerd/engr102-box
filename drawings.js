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

D.b2=()=>{
  const f=V(80,105,52);f.title(0,-.95,'FRONT VIEW');
  f.rect(0,0,9,2.5,'wd');f.line(0,.25,9,.25,'hid');f.line(0,.375,9,.375,'hid');f.line(0,2.25,9,2.25,'hid');f.line(.5,0,.5,2.5,'hid');f.line(8.5,.375,8.5,2.5,'hid');
  f.dimH(0,9,2.5,2.95,'9.00');f.dimV(0,2.5,0,-.55,'2.50');f.note(6.6,.31,6.2,-.5,'GROOVE THRU, 1/8 W × 3/16 DP');f.balloon(3,1.4,3,1.4,'A');
  const t=V(80,375,52);t.title(0,-.65,'TOP VIEW');
  t.rect(0,0,9,3,'wd');t.line(0,.5,9,.5,'thin');t.line(0,2.5,9,2.5,'thin');t.line(.5,.5,.5,2.5,'thin');t.line(8.5,.5,8.5,2.5,'thin');
  t.rect(.34,.33,8.66,2.34,'ac');t.cpl(4.5,-.4,3.4,'A');t.dimV(0,3,0,-.55,'3.00');t.dimH(.34,9,3,3.5,'LID 8.66');t.balloon(1.2,1.5,1.2,1.5,'E');
  const Lp=[[0,0],[.5,0],[.5,.25],[.3125,.25],[.3125,.375],[.5,.375],[.5,2.25],[.25,2.25],[.25,2.5],[0,2.5]];
  const s=V(720,125,80);s.title(0,-.95,'SECTION A–A');
  s.secPoly(Lp,'wd');s.secPoly(Lp.map(([x,y])=>[3-x,y]),'wd');s.secRect(.25,2.25,2.5,.25,'wd');s.rect(.33,.25,2.34,.125,'ac');
  s.dimH(0,3,0,-.45,'3.00');s.dimH(.5,2.5,2.5,2.9,'2.00 INSIDE');s.dimV(0,.25,0,-.4,'.25');s.dimV(2.25,2.5,0,-.4,'.25');
  s.note(.41,.32,.7,.9,'GROOVE 1/8 × 3/16 DP');s.note(.38,2.3,.7,1.85,'RABBET 1/4 × 1/4');
  s.balloon(2.8,1.3,3.4,1.3,'A');s.balloon(2.0,2.37,3.4,2.35,'D');s.balloon(1.8,.31,2.0,1.38,'E');
  return svg(1020,600,'B2 router-table pencil box: front view, top view, section A-A',[f,t,s])};

D.b3=()=>{
  const f=V(80,125,64);f.title(0,-1.15,'FRONT VIEW');
  f.rect(0,0,5.5,3.5,'wd',.25);f.rect(.625,.875,4.25,2,'drw',.625);f.line(0,1.875,.625,1.875,'cut');
  f.rect(1,1.25,3.5,1.25,'hid',.5);f.rect(2,1.6875,1.5,.375,'al',.06);
  f.dimH(0,5.5,3.5,3.95,'5.50');f.dimV(0,3.5,0,-.55,'3.50');f.dimH(.625,4.875,.875,.4,'4.25');f.dimV(.875,2.875,4.875,5.95,'2.00');f.dimV(2.875,3.5,4.875,5.95,'.625');
  f.note(.8,1.05,1.3,-.5,'R.625 MIN TYP, 1/4 IN BLADE');f.note(.3,1.91,.3,3.2,'ENTRY KERF, GLUE SHUT');
  f.balloon(5.15,.5,5.15,.5,'A');f.balloon(.82,2.65,.82,2.65,'B');f.balloon(3.5,1.87,5.15,1.5,'C');
  const s=V(570,125,64);s.title(0,-1.15,'RIGHT SIDE VIEW');
  s.rect(0,0,3.5,3.5,'wd');s.line(3.25,0,3.25,3.5,'cutl');
  s.line(0,.875,3.25,.875,'hid');s.line(0,2.875,3.25,2.875,'hid');s.line(.25,.875,.25,2.875,'cut');s.line(3,.875,3,2.875,'cut');s.rect(.25,1.25,2.75,1.25,'hid');
  s.dimH(0,3.5,3.5,3.95,'3.50');s.dimH(3.25,3.5,0,-.5,'.25 BACK');s.dimH(0,.25,.875,.45,'.25 TYP');
  const g=V(840,150,36);g.title(0,-1.4,'4×4 END GRAIN');
  g.rect(0,0,3.5,3.5,'wd');[.45,.95,1.45].forEach(r=>g.circ(1.75,1.85,r,'thin'));g.circ(1.75,1.85,.06,'dot');
  g.dimH(0,3.5,3.5,3.95,'3.50');g.dimV(0,3.5,3.5,4.0,'3.50');g.text(0,4.75,'CROSSCUT 5.50 LONG (STAFF)','lbl','start');g.text(0,5.15,'PITH FALLS IN THE HOLLOW','lbl','start');
  return svg(1020,370,'B3 bandsaw box from 4x4: front view, side view, 4x4 end grain',[f,s,g])};

D.b4=()=>{
  const p=V(90,115,70);p.title(0,-1.05,'TOP VIEW, PLATE');
  p.rect(0,0,6,4,'al',.06);p.rect(.75,.75,2.5,1,'holeF',.06);p.text(2,1.33,'W1','hlab');
  const H=[['H1',.375,.375,.075],['H2',5.625,.375,.075],['H3',.375,3.625,.075],['H4',5.625,3.625,.075],['H5',4.5,1.25,.1405],['H6',1.25,2.9,.125],['H7',2,2.9,.125],['H8',2.75,2.9,.0985]];
  H.forEach(([id,x,y,r])=>{p.circ(x,y,r,'holeF');p.cross(x,y,r+.13);p.text(x+r+.1,y-r-.06,id,'hlab','start')});
  p.text(-.08,-.1,'0,0','dt','end');p.dimH(0,6,4,4.45,'6.00');p.dimV(0,4,0,-.55,'4.00');
  const v=V(615,115,55);v.title(0,-1.05,'FRONT VIEW');
  v.rect(0,.125,6,2.375,'wd');v.rect(0,0,6,.125,'al');fingers(v,0,.125,2.5,.125,.25);fingers(v,5.875,.125,2.5,.125,.25);
  v.rect(.125,.125,.75,2.25,'hid');v.rect(5.125,.125,.75,2.25,'hid');v.line(.125,2.375,5.875,2.375,'hid');
  [.375,5.625].forEach(x=>{v.line(x-.04,0,x-.04,.65,'hid');v.line(x+.04,0,x+.04,.65,'hid')});
  v.rect(1.05,.125,.4,.55,'hid');v.rect(1.8,.125,.4,.55,'hid');v.rect(4.25,.125,.5,.4,'hid');
  v.rect(4.15,-.55,.7,.55,'kn',.06);v.line(1.25,0,1.33,-.42,'ol');v.line(2,0,2.08,-.42,'ol');
  v.dimV(0,2.5,6,6.45,'2.50');v.dimH(0,6,2.5,2.9,'6.00');v.note(3.1,.06,3.3,-.8,'PLATE .125 6061, WATERJET');
  v.balloon(3.1,1.4,3.1,1.4,'B');v.balloon(.5,1.6,-.45,1.6,'C');
  return svg(1020,450,'B4 instrument-panel box: plate top view and front view',[p,v])};

D.b5=()=>{
  const W=5.925,Ln=7.8,n=1.387;
  const fp=V(80,120,56);fp.title(0,-1.05,'FLAT PATTERN, 1/8 1100 ALUMINUM');
  fp.poly([[n,0],[Ln-n,0],[Ln-n,n],[Ln,n],[Ln,W-n],[Ln-n,W-n],[Ln-n,W],[n,W],[n,W-n],[0,W-n],[0,n],[n,n]],'al');
  [[n,n],[Ln-n,n],[Ln-n,W-n],[n,W-n]].forEach(([x,y])=>fp.circ(x,y,.125,'holeF'));
  fp.line(n,n,Ln-n,n,'bend');fp.line(n,W-n,Ln-n,W-n,'bend');fp.line(n,n,n,W-n,'bend');fp.line(Ln-n,n,Ln-n,W-n,'bend');
  fp.text(Ln/2,n/2+.08,'BEND 1 · UP 90°');fp.text(Ln/2,W-n/2+.08,'BEND 2 · UP 90°');fp.text(n/2,W/2+.08,'BEND 3');fp.text(Ln-n/2,W/2+.08,'BEND 4');
  fp.text(Ln/2,W/2-.05,'BASE','vt');fp.text(Ln/2,W/2+.3,'5.25 × 3.38 OUTSIDE','dt');
  fp.dimH(0,Ln,W,W+.45,'7.80');fp.dimV(0,W,0,-.55,'5.93');fp.dimH(0,n,0,-.4,'1.39');fp.dimH(n,Ln-n,0,-.4,'5.03');
  fp.dimV(0,n,Ln,Ln+.45,'1.39');fp.dimV(n,W-n,Ln,Ln+.45,'3.15');fp.note(n+.08,W-n-.08,2.1,W-n-.6,'Ø.250 RELIEF, 4×');
  const c=V(640,150,60);c.title(0,-.9,'SECTION, LID ON TRAY');
  c.secRect(0,.25,.125,1.5,'al');c.secRect(3.25,.25,.125,1.5,'al');c.secRect(.125,1.625,3.125,.125,'al');
  c.secRect(0,0,3.375,.125,'wd');c.secRect(.15,.125,3.075,.125,'wd');
  c.dimH(0,3.375,1.75,2.1,'3.38');c.dimV(.25,1.75,3.375,3.85,'1.50');
  c.balloon(3.0,.06,3.7,-.3,'B');c.balloon(2.9,.19,3.7,.25,'C');c.balloon(3.31,1.0,3.7,1.0,'A');
  c.note(.2,.19,.5,.85,'LIP C DROPS INSIDE THE RIM');c.text(.5,1.2,'.025 CLEAR EACH SIDE','dt','start');
  return svg(1020,500,'B5 folded aluminum tray: flat pattern and lid section',[fp,c])};

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
D3.b2=()=>{const v=ISO(),L=9,W=3,H=2.5,t=.5,g0=2.125,g1=2.25;
  v.part(t,t,0,L-t,W-t,.25,'floor')
   .part(0,0,0,L,t,H,'wood')
   .part(0,t,0,t,W-t,H,'wood')
   .part(L-t,t,0,L,W-t,g0,'wood')
   .part(0,W-t,0,L,W,H,'wood')
   .part(2.3,t,g0,L,W-t,g1,'acr')
   .part(L,.33,g0,10.95,W-.33,g1,'acr');
  return isoSvg(v,'B2 router-table pencil box with the lid partly slid out')};
D3.b3=()=>{const v=ISO(),L=5.5,D=3.5,H=3.5,x0=.625,x1=4.875,z0=.875,z1=2.875,out=1.4,w=.375;
  v.part(0,0,0,x0,D,H,'wood',v=>v.line([0,D,1.875],[x0,D,1.875],'thin'))     // left of the opening, with the glued entry kerf
   .part(x1,0,0,L,D,H,'wood',v=>v.line([L,.25,0],[L,.25,H],'thin'))         // right of the opening, back slice line
   .part(x0,0,0,x1,D,z0,'wood').part(x0,0,z1,x1,D,H,'wood').part(x0,0,z0,x1,.25,z1,'wood');
  const y0=.25+out,y1=D+out;                                                  // drawer pulled out
  v.part(x0,y0,z0,x1,y1,z0+w,'floor').part(x0,y0,z0+w,x1,y0+w,z1,'wood').part(x0,y0+w,z0+w,x0+w,y1-w,z1,'wood')
   .part(x1-w,y0+w,z0+w,x1,y1-w,z1,'wood').part(x0,y1-w,z0+w,x1,y1,z1,'wood')
   .part(2.0,y1,1.69,3.5,y1+.25,2.06,'alu');
  return isoSvg(v,'B3 bandsaw box with the drawer pulled out')};
D3.b4=()=>{const v=ISO(),z=2.5;
  v.part(0,0,0,6,4,2.375,'wood',v=>{fingersOnY(0,.125,0,2.375,4,.25,0)(v);v.xf(3.875,4,0,.25,6,'wd3');v.xf(3.875,4,.5,.75,6,'wd3');v.xf(3.875,4,1,1.25,6,'wd3');v.xf(3.875,4,1.5,1.75,6,'wd3');v.xf(3.875,4,2,2.25,6,'wd3')})
   .part(0,0,2.375,6,4,z,'alu',v=>{v.top(.75,3.25,.75,1.75,z,'cav');[[.375,.375],[5.625,.375],[.375,3.625],[5.625,3.625]].forEach(([x,y])=>v.circ(x,y,.09,z,'kn'));
     v.circ(2.75,2.9,.1,z,'led');[1.25,2].forEach(x=>{v.circ(x,2.9,.16,z,'kn');v.line([x,2.9,z],[x,3.15,z+.45],'lever')});v.cyl(4.5,1.25,.38,z,.45,'pr')});
  return isoSvg(v,'B4 instrument-panel box')};
D3.b5=()=>{const v=ISO(),L=5.25,W=3.375,H=1.5,t=.125,lz=2.4;
  v.part(0,0,0,L,W,t,'alu')
   .part(0,0,t,L,t,H,'alu').part(0,t,t,t,W-t,H,'alu').part(L-t,t,t,L,W-t,H,'alu').part(0,W-t,t,L,W,H,'alu')
   .part(.15,.15,lz,L-.15,W-.15,lz+.125,'wood').part(0,0,lz+.125,L,W,lz+.25,'wood');
  return isoSvg(v,'B5 folded aluminum tray with the plywood lid lifted')};
