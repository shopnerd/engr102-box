# ENGR 102 Box Project

Live: https://shopnerd.github.io/engr102-box/ (GitHub Pages from `main`, so a push deploys in about a minute)

This is the student guide for the ENGR 102 two-material box. It's plain HTML, CSS and JavaScript: no framework, no build step, no server.

- `content.js` holds every word students read: the lessons, the five designs, the readiness check, the glue chart, the machine list, the print limit and the links. Edit text there.
- `drawings.js` and `drawings.css` hold the spec drawings and the three-quarter sample views. The printable spec-sheet page uses the same code.
- `boxgen.js` is the laser box designer. It builds a finger-jointed box, lays the panels out on the sheet with the material outline, and writes the SVG or DXF.
- `audit.js` is the file checker for DXF and SVG files. It runs in the browser, and files are never uploaded.
- `tools.js` holds the two tool pages. `app.js` is the router, the progress checkboxes, the plan sheet and the quiz. Progress lives in each student's browser only.
- `node test-tools.cjs` runs a round-trip test: box designer, then DXF, then file checker.
- `python bundle.py` writes `dist/index.html`, a single-file copy for sharing offline. That file isn't committed.

Status: draft. Staff still need to confirm:
- which training level unlocks each machine
- the laser bed sizes and thickness limits
- the glue brands
- the safety summaries in "Making it"
- every dimension, by building one of each design
