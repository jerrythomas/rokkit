<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import presetIcons from './snippets/01-preset-icons.js?raw'
	import customBundle from './snippets/03-custom-bundle.sh?raw'
	import glyphData from '@rokkit/icons/glyph.json'

	const GLYPH_VARIANTS = ['', '-outline', '-solid', '-duotone-outline']

	// Unique base names for glyph icons (strip variant suffixes)
	const glyphBases = [
		...new Set(
			Object.keys(glyphData.icons).map((n) => n.replace(/-duotone-outline$|-outline$|-solid$/, ''))
		)
	].sort()
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit ships curated icon sets as Iconify-compatible JSON bundles, fully tree-shaken by UnoCSS.
		Use semantic icons for component state UI; glyph icons for general-purpose application icons.
	</p>

	<h2>Collections</h2>
	<table>
		<thead>
			<tr><th>Import path</th><th>Prefix</th><th>Count</th><th>Contents</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>@rokkit/icons/semantic.json</code></td><td>built-in (<code>action-add</code>)</td
				><td>376</td><td>Semantic UI icons for Rokkit components — 94 icons × 4 variants</td></tr
			>
			<tr
				><td><code>@rokkit/icons/glyph.json</code></td><td><code>i-glyph:</code></td><td>637</td><td
					>General-purpose glyph icons, 4 variants each</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/auth.json</code></td><td><code>i-logo:</code></td><td>107</td><td
					>Auth provider logos</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/app.json</code></td><td><code>i-app:</code></td><td>36</td><td
					>Application-level icons</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/twotone.json</code></td><td><code>i-twotone:</code></td><td>4</td
				><td>Two-tone icons</td></tr
			>
		</tbody>
	</table>

	<h2>Configuration</h2>
	<p>
		Load collections in <code>rokkit.config.js</code> using the <code>icons</code> key. The key name you
		use becomes the UnoCSS class prefix:
	</p>
	<Code content={presetIcons} language="javascript" />
	<p>
		With the config above, use <code>i-glyph:database</code>, <code>i-app:alert-bell</code>,
		<code>i-logo:google</code>. Any Iconify-compatible JSON file works — including third-party sets
		like <code>@iconify-json/solar</code>.
	</p>

	<h2>Semantic Icons</h2>
	<p>
		The semantic collection contains 94 icons used internally by Rokkit components for state and
		interaction UI. The preset registers them as shorthand aliases — use the icon name directly as a
		class, e.g. <code>action-add</code>. Examples:
	</p>
	<div class="mb-4 flex flex-wrap gap-3">
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="action-add text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">action-add</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="action-delete text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">action-delete</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="accordion-closed text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">accordion-closed</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="accordion-opened text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">accordion-opened</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="checkbox-checked text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">checkbox-checked</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="checkbox-unchecked text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">checkbox-unchecked</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="node-open text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">node-open</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="node-closed text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">node-closed</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="mode-dark text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">mode-dark</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="mode-light text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">mode-light</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="sort-asc text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">sort-asc</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="sort-desc text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">sort-desc</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="navigate-up text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">navigate-up</code
			>
		</div>
		<div class="border-surface-z2 flex flex-col items-center gap-1 rounded border p-2">
			<span class="navigate-down text-surface-z8 text-xl"></span><code
				class="text-surface-z5 text-[10px]">navigate-down</code
			>
		</div>
	</div>
	<p>
		Browse the full set in the <a href="/playground/icons">Icon Browser playground</a>.
	</p>

	<h2>Glyph Icons (160 icons × 4 variants)</h2>
	<p>
		The <code>glyph</code> collection has 160 base icons, each available in four variants: default,
		<code>-outline</code>, <code>-solid</code>, and <code>-duotone-outline</code>. Use as
		<code>i-glyph:&#123;name&#125;</code>.
	</p>
	<div
		class="border-surface-z2 mb-4 grid grid-cols-4 gap-1 rounded border p-2 text-center text-xs font-medium"
	>
		<span>default</span>
		<span>-outline</span>
		<span>-solid</span>
		<span>-duotone-outline</span>
	</div>
	<div class="grid gap-1" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">
		{#each glyphBases as base}
			<div class="border-surface-z2 flex items-center gap-2 rounded border px-2 py-1">
				{#each GLYPH_VARIANTS as variant}
					<span
						class="i-glyph:{base}{variant} text-surface-z8 shrink-0 text-lg"
						title="{base}{variant}"
					></span>
				{/each}
				<code class="text-surface-z5 truncate text-[10px]">{base}</code>
			</div>
		{/each}
	</div>

	<h2>Building Custom Icon Sets</h2>
	<p>
		Use the Rokkit CLI to bundle your own SVG folders into the same Iconify JSON format. Each
		subfolder becomes one JSON file:
	</p>
	<Code content={customBundle} language="bash" />
	<p>
		See <a href="/docs/toolchain/cli">CLI reference</a> for the full flag reference and config file format.
	</p>
</article>
