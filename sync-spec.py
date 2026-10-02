# Copies the shared drawing code (drawings.js, boxgen.js, drawings.css) into ../ENGR102-box-spec-sheets.html
import pathlib
here = pathlib.Path(__file__).parent; p = here.parent / 'ENGR102-box-spec-sheets.html'
s = p.read_text(encoding='utf-8')
a = s.index('/*DRAWINGS*/') + len('/*DRAWINGS*/'); b = s.index('/*END DRAWINGS*/')
s = s[:a] + '\nconst esc=s=>String(s);\n' + (here/'drawings.js').read_text(encoding='utf-8') + '\n' + (here/'boxgen.js').read_text(encoding='utf-8') + '\n' + s[b:]
a = s.index('/* svg drawing classes */'); b = s.index('.isorow{')
s = s[:a] + (here/'drawings.css').read_text(encoding='utf-8') + '\n' + s[b:]
p.write_text(s, encoding='utf-8'); print('spec sheets synced')
