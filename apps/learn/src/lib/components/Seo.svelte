<script lang="ts">
	/**
	 * Single source of truth for per-page <head> SEO. Rendered once in the root
	 * +layout.svelte; routes feed overrides via `page.data.seo` (set in `load`).
	 * Emits title, description, canonical, robots, Open Graph, Twitter card, and
	 * WebSite JSON-LD. Canonical/og:url use the canonical origin (SITE.origin) +
	 * the current path, so the `.org` mirror consolidates onto `.com`.
	 */
	import { page } from '$app/state'
	import { SITE, isNoindexPath, absoluteUrl, type SeoData } from '$lib/seo'

	let { seo = {} }: { seo?: SeoData } = $props()

	const path = $derived(page.url?.pathname ?? '/')
	const canonical = $derived(SITE.origin + path)
	const title = $derived(seo.title ?? SITE.title)
	const description = $derived(seo.description ?? SITE.description)
	const image = $derived(absoluteUrl(seo.image ?? SITE.ogImage))
	const ogType = $derived(seo.type ?? 'website')
	const noindex = $derived(Boolean(seo.noindex) || isNoindexPath(path))

	// JSON-LD WebSite schema. JSON.stringify output is safe (no user input); the
	// closing tag is split so it can't terminate this component's <script>.
	const jsonLd = $derived(
		`<script type="application/ld+json">${ 
			JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: SITE.name,
				url: SITE.origin,
				description: SITE.description
			}) 
			}</scr` + `ipt>`
	)
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}<meta name="robots" content="noindex, follow" />{/if}

	<meta property="og:type" content={ogType} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={image} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	<!-- eslint-disable-next-line svelte/no-at-html-tags — fixed, non-user JSON-LD -->
	{@html jsonLd}
</svelte:head>
