<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The Rokkit Chart library includes a comprehensive color palette system designed specifically for
		data visualization. It provides consistent, accessible color schemes that work well across
		different chart types and ensure proper contrast for readability.
	</p>

	<h1>Key Features:</h1>
	<ul>
		<li>Multiple color palettes with 9 shades each</li>
		<li>Accessibility-focused color combinations</li>
		<li>Consistent naming and organization</li>
		<li>Easy integration with chart components</li>
		<li>Reactive color system using Svelte stores</li>
		<li>Support for custom palette extensions</li>
	</ul>

	<h1>Palette Overview</h1>
	<p>Here's a demonstration of the available color palettes in the Rokkit Chart system:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />
	<h1>Basic Usage</h1>
	<p>
		Access color palettes through the reactive `swatch` store from `@rokkit/chart/lib`. This store
		provides all available colors organized by palette name and shade.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<h1>Color Structure</h1>
	<p>
		Each color palette contains 9 shades numbered from 100 (lightest) to 900 (darkest). The 500
		shade typically serves as the base color for each palette.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Available Palettes</h1>
			<ul>
				<li><strong>blue</strong>: Primary blue tones</li>
				<li><strong>green</strong>: Success and growth indicators</li>
				<li><strong>orange</strong>: Warning and attention colors</li>
				<li><strong>red</strong>: Error and critical states</li>
			</ul>
		</div>

		<div data-card>
			<h1>Shade Guidelines</h1>
			<ul>
				<li><strong>100-300</strong>: Light backgrounds and highlights</li>
				<li><strong>400-600</strong>: Primary interface colors</li>
				<li><strong>700-900</strong>: Text and strong accents</li>
			</ul>
		</div>
	</div>
	<h1>Multi-Series Charts</h1>
	<p>
		When working with charts that display multiple data series, you can create color arrays using
		different palettes or shades to ensure visual distinction between data sets.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<h1>Color Selection Best Practices</h1>
	<ul>
		<li><strong>Contrast</strong>: Ensure sufficient contrast between adjacent colors</li>
		<li><strong>Accessibility</strong>: Consider colorblind-friendly combinations</li>
		<li><strong>Consistency</strong>: Use the same color for the same data type across charts</li>
		<li><strong>Hierarchy</strong>: Use darker shades for more important data</li>
	</ul>
	<h1>Chart Integration</h1>
	<p>
		The palette system integrates seamlessly with all Rokkit Chart components. Colors can be applied
		to various chart elements including data series, backgrounds, borders, and text.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Chart Elements</h1>
			<ul>
				<li><strong>Data Series</strong>: Line colors, bar fills, point colors</li>
				<li><strong>Backgrounds</strong>: Chart area, grid backgrounds</li>
				<li><strong>Text</strong>: Labels, legends, annotations</li>
				<li><strong>Borders</strong>: Chart outlines, axis lines</li>
			</ul>
		</div>

		<div data-card>
			<h1>Reactive Updates</h1>
			<ul>
				<li>Colors update automatically when palette changes</li>
				<li>Consistent theme switching across all charts</li>
				<li>Real-time color preview in development</li>
				<li>Smooth transitions between color states</li>
			</ul>
		</div>
	</div>
	<h1>Custom Palettes</h1>
	<p>
		While Rokkit Chart provides a comprehensive set of default palettes, you can extend the system
		with custom color schemes that match your brand or specific visualization needs.
	</p>

	<h1>Extending the Palette System</h1>
	<ul>
		<li>Add new color palettes with consistent shade structures</li>
		<li>Override specific colors while maintaining accessibility</li>
		<li>Create theme-specific color variations</li>
		<li>Export custom palettes for reuse across projects</li>
	</ul>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand the palette system, explore how patterns and symbols enhance chart
			accessibility, or dive into specific chart implementations.
		</p>
		<span>
			<a href="/chart-elements/patterns" class="button is-primary">
				Patterns
				<span class="ml-2">→</span>
			</a>
			<a href="/chart-elements/symbols" class="button is-primary">
				Symbols
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
