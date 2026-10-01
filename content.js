/* ENGR 102 box project: all student-facing text lives here. Rev B draft, 2026-10-01. */
const SITE = {
  rev: 'B', date: '2026-10-01', status: 'Draft. BFMS staff review pending.',
  title: 'ENGR 102 Box Project', shop: 'Baum Family Maker Space',
  printLimit: '150 g', printLimitNote: 'Prints are PLA on the Prusa printers.',
  printForm: 'https://docs.google.com/forms/d/e/1FAIpQLSdLfjsy2pTRdiKEvDxOGvLgcNSF4Lf05G-Mg_li9BCrzRpjbQ/viewform',
  boxStudio: 'https://box.100xbtr.com'
};
/* Machines for the file checker. Beds and thickness limits marked confirm:true still need staff confirmation. */
const MACHINES = {
  red:   { name: 'Red laser (3D print lab, 101C)', kind: 'laser', bed: [32, 18], maxT: 0.25, pierce: 0.2, capMin: 15, confirm: true },
  blue:  { name: 'Blue laser (SSL 104)', kind: 'laser', bed: [32, 18], maxT: 0.25, pierce: 0.2, capMin: 15, confirm: true },
  water: { name: 'Waterjet (staff run)', kind: 'waterjet', bed: [48, 48], maxT: 2, pierce: 3, capMin: 10, confirm: true }
};
const SPEEDS = { 'laser-ply-0.125': 0.5, 'laser-ply-0.25': 0.2, 'laser-acrylic-0.125': 0.4, 'laser-acrylic-0.25': 0.15, 'waterjet-aluminum-0.125': 0.5, 'waterjet-aluminum-0.25': 0.25 };

const GLUE = `<div class="tw"><table>
<tr><th>Joining</th><th>Use</th><th>Notes</th></tr>
<tr><td>Wood to wood</td><td>Wood glue (yellow PVA)</td><td>Clamp 30–60 min, full strength overnight. Wipe squeeze-out while wet.</td></tr>
<tr><td>Acrylic to acrylic</td><td>Acrylic cement (solvent)</td><td>Only at the ventilated station, with nitrile gloves and the needle bottle. Staff show you once first.</td></tr>
<tr><td>Acrylic or aluminum to wood</td><td>Two-part epoxy</td><td>Wear gloves. Rough up aluminum with sandpaper first.</td></tr>
<tr><td>3D print to anything</td><td>Super glue (CA) or epoxy</td><td>Super glue fumes can fog clear acrylic. Use epoxy near clear parts.</td></tr>
<tr><td>Not allowed</td><td>Hot glue for structure, contact cement</td><td>Hot glue is fine for holding wires.</td></tr>
</table></div><p class="note">Draft: staff will confirm which glue brands BFMS stocks.</p>`;

const LESSONS = [
{ id:'brief', title:'The assignment', time:'15 min',
  goals:['Know what you must make and what counts as "two materials"','Know what BFMS gives you for free','Know the rules for every box'],
  need:['Nothing yet'],
  body:`
<p>You will design and build one box that uses <strong>at least two different materials</strong>. You can design it yourself, or start from one of five pre-made designs and make it your own. Both are fine. Your instructor grades the project. BFMS staff approve your plan and check that you built it safely.</p>
<h3>What BFMS gives you</h3>
<p>One kit per student. A kit covers the two materials for your box plus <strong>one remake</strong> if a part goes wrong. Anything past that, you buy or bring in yourself.</p>
<div class="tw"><table>
<tr><th>Material</th><th>Thickness</th><th>Cut on</th><th>Who runs it</th></tr>
<tr><td>Baltic birch plywood</td><td class="n">1/8 or 1/4</td><td>Red or blue laser</td><td>You, after training</td></tr>
<tr><td>Cast acrylic</td><td class="n">1/8 or 1/4</td><td>Red or blue laser</td><td>You, after training</td></tr>
<tr><td>6061 aluminum plate</td><td class="n">1/8 or 1/4</td><td>Waterjet</td><td>Staff. You send a DXF.</td></tr>
<tr><td>1000-series (1100) aluminum, for bending</td><td class="n">1/16 to 1/8</td><td>Waterjet, then the finger brake</td><td>Staff cut, you bend</td></tr>
<tr><td>4×4 wood block</td><td class="n">3.5 × 3.5 × 5.5</td><td>Bandsaw</td><td>You, after training</td></tr>
<tr><td>Poplar boards, pre-cut</td><td class="n">1/2 thick</td><td>Router table</td><td>You, after training</td></tr>
<tr><td>3D printed part</td><td class="n">up to ${SITE.printLimit}</td><td>3D printer</td><td>3D print lab workers, from your request</td></tr>
</table></div>
<p class="muted">The <b>red laser</b> is in the 3D print lab, room 101C. The <b>blue laser</b> is in SSL 104. ${SITE.printLimitNote}</p>
<h3>Rules for every box</h3>
<ul class="rules">
<li><b>Two materials minimum.</b> Two kinds of wood count as one material.</li>
<li><b>Only the waterjet cuts aluminum.</b> The lasers never cut metal.</li>
<li><b>No table saw and no chop saw.</b> Staff pre-cut solid wood for you.</li>
<li><b>Caps:</b> laser up to 15 minutes per file, waterjet up to 10 minutes per part, 3D printing up to ${SITE.printLimit}.</li>
<li><b>Glue only with the right glue for your materials.</b> The glue chart is in <a href="#/lesson/make">Making it</a>.</li>
<li><b>Every laser and waterjet file includes a material outline</b>, a rectangle the size of your sheet.</li>
<li><b>Nothing gets cut until staff sign your plan.</b></li>
</ul>
<h3>Suggested timeline</h3>
<p class="muted">Your section's real dates come from your instructor.</p>
<ol class="timeline"><li><b>Week 1.</b> Read this guide, finish BFMS Levels 1–3, pick a path.</li><li><b>Week 2.</b> Design, make your files, check them, get your plan signed.</li><li><b>Week 3.</b> Cut your parts and send your print request.</li><li><b>Week 4.</b> Assemble, finish, photograph, reflect.</li></ol>`,
  check:['I know my box needs at least two materials','I know I get one kit and one remake','I know the table saw and chop saw are off limits']},

{ id:'training', title:'Trainings you need', time:'10 min',
  goals:['Know which BFMS trainings you must take','Know which machines other people run for you'],
  need:['Your USC login, to check your training record'],
  body:`
<p>ENGR 102 requires BFMS <strong>Levels 1, 2 and 3</strong>. <strong>Levels 4 and 5 are optional.</strong> Take them if you want to do more in the shop later. Check your training record before you plan a part around a machine you can't use yet.</p>
<div class="tw"><table>
<tr><th>Machine</th><th>Used for</th><th>Who runs it</th></tr>
<tr><td>Red laser (101C), blue laser (SSL 104)</td><td>Plywood and acrylic parts, engraving</td><td>You, after training</td></tr>
<tr><td>Bandsaw</td><td>The bandsaw box, curves in wood</td><td>You, after training</td></tr>
<tr><td>Router table</td><td>Grooves and rabbets in the router box</td><td>You, after training</td></tr>
<tr><td>Finger brake</td><td>Folding aluminum</td><td>You, after a staff demo</td></tr>
<tr><td>3D printer</td><td>One printed part</td><td><b>No training needed.</b> Send a request. 3D print lab workers print it for you. See <a href="#/lesson/print">3D printing</a>.</td></tr>
<tr><td>Waterjet</td><td>Aluminum parts</td><td><b>Staff only.</b> You submit a DXF.</td></tr>
<tr><td>Table saw, chop saw</td><td>Pre-cutting solid wood</td><td><b>Staff only.</b></td></tr>
</table></div>
<p class="note">Draft: staff will confirm which level unlocks each machine.</p>`,
  check:['I am signed up for or have finished Levels 1–3','I know the waterjet, table saw and chop saw are staff only']},

{ id:'path', title:'Choose your path', time:'10 min',
  goals:['Decide between your own design and a pre-made one'],
  need:['A rough idea of what you want to store in your box'],
  body:`
<p>There are two ways to do this project. Neither is the "easy" one. Pre-made designs still need your own choices, and your own design can be simple.</p>
<div class="cards2">
<div class="pcard"><h4>Design your own</h4><p>Pick the size, shape, joints and materials. Use CAD, the laser box designer, Box Studio, or AI help. Best if you want to learn CAD or your major will use it.</p><a class="btn" href="#/lesson/cad">Designing your own</a></div>
<div class="pcard"><h4>Start from a pre-made design</h4><p>Pick one of five tested designs. Change the size and make it yours with engraving, cutouts, inlays, a printed part or a finish. You won't need CAD.</p><a class="btn" href="#/designs">See the five designs</a></div>
</div>
<h3>Help me pick</h3>
<form id="picker" class="picker">
<label for="pk1">Do you want to learn CAD on this project?</label>
<select id="pk1"><option value="">Choose</option><option value="y">Yes</option><option value="n">No, or not now</option></select>
<label for="pk2">Which sounds most fun?</label>
<select id="pk2"><option value="">Choose</option><option value="laser">Precise laser-cut parts</option><option value="wood">Shaping solid wood by hand</option><option value="metal">Bending metal</option><option value="mix">Electronics or a control panel</option></select>
<button type="submit" class="btn">Suggest a path</button>
<p id="pkout" class="pkout" aria-live="polite"></p>
</form>`,
  check:['I picked my path: my own design or a pre-made one']},

{ id:'designs', title:'The five pre-made designs', time:'20 min',
  goals:['See each design, its parts and its machines','Pick one, or borrow ideas for your own'],
  need:['Nothing'],
  body:`<p>Each design has a sample view, full drawings, a parts list and build steps.</p><p><a class="btn" href="#/designs">Open the design gallery</a></p>`,
  check:['I looked at all five designs','If I am using one, I picked it']},

{ id:'cad', title:'Designing your own', time:'30 min to learn a tool',
  goals:['Pick a design tool that fits your experience','Design parts that fit together the first time'],
  need:['A laptop','A tape measure. You don\'t need calipers for this project.'],
  body:`
<h3>Pick a tool</h3>
<div class="tw"><table>
<tr><th>Tool</th><th>Good for</th></tr>
<tr><td><a href="#/tools/box">Laser box designer</a></td><td>Finger-jointed laser boxes from a few numbers. Built into this guide. Gives a DXF and SVG with the material outline included.</td></tr>
<tr><td><a href="${SITE.boxStudio}" target="_blank" rel="noopener">Box Studio</a></td><td>The BFMS box designer for enclosures and control panels. Prints a box body and exports a flat face plate for the laser or waterjet.</td></tr>
<tr><td><a href="https://www.onshape.com/en/education" target="_blank" rel="noopener">Onshape</a></td><td>Real CAD in the browser on any laptop. Free for students.</td></tr>
<tr><td><a href="https://www.autodesk.com/education/edu-software/overview" target="_blank" rel="noopener">Fusion</a>, SolidWorks, NX</td><td>Real CAD with more power. See <a href="#/lesson/dxf">Exporting a DXF</a>.</td></tr>
<tr><td>AI assistant</td><td>Describe the box in words and get an SVG. Use the prompt below.</td></tr>
</table></div>
<h3>Design rules that save remakes</h3>
<ol>
<li><b>Measure your material with a tape measure before you design.</b> Sheets sold as "1/8" are often a little thinner. If yours reads just under 1/8, design to .118 (3 mm). The laser box designer lets you type the number in.</li>
<li><b>Work in inches or millimeters, and say which.</b> Export at 1:1 scale.</li>
<li><b>Plan for the laser kerf.</b> The beam removes a hair of material. Tight joints need a slightly smaller slot. Sliding parts, like a lid, need a little extra room.</li>
<li><b>Keep inside corners round</b> on bandsaw parts. A 1/4 blade can't turn tighter than about a 5/8 radius.</li>
<li><b>Aluminum parts need closed outlines</b> and holes no smaller than the plate is thick.</li>
<li><b>Fit your sheet.</b> Your kit sheet is 12 × 24. The finger brake folds up to 12 wide.</li>
<li><b>Draw a material outline</b>, a rectangle the size of your sheet around all your parts, on its own layer named MATERIAL.</li>
</ol>
<h3>Using AI to help design</h3>
<p>Copy this prompt, fill in the brackets, and paste it into the AI tool. Then open the file it gives you in the <a href="#/tools/check">file checker</a>.</p>
<div class="prompt"><pre id="aiprompt">I'm designing a box to cut on a laser cutter. Make an SVG file I can cut.
- Outside size: [8] × [4] × [3] inches (length × width × height)
- Material: [1/8 in Baltic birch plywood], measured thickness [0.118] in
- Joints: finger joints on every edge, about [0.5] in wide
- Top: [closed / open / a loose lid with a smaller lip layer underneath]
- Lay every panel flat on a [24 × 12] in sheet with 0.25 in gaps
- Draw the sheet as a separate rectangle, stroke green (#00A000), id="MATERIAL"
- Cut lines: stroke red (#FF0000), width 0.001 in, no fill
- Engraving, if any: fill blue (#0000FF). Convert any text to paths.
- Set width and height in inches, like width="24in", with a viewBox in inches
Then list each panel with its size so I can check it.</pre><button class="btn ghost" id="copyprompt" type="button">Copy prompt</button></div>
<p class="muted">AI tools get dimensions wrong. Check every number before you cut. Staff check AI-made files too. Follow your instructor's rules on AI use and say where you used it.</p>`,
  check:['I picked a design tool','I measured my material','My files are at 1:1 scale with units noted']},

{ id:'dxf', title:'Exporting a DXF', time:'15 min',
  goals:['Get a clean, flat, 1:1 DXF out of your CAD program'],
  need:['Your CAD model'],
  body:`
<p>The waterjet always needs a DXF, and the lasers take one too. A good DXF is flat, 1:1, in inches, made of closed outlines, and has nothing else in it: no dimensions, borders or title blocks.</p>
<details open><summary>Fusion</summary><ol>
<li>Start a sketch on the flat face of your part (Create Sketch, then click the face). The face edges come into the sketch. If they don't, use Project (P) and click the face.</li>
<li>Add a rectangle the size of your sheet around the part. This is your material outline.</li>
<li>Finish the sketch. In the browser on the left, right-click the sketch and choose <b>Save As DXF</b>.</li>
<li>Sheet metal parts: Create Flat Pattern, then right-click the flat pattern and export the DXF from there.</li></ol></details>
<details><summary>SolidWorks</summary><ol>
<li>Select the flat face you want to cut.</li>
<li>File › Save As, and pick DXF (*.dxf). In the Options button, set units to inches, output 1:1 and version R2000 or newer.</li>
<li>In the DXF/DWG Output panel, choose <b>Faces/Loops/Edges</b>, check that your face is selected, and save.</li>
<li>Sheet metal parts: right-click the Flat-Pattern in the tree and choose <b>Export to DXF/DWG</b>.</li>
<li>Add the material outline: in a sketch on the face, draw the sheet rectangle before you export, or ask staff to help add it.</li></ol></details>
<details><summary>NX</summary><ol>
<li>Make a drawing at 1:1 with only the face or flat-pattern view. Turn off the border, title block and dimensions.</li>
<li>Draw the sheet rectangle around the view as your material outline.</li>
<li>File › Export › AutoCAD DXF/DWG. Export the drawing as 2D, in inches.</li>
<li>Sheet metal parts: export the flat pattern instead.</li>
<li>Menu names change between NX versions. Ask staff if yours look different.</li></ol></details>
<details><summary>Onshape</summary><ol>
<li>Right-click the flat face (or the flat pattern for sheet metal) and choose <b>Export as DXF/DWG</b>.</li>
<li>Set units to inches.</li>
<li>Add the material outline in a sketch on the face before exporting.</li></ol></details>
<h3>Before you send it</h3>
<p>Run it through the <a href="#/tools/check">file checker</a>. It checks units, closed outlines, doubled lines, small holes, the material outline and your cut time.</p>`,
  check:['I exported a 1:1 DXF in inches','My DXF has a material outline','The file checker shows no red items']},

{ id:'files', title:'Preparing your files', time:'20 min',
  goals:['Send each machine a file it can cut the first time'],
  need:['Your design'],
  body:`
<div class="tw"><table>
<tr><th>Machine</th><th>File</th><th>Checklist</th></tr>
<tr><td>Red laser (101C), blue laser (SSL 104)</td><td>SVG or DXF</td><td>Cut lines and engrave areas on separate colors or layers, per the laser station's guide. Hairline strokes for cuts. Text converted to outlines. Material outline included.</td></tr>
<tr><td>Waterjet</td><td>DXF, 1:1</td><td>Closed outlines only, no doubled lines, no text unless it's outlined, material outline included. Name it <span class="n">Lastname_Firstname_ENGR102.dxf</span>. Staff cut it and tell you when it's ready.</td></tr>
<tr><td>Finger brake</td><td>A flat pattern drawing</td><td>Bend lines marked, bend order numbered, relief holes at the corners.</td></tr>
<tr><td>3D printer</td><td>STL</td><td>See <a href="#/lesson/print">3D printing</a>.</td></tr>
</table></div>
<p><a class="btn" href="#/tools/check">Open the file checker</a></p>
<p class="muted">Only cut kit materials on the lasers. Some plastics, like PVC and vinyl, give off toxic gas when lasered.</p>`,
  check:['Each machine has the right file type','Every laser and waterjet file has a material outline','The file checker shows no red items']},

{ id:'print', title:'3D printing', time:'10 min, plus print time',
  goals:['Get one part printed without taking printer training'],
  need:['An STL file of your part'],
  body:`
<p>You don't need 3D printer training for this project. The 3D print lab's student workers print your part and can help you get the file ready. If you want to run the printers yourself later, take the training then.</p>
<h3>How it works</h3>
<ol class="steps">
<li><b>Make an STL</b> of your part. Prints are PLA on the Prusa printers. Box Studio, Onshape, Fusion, SolidWorks and NX all export STL.</li>
<li><b>Send a request.</b> Scan the 3D Print Request QR code on the BFMS poster, or use <a href="${SITE.printForm}" target="_blank" rel="noopener">the request form</a>. Upload your STL and say it's for ENGR 102.</li>
<li><b>Approve the estimate.</b> You'll get the weight, time and cost. ENGR 102 prints are billed to the course account. Reply to approve it.</li>
<li><b>Wait for the pickup notice.</b> Print time depends on the queue, so send your request early.</li>
<li><b>Pick up your part</b> at the 3D print lab, room 101C.</li>
</ol>
<p class="muted">Limit: ${SITE.printLimit} per student. ${SITE.printLimitNote} Prints are PLA on the Prusa printers. A printed box body can fit under the limit with thin walls; the estimate tells you the weight before anything prints.</p>`,
  check:['I sent my print request','I approved the estimate','I picked up my part']},

{ id:'plan', title:'Your plan and sign-off', time:'20 min',
  goals:['Write a plan staff can approve in two minutes','Get the signature that unlocks cutting'],
  need:['Your design and files'],
  body:`
<p>Fill out the plan sheet, print it, and bring it with your files to a staff member. When they sign it, you can cut. Keep it with your parts until you're done.</p>
<p><a class="btn" href="#/plan">Open the plan sheet</a></p>
<h3>What staff look for</h3>
<ul><li>Two materials, both from the kit list</li><li>Every part has a size, a material and a machine</li><li>You've finished Levels 1–3</li><li>Your files passed the file checker and are under the time caps</li><li>You've named the hazards for each step</li></ul>`,
  check:['I filled out my plan','Staff signed my plan']},

{ id:'make', title:'Making it', time:'2–6 hours',
  goals:['Cut, fold and assemble your parts safely'],
  need:['Signed plan','Safety glasses','Closed-toe shoes, hair tied back, no loose sleeves'],
  body:`
<p class="note">Draft: this section summarizes the shop's rules. Your BFMS training is the real authority. If this page and your training disagree, follow your training and tell staff.</p>
<details open><summary>Lasers: red (101C) and blue (SSL 104)</summary><ul>
<li>Stay with the laser the entire time it runs. Know where the stop button and fire extinguisher are.</li>
<li>Kit plywood and cast acrylic only. Never PVC or vinyl.</li>
<li>Focus, then run a small test cut before the real part.</li>
<li>Keep the lid closed until the fan has cleared the smoke.</li></ul></details>
<details><summary>Bandsaw</summary><ul>
<li>Set the blade guard about 1/4 above the wood.</li>
<li>Keep your fingers out of the blade's path. Use a push stick near the blade.</li>
<li>No gloves. Tie back hair and sleeves.</li>
<li>Plan your cuts so you don't back out of long curves. If you must back out, switch off and wait for the blade to stop.</li></ul></details>
<details><summary>Router table</summary><ul>
<li>Check the bit height and fence on a scrap first.</li>
<li>Feed against the bit's rotation, right to left when facing the fence. Never feed the other way.</li>
<li>Use push blocks and a featherboard. Keep your hands away from the bit opening.</li>
<li>Switch off and wait for the bit to stop before you reach in or adjust anything.</li></ul></details>
<details><summary>Finger brake</summary><ul>
<li>Aluminum edges are sharp. Deburr the blank before you bend. Gloves are fine here.</li>
<li>Keep your fingers out from under the clamping fingers and away from the bending leaf.</li>
<li><b>Springback:</b> aluminum bounces back a little when you let go of the leaf. Bend slightly past where you want it, check with a square, and bump it a bit more if it's still open.</li>
<li>Bend in the order on your drawing. The last bends need fingers that fit between the sides you already bent.</li></ul></details>
<details><summary>Waterjet (staff only)</summary><ul>
<li>Submit your DXF and wait for staff to cut it.</li>
<li>Waterjet edges can be rough. File and sand them before handling a lot.</li></ul></details>
<details><summary>Gluing</summary>${GLUE}</details>
<details><summary>Sanding and finishing</summary><ul>
<li>Sand by hand through 120, 180 and 220 grit. Small parts don't go on the disc sander.</li>
<li>Use a dust mask or extraction when sanding.</li></ul></details>`,
  check:['I cut my parts','I assembled my box','I cleaned my station']},

{ id:'document', title:'Document and reflect', time:'30 min',
  goals:['Show what you made and what you learned'],
  need:['Your finished box','A phone camera'],
  body:`
<h3>Photos</h3>
<ul><li>The finished box from a three-quarter view, like the samples in the design gallery</li><li>The box with the lid or drawer open</li><li>Your parts laid out before assembly</li></ul>
<h3>Reflection prompts</h3>
<ol><li>Which two materials did you choose, and why?</li><li>What did you change from your plan, and why?</li><li>What went wrong, and how did you fix it?</li><li>If you made it again, what would you do differently?</li></ol>
<p class="muted">Your instructor sets what to hand in and how.</p>`,
  check:['I took my photos','I wrote my reflection']},

{ id:'check', title:'Readiness check', time:'10 min',
  goals:['Confirm you know the rules before your plan meeting'],
  need:['Nothing'],
  body:`<p>Fourteen questions on the rules and the machines. Get 12 right to pass. Show the result to staff at your plan sign-off. It doesn't replace your BFMS training.</p><p><a class="btn" href="#/check">Start the check</a></p>`,
  check:['I passed the readiness check']}
];

const DESIGNS = [
{ id:'b1', name:'Laser pencil box', tag:'Sliding acrylic lid. No router needed.', size:'8.00 × 3.00 × 2.25',
  mats:['1/8 plywood','1/8 cast acrylic'], machines:['Red or blue laser'], time:'About 3 hours', level:'Good first project',
  how:'The lid slides in a slot made by stacking laser-cut layers. The inner wall is two pieces with a gap between them, and the lid rides in that gap.',
  parts:[['A',2,'Outer side, finger jointed','8.00 × 2.25','1/8 ply'],['B',2,'Inner side, lower','7.75 × 1.75','1/8 ply'],['C',2,'Inner side, cap','7.75 × .25','1/8 ply'],['D',1,'End, closed','3.00 × 2.25','1/8 ply'],['E',1,'End, lid exit','3.00 × 1.87','1/8 ply'],['F',1,'Bottom','7.75 × 2.75','1/8 ply'],['G',1,'Lid, engraved','7.85 × 2.72','1/8 acrylic']],
  steps:['Measure the ply and the acrylic. Set the slot to the lid thickness plus a hair.','Laser A–F from one 12 × 24 ply sheet (about 8 min). Laser and engrave G from an 8 × 3 acrylic piece.','Glue B and C to the inside of each A with wood glue, using a scrap of acrylic as a spacer to hold the slot open.','Glue up A, D, E and F. Keep glue out of the slot.','Sand, then slide the lid in. The lid is not glued.'],
  yours:['Engrave a name, pattern or drawing on the lid','Use colored acrylic for the lid','Change the length to fit your pens','Add a laser-cut divider']},
{ id:'b2', name:'Router-table pencil box', tag:'Solid poplar with a routed groove and rabbet.', size:'9.00 × 3.00 × 2.50',
  mats:['1/2 poplar (pre-cut)','1/4 plywood','1/8 acrylic or plywood'], machines:['Router table','Red or blue laser'], time:'About 4 hours', level:'Needs router table training',
  how:'Staff pre-cut the poplar sides and ends. You route a groove for the lid and a rabbet for the bottom, then glue it up.',
  parts:[['A',2,'Side (staff pre-cut)','9.00 × 2.50 × .50','poplar'],['B',1,'End, closed (staff pre-cut)','2.00 × 2.50 × .50','poplar'],['C',1,'End, lid exit (staff pre-cut)','2.00 × 2.12 × .50','poplar'],['D',1,'Bottom','8.50 × 2.50','1/4 ply'],['E',1,'Lid','8.66 × 2.34','1/8 acrylic or ply']],
  steps:['Collect your pre-cut poplar from staff.','Router op 1: groove 1/8 wide × 3/16 deep, 1/4 below the top edge, on both sides and the closed end.','Router op 2: rabbet 1/4 × 1/4 on the bottom inside edge of all four pieces.','Laser the bottom and lid. Dry-fit them.','Glue the sides to the ends with wood glue, with the bottom captured but not glued.','Sand, round the edges by hand, and slide the lid in.'],
  yours:['Engrave the lid','Use a contrasting wood lid','Add a finger notch to the lid','Try a different finish']},
{ id:'b3', name:'Bandsaw box with drawer', tag:'One 4×4 block, a hidden drawer and a pull.', size:'5.50 × 3.50 × 3.50',
  mats:['4×4 construction lumber, untreated','Pull: 1/8 aluminum, acrylic or a 3D print'], machines:['Bandsaw','Finger brake, laser or 3D printer for the pull'], time:'About 3–4 hours', level:'Needs bandsaw training',
  how:'You cut the drawer out of a solid block, hollow it, and glue the pieces back together. Every inside corner needs a 5/8 radius or larger for the 1/4 blade.',
  parts:[['A',1,'Body, one 4×4 block','5.50 × 3.50 × 3.50','untreated 4×4'],['B',1,'Drawer, cut from A','4.25 × 2.00 × 3.25','same block'],['C',1,'Pull','1.50 × .38','1/8 aluminum, acrylic or print']],
  steps:['Stick the paper template on a long-grain face of the block.','Slice the .25 back off the block and set it aside.','Enter at the left side, cut all the way around the drawer outline, and leave through the same entry kerf.','Glue and clamp the entry kerf shut with wood glue.','Slice .25 off the front and the back of the drawer piece.','Cut out the drawer hollow, leaving .375 walls. Glue the drawer front and back back on.','Glue the back onto the body. Sand everything, then fit the pull with screws or epoxy.'],
  yours:['Draw your own outline and drawer shape','Bend an aluminum pull on the finger brake','Print a custom knob','Carve or wood-burn the front']},
{ id:'b4', name:'Instrument-panel box', tag:'An aluminum control-panel top on a plywood or 3D printed body.', size:'6.00 × 4.00 × 2.50',
  mats:['1/8 6061 aluminum','Body: 1/8 plywood or a 3D print'], machines:['Waterjet (staff)','Red or blue laser, or the 3D print lab'], time:'About 4 hours plus the waterjet queue', level:'Good for electronics fans',
  how:'Lay out the knob, switch and window holes in Box Studio, which exports the aluminum plate as a DXF. For the body, laser a finger-jointed plywood box, or have Box Studio make a printed frame with screw bosses.',
  parts:[['A',1,'Top plate','6.00 × 4.00 × .125','6061 aluminum'],['B',1,'Body: laser plywood box, or a 3D printed frame from Box Studio','6.00 × 4.00 × 2.37','1/8 ply or print'],['C',4,'Corner blocks (plywood body only)','.75 × .75 × 2.25','ply scraps or pine'],['D',1,'Window, optional','2.75 × 1.25','1/8 acrylic'],['—',4,'Screws','#6 × 1/2 pan head','steel']],
  steps:['Open Box Studio, switch to plate mode and inches, and place your parts.','Export the plate DXF, add the material outline, and check it in the file checker.','Submit the DXF. Staff waterjet the plate.','Plywood body: laser it and glue it up with a block in each corner. Printed body: send Box Studio\'s STL as a print request.','Deburr the plate. Pilot-drill the blocks, or use the printed bosses.','Screw the plate on. Add switches, a knob or an LED if you like.'],
  yours:['Move or add cutouts','Add a real switch and LED','Engrave labels on the plate','Glue acrylic behind the window with epoxy']},
{ id:'b5', name:'Folded aluminum tray', tag:'1/8 aluminum folded on the finger brake, with a plywood lid.', size:'5.25 × 3.38 × 1.50',
  mats:['1/8 1100-O aluminum (soft temper)','1/8 plywood'], machines:['Waterjet (staff)','Finger brake','Red or blue laser'], time:'About 3 hours plus the waterjet queue', level:'Good intro to sheet metal',
  how:'Staff waterjet a flat blank from 1000-series aluminum. The drawings are for 1/8; staff have the pattern for 1/16 too. You fold the four sides up on the finger brake. The plywood lid has a smaller layer glued underneath that drops inside the rim, so it can\'t slide around.',
  parts:[['A',1,'Tray blank, flat pattern','7.80 × 5.93','1/8 1100 aluminum'],['B',1,'Lid top','5.25 × 3.38','1/8 ply'],['C',1,'Lid lip, glued under B','4.95 × 3.08','1/8 ply']],
  steps:['Submit the flat pattern DXF. Staff waterjet the blank.','Deburr every edge.','Bends 1 and 2, the long sides: fingers 4 + 1 across the bend line. Bend a little past square to allow for springback.','Bends 3 and 4, the ends: one 3-inch finger, which fits between the long sides.','Laser B and C. Glue C centered under B with wood glue.','Drop the lid on. The lip keeps it in place.'],
  yours:['Engrave the lid','Use acrylic for the lid instead','Change the tray size to another finger combination','Add laser-cut dividers']}
];

const QUIZ = [
{ q:'Which machines can you NOT use for this project?', a:['The lasers and the bandsaw','The table saw and the chop saw','The router table and the finger brake'], c:1 },
{ q:'How thick can your plywood, acrylic or aluminum plate be?', a:['1/8 or 1/4','Anything up to 1/2','1/16 only'], c:0 },
{ q:'Who runs the waterjet?', a:['You, after Level 3','Staff. You send a DXF file.','Anyone with a signed plan'], c:1 },
{ q:'Where is the red laser?', a:['SSL 104','The 3D print lab, room 101C','The machine shop'], c:1 },
{ q:'Which machine cuts aluminum?', a:['The blue laser','The red laser','Only the waterjet'], c:2 },
{ q:'What do you need before cutting any part?', a:['A finished CAD model','A plan signed by staff','A photo of your sketch'], c:1 },
{ q:'With a 1/4 bandsaw blade, the tightest inside corner you can cut is about:', a:['1/8 radius','5/8 radius','2 inch radius'], c:1 },
{ q:'What must every laser and waterjet file include?', a:['A material outline the size of your sheet','Your student ID number','A title block with dimensions'], c:0 },
{ q:'Is pressure-treated lumber OK for the bandsaw box?', a:['Yes, it\'s cheaper','Only if you wear a mask','No. Its sawdust isn\'t safe.'], c:2 },
{ q:'Which aluminum do you fold on the finger brake?', a:['1/16 to 1/8 1000-series (1100) aluminum','1/8 6061-T6 plate','1/4 6061 plate'], c:0 },
{ q:'You\'re gluing clear acrylic to plywood. What do you use?', a:['Super glue','Two-part epoxy','Hot glue'], c:1 },
{ q:'How do you get a part 3D printed?', a:['Walk up and start a printer','Send a request with the QR code, approve the estimate, pick it up in 101C','Email your instructor the STL'], c:1 },
{ q:'Why do you bend aluminum slightly past square?', a:['It springs back a little when you let go','It makes the corner stronger','The brake can\'t reach 90 degrees'], c:0 },
{ q:'An AI tool made your SVG. What do you do before cutting?', a:['Send it straight to the laser','Run it through the file checker, measure it, and fix it','Nothing. AI files are exact.'], c:1 }
];
