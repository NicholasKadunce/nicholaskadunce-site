# nicholaskadunce-site

Personal portfolio website for Nicholas Kadunce — Operations Executive & Plant Manager.

## Structure

- `public/` — Static site files served via GitHub Pages
  - `index.html` — Main portfolio site (single-page, self-contained)
  - `resume.html` — Two-page print resume (source of `Nicholas_Kadunce_Resume.pdf`)
  - `Nicholas_Kadunce_Resume.pdf` — Styled resume matching site design
  - `dashboard.html` — Live operations dashboard demo linked from the portfolio
- `cloudflare-worker/` — Serverless backend for AI chatbot (Claude Sonnet)

## AI Chatbot

The site includes an AI assistant powered by Claude Sonnet via a Cloudflare Worker proxy. See `cloudflare-worker/` for deployment instructions.
