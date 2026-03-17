<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import usage from './color-system/snippets/00-usage.svelte?raw'
	import customPalette from './color-system/snippets/01-custom-palette.js?raw'
	import darkMode from './color-system/snippets/02-dark-mode.svelte?raw'
	import themeImports from './styling/snippets/00-theme-imports.css?raw'
	import dataAttributes from './styling/snippets/01-data-attributes.css?raw'
	import customTheme from './styling/snippets/02-custom-theme.css?raw'
	import skins from './styling/snippets/03-skins.svelte?raw'
	import componentClass from './styling/snippets/04-component-class.svelte?raw'
</script>

<article data-article-root>
	<h1>Theming</h1>
	<p>
		Rokkit separates layout CSS (structural) from theme CSS (visual). Components ship unstyled with <code
			>data-*</code
		> attribute hooks. Themes provide the visual layer — colors, radii, shadows — without touching structure.
	</p>

	<h2>Overview</h2>
	<p>Add a data attribute to <code>&lt;html&gt;</code> and import the theme CSS:</p>
	<pre><code>&lt;html data-style="rokkit" data-mode="dark"&gt;</code></pre>

	<h2>Color System</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit uses semantic z-depth color tokens that automatically adapt between light and dark modes.
		The system provides consistent visual hierarchy without manual color management.
	</p>

	<h3>Z-Depth Tokens</h3>
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

	<h3>Color Palettes</h3>
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

	<h3>Usage</h3>
	<p>
		Use z-depth tokens as UnoCSS utility classes. The token resolves to the correct shade for the
		current mode (light or dark):
	</p>
	<Code content={usage} language="svelte" />

	<h3>Customizing the Palette</h3>
	<p>
		Override the default colors by passing a custom palette to <code>themeRules()</code>
		in your UnoCSS config:
	</p>
	<Code content={customPalette} language="javascript" />

	<h3>Dark Mode</h3>
	<p>
		Z-depth tokens automatically invert in dark mode. Set <code>data-mode="dark"</code> on your root
		element, and all <code>z1-z10</code> values flip to their dark equivalents. No additional CSS needed.
	</p>
	<p>
		Use the <code>ThemeSwitcherToggle</code> component from <code>@rokkit/app</code> to let users toggle
		between light, dark, and system modes:
	</p>
	<Code content={darkMode} language="svelte" />

	<h2>Styling</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit separates layout CSS from visual theme CSS using <code>data-*</code> attribute selectors. This
		clean architecture makes it easy to customize, override, or build entirely new themes.
	</p>

	<h3>Theme Architecture</h3>
	<p>Every Rokkit component uses two layers of CSS:</p>
	<ul>
		<li><strong>Base (layout)</strong> — Positioning, sizing, spacing. Rarely needs changing.</li>
		<li>
			<strong>Theme (visual)</strong> — Colors, borders, shadows, transitions. Swap or override freely.
		</li>
	</ul>
	<Code content={themeImports} language="css" />

	<h3>Data-Attribute Hooks</h3>
	<p>
		Components expose styling hooks via <code>data-*</code> attributes instead of class names. This avoids
		naming collisions and makes selectors self-documenting:
	</p>
	<Code content={dataAttributes} language="css" />

	<h3>Common State Attributes</h3>
	<p>Components share a consistent set of state attributes across all components:</p>
	<table>
		<thead>
			<tr><th>Attribute</th><th>When Present</th><th>Components</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>data-selected</code></td><td>Item is selected</td><td
					>List, Select, Tabs, Toggle</td
				></tr
			>
			<tr
				><td><code>data-focused</code></td><td>Item has keyboard focus</td><td>All navigable</td
				></tr
			>
			<tr><td><code>data-disabled</code></td><td>Item is disabled</td><td>All</td></tr>
			<tr
				><td><code>data-expanded</code></td><td>Group is expanded</td><td>List, Tree, Select</td
				></tr
			>
			<tr><td><code>data-open</code></td><td>Dropdown is open</td><td>Select, Menu</td></tr>
		</tbody>
	</table>

	<h3>Building a Custom Theme</h3>
	<p>
		Create your own theme by writing CSS that targets data attributes. Start by copying the Rokkit
		theme and modifying colors, borders, and transitions:
	</p>
	<Code content={customTheme} language="css" />

	<h3>Skins</h3>
	<p>
		Rokkit provides pre-built skin sets that bundle color palettes and style variations. Apply a
		skin by adding a class to your root element:
	</p>
	<Code content={skins} language="svelte" />

	<h3>Component-Level Styling</h3>
	<p>
		Every component accepts a <code>class</code> prop for adding custom CSS classes. Use this for one-off
		adjustments without creating new theme rules:
	</p>
	<Code content={componentClass} language="svelte" />

	<h2>Density</h2>
	<p class="text-surface-z5">Coming soon.</p>

	<h2>Whitelabeling</h2>
	<p class="text-surface-z5">Coming soon.</p>
</article>
