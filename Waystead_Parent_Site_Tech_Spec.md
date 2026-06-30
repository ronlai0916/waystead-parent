# Waystead — Parent Website Technical Specification

**Document type:** Technical spec (feeds Claude Code)
**Property:** `waystead.co.uk` (canonical) + `www.waystead.co.uk`
**Version:** 1.1
**Companion doc:** `Waystead_Parent_Site_Plan.md` (content + design)
**Change in v1.1:** Only **live** products are shown on the homepage. In-development products (Tutoring, Consulting) are kept in the data but hidden from view until launch — see §5.1.

---

## 1. Architecture decision

This is a **static website** — HTML, CSS, and minimal JavaScript only. **No backend, no database, no CMS.**

**Why static:** the parent landing page has no logins, no live data, and changes rarely. A static site is faster, far more secure (no server-side code to attack), trivial to host, and consumes almost no resources on the shared Oracle VM. A database-backed CMS would be wrong for a single landing page.

## 2. Technology stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Markup | Semantic HTML5 | One `index.html` |
| Styling | Plain CSS (custom properties for brand tokens) | No Tailwind build step required; optional if preferred |
| Scripting | Vanilla JS, minimal | Only for mobile nav toggle / smooth scroll |
| Fonts | Sora + Manrope | Self-hosted `.woff2` preferred (privacy + speed); Google Fonts acceptable fallback |
| Build | None required | Hand-built static files. (Astro is an option only if the site later grows to many pages — not now.) |
| Version control | Git + GitHub | Single repo |

**Do not** introduce React/Next/Vue/a database for this site. Keep it dependency-light.

## 3. File / repo structure

```
waystead-parent/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js              # mobile nav toggle, smooth scroll only
├── assets/
│   ├── logo/
│   │   ├── waymark.svg
│   │   ├── waystead-wordmark.svg
│   │   └── waystead-lockup.svg
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── favicon-32.png
│   │   ├── apple-touch-icon.png
│   │   └── og-image.png      # 1200×630 social share card
│   └── fonts/                # self-hosted woff2 (if not using Google Fonts)
│       ├── sora-600.woff2
│       ├── sora-700.woff2
│       ├── manrope-400.woff2
│       ├── manrope-500.woff2
│       └── manrope-600.woff2
├── robots.txt
├── sitemap.xml
└── README.md
```

## 4. Brand tokens (CSS custom properties)

```css
:root {
  /* Colour */
  --indigo: #3D37A8;   /* Scheduler accent / primary */
  --teal:   #0F8B7E;   /* Learning accent */
  --amber:  #F2A31D;   /* "you are here" dot / Tutoring */
  --slate:  #4B5567;   /* Consulting accent */
  --ink:    #1B1A20;   /* text */
  --paper:  #FAF8F3;   /* background */

  /* Type */
  --font-head: "Sora", system-ui, sans-serif;
  --font-body: "Manrope", system-ui, sans-serif;

  /* Layout */
  --maxw: 1120px;
  --radius: 16px;
  --gap: clamp(1rem, 2vw, 2rem);
}
```

**Rule enforced in code:** the wordmark "Waystead" always renders in `--ink` and is never recoloured. Parent chrome (header/hero/footer) uses only `--ink` on `--paper`; accent colours are scoped to product cards.

## 5. Page sections (build order)

Build as one `index.html` with these `<section>` blocks, matching the plan doc:

1. `<header>` — sticky or static; waymark + wordmark; nav anchors to `#idea`, `#products`, `#about`, `#contact`; mobile hamburger toggle.
2. `#hero` — waymark, wordmark, `Know the way.`, supporting sentence.
3. `#idea` — brand-story paragraph.
4. `#products` — responsive grid showing **only live products** (currently Scheduler + Learning). See §5.1 for the visibility rule.
5. `#about` — founder/company paragraph.
6. `#contact` — `mailto:hello@waystead.co.uk`.
7. `<footer>` — wordmark, **live** product list (Scheduler, Learning only), contact, copyright, tagline.

### 5.1 Product visibility rule (data-driven, reversible)

The four products live in a single **data array**; the page renders cards by **filtering on a `live` flag**, so showing or hiding a product is a one-line change, not a markup edit.

- **Render on the homepage:** only products where `live: true` — currently **Scheduler** and **Learning**.
- **Keep in the data, hidden from view:** **Tutoring** and **Consulting** (`live: false`). Retain their full details (descriptor, tagline, accent) so they're launch-ready.
- **To launch a product later:** flip its flag to `live: true` (and add its `href` subdomain). No other change needed — the card, accent, grid and footer pick it up automatically.
- **Hidden products must not appear anywhere user-facing:** not in the product grid, not in the footer product list, not in the nav. (Internally they may remain as commented/flagged data only.)

Reference data shape:

```js
const products = [
  { slug:'scheduler', descriptor:'Scheduler', live:true,  accent:'indigo',
    tagline:"Your family's week, mapped.", href:'https://scheduler.waystead.co.uk' },
  { slug:'learning',  descriptor:'Learning',  live:true,  accent:'teal',
    tagline:'Clear steps to 11+.',          href:'https://learn.waystead.co.uk' },
  // --- Hidden until launch: do not render while live:false ---
  { slug:'tutoring',   descriptor:'Tutoring',   live:false, accent:'amber',
    tagline:'One-to-one, one step at a time.', href:'' },
  { slug:'consulting', descriptor:'Consulting', live:false, accent:'slate',
    tagline:'A steadier way to decide.',        href:'' },
];
```

For a pure-static build with no JS, the equivalent is: hand-author only the two live cards in `index.html`, and keep the two future cards as an **HTML comment block** clearly labelled "uncomment at launch." Either approach satisfies the rule; the data-array version is preferred because launching is then a flag flip.

### Reusable component — product card

```
[ Product card ]
- shared waymark (white-on-accent badge or inline mark)
- "Waystead" (ink, Sora 600) + descriptor (accent, Manrope tracked caps)
- tagline OR "In development" tag
- live cards: link/button to subdomain
- future cards: muted styling, non-clickable "In development" pill
```

Card accent is set per product via a modifier class (`.card--indigo`, `.card--teal`, `.card--amber`, `.card--slate`).

## 6. Responsive requirements

- **Mobile-first** CSS; single-column stack on phones.
- Product grid: **column count follows the number of live products.** With 2 live products: 1 column (mobile) → 2 columns (tablet/desktop), centred and not stretched full-width. The grid must adapt automatically as products are switched live (2→3→4), without hard-coding four columns.
- Tap targets ≥ 44px; nav collapses to a toggle under ~768px.
- Test at 360px, 768px, 1024px, 1440px widths.

## 7. Accessibility

- Logical heading order (`h1` once in hero; `h2` per section).
- `alt` text on the waymark/logo images; decorative SVGs marked `aria-hidden` where appropriate.
- Visible focus states on links/buttons.
- Colour contrast meets **WCAG AA**. Verify accent-on-paper text (teal/indigo/slate on paper pass; amber text on paper is borderline — use amber for the dot/graphics, not body text).
- `prefers-reduced-motion` respected for any scroll animation.

## 8. SEO & social

- `<title>`: `Waystead — Know the way.`
- `<meta name="description">`: one-sentence summary of the family of products.
- **Open Graph + Twitter Card** tags with `og:image` → `assets/icons/og-image.png` (1200×630) so Facebook/LinkedIn shares preview the waymark properly.
- `lang="en-GB"`.
- `robots.txt` allowing all; `sitemap.xml` listing the homepage.
- Favicon + `apple-touch-icon` wired up.
- Structured data (optional): `Organization` JSON-LD with name, logo, URL, contact.

## 9. Performance

- Self-host or `preconnect` fonts; `font-display: swap`.
- Compress images; serve the OG image and icons optimised.
- Inline critical CSS if convenient; otherwise a single small stylesheet.
- Target: sub-second load; near-100 Lighthouse on a static page.

## 10. Domain, hosting & deployment — aligned to the existing Waystead VPS

**This deploys onto the SAME VPS and pattern as Waystead Scheduler and Waystead Learning.** Match that environment exactly:

- **Server:** Oracle Cloud VM `pcc-prod`, Ubuntu 24.04 ARM, reached over **Tailscale**: `ssh ubuntu@pcc-prod`.
- **Ingress:** a **single Caddy container** (`pcc-prod-caddy`) inside the Scheduler's Docker Compose project fronts the whole VM (ports 80/443). Its config is the **Caddyfile at `~/personal-command-center/infra/Caddyfile`** on the VPS. ACME email is already set globally, so new domains get certificates automatically.
- **Networking:** apps run in their own Compose projects and are reached **by container name over a shared external Docker network called `web`**. Caddy proxies to them (e.g. `reverse_proxy store-web:3000` for Learning).
- **DNS:** at **names.co.uk** → waystead.co.uk → Manage DNS. The VM's public IP is `curl -4 ifconfig.me` on the VPS (NOT the Tailscale 100.x address).
- **Ports 80/443:** already open (other sites work) — no Oracle Security List / ufw change needed.
- **Mail untouched:** Zoho `MX/SPF/DKIM` (+ Resend `send.` subdomain records) stay as-is.

**Serving model for THIS site:** the parent is static, so run it as its **own tiny Compose project** (an `nginx:alpine` container serving the files via a read-only bind mount), attached to the `web` network — mirroring how the Learning store is wired. The ingress Caddy then proxies `waystead.co.uk` to it. This keeps the parent self-contained and uses the identical git-pull + compose deploy ritual.

**Canonicalisation (avoid duplicate-content SEO split):**
- `waystead.co.uk` = **canonical**; `www`, `waystead.uk`, `www.waystead.uk` → **301 redirect** to it (handled in the Caddy block).

**Parent compose project (`docker-compose.yml`):**
```yaml
services:
  web:
    image: nginx:alpine
    container_name: waystead-parent-web
    restart: unless-stopped
    volumes:
      - ./site:/usr/share/nginx/html:ro   # built static files live in ./site
    networks: [web]
networks:
  web:
    external: true
```

**Caddy blocks to ADD to `~/personal-command-center/infra/Caddyfile`** (keep all existing blocks; back up first with `cp Caddyfile Caddyfile.bak`):
```
waystead.co.uk {
    encode gzip
    reverse_proxy waystead-parent-web:80
}
www.waystead.co.uk, waystead.uk, www.waystead.uk {
    redir https://waystead.co.uk{uri} permanent
}
```

**Reload ingress Caddy & watch certs:**
```bash
cd ~/personal-command-center
docker compose -f infra/docker-compose.prod.yml restart caddy
docker logs -f pcc-prod-caddy        # look for "certificate obtained" for waystead.co.uk
```

> ⚠️ Restarting the ingress Caddy briefly blips ALL sites (a few seconds) — expected. No DB is involved, so the DB-backup ritual does not apply here; backing up the Caddyfile is the relevant safety step.

## 11. Analytics (optional, privacy-first)

If visitor metrics are wanted, use **Plausible** or self-hosted **Umami** rather than Google Analytics — better fit for a UK/GDPR brand and avoids triggering cookie-consent obligations. Cookieless by default.

## 12. Deliverables from Claude Code

1. Complete static site per the structure in §3.
2. All sections built and responsive per §5–6.
3. Brand tokens wired per §4; wordmark/chrome rules enforced.
4. SEO/social tags and favicons per §8.
5. `README.md` with local-preview and deploy-to-VM instructions.
6. (Optional) the Caddyfile snippet and DNS checklist for deployment.

## 13. Claude Code build prompt (paste-ready)

> Build the **Waystead parent website** as a **static site** (semantic HTML5 + plain CSS with custom properties + minimal vanilla JS). No backend, no database, no framework. Follow this spec exactly.
>
> Implement the brand tokens (Indigo #3D37A8, Teal #0F8B7E, Amber #F2A31D, Slate #4B5567, Ink #1B1A20, Paper #FAF8F3; fonts Sora for headings, Manrope for body). The parent chrome (header/hero/footer) uses only Ink on Paper; product accents appear only on their cards. The "Waystead" wordmark is always Ink, never recoloured.
>
> Build one `index.html` with these sections: sticky header (waymark + wordmark + nav: The idea/Products/About/Contact, with a mobile toggle); hero (waymark, "Waystead", "Know the way.", supporting sentence); "The idea" brand-story block; a responsive product grid that renders **only live products** from a data array [Scheduler indigo/live/"Your family's week, mapped."→scheduler.waystead.co.uk; Learning teal/live/"Clear steps to 11+."→learn.waystead.co.uk]; an About paragraph; a Contact section (mailto:hello@waystead.co.uk); and a footer (wordmark, live products only, contact, copyright, "Know the way.").
>
> Keep Tutoring (amber) and Consulting (slate) in the data with `live:false` so they're launch-ready, but **do not render them anywhere** while in development — not in the grid, footer, or nav. Launching later must be a single flag flip per §5.1. The grid's column count must follow the number of live products (2 now → 1 col mobile, 2 cols desktop, centred), adapting automatically as more go live.
>
> Requirements: mobile-first responsive (grid 1→2→4 columns), WCAG AA contrast, semantic headings, alt text, visible focus states, prefers-reduced-motion. Add SEO + Open Graph/Twitter tags (title "Waystead — Know the way.", og:image placeholder), lang="en-GB", favicon links, robots.txt, sitemap.xml, and Organization JSON-LD. Self-host fonts with font-display: swap. Use this file structure: [paste §3]. Also produce a README with local-preview and Oracle-VM deploy steps, and a Caddyfile snippet that serves waystead.co.uk and 301-redirects www + the .uk variants to the canonical .co.uk.
>
> I will provide the waymark SVG, favicon, and OG image exported from the design; use placeholders named per the file structure until then.

---

*Sequence: design in Claude Design → export logo/favicon/OG image → build with this spec in Claude Code → deploy to the Oracle VM behind Caddy → point DNS → verify HTTPS and redirects.*
