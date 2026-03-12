<script>
	import { Code } from '$lib/components/Story'
	import usage from './snippets/00-usage.svelte?raw'
	import customPalette from './snippets/01-custom-palette.js?raw'
	import darkMode from './snippets/02-dark-mode.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit uses semantic z-depth color tokens that automatically adapt between light and dark modes.
		The system provides consistent visual hierarchy without manual color management.
	</p>

	<h2>Z-Depth Tokens</h2>
	<p>
		Colors use a numbered z-depth system (<code>z1</code> through <code>z10</code>) where lower
		numbers are subtle and higher numbers are prominent:
	</p>
	<table>
		<thead>
			<tr><th>Token</th><th>Light Mode</th><th>Dark Mode</th><th>Usage</th></tr>
		</thead>
		<tbody>
			<tr><td><code>z1</code></td><td>50</td><td>950</td><td>Subtle backgrounds</td></tr>
			<tr><td><code>z2</code></td><td>100</td><td>900</td><td>Borders, dividers</td></tr>
			<tr><td><code>z3</code></td><td>200</td><td>800</td><td>Hover backgrounds</td></tr>
			<tr><td><code>z4</code></td><td>300</td><td>700</td><td>Active states</td></tr>
			<tr><td><code>z5</code></td><td>400</td><td>600</td><td>Muted text</td></tr>
			<tr><td><code>z6</code></td><td>500</td><td>500</td><td>Body text</td></tr>
			<tr><td><code>z7</code></td><td>600</td><td>400</td><td>Emphasis text</td></tr>
			<tr><td><code>z8</code></td><td>700</td><td>300</td><td>Headings</td></tr>
			<tr><td><code>z9</code></td><td>800</td><td>200</td><td>High contrast</td></tr>
			<tr><td><code>z10</code></td><td>900</td><td>100</td><td>Maximum contrast</td></tr>
		</tbody>
	</table>

	<h2>Color Palettes</h2>
	<p>Rokkit includes these semantic color groups:</p>
	<ul>
		<li><code>surface</code> — Neutral grays for backgrounds, text, and borders</li>
		<li><code>primary</code> — Brand color for primary actions and focus states</li>
		<li><code>secondary</code> — Accent color for highlights and active indicators</li>
		<li><code>accent</code> — Additional emphasis color</li>
		<li>
			<code>success</code>, <code>warning</code>, <code>danger</code>, <code>info</code> — Status colors
		</li>
	</ul>

	<h2>Usage</h2>
	<p>
		Use z-depth tokens as UnoCSS utility classes. The token resolves to the correct shade for the
		current mode (light or dark):
	</p>
	<Code content={usage} language="svelte" />

	<h2>Customizing the Palette</h2>
	<p>
		Override the default colors by passing a custom palette to <code>themeRules()</code>
		in your UnoCSS config:
	</p>
	<Code content={customPalette} language="javascript" />

	<h2>Dark Mode</h2>
	<p>
		Z-depth tokens automatically invert in dark mode. Set <code>data-mode="dark"</code> on your root
		element, and all <code>z1-z10</code> values flip to their dark equivalents. No additional CSS needed.
	</p>
	<p>
		Use the <code>ThemeSwitcherToggle</code> component from <code>@rokkit/app</code> to let users toggle
		between light, dark, and system modes:
	</p>
	<Code content={darkMode} language="svelte" />

	<h2>Related</h2>
	<ul>
		<li><a href="/styling">Styling</a> — Theme architecture and CSS hooks</li>
		<li><a href="/icons">Icons</a> — Icon mapping and customization</li>
	</ul>
</article>
