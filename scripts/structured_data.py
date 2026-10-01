"""Single owner of the site's JSON-LD. Run after any page generator:

    python3 scripts/structured_data.py          # rewrite every page
    python3 scripts/structured_data.py --check  # report only, change nothing

Rules it enforces on every root page:
  * exactly one business entity, @id https://nextdigitalevel.com/#business,
    identical on every page so @id references resolve on the page itself;
  * no street address in it (owner's instruction, 2026-10-01);
  * every other node points at the business by @id only;
  * FAQPage is rebuilt from the FAQ the visitor can actually read, so the
    questions and answers match the visible text word for word;
  * every /creation-site-internet-* page has a Service with the page's place
    as areaServed (City for towns, AdministrativeArea for cantons);
  * every indexable page except the homepage has a BreadcrumbList.
"""
from pathlib import Path
import html, json, re, sys

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://nextdigitalevel.com'
BUSINESS_ID = SITE + '/#business'
CANTONS = ['Vaud', 'Genève', 'Fribourg', 'Neuchâtel', 'Valais', 'Jura']

BUSINESS = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": BUSINESS_ID,
    "name": "Next Digital Level",
    "alternateName": "NDL",
    "url": SITE + "/",
    "logo": SITE + "/assets/logo-mark-512.png",
    "image": SITE + "/assets/social-preview.png",
    "description": ("Entreprise suisse de création de sites codés sur mesure pour les PME de Suisse "
                    "romande, avec un aperçu gratuit avant tout engagement, un site prêt sous 7 jours, "
                    "sans frais récurrents et 12 mois de suivi."),
    "telephone": "+41 76 263 28 17",
    "email": "contact@nextdigitalevel.com",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Chavannes-près-Renens",
        "postalCode": "1022",
        "addressRegion": "VD",
        "addressCountry": "CH",
    },
    "areaServed": [{"@type": "AdministrativeArea", "name": c} for c in CANTONS],
    "sameAs": [
        "https://www.instagram.com/nextdigitalevel/",
        "https://www.facebook.com/profile.php?id=61591099700363",
        # Google Business Profile, linked at the owner's request on 2026-09-30.
        "https://www.google.com/maps/place/?q=place_id:ChIJDxHjKQyWSAkRY9ludK1MBZE",
    ],
    "hasMap": "https://maps.google.com/?cid=10449842818249578851",
    # Owner confirmed availability is 24/7; matches the Business Profile.
    "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00", "closes": "23:59",
    },
    "knowsLanguage": ["fr", "en"],
    "contactPoint": {"@type": "ContactPoint", "telephone": "+41 76 263 28 17",
                     "contactType": "customer service", "availableLanguage": ["French", "English"]},
}

# areaServed for each local page: cantons are AdministrativeArea, towns are City.
def city(name, canton):
    return {"@type": "City", "name": name,
            "containedInPlace": {"@type": "AdministrativeArea", "name": canton}}
def canton(name):
    return {"@type": "AdministrativeArea", "name": name}

PLACES = {
    'creation-site-internet-geneve': ('Genève', canton('Genève')),
    'creation-site-internet-lausanne': ('Lausanne et le canton de Vaud', canton('Vaud')),
    'creation-site-internet-fribourg': ('Fribourg', canton('Fribourg')),
    'creation-site-internet-neuchatel': ('Neuchâtel', canton('Neuchâtel')),
    'creation-site-internet-valais': ('Valais', canton('Valais')),
    'creation-site-internet-jura': ('Jura', canton('Jura')),
    'creation-site-internet-nyon': ('Nyon', city('Nyon', 'Vaud')),
    'creation-site-internet-morges': ('Morges', city('Morges', 'Vaud')),
    'creation-site-internet-vevey-montreux': ('Vevey et Montreux', [city('Vevey', 'Vaud'), city('Montreux', 'Vaud')]),
    'creation-site-internet-yverdon': ('Yverdon-les-Bains', city('Yverdon-les-Bains', 'Vaud')),
    'creation-site-internet-bulle': ('Bulle', city('Bulle', 'Fribourg')),
    'creation-site-internet-martigny': ('Martigny', city('Martigny', 'Valais')),
    'creation-site-internet-sierre': ('Sierre et Crans-Montana', [city('Sierre', 'Valais'), city('Crans-Montana', 'Valais')]),
    'creation-site-internet-monthey': ('Monthey', city('Monthey', 'Valais')),
    'creation-site-internet-la-chaux-de-fonds': ('La Chaux-de-Fonds', [city('La Chaux-de-Fonds', 'Neuchâtel'), city('Le Locle', 'Neuchâtel')]),
    'creation-site-internet-suisse-romande': ('Suisse romande', [canton(c) for c in CANTONS]),
}

# Breadcrumb names for pages that had none: the same labels the footer uses.
CRUMB_NAMES = {
    'websites': 'Sites sur mesure',
    'advertising': 'Visibilité & publicité',
    'book': 'Demander un aperçu gratuit',
    'tradie-websites': 'Artisans & services',
    'beauty-salon-websites': 'Salons & instituts',
    'ndis-provider-websites': 'Expérience NDIS en Australie',
    'web-design-melbourne': 'Notre expérience australienne',
    'website-cost-australia': 'Préparer votre projet',
}
NO_CRUMB = {'index', '404'}

LD = re.compile(r'<script type="application/ld\+json">\s*(.*?)\s*</script>\n?', re.S)
INLINE = re.compile(r'</?(?:a|b|strong|em|i|span|small|abbr|code)\b[^>]*>', re.I)
BLOCK = re.compile(r'<br\s*/?>|</?(?:p|div|li|ul|ol|h[1-6])\b[^>]*>', re.I)


def visible_text(fragment):
    """The text a reader sees: inline tags vanish, block tags become a space,
    entities are decoded (a non-breaking space stays one), and only the
    formatting whitespace of the source is collapsed."""
    t = BLOCK.sub(' ', INLINE.sub('', fragment))
    t = html.unescape(re.sub(r'<[^>]+>', '', t))
    return re.sub(r'[ \t\r\n]+', ' ', t).strip()


def visible_faq(page):
    out = []
    for m in re.finditer(r'<details class="faq-detail">(.*?)</details>', page, re.S):
        body = m.group(1)
        sm = re.search(r'<summary>(.*?)</summary>(.*)', body, re.S)
        if not sm:
            continue
        q = re.sub(r'<span aria-hidden="true">.*?</span>', '', sm.group(1), flags=re.S)
        out.append((visible_text(q), visible_text(sm.group(2))))
    return out


def render(obj):
    return '<script type="application/ld+json">\n%s\n</script>\n' % json.dumps(obj, ensure_ascii=False, indent=1)


def process(path, check=False):
    page = path.read_text()
    slug = path.stem
    blocks, issues = [], []
    for m in LD.finditer(page):
        try:
            blocks.append((m.group(0), json.loads(m.group(1))))
        except ValueError:
            issues.append('invalid JSON-LD left untouched')
            blocks.append((m.group(0), None))

    kept = []
    for raw, d in blocks:
        if d is None:
            kept.append(raw); continue
        t = d.get('@type')
        if t == 'ProfessionalService':
            continue                                  # replaced by the canonical entity
        if t in ('FAQPage',):
            continue                                  # rebuilt from the visible FAQ
        if t == 'Service' and slug in PLACES:
            continue                                  # rebuilt from PLACES
        if t == 'BreadcrumbList':
            items = d.get('itemListElement') or []
            # Generators copy <head> from websites.html; a breadcrumb that ends on
            # another page is an inherited stray, not this page's trail.
            if not items or items[-1].get('item') != '%s/%s' % (SITE, slug):
                continue
        if t == 'Service':
            d['provider'] = {"@id": BUSINESS_ID}
        if t == 'WebSite':
            d['publisher'] = {"@id": BUSINESS_ID}
        kept.append(render(d))

    new = [render(BUSINESS)]
    if slug in PLACES:
        label, area = PLACES[slug]
        new.append(render({"@context": "https://schema.org", "@type": "Service",
                           "serviceType": "Création de site internet",
                           "name": "Création de site internet — " + label,
                           "provider": {"@id": BUSINESS_ID},
                           "areaServed": area,
                           "url": "%s/%s" % (SITE, slug)}))
    faq = visible_faq(page)
    if faq:
        new.append(render({"@context": "https://schema.org", "@type": "FAQPage",
                           "mainEntity": [{"@type": "Question", "name": q,
                                           "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}))
    has_crumb = any(d and d.get('@type') == 'BreadcrumbList' and (d.get('itemListElement') or [{}])[-1].get('item') == '%s/%s' % (SITE, slug)
                    for _, d in blocks)
    if not has_crumb and slug not in NO_CRUMB:
        name = CRUMB_NAMES.get(slug) or html.unescape(re.search(r'<title>(.*?)</title>', page).group(1)).split(' | ')[0].split(' · ')[0]
        new.append(render({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": name, "item": "%s/%s" % (SITE, slug)}]}))

    # Rebuild: drop every old JSON-LD block, put the full set back where the first one was.
    first = LD.search(page)
    stripped = LD.sub('', page)
    at = first.start() if first else stripped.index('</head>')
    out = stripped[:at] + ''.join(new + kept) + stripped[at:]
    out = out.replace(SITE + '/#organization', BUSINESS_ID)
    if not check and out != page:
        path.write_text(out)
    return out != page, faq, issues


def main():
    check = '--check' in sys.argv
    changed = []
    for path in sorted(ROOT.glob('*.html')):
        did, faq, issues = process(path, check)
        if did:
            changed.append(path.name)
        for i in issues:
            print('!', path.name, i)
    print(('would change' if check else 'changed'), len(changed), 'pages')
    return changed


if __name__ == '__main__':
    main()
