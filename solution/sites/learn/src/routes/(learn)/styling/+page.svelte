<script>
	import { Code } from '$lib/components/Story'
	import themeImports from './snippets/00-theme-imports.css?raw'
	import dataAttributes from './snippets/01-data-attributes.css?raw'
	import customTheme from './snippets/02-custom-theme.css?raw'
	import skins from './snippets/03-skins.svelte?raw'
	import componentClass from './snippets/04-component-class.svelte?raw'
</script>

<article data-article-root>
	<p class="text-[1.0625rem] leading-7 text-surface-z6 mb-8">
		Rokkit separates layout CSS from visual theme CSS using <code>data-*</code> attribute
		selectors. This clean architecture makes it easy to customize, override, or build entirely
		new themes.
	</p>

	<h2>Theme Architecture</h2>
	<p>
		Every Rokkit component uses two layers of CSS:
	</p>
	<ul>
		<li><strong>Base (layout)</strong> — Positioning, sizing, spacing. Rarely needs changing.</li>
		<li><strong>Theme (visual)</strong> — Colors, borders, shadows, transitions. Swap or override freely.</li>
	</ul>
	<Code content={themeImports} language="css" />

	<h2>Data-Attribute Hooks</h2>
	<p>
		Components expose styling hooks via <code>data-*</code> attributes instead of class names.
		This avoids naming collisions and makes selectors self-documenting:
	</p>
	<Code content={dataAttributes} language="css" />

	<h2>Common State Attributes</h2>
	<p>
		Components share a consistent set of state attributes across all components:
	</p>
	<table>
		<thead>
			<tr><th>Attribute</th><th>When Present</th><th>Components</th></tr>
		</thead>
		<tbody>
			<tr><td><code>data-selected</code></td><td>Item is selected</td><td>List, Select, Tabs, Toggle</td></tr>
			<tr><td><code>data-focused</code></td><td>Item has keyboard focus</td><td>All navigable</td></tr>
			<tr><td><code>data-disabled</code></td><td>Item is disabled</td><td>All</td></tr>
			<tr><td><code>data-expanded</code></td><td>Group is expanded</td><td>List, Tree, Select</td></tr>
			<tr><td><code>data-open</code></td><td>Dropdown is open</td><td>Select, Menu</td></tr>
		</tbody>
	</table>

	<h2>Building a Custom Theme</h2>
	<p>
		Create your own theme by writing CSS that targets data attributes. Start by copying
		the Rokkit theme and modifying colors, borders, and transitions:
	</p>
	<Code content={customTheme} language="css" />

	<h2>Skins</h2>
	<p>
		Rokkit provides pre-built skin sets that bundle color palettes and style variations.
		Apply a skin by adding a class to your root element:
	</p>
	<Code content={skins} language="svelte" />

	<h2>Component-Level Styling</h2>
	<p>
		Every component accepts a <code>class</code> prop for adding custom CSS classes.
		Use this for one-off adjustments without creating new theme rules:
	</p>
	<Code content={componentClass} language="svelte" />

	<h2>Related</h2>
	<ul>
		<li><a href="/color-system">Color System</a> — Semantic color tokens and palettes</li>
		<li><a href="/icons">Icons</a> — Icon mapping and customization</li>
	</ul>
</article>
