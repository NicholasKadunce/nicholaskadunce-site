# nicholaskadunce-site

Personal portfolio website for Nicholas Kadunce — Operations & AI Leadership.

## Structure

- `public/` — Static site files served via GitHub Pages
  - `index.html` — Main portfolio site (single-page, self-contained)
  - `Nicholas_Kadunce_Resume.pdf` — Styled resume matching site design
- `cloudflare-worker/` — Serverless backend for AI chatbot (Claude Sonnet)

## AI Chatbot

The site includes an AI assistant powered by Claude Sonnet via a Cloudflare Worker proxy. See `cloudflare-worker/` for deployment instructions.
