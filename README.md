# nicholaskadunce-site

Personal website and resume for Nicholas Kadunce, Plant Manager.

## Structure

- `public/`: static site files, served by GitHub Pages
  - `index.html`: the single-page site (self-contained, inline CSS and JS)
  - `article.html`: reading page for the Metals & Mining Review article "Building Operations that Deliver Results", with the cover image and attribution; linked from the site's In print section
  - `resume.html`: two-page print resume (source of `Nicholas_Kadunce_Resume.pdf`)
  - `Nicholas_Kadunce_Resume.pdf`: the resume, printed from `resume.html` with Playwright (Chromium, Letter, no margins)
  - `dashboard.html`: the Daily Operations Review demo (representative data) linked from the site
  - `nk-logo.png`, `favicon.png`, `mmr-cover.jpg`: assets
- `cloudflare-worker/`: serverless backend for the "Ask about Nicholas" assistant (Claude Sonnet)

## AI assistant

The site includes an assistant that calls a Cloudflare Worker proxy, which holds the system prompt and forwards the conversation to the Anthropic API. The worker keeps only well-formed user and assistant turns from the client history, so the rules in the system prompt cannot be widened from the browser.

Deployment, from `cloudflare-worker/`:

1. `npx wrangler secret put ANTHROPIC_API_KEY` (the key is never stored in the repo)
2. `npx wrangler deploy`

The worker name and entry point are in `cloudflare-worker/wrangler.toml`. The site calls the deployed worker URL set as `AI_WORKER_URL` in `index.html`.
