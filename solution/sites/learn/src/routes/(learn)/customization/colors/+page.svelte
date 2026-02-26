<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		Rokkit uses <a
			href="https://unocss.dev/"
			target="_blank"
			rel="noopener"
			class="text-primary-z7 underline">UnoCSS</a
		>
		for all styles and color utilities. To get started with UnoCSS in your SvelteKit project, follow
		the
		<a
			href="https://unocss.dev/integrations/vite#sveltekit"
			target="_blank"
			rel="noopener"
			class="text-primary-z7 underline">official UnoCSS SvelteKit integration guide</a
		>.
	</p>
	<p>
		For dark mode support, Rokkit recommends using the <code>data-mode</code> attribute on your root
		element (e.g., <code>&lt;html data-mode="dark"&gt;</code>). This approach is compatible with
		Rokkit's theme switcher component and enables seamless palette switching. However, you are free
		to use <code>media</code> or <code>class</code> strategies for dark mode if you prefer. If you
		want to use Rokkit's built-in theme switcher, be sure to use the <code>data-mode</code> attribute
		as shown in the example below.
	</p>
	<h2>Theme Mode Configuration</h2>
	<p>You can configure light/dark mode selectors in UnoCSS using the following pattern:</p>
	<Code {...storyBuilder.getFragment(0)} />

	<h2>Defining the Palette</h2>
	<p>
		Rokkit UI provides a powerful and flexible color mapping system that lets you easily adapt the
		UI to your brand or design needs. By default, Rokkit uses a set of colors from <code
			>@unocss/preset-mini/colors</code
		> along with some custom additions. You can use these built-in colors, or provide your own color
		set and mapping to override or extend the defaults.
	</p>
	<p>
		<strong>How does it work?</strong> Each semantic color role (like <code>primary</code>,
		<code>info</code>, <code>surface</code>, etc.) is mapped to a color name (such as
		<code>blue</code>, <code>cyan</code>, <code>stone</code>, etc.). You can override this mapping
		to use any built-in color, or provide your own custom color set and map roles to those. You do
		<em>not</em> need to provide a full color set—any colors or mappings you provide will be merged with
		the defaults, overriding only what you specify.
	</p>
	<p>
		For example, by default, the <code>info</code> role is mapped to <code>cyan</code>. If you want
		to use the built-in <code>sky</code> color for info instead, just update the mapping. Or, if you
		want to use a completely custom color (e.g., <code>my-custom-info</code>), add your color and
		map <code>info</code> to it. You only need to provide the color and mapping you want to change—everything
		else stays as-is.
	</p>

	<h3>Simple Example</h3>
	<Code {...storyBuilder.getFragment(1)} />

	<h3>Custom Colors Example</h3>
	<Code {...storyBuilder.getFragment(2)} />

	<h2>Semantic Color System</h2>
	<p>
		Instead of hardcoded color values, use semantic shortcuts like <code>bg-surface-z1</code>
		through <code>bg-surface-z10</code> (and similarly for primary, secondary, etc.). These map to palette
		shades and automatically adapt between light and dark modes.
	</p>
	<table class="border-surface-z4 my-6 w-full rounded border">
		<thead>
			<tr class="bg-surface-z2 text-surface-z10">
				<th class="px-3 py-2 text-left">Shortcut</th>
				<th class="px-3 py-2 text-left">Light Mode</th>
				<th class="px-3 py-2 text-left">Dark Mode</th>
			</tr>
		</thead>
		<tbody>
			<tr><td class="px-3 py-1">bg-surface-z1</td><td>bg-surface-50</td><td>bg-surface-950</td></tr>
			<tr><td class="px-3 py-1">bg-surface-z2</td><td>bg-surface-100</td><td>bg-surface-900</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z3</td><td>bg-surface-200</td><td>bg-surface-800</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z4</td><td>bg-surface-300</td><td>bg-surface-700</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z5</td><td>bg-surface-500</td><td>bg-surface-600</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z6</td><td>bg-surface-600</td><td>bg-surface-500</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z7</td><td>bg-surface-700</td><td>bg-surface-300</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z8</td><td>bg-surface-800</td><td>bg-surface-200</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z9</td><td>bg-surface-900</td><td>bg-surface-100</td></tr
			>
			<tr><td class="px-3 py-1">bg-surface-z10</td><td>bg-surface-950</td><td>bg-surface-50</td></tr
			>
		</tbody>
	</table>

	<h3>How to Use Semantic Colors</h3>
	<p>
		Rokkit provides helper functions to generate all semantic color shortcuts for your palette. In
		your UnoCSS config, use:
	</p>
	<Code {...storyBuilder.getFragment(3)} />

	<p>
		This will generate classes like <code>bg-surface-z1</code>, <code>text-primary-z10</code>,
		<code>border-info-z4</code>, and more, all mapped to your palette and adaptive to dark mode.
	</p>

	<h3>Usage Example</h3>
	<Code {...storyBuilder.getFragment(4)} />

	<p class="text-surface-z8 mt-2 text-sm">
		Switching to dark mode (e.g., <code>[data-mode="dark"]</code> on your root element) will automatically
		invert the mapping.
	</p>

	<h2>Skin Shortcuts</h2>
	<p>
		Rokkit leverages UnoCSS shortcuts to define "skins"—named style sets that bundle palette,
		spacing, and other visual rules. This makes it easy to switch themes or support multiple branded
		experiences.
	</p>
	<Code {...storyBuilder.getFragment(5)} />
	<p>Switching the skin class instantly updates the look and feel of all nested components.</p>
	<p>
		<strong>Usage Example:</strong>
	</p>
	<Code {...storyBuilder.getFragment(6)} />

	<h2>Further Reading & Playground</h2>
	<ul class="ml-6 list-disc">
		<li>
			<a href="./play" class="text-primary-z7 underline">Palette Playground</a> &mdash; Try out palette
			and skin switching interactively.
		</li>
		<li>
			<a href="/customization/overview" class="text-primary-z7 underline">Customization Overview</a>
		</li>
		<li>
			<a href="/customization/styles" class="text-primary-z7 underline"
				>Style & Skin Customization</a
			>
		</li>
		<li>
			<a href="/customization/icons" class="text-primary-z7 underline">Icon Customization</a>
		</li>
	</ul>
</article>
