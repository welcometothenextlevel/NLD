# Next Digital Level — Australian SEO playbook

Internal notes. Not linked from the site and excluded in `robots.txt`.
Last updated 30 July 2026.

---

## 1. Google Business Profile — do this first

This is the single highest-return item on the list, and it's free. For local searches
("web designer near me", "web design Melbourne") the map pack takes most of the clicks,
and you can't appear in it without a profile.

You do **not** need a shopfront. Register as a **service-area business**, which hides
your address and shows the areas you cover instead.

### Setup

1. Go to <https://business.google.com> and sign in with the Google account you want to
   own this forever — not a personal one you might lose access to.
2. **Business name:** `Next Digital Level`. Exactly that. Don't stuff it with keywords
   ("Next Digital Level | Web Design Melbourne") — it's against the guidelines and is a
   common reason for suspension.
3. **Category (primary):** `Website designer`. This one choice does more for what you
   rank for than anything else on the profile.
4. **Additional categories:** `Advertising agency`, `Marketing agency`,
   `Internet marketing service`. Add all three.
5. When asked "do you want to add a location customers can visit?" → **No**.
6. **Service areas:** add Melbourne plus the suburbs you actually want work from —
   Altona Meadows, Werribee, Point Cook, Footscray, Sunshine, Melton, Preston, Coburg,
   Craigieburn. Cap it at about 20; listing all of Victoria dilutes it.
7. **Phone:** +61 425 887 683. **Website:** https://nextdigitalevel.com/
8. Verification: usually video these days. You'll record a continuous clip showing your
   workspace, some evidence of the business (laptop with the site open, invoices, branded
   material) and your face. Takes five minutes. Postcard is the fallback.

### Fill it out properly once verified

- **Description (750 chars).** Lead with what you do and where. Something like:
  > Next Digital Level builds websites and runs Facebook and Instagram advertising for
  > Australian small businesses. We build your website free within 24 hours so you can see
  > the quality before you pay anything, then run the advertising that brings customers to
  > it. Most of our work is across Melbourne's western and northern suburbs, and we work
  > remotely with businesses Australia-wide. If your first week of advertising brings no
  > enquiries, we refund you in full.
- **Services.** Add each one separately: Website design, E-commerce websites, Booking
  websites, Facebook advertising, Instagram advertising, Google Business Profile setup.
  Each gets its own short description.
- **Photos.** Minimum 5, ideally 10+. Screenshots of sites you've built, your logo, a
  photo of you working. Profiles with photos get materially more clicks.
- **Products** (optional but useful): "Free website sample — $0" is a strong hook.
- **Q&A.** Post your own questions and answer them: "Do you build websites for tradies?",
  "How fast can you build my website?" This is allowed and it works.

### Reviews — the part that actually moves rankings

Reviews are the biggest differentiator between two otherwise identical profiles, and you
have real happy clients already.

Ask Liza (Talofa), Edvard (E&J Carpet Cleaning), Char's Beauty Room, All In 1 Party World
and Just Quality Lawn Care. Get the short link from your profile dashboard
(`Ask for reviews` → copies a `g.page/r/...` link) and send:

> Hi [name], glad the site's working for you. Would you mind leaving us a quick Google
> review? It genuinely helps other local businesses find us. Takes about 30 seconds:
> [link]

Timing beats wording: ask right after you've delivered something they're pleased with.
Aim for 5 in the first month, then 2–3 a month ongoing. Reply to every single one.

**Don't:** offer discounts for reviews, write them yourself, or ask for them in bulk.
Google detects clustering and it can cost you the profile.

### Posts

One post a week, 30 seconds each. New site launched, a client result, the free-sample
offer. Keeps the profile active, which helps.

---

## 2. Google Search Console

Needed to see which searches you're appearing for, and to tell Google about new pages.

1. <https://search.google.com/search-console> → Add property → **URL prefix** →
   `https://nextdigitalevel.com/`
2. Verification: choose **HTML tag**, copy the `content="..."` value and send it to me —
   it's a one-line addition to `index.html` and I'll push it.
   (DNS TXT at your registrar also works and covers the whole domain.)
3. Once verified: **Sitemaps** → submit `sitemap.xml`.
4. Then **URL Inspection** → paste each new page → **Request indexing**:
   - `/web-design-melbourne.html`
   - `/website-cost-australia.html`
   - `/ndis-provider-websites.html`
   - `/tradie-websites.html`
   - `/beauty-salon-websites.html`

   This is the difference between being indexed this week and in six weeks.

**Bing Webmaster Tools** (<https://www.bing.com/webmasters>) will import straight from
Search Console in two clicks. Worth doing — Bing feeds ChatGPT's search results.

---

## 3. Australian citations

Consistent name, phone and website across directories. Free, dull, and it works.

| Directory | URL |
|---|---|
| True Local | truelocal.com.au |
| Yellow Pages AU | yellowpages.com.au |
| Hotfrog AU | hotfrog.com.au |
| Start Local | startlocal.com.au |
| Local Search | localsearch.com.au |
| Apple Business Connect | businessconnect.apple.com |
| Bing Places | bingplaces.com |

Rule: identical business name, identical phone format, identical URL everywhere.
Inconsistency is what undermines the whole exercise.

---

## 4. What to measure

Check monthly, not daily — rankings move slowly and daily checking tells you nothing.

- **Search Console:** impressions and clicks by query. The queries you're appearing for
  but not being clicked on tell you which titles need rewriting.
- **Google Business Profile insights:** calls, direction requests, website clicks.
- **The only number that matters:** enquiries per month, and where each one came from.
  Ask every caller how they found you and write it down.

Realistic expectation: 3–6 months before local rankings meaningfully shift on a domain
this new. The Google Business Profile can produce calls within weeks, which is why it's
first on the list.

---

## 5. Still outstanding

- [ ] `.com.au` domain — needs an ABN. Genuine AU relevance signal plus buyer trust.
      When you have the ABN, register it and 301 one domain to the other; do not run both.
- [ ] Real client photos for the industry pages. Currently text-only, which is fine but
      real screenshots would convert better.
- [ ] More cities once Melbourne ranks — Sydney and Brisbane pages are only worth
      building when there's a local client to put on them.
- [ ] Ask the four current clients for a written testimonial for the industry pages, so
      each page has proof specific to that trade.
