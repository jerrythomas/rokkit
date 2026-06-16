import { guides } from '$lib/guides'
import { SITE } from '$lib/seo'

// Prerendered to a static /sitemap.xml. Only indexable content routes are
// listed — the /app catalog and /chat shells are interactive (noindex), so
// they're intentionally excluded.
export const prerender = true

export function GET() {
	const urls = [
		{ loc: '/', priority: '1.0' },
		{ loc: '/guides', priority: '0.8' },
		...guides.map((g) => ({ loc: `/guides/${g.slug}`, priority: '0.7' }))
	]

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${ 
		urls
			.map(
				(u) =>
					`  <url><loc>${SITE.origin}${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
			)
			.join('\n') 
		}\n</urlset>\n`

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=3600'
		}
	})
}
