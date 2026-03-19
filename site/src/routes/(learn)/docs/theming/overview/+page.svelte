<script>
	import { Code } from '$lib/components/Story'
	import activateTheme from './snippets/00-activate-theme.html?raw'
	import utilityClasses from './snippets/01-utility-classes.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit separates layout CSS (structural) from theme CSS (visual). Components ship unstyled with <code
			>data-*</code
		> attribute hooks. Themes provide the visual layer — colors, radii, shadows — without touching structure.
	</p>

	<h2>Activating a theme</h2>
	<p>
		Add <code>data-style</code> to your <code>&lt;html&gt;</code> element and import the theme CSS. The
		style attribute selects the visual personality:
	</p>
	<Code content={activateTheme} language="html" />
	<p>Four built-in styles are available:</p>
	<table>
		<thead>
			<tr><th>Style</th><th>Personality</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>rokkit</code></td><td>Rich gradients, glowing borders, and vibrant accents</td
				></tr
			>
			<tr
				><td><code>minimal</code></td><td
					>Clean, understated styling with subtle borders and soft backgrounds</td
				></tr
			>
			<tr
				><td><code>material</code></td><td
					>Material Design–inspired with elevation shadows and depth</td
				></tr
			>
			<tr
				><td><code>glass</code></td><td
					>Glassmorphism with backdrop blur, transparency, and subtle borders</td
				></tr
			>
		</tbody>
	</table>
	<p>
		<code>data-style</code> can be set on any ancestor element, not just <code>&lt;html&gt;</code>.
		Multiple themes can coexist on the same page — components inherit the nearest ancestor's
		<code>data-style</code>.
	</p>

	<h2>Data attributes</h2>
	<p>Four data attributes control the visual presentation:</p>
	<table>
		<thead>
			<tr><th>Attribute</th><th>Values</th><th>Purpose</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>data-style</code></td><td
					><code>rokkit</code>, <code>minimal</code>, <code>material</code></td
				><td>Visual personality</td></tr
			>
			<tr
				><td><code>data-mode</code></td><td><code>light</code>, <code>dark</code></td><td
					>Light/dark mode</td
				></tr
			>
			<tr
				><td><code>data-palette</code></td><td>color variant name</td><td>Color skin override</td
				></tr
			>
			<tr
				><td><code>data-density</code></td><td
					><code>compact</code>, <code>default</code>, <code>comfortable</code></td
				><td>Spacing density (planned)</td></tr
			>
		</tbody>
	</table>

	<h2>UnoCSS utility classes</h2>
	<p>
		Use UnoCSS utility classes to apply theme colors — not inline CSS variables. The pattern is
		<code>&#123;bg|text|border&#125;-&#123;role&#125;-z&#123;n&#125;</code>, where <code>role</code>
		is a semantic color group and <code>n</code> is a z-depth token (1–10):
	</p>
	<Code content={utilityClasses} language="svelte" />
	<p>
		Z-depth tokens automatically invert between light and dark mode — no extra CSS needed. See
		<a href="/docs/theming/color-system">Color System</a> for the full z-depth reference.
	</p>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/theming/color-system">Color System</a> — z-depth tokens, palettes, dark mode
		</li>
		<li>
			<a href="/docs/theming/styling">Styling</a> — theme CSS architecture, data-attribute hooks, custom
			themes
		</li>
		<li><a href="/docs/utilities/unocss">UnoCSS</a> — <code>presetRokkit</code> setup</li>
	</ul>
</article>
