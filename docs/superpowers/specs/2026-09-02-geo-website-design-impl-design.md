# GEO Compass marketing site — design spec

**Date:** 2026-09-02
**Project:** `geo-website` (Astro 7, React island support, Tailwind v4)
**Source design:** Claude Design project `93e9f9a1-4ffe-44b4-b7dd-c0e67ca78af3`, file `GEO Compass Site v2.dc.html`

## Goal

Implement the `GEO Compass Site v2.dc.html` design as a static, SEO-optimised,
bilingual (fr/en) Astro site with a dark mode and maximum use of islands for
performance.

## Scope

One page: header, hero, 4-card feature grid, CTA band, donations section,
"Qu'est-ce que la GEO ?" explainer, footer. Two locales. No blog, no CMS, no
backend. Auth / legal links point to the existing app
`https://geo-compass-front-end.vercel.app`.

Out of scope: building any of those linked pages, analytics wiring, contact
forms, the actual donation flow.

## Rules (from the request)

- **Clean code:** one component per file, no more. Descriptive, readable names.
- **No ternaries in JSX.** Any conditional goes into a named variable declared
  above the return and used in the markup, or into a dedicated sub-component.
  Applies to `.tsx` islands and to `.astro` template expressions.
- **Islands everywhere sensible** for max performance — `.astro` static by
  default, React `.tsx` islands only where interactivity is required, hydrated
  with the narrowest directive (`client:idle` / `client:visible` / `client:media`).
- **Maximum Astro SEO tooling.**
- **i18n library:** Paraglide JS (`@inlang/paraglide-js`), fr + en.
- **Dark mode.**
- **A review agent** checks every change.

## Design facts extracted from the .dc.html

| Token | Value |
| --- | --- |
| Font | `Plus Jakarta Sans` (Google Fonts), weights 400/500/600/700; fallback `system-ui, sans-serif` |
| Accent green | `#0f7a54` |
| Ink / text | `#111413` primary, `#3d4442`, `#5b6360`, `#7b8380` secondary |
| Surfaces | `#fff` page, `#fafbfa` explainer band, `#f2f4f3` chips/buttons, `#dcdedd` image placeholders |
| Borders | `#ececec`, `#e6e9e8`, `#d7dbda` |
| Grid lines | `#eef0ef`; dot texture `#d9dedc` |
| Radius | 9–14px |
| Max content width | 1440px, centered |
| Hover | links → `#0f7a54`; chips → `#e6e9e8`; primary CTA → bg `#111413` / white |

Background: two fixed, `pointer-events:none`, `z-index:0` layers — a 56px grid
(`gcgrid`, 22s linear loop) and a 28px dot field (`gcdots`, 30s loop), both
radial-masked to fade below the hero. Content sits at `z-index:1`.
`support.js` is the design-canvas preview runtime — **not used in the build**;
`style-hover="..."` attributes in the source map to CSS `:hover` rules.

### Sections (top → bottom)

1. **Header** — logo (inline hexagon SVG + wordmark), "Se connecter" + "Créer un
   compte" chips linking to the app.
2. **Hero** (`#top`) — h1 "GEO-Compass", tagline "La GEO accessible à tous",
   underlined text link "Expliquer ce qu'est la GEO" → `#geo`.
3. **Features** (`#features`) — 2×2 grid (1 col on mobile). Each card: h2,
   16/10 media box, one-line paragraph (`max-width:46ch`).
   - "La GEO à moindre coût" — placeholder box
   - "Suivre chaque jour ses résultats" — `dashboard-light.png`, `object-position:top left`
   - "Historique de données" — placeholder box
   - "Qui parle de vous ?" — `dashboard-dark.png`, `object-position:top right`
4. **CTA band** — single "Créer un compte" button, hover inverts to dark.
5. **Donations** (`#dons`) — h2, paragraph (`60ch`), 16/9 placeholder box,
   "Soutenir le projet" outline button.
6. **Explainer** (`#geo`) — `#fafbfa` band, top border. Two-column grid
   (`0.8fr 1fr`, 80px gap, stacks on mobile): h2 "Qu'est-ce que la GEO ?" +
   lead paragraph and three labelled points.
7. **Footer** — "© 2026 GEO Compass" + legal/login links to the app.

Placeholder boxes keep their French captions ("Visuel à venir — …") as real
translated copy for now.

## Architecture

### Rendering & routing

- `output: 'static'`. Astro i18n routing: `defaultLocale: 'fr'`, `locales:
  ['fr','en']`, `prefixDefaultLocale: false` → `/` is French, `/en/` is English.
  (Matches design copy; sibling app defaults to `en` but that is a separate
  concern.)
- Pages: `src/pages/index.astro` (fr) and `src/pages/en/index.astro` (en). Both
  are thin — they set locale, render `<BaseLayout>` + the section components in
  order. Section components read strings through Paraglide messages, so the two
  page files stay near-identical and tiny.

### i18n — Paraglide JS

- `@inlang/paraglide-js` with its Vite plugin in `astro.config.mjs`.
- `project.inlang/settings.json`, messages in `messages/fr.json` + `messages/en.json`,
  namespaced keys (`header.*`, `hero.*`, `features.*`, `cta.*`, `donations.*`,
  `geo.*`, `footer.*`, `meta.*`).
- Compiled output `src/paraglide/` (git-ignored, regenerated on build/dev).
- Locale set per-request from the URL in `src/middleware.ts` via Paraglide's
  server middleware / `paraglideMiddleware`.
- The language switcher island imports `localizeHref` to build the counterpart
  URL.

### SEO tooling

- `@astrojs/sitemap` — i18n config so alternates are emitted.
- `astro-robots-txt` — generates `robots.txt` pointing at the sitemap.
- `src/components/Seo.astro` — one component: `<title>`, description, canonical,
  `hreflang` alternates (fr / en / x-default), Open Graph, Twitter card, theme-color.
- `src/components/StructuredData.astro` — JSON-LD `Organization` +
  `WebSite` / `SoftwareApplication`, injected once from `BaseLayout`.
- Per-locale `<html lang>`, semantic landmarks (`header`/`main`/`footer`),
  descriptive `alt` text (already in the design), `sitemap`/`robots` linked from `<head>`.
- OG image: static file in `public/` (`og.png`) — placeholder acceptable if not supplied.

### Dark mode

- `src/components/ThemeScript.astro` — tiny inline, render-blocking script in
  `<head>`: reads `localStorage.theme` else `prefers-color-scheme`, sets
  `class="dark"` on `<html>` before paint (no FOUC). One file, no framework.
- Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))` in `global.css`;
  every colour is a CSS variable with a `.dark` override — sections use the
  variables, not hard-coded hex.
- `src/components/ThemeToggle.tsx` — React island, `client:idle`. Toggles the
  class + persists to `localStorage`, `aria-pressed`, sun/moon SVG.
- Dark palette: dark-inverted neutrals, same `#0f7a54` accent (nudge lighter for
  contrast — a `--accent` dark value, tuned by the sections agent against WCAG AA).

### Islands (React `.tsx`, one per file)

| Island | Directive | Why |
| --- | --- | --- |
| `ThemeToggle.tsx` | `client:idle` | needs `localStorage` + click |
| `LanguageSwitcher.tsx` | `client:idle` | swaps locale, remembers choice |
| `MobileNav.tsx` | `client:media('(max-width: 767px)')` | only hydrate on small screens |

Everything else — all six sections, header shell, footer, background, SEO,
structured data — is static `.astro`. The animated background is pure CSS
(`@keyframes` already in the design), no JS.

### Component inventory (one file each)

```
src/layouts/BaseLayout.astro          page shell, <head>, background, slots
src/components/Seo.astro
src/components/StructuredData.astro
src/components/ThemeScript.astro
src/components/ThemeToggle.tsx         island
src/components/LanguageSwitcher.tsx    island
src/components/MobileNav.tsx           island
src/components/SiteHeader.astro
src/components/SiteFooter.astro
src/components/BackgroundGrid.astro    the two fixed CSS layers
src/components/sections/HeroSection.astro
src/components/sections/FeaturesSection.astro
src/components/sections/FeatureCard.astro      (reused 4×)
src/components/sections/CtaBand.astro
src/components/sections/DonationsSection.astro
src/components/sections/GeoExplainerSection.astro
src/components/sections/ExplainerPoint.astro   (reused 3×)
src/components/PlaceholderVisual.astro         the "visuel à venir" boxes
src/pages/index.astro                  fr
src/pages/en/index.astro               en
src/middleware.ts                      Paraglide locale from URL
src/styles/global.css                  tokens + dark variant + font
messages/fr.json  messages/en.json
project.inlang/settings.json
```

`SplitText.tsx` and the sample `Layout.astro` from the starter are removed if
unused after the hero is built (hero title may keep a lightweight entrance
animation via `SplitText` as a `client:visible` island — the sections agent
decides; if unused, delete it).

### Assets

`dashboard-light.png` and `dashboard-dark.png` cannot be pulled through the
design MCP (256 KiB `get_file` cap truncates them). **Prerequisite:** the user
exports both PNGs from the design project into `src/assets/`. Until then
`FeatureCard` renders `PlaceholderVisual` for those two cards too. Once present,
they load through `astro:assets` `<Image>` (width/height set, `loading="lazy"`,
`decoding="async"`, AVIF/WebP).

### Error handling

Static site — little runtime error surface. `astro check` + `tsc --noEmit` must
pass. `404.astro` optional (Vercel/host default is fine); skip unless trivial.
Missing message key → Paraglide falls back to the key at build; the review
agent greps for untranslated keys.

## Testing / verification

- `pnpm astro check` — zero errors.
- `pnpm build` — succeeds; `dist/` has `/index.html` and `/en/index.html` with
  correct `<html lang>`, hreflang alternates, sitemap, robots.txt.
- Manual: toggle dark mode (no flash on reload), switch language (stays on same
  section), mobile nav at <768px, keyboard-tab through header.
- Lighthouse (review agent): Performance ≥ 95, SEO 100, Accessibility ≥ 95,
  zero unnecessary hydration (check the islands payload).
- One tiny check committed: `src/paraglide`-independent unit is not meaningful
  here; instead an assert-style `scripts/check-locales.mjs` that fails if
  `fr.json` and `en.json` key sets differ.

## Work split — 3 herdr tabs / agents

Each tab = its own git worktree off `main`. Review agent gates every merge.
`pnpm` is the package manager (sibling project uses it).

### Tab 1 — `foundation`
Runs first; tabs 2–3 branch after it lands on `main`.
- `astro.config.mjs`: `@astrojs/react` (present), Tailwind (present), i18n
  routing, `@astrojs/sitemap`, `astro-robots-txt`, Paraglide Vite plugin,
  `site` URL, `output: 'static'`.
- `src/styles/global.css`: font import, design tokens as CSS vars, dark variant + overrides.
- `BaseLayout.astro`, `BackgroundGrid.astro`, `Seo.astro`, `StructuredData.astro`,
  `ThemeScript.astro`, `ThemeToggle.tsx`, `LanguageSwitcher.tsx`, `MobileNav.tsx`,
  `SiteHeader.astro`, `SiteFooter.astro`.
- `src/middleware.ts`, `project.inlang/settings.json`, `messages/{fr,en}.json`
  scaffold with `header.*`, `footer.*`, `meta.*` filled.
- `scripts/check-locales.mjs`.
- Deliverable: `pnpm build` green with an empty `<main>`.

### Tab 2 — `sections`
Branches from `main` after Tab 1.
- All `src/components/sections/*`, `PlaceholderVisual.astro`, `FeatureCard.astro`.
- `src/pages/index.astro` + `src/pages/en/index.astro`.
- Fills `features.*`, `hero.*`, `cta.*`, `donations.*`, `geo.*` in both message files.
- Wires `astro:assets` `<Image>` for the two dashboard PNGs (or placeholder until supplied).
- Responsive: 2-col → 1-col grid, explainer 2-col → stacked, `clamp()` type as in design.
- Dark-mode values for every section using the CSS vars; tunes `--accent` dark for AA.

### Tab 3 — `review` (continuous)
- After each push on a feature branch: `pnpm astro check`, `pnpm tsc --noEmit`,
  `pnpm build`, `node scripts/check-locales.mjs`, Lighthouse (via
  `@lhci/cli` or `npx unlighthouse`), `eslint` if configured.
- Enforces: one component per file; no ternaries in JSX / `.astro` expressions
  (conditions → named variable or sub-component); island directives are the
  narrowest that works; no `client:load`; no hard-coded hex outside
  `global.css`; both locales render; `alt` text present; heading order sane.
- Posts findings as a checklist per branch; approves or blocks the merge to `main`.
- Uses the `superpowers:requesting-code-review` / `receiving-code-review` flow.

### Merge order
`foundation` → `main`; then `sections` builds, `review` gates, merge to `main`;
final commit wires any supplied PNGs. Dark-mode + i18n are built into every
component from the start, not bolted on.

## Open items
1. User to export `dashboard-light.png` + `dashboard-dark.png` into `src/assets/`.
2. OG image (`public/og.png`) — supply or accept a generated placeholder.
3. `site` URL for `astro.config.mjs` / canonical (deploy domain?). Default
   assumption: `https://geo-compass.vercel.app` — confirm.
