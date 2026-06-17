// Guide content is project-authored markdown (no user input), and the
// list of guides is known at build time — so pre-render every /guides/*
// route to static HTML. Faster initial paint, better SEO, no server
// runtime needed for this section.
export const prerender = true

// Default SEO for the guides section. The index page uses this as-is; each
// /guides/[slug] page overrides it with the guide's own title + description.
export const load = () => ({
	seo: {
		title: 'Guides — Rokkit',
		description:
			'Practical guides for building with Rokkit — getting started, data binding, composability, theming, and the CLI toolchain.'
	}
})
