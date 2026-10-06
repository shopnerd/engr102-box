# Inlines style.css, drawings.css and the three scripts into dist/index.html (one file to host or share).
import re, pathlib
here = pathlib.Path(__file__).parent
html = (here/'index.html').read_text(encoding='utf-8')
for css in ['style.css','drawings.css']:
    html = html.replace(f'<link rel="stylesheet" href="{css}">', '<style>\n'+(here/css).read_text(encoding='utf-8')+'\n</style>')
for js in ['drawings.js','content.js','boxgen.js','audit.js','tools.js','box3d.js','app.js']:
    html = html.replace(f'<script src="{js}"></script>', '<script>\n'+(here/js).read_text(encoding='utf-8').replace('</script', r'<\/script')+'\n</script>')
(here/'dist').mkdir(exist_ok=True)
(here/'dist'/'index.html').write_text(html, encoding='utf-8')
print('dist/index.html', len(html))
