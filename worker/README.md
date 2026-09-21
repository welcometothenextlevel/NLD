# Assistant backend

`js/chat.js` runs on its own with a built-in knowledge base (no server, no key).
To have Claude write the replies instead, deploy `chat-worker.js` as a
Cloudflare Worker, add your `ANTHROPIC_API_KEY` as a secret, and set
`window.NDL_CHAT_ENDPOINT` on the pages (see the header of `chat-worker.js`).

If the worker is down or slow (>14 s), the widget silently falls back to the
local engine, so visitors never see an error.
