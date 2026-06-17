# SEO Follow-ups — Indexable Component Docs + PNG OG Image

**Date:** 2026-06-16
**Status:** Shipped 2026-06-16 (commit `feeede85`). Both follow-ups done:
prerendered indexable `/components` index + `/components/[name]` (all 49 catalog
components, per-page `<Seo>`, in the sitemap) as the content counterpart to the
noindex `/app` shell; and a rasterized 1200×630 `og-image.png` (X/Twitter-
compatible) with `SITE.ogImage` pointing at it (SVG kept as source).
**Site Applicability:** `apps/learn` (routes + static assets).

## Context

The SEO baseline is shipped: `<Seo>` component (title/description/canonical/OG/
Twitter/JSON-LD), `robots.txt`, prerendered `/sitemap.xml`, `og-image.svg`,
`theme-color`, and `noindex` on the interactive shells. Canonical origin is
`https://rokkit.sensei-hq.com` (the `.org` mirror consolidates onto it). Two
known gaps remain.

## 1. Indexable component documentation (higher value)

The component catalog lives under `/app/*` (`/app`, `/app/catalog`, `/app/<comp>`)
— the interactive chat/canvas shell — which is **`noindex`** (it's an app, not
content). So the per-component docs are **not indexable**: searches like
"rokkit tree component" or "svelte data table" can't surface them, even though
that's exactly the long-tail traffic a component library wants.

Options (pick one):
- **Static doc routes** — a prerendered `/components` + `/components/[name]` set
  rendering each component's doc (markdown + a static example), indexable, with
  per-component `<Seo>` (title/description) and added to the sitemap. The
  interactive `/app` catalog stays as the "playground" view.
- **Make `/app/catalog/[name]` SSR + indexable** — drop those specific routes
  from `NOINDEX_PREFIXES`, ensure they server-render real content (not just the
  shell), and sitemap them. Riskier (the shell is heavy/client-driven).

Recommended: the dedicated static `/components/*` routes — cleanest crawlable
surface, decoupled from the app shell. Wire each into the sitemap + `<Seo>`.

## 2. PNG Open Graph image (quick polish)

`static/og-image.svg` (1200×630) is referenced as `og:image`. SVG OG images work
in Google/Slack/Facebook but **X/Twitter doesn't render them** → no card preview
on X. Export a `og-image.png` (1200×630) from the SVG and point `SITE.ogImage`
(in `lib/seo.ts`) at it. Keep the SVG as the source of truth.

- Could be a build step (rasterize the SVG with `sharp`/`resvg`) or a committed
  static PNG. A committed PNG is simplest.

## Out of scope

- Per-guide OG images (the shared card is fine for v1).
- Structured data beyond `WebSite` (e.g. `BreadcrumbList`, `TechArticle` on
  guides) — nice-to-have, low priority.

## Deliverable

Indexable `/components/*` (or un-noindexed catalog) in the sitemap with per-page
`<Seo>`, and a PNG `og:image` for X/Twitter compatibility.
