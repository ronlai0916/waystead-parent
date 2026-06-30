# Waystead — Parent Site

The static landing site for **`waystead.co.uk`**. It establishes the Waystead
brand and routes visitors to the live products (**Scheduler** and **Learning**).
No framework, no backend, no database, no build step — semantic HTML5 + plain
CSS (custom-property brand tokens) + a little vanilla JS.

Source of truth for requirements: `Waystead_Parent_Site_Tech_Spec.md`.
Build/brand rules: `CLAUDE.md`.

---

## Structure

```
waystead-parent/
├── index.html              # the whole page (one file)
├── css/styles.css          # brand tokens + responsive layout
├── js/main.js              # mobile nav toggle only (page works without JS)
├── assets/
│   ├── logo/waymark.svg
│   ├── fonts/              # self-hosted woff2 (latin subset, variable)
│   │   ├── sora-latin-var.woff2      # Sora 600–700
│   │   └── manrope-latin-var.woff2   # Manrope 400–600
│   └── icons/
│       ├── favicon.svg · favicon.ico · favicon-32.png
│       ├── apple-touch-icon.png (180×180)
│       └── og-image.png (1200×630)
├── robots.txt
├── sitemap.xml
└── README.md
```

> **Fonts note:** Google serves Sora and Manrope as *variable* fonts, so the
> latin subset for all requested weights (Sora 600/700, Manrope 400/500/600)
> ships as **one woff2 per family** rather than five separate static files —
> same weights, fewer bytes. They're `@font-face`'d with weight ranges in
> `css/styles.css` and `font-display: swap`.

---

## Local preview

No build step. Serve the folder with any static server:

```bash
# Python (built in on macOS/Linux)
python3 -m http.server 8000
# → http://localhost:8000
```

```bash
# or Node, if you prefer
npx serve .
```

Open the printed URL. Use a real server (not `file://`) so the absolute
asset/font paths and the JSON-LD resolve correctly.

**Responsive check:** verify at 360 / 768 / 1024 / 1440 px. The mobile nav
collapses to a hamburger under 768px.

---

## Editing content

- **Copy / sections:** edit `index.html` directly.
- **About paragraph:** currently a clearly-marked placeholder — replace the
  `.placeholder` block with the owner-supplied founder copy. Do not invent bio
  facts.
- **Brand colours / fonts / spacing:** the tokens live in `:root` at the top of
  `css/styles.css`. Don't improvise colours or fonts outside these tokens.

### Launching a hidden product (Tutoring / Consulting)

Per Tech Spec §5.1, only **live** products appear anywhere user-facing. The
product data array (the single source of truth) is kept as a labelled comment
block at the top of the `#products` section in `index.html`. To launch one:

1. In `index.html`, **uncomment** that product's `<a class="card card--…">`
   block inside `.product-grid` and set its real `href`.
2. Add the matching `<li>` to the **Products** list in the footer.
3. (Optional) update the data array comment so `live:true`.

The product grid columns follow the **number of live cards automatically**
(`auto-fit`), so 2 → 3 → 4 products reflow with no CSS change. Accent colour is
set purely by the card's modifier class (`.card--indigo/teal/amber/slate`); the
"Waystead" wordmark inside every card stays Ink and is never recoloured.

---

## Deploy to the Oracle VM (behind the shared Caddy)

This site runs as its **own tiny Compose project** (`nginx:alpine` serving the
static files read-only) on the shared external Docker network **`web`**, fronted
by the existing ingress Caddy. It mirrors how Scheduler/Learning are wired.
Full context: Tech Spec §10.

### 1. Get the files onto the VM

```bash
ssh ubuntu@pcc-prod                  # over Tailscale
# clone (or git pull) this repo, e.g. into ~/waystead-parent
```

### 2. Compose project

`docker-compose.yml` (static files are served from `./site` — point it at the
repo's web root, or copy the site files into `./site`):

```yaml
services:
  web:
    image: nginx:alpine
    container_name: waystead-parent-web
    restart: unless-stopped
    volumes:
      - ./site:/usr/share/nginx/html:ro
    networks: [web]
networks:
  web:
    external: true
```

```bash
docker compose up -d
```

### 3. Wire the ingress Caddy

Edit `~/personal-command-center/infra/Caddyfile` (**back it up first**):

```bash
cd ~/personal-command-center/infra
cp Caddyfile Caddyfile.bak
```

Add these blocks (keep all existing ones). Canonical host + 301 redirects for
`www` and the `.uk` variants:

```
waystead.co.uk {
    encode gzip
    reverse_proxy waystead-parent-web:80
}

www.waystead.co.uk, waystead.uk, www.waystead.uk {
    redir https://waystead.co.uk{uri} permanent
}
```

Reload the ingress Caddy and watch certificates issue:

```bash
cd ~/personal-command-center
docker compose -f infra/docker-compose.prod.yml restart caddy
docker logs -f pcc-prod-caddy        # look for "certificate obtained" for waystead.co.uk
```

> ⚠️ Restarting the ingress Caddy briefly blips **all** sites for a few
> seconds — expected. No database is involved here; backing up the Caddyfile is
> the relevant safety step.

### 4. DNS (names.co.uk)

Get the VM's **public** IP on the box (not the Tailscale 100.x address):

```bash
curl -4 ifconfig.me
```

At **names.co.uk → waystead.co.uk → Manage DNS**, point `A`/`AAAA` records for
`waystead.co.uk` (and `www`) at that IP. **Do not touch mail records** — Zoho
`MX/SPF/DKIM` and the Resend `send.` subdomain records stay exactly as they are.

### 5. Verify

```bash
curl -I https://waystead.co.uk            # 200, valid cert
curl -I https://www.waystead.co.uk        # 301 → https://waystead.co.uk
curl -I https://waystead.uk               # 301 → https://waystead.co.uk
```

Then spot-check the page, favicon, OG preview (e.g. paste the URL into a
LinkedIn/Slack composer), and the mobile nav.

---

## Quality bar (already wired)

- Mobile-first, responsive (360 / 768 / 1024 / 1440).
- WCAG AA contrast; logical headings; alt text; visible focus states;
  `prefers-reduced-motion` respected; skip link.
- SEO/social: title, meta description, Open Graph + Twitter, `lang="en-GB"`,
  favicons, `robots.txt`, `sitemap.xml`, Organization JSON-LD.
- Self-hosted fonts with `font-display: swap` and `preload` — no third-party
  requests, no cookies, no trackers.

## Optional: privacy-first analytics

If visitor metrics are wanted later, add **Plausible** or self-hosted **Umami**
(cookieless, GDPR-friendly) — not Google Analytics. One `<script>` in `<head>`;
nothing else changes.
