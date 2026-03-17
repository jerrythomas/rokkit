<script>
	import { Code } from '$lib/components/Story'
	import setup from './snippets/00-setup.js?raw'
	import options from './snippets/01-options.js?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		<code>@rokkit/unocss</code> exports a single <code>presetRokkit()</code> function — a complete
		UnoCSS preset that wires up Rokkit's color token system, semantic utility shortcuts, icon
		integration, and dark mode in one call.
	</p>

	<h2>Setup</h2>
	<p>
		Add <code>presetRokkit()</code> to your UnoCSS config. The CLI (<code>rokkit init</code>)
		writes this automatically:
	</p>
	<Code content={setup} language="javascript" />

	<h2>What presetRokkit adds</h2>
	<ul>
		<li>
			<strong>Z-scale color tokens</strong> — semantic utility classes like
			<code>bg-surface-z1</code>, <code>text-primary-z7</code>, <code>border-surface-z2</code>
			that automatically invert in dark mode
		</li>
		<li>
			<strong>Semantic color groups</strong> — <code>surface</code>, <code>primary</code>,
			<code>secondary</code>, <code>accent</code>, <code>success</code>, <code>warning</code>,
			<code>danger</code>, <code>info</code>
		</li>
		<li>
			<strong>Icon integration</strong> — loads configured icon collections for use with
			<code>i-solar:icon-name</code> utility classes
		</li>
		<li>
			<strong>Dark mode</strong> — data-attribute-based dark mode (<code>data-mode="dark"</code>)
			instead of CSS class
		</li>
		<li>
			<strong>Theme shortcuts</strong> — common component utility patterns
		</li>
	</ul>

	<h2>Configuration options</h2>
	<Code content={options} language="javascript" />

	<h2>Using utility classes</h2>
	<p>
		Always use utility classes for color tokens — not inline CSS variables. See
		<a href="/docs/theming/overview">Theming Overview</a> for the full utility class guide and
		z-depth token reference.
	</p>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/theming/overview">Theming Overview</a> — Data attributes, z-scale tokens,
			utility class patterns
		</li>
		<li>
			<a href="/docs/theming/color-system">Color System</a> — Z-depth token values by mode
		</li>
		<li>
			<a href="/docs/toolchain/cli">CLI</a> — <code>rokkit init</code> sets up this preset
			automatically
		</li>
	</ul>
</article>
