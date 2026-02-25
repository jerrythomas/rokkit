<script>
	import { Code, StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		Rokkit UI provides a powerful <strong>Theme</strong> class for managing palettes, semantic color
		shortcuts, skins, and more. This page covers practical usage of the Theme API, configuration patterns,
		and code examples for real-world customization.
	</p>

	<h2>Theme API Overview</h2>
	<ul>
		<li>
			<strong>getPalette(mapping)</strong>: Returns a skin shortcut for a palette mapping.
			<Code {...storyBuilder.getFragment(2)} />
		</li>
		<li>
			<strong>getShortcuts(role)</strong>: Generates semantic color shortcuts for a given role
			(e.g., <code>'surface'</code>, <code>'primary'</code>).
		</li>
		<li>
			<strong>getColorRules(mapping)</strong>: Returns the full color rule set for UnoCSS’s theme
			configuration, based on your palette mapping.
		</li>
	</ul>

	<h2>Example: Using Theme in UnoCSS Configuration</h2>
	<p>
		Below is a typical UnoCSS config using the Theme API to define skins, semantic color shortcuts,
		and icon mappings:
	</p>
	<Code {...storyBuilder.getFragment(0)} />

	<h2>Theme API Usage Example</h2>
	<p>
		Here’s how you might use the Theme class directly in your code to generate palette and
		shortcuts:
	</p>
	<Code {...storyBuilder.getFragment(1)} />

	<h2>Further Reading</h2>
	<ul>
		<li><a href="/customization/overview">Customization Overview</a></li>
		<li><a href="/customization/details">Customization Details (this page)</a></li>
		<li><a href="/theming/colors">Theming & Colors</a></li>
		<li><a href="/customization/icons">Icon Customization</a></li>
		<li><a href="/customization/styles">Style & Skin Customization</a></li>
	</ul>
</article>
