/* Next Digital Level — assistant backend (Cloudflare Worker).
 *
 * The website's assistant (js/chat.js) works on its own with a built-in
 * knowledge base. Deploy this worker and point the site at it to have the
 * answers written by Claude instead, with the same knowledge as context.
 *
 * Deploy (5 minutes, no build step):
 *   1. dash.cloudflare.com → Workers & Pages → Create → "Hello World" → paste this file.
 *   2. Settings → Variables → add a *secret* ANTHROPIC_API_KEY (console.anthropic.com).
 *   3. Copy the worker URL (https://….workers.dev).
 *   4. In every HTML page, before the chat.js <script>, add:
 *        <script>window.NDL_CHAT_ENDPOINT = "https://….workers.dev";</script>
 *      (or set data-chat-endpoint="…" on <body>). Nothing else changes.
 *
 * The site remains fully static; only the assistant's replies go through here.
 */

const ALLOWED_ORIGINS = new Set([
  'https://nextdigitalevel.com',
  'https://www.nextdigitalevel.com',
  'http://localhost:4195',
]);

const SYSTEM = `Tu es l'assistant de Next Digital Level, un studio suisse de création de sites web sur mesure pour les PME et indépendants de Suisse romande. Tu réponds sur le site nextdigitalevel.com.

Faits (n'invente rien au-delà) :
- Entreprise suisse. Zone : toute la Suisse romande (Genève, Vaud, Fribourg, Neuchâtel, Valais, Jura). Échanges par téléphone, WhatsApp ou visio, en français ou en anglais.
- Offre : sites entièrement codés sur mesure, sans template générique ni constructeur. Aperçu gratuit AVANT tout engagement : le client voit une proposition concrète, puis décide, sans obligation.
- Site prêt sous 7 jours après validation du projet et réception des éléments nécessaires (textes, photos, coordonnées).
- Sans frais récurrents : pas d'abonnement, pas de location. Le site et le code appartiennent au client. Seuls coûts tiers possibles : nom de domaine, éventuel outil externe (réservation…), toujours précisés avant accord.
- 12 mois de suivi inclus après la mise en ligne : un interlocuteur, 7 jours sur 7.
- Inclus dans chaque site : design responsive, pages rapides, contact en un geste (appel, WhatsApp, e-mail, itinéraire), SEO local (titres, descriptions, données structurées, contenu régional), HTTPS, accessibilité, nom de domaine et mise en ligne gérés.
- Accompagnement possible sur Google Business Profile et la visibilité/publicité locale (page /advertising.html). Aucun classement Google n'est garanti.
- Refonte de sites existants possible (domaine et référencement conservés).
- Expérience : sites réalisés pour des petites entreprises australiennes (institut de beauté, services NDIS, nettoyage, bijouterie, transport, club sportif…). Réalisations : /index.html#work.
- PAS de tarif public : chaque projet est chiffré après l'aperçu et l'échange. Ne donne jamais de prix, de fourchette ni d'estimation.
- Contact : téléphone +41 76 263 28 17, WhatsApp https://wa.me/41762632817, e-mail contact@nextdigitalevel.com. Demande d'aperçu : /book.html.

Style : français soigné, tutoiement interdit (vouvoiement), réponses courtes (2 à 5 phrases), concrètes, sans jargon ni emojis. Si l'utilisateur écrit en anglais, réponds en anglais. Si tu ne sais pas, dis-le et oriente vers WhatsApp ou le téléphone. Termine souvent par une invitation naturelle à demander l'aperçu gratuit, sans insister lourdement. Ne parle jamais d'autres prestataires. Réponds en texte brut, sans Markdown.`;

function cors(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://nextdigitalevel.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });
    if (!ALLOWED_ORIGINS.has(origin)) return new Response(JSON.stringify({ error: 'origin' }), { status: 403, headers });
    if (!env.ANTHROPIC_API_KEY) return new Response(JSON.stringify({ error: 'missing ANTHROPIC_API_KEY' }), { status: 500, headers });

    let body;
    try { body = await request.json(); } catch (e) { return new Response(JSON.stringify({ error: 'bad json' }), { status: 400, headers }); }
    const raw = Array.isArray(body.messages) ? body.messages : [];
    // Keep only well-formed turns, cap length, and make sure the transcript alternates and ends with the user.
    const messages = [];
    for (const m of raw.slice(-12)) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') continue;
      const content = m.content.trim().slice(0, 1200);
      if (!content) continue;
      if (messages.length && messages[messages.length - 1].role === m.role) messages[messages.length - 1].content += '\n' + content;
      else messages.push({ role: m.role, content });
    }
    while (messages.length && messages[0].role !== 'user') messages.shift();
    if (!messages.length || messages[messages.length - 1].role !== 'user') return new Response(JSON.stringify({ error: 'no question' }), { status: 400, headers });

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-5',
        max_tokens: 1024,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'low' },
        fallbacks: 'default',
      }),
    });
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'upstream ' + upstream.status, detail: detail.slice(0, 300) }), { status: 502, headers });
    }
    const data = await upstream.json();
    const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!reply) return new Response(JSON.stringify({ error: 'empty', stop_reason: data.stop_reason }), { status: 502, headers });
    return new Response(JSON.stringify({ reply, chips: ['Demander un aperçu', 'Parler à quelqu’un'] }), { status: 200, headers });
  },
};
