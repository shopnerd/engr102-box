# ENGR 102 Box Project app

Student guide for the ENGR 102 two-material box. Vanilla HTML/CSS/JS, no framework, no server.

- `content.js` holds every word students read: the 10 lessons, the 5 designs, the 12-question readiness check. Edit text here.
- `drawings.js` and `drawings.css` hold the spec-sheet drawings. They're extracted from `../ENGR102-box-spec-sheets.html`, so if you change a drawing, change it in both places, or re-extract.
- `app.js` is the hash router, progress checkboxes, plan sheet and quiz. Progress is saved in the student's browser (localStorage) only. There are no accounts and no server records.
- `python bundle.py` inlines everything into `dist/index.html`, one file you can host anywhere or open with a double-click.

Status: rev A draft, 2026-10-01. Staff still need to confirm three things before students see it:
- which training level unlocks each machine
- the safety summaries in lesson 8
- every dimension, by building one of each design
