/**
 * Site-wide SEO metadata + helpers.
 *
 * Single source of truth for the canonical origin, default title/description,
 * and the social-share (Open Graph / Twitter) image. The `<Seo>` component
 * (lib/components/Seo.svelte) consumes this; routes feed per-page overrides
 * through `page.data.seo` (set in their `load`).
 *
 * Canonical origin is the `.com` domain — the `.org` mirror serves identical
 * content, so every page canonical-points here to consolidate ranking signals.
 */

export const SITE = {
	origin: 'https://rokkit.sensei-hq.com',
	name: 'Rokkit',
	/** Default <title> when a route doesn't set one. */
	title: 'Rokkit — data-driven Svelte 5 components',
	/** Default meta description (≤ ~160 chars for clean SERP snippets). */
	description:
		'Rokkit is a data-driven Svelte 5 component library and design system: components adapt to your data via field mapping, with built-in selection, validation, theming, keyboard nav, and accessibility.',
	/** Social-share card, 1200×630 PNG (X/Twitter doesn't render SVG og:image).
	 *  Rasterized from og-image.svg (the source of truth). */
	ogImage: '/og-image.png',
	twitter: '@senseihq',
	github: 'https://github.com/jerrythomas/rokkit',
	locale: 'en'
} as const

/**
 * Path prefixes that should NOT be indexed — interactive app shells and iframe
 * embeds, not content pages. Crawl budget + ranking concentrate on `/`,
 * `/guides/*`, and the component/API reference instead.
 */
export const NOINDEX_PREFIXES = ['/app', '/chat', '/chat-lab', '/embed', '/legacy'] as const

/** Per-page SEO overrides a route can return from `load` as `{ seo }`. */
export interface SeoData {
	title?: string
	description?: string
	/** Absolute or root-relative image URL; falls back to SITE.ogImage. */
	image?: string
	/** Open Graph type. Default 'website'. */
	type?: 'website' | 'article'
	/** Force-exclude from indexing (in addition to NOINDEX_PREFIXES). */
	noindex?: boolean
}

/** True when `pathname` falls under a no-index prefix. */
export function isNoindexPath(pathname: string): boolean {
	return NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p  }/`))
}

/** Resolve a possibly root-relative URL against the canonical origin. */
export function absoluteUrl(pathOrUrl: string): string {
	return pathOrUrl.startsWith('http') ? pathOrUrl : SITE.origin + pathOrUrl
}
