"""Build aurum-demo into a single self-contained HTML file (dist/aurum-demo.html)."""
import base64, json, pathlib, re
R = pathlib.Path(__file__).resolve().parent
S = R / 'src'

ICONS = {
    'ar': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12L12 4M5.5 4H12v6.5"/></svg>',
    'star': '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6z"/></svg>',
    'ico-chat': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 4h14v10H8l-5 3.5z"/></svg>',
    'ico-target': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="3.5"/></svg>',
    'ico-court': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="3.5" width="15" height="13"/><path d="M2.5 10h15M10 3.5v13"/></svg>',
    'ico-copy': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>',
}

def data_uri(p):
    mt = 'image/png' if p.suffix == '.png' else 'image/jpeg'
    return f'data:{mt};base64,' + base64.b64encode(p.read_bytes()).decode()

imgs = {p.stem: data_uri(p) for p in sorted((R / 'assets').iterdir()) if p.suffix in ('.jpg', '.png')}
partials = {p.stem: p.read_text() for p in (S / 'partials').glob('*.html')}

def fill(t):
    for k, v in partials.items():
        t = t.replace('{{%s}}' % k, v)
    for k, v in ICONS.items():
        t = t.replace('{{%s}}' % k, v)
    t = re.sub(r'\{\{img:(\w+)\}\}', lambda m: imgs[m.group(1)], t)
    left = re.findall(r'\{\{[^}]+\}\}', t)
    assert not left, left
    return t

pages = {p.stem: fill(p.read_text()) for p in (S / 'pages').glob('*.html')}
page_imgs = {k: v for k, v in imgs.items() if k != 'favicon'}
js = (S / 'app.js').read_text()
js = js.replace('/*IMG*/{}', json.dumps(page_imgs)).replace('/*PAGES*/{}', json.dumps(pages, ensure_ascii=False).replace('</', '<\\/'))
css = (S / 'styles.css').read_text()
shell = (S / 'shell.html').read_text().replace('{{css}}', css)
shell = fill(shell.replace('{{js}}', '@@JS@@')).replace('@@JS@@', js)
out = R / 'dist' / 'aurum-demo.html'
out.parent.mkdir(exist_ok=True)
out.write_text(shell)
print(out, f'{out.stat().st_size/1024:.0f} KB')
