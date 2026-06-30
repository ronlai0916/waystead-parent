# CLAUDE.md — Waystead Parent Site

Project instructions for Claude Code. Read every session. Keep changes consistent with these rules.

## What this is
The **Waystead parent website** — a single-page static landing site for `waystead.co.uk`.
It establishes the Waystead brand and routes visitors to the products. It is NOT a marketing
funnel and has no app features.

## Authoritative spec
`Waystead_Parent_Site_Tech_Spec.md` in this folder is the source of truth. When in doubt,
follow it. If a request conflicts with the spec, flag it rather than silently diverging.

## Hard constraints (do not break)
- **Static site only:** semantic HTML5 + plain CSS (custom properties) + minimal vanilla JS.
- **No framework, no backend, no database, no CMS.** No React/Vue/Next, no build step required.
- **Minimal dependencies.** Prefer zero npm runtime deps. Self-host fonts.
- Do not introduce localStorage/cookies/trackers beyond an optional privacy-first analytics snippet if explicitly asked.

## Brand tokens (use exactly — never improvise colours or fonts)
- Indigo `#3D37A8` (Scheduler) · Teal `#0F8B7E` (Learning) · Amber `#F2A31D` (waypoint dot / Tutoring) · Slate `#4B5567` (Consulting)
- Ink `#1B1A20` (text) · Paper `#FAF8F3` (background)
- Fonts: **Sora** (headings/wordmark, 600/700) · **Manrope** (body/UI, 400/500/600)

## Non-negotiable design rules
- The **"Waystead" wordmark is always Ink `#1B1A20`, never recoloured.**
- **Parent chrome (header, hero, footer) stays neutral** — Ink on Paper. Product accent colours appear **only** on product cards.
- Logo is the **waymark**: a "W" of two upward chevrons as one rounded stroke, amber dot at the summit.

## Product visibility (spec §5.1 — important)
- Render **only live products** on the page: **Scheduler** and **Learning**.
- **Tutoring** and **Consulting** stay in the data with `live:false` but must appear **nowhere** user-facing — not in the grid, footer, or nav.
- Launching a product later must be a **single flag flip** (`live:true` + its `href`). Build it so that just works.
- Product grid columns follow the **count of live products** (2 now → 1 col mobile, 2 cols centred on desktop); must adapt automatically as more go live. Do not hard-code four columns.

## Assets (already in this folder)
- `assets/logo/waymark.svg`
- `assets/icons/favicon.svg`, `favicon.png`, `og-image.png` (1200×630 for Open Graph)
Use these; do not regenerate or restyle the logo.

## Quality bar
- Mobile-first, fully responsive (test 360 / 768 / 1024 / 1440).
- Accessible: logical headings, alt text, visible focus states, WCAG AA contrast, `prefers-reduced-motion`.
- SEO/social: `<title>` "Waystead — Know the way.", meta description, Open Graph + Twitter tags, `lang="en-GB"`, favicon links, `robots.txt`, `sitemap.xml`, optional Organization JSON-LD.
- Target near-instant load (static).

## Deployment context (don't confuse web with mail)
- Canonical: `waystead.co.uk`. `www` and the `.uk` variants **301-redirect** to it.
- Deploys to the **same VPS as Scheduler/Learning**: Oracle `pcc-prod`, Ubuntu 24.04 ARM, via Tailscale (`ssh ubuntu@pcc-prod`).
- Ingress is a **single Caddy container** (`pcc-prod-caddy`); its Caddyfile is `~/personal-command-center/infra/Caddyfile`. Apps are reached by container name over the shared external Docker network **`web`**.
- This site runs as its **own tiny Compose project** (nginx:alpine serving static files), on the `web` network; Caddy `reverse_proxy waystead-parent-web:80`.
- DNS is at **names.co.uk**; public IP via `curl -4 ifconfig.me` on the VPS.
- **Email is separate** (Zoho MX/SPF/DKIM + Resend `send.` records). Never touch or suggest changes to mail DNS records.

## Workflow notes
- Ask before destructive actions; commit to git at sensible points.
- The About/founder paragraph is owner-supplied — use a clearly-marked placeholder until provided; do not invent biographical facts.
