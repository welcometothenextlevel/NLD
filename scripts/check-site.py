"""Dependency-free checks for the buildless GitHub Pages site."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re
ROOT = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.links, self.h1 = path, set(), [], 0
        self.jsonld, self.buffer, self.lang = False, '', None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if a.get('id'):
            assert a['id'] not in self.ids, f'{self.path}: duplicate ID'
            self.ids.add(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'img': assert 'alt' in a, f'{self.path}: missing alt'
        for key in ('href', 'src'):
            if a.get(key): self.links.append(a[key])
        if tag == 'script' and a.get('type') == 'application/ld+json': self.jsonld, self.buffer = True, ''
    def handle_data(self, data):
        if self.jsonld: self.buffer += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.jsonld: json.loads(self.buffer); self.jsonld = False
pages = {}
for path in ROOT.rglob('*.html'):
    if '.git' in path.parts: continue
    page = Page(path.relative_to(ROOT)); text = path.read_text(); page.feed(text)
    assert page.lang == 'fr-CH', f'{path}: wrong language'
    assert not re.search(r'\$\s*\d|\b(?:CHF|AUD)\s*\d|61425887683|en_AU|priceCurrency|priceRange', text), f'{path}: stale pricing/contact'
    if path.parent == ROOT:
        assert page.h1 == 1, f'{path}: expected one h1'
        for token in ('rel="canonical"', 'property="og:title"', 'name="description"'):
            assert token in text, f'{path}: missing {token}'
    pages[path.resolve()] = page
for path, page in pages.items():
    for link in page.links:
        url = urlsplit(link)
        if url.scheme == 'tel': assert link == 'tel:+41762632817'
        if url.netloc == 'wa.me': assert url.path == '/41762632817'
        if url.scheme or url.netloc: continue
        target = ((ROOT / url.path.lstrip('/')) if url.path.startswith('/') else path.parent / url.path).resolve() if url.path else path
        if target.is_dir(): target /= 'index.html'
        # Links are extension-less; GitHub Pages serves /foo from foo.html.
        if not target.exists() and target.with_suffix('.html').exists(): target = target.with_suffix('.html')
        assert target.exists(), f'{page.path}: missing {link}'
        assert not (url.path.endswith('.html') and url.scheme == '' and url.netloc == ''), f'{page.path}: internal link keeps .html ({link})'
        if url.fragment and target in pages: assert unquote(url.fragment) in pages[target].ids, f'{page.path}: missing fragment {link}'
home = (ROOT / 'index.html').read_text()
for token in ('7 jours', '12 mois', 'aperçu gratuit', 'Sans frais récurrents', 'Entreprise suisse', 'australiennes', 'template générique', 'Google Business Profile'):
    assert token in home, f'Missing offer: {token}'
print(f'PASS: {len(pages)} HTML pages; links, fragments, metadata, JSON-LD, contact, offer, absence of prices.')
