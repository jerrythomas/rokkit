<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import palette from './snippets/00-palette.js?raw'
</script>

<article data-article-root>
	<p>
		Whitelabeling means replacing Rokkit's default colors with your own brand palette. Because the
		entire color system is driven by CSS custom properties, a full rebrand requires only a
		<code>palette</code> override in your UnoCSS config — no CSS overrides needed:
	</p>
	<Code content={palette} language="javascript" />
	<p>
		For per-client whitelabeling (multiple palettes at runtime), use CSS custom property overrides
		scoped to a wrapper element. Each client's palette is a small CSS block that sets the
		<code>--color-primary-*</code> and <code>--color-secondary-*</code> variables:
	</p>
	<pre><code
			>{`.client-acme {
  --color-primary-500: #e11d48;
  --color-secondary-500: #7c3aed;
}`}</code
		></pre>
	<p>
		Wrap each tenant's content in a <code>&lt;div class="client-acme"&gt;</code> and all Rokkit components
		inside will use that palette automatically. This works with any number of palettes on the same page
		simultaneously.
	</p>
</article>
