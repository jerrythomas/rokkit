<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		Patterns are visual elements used in charts and visualizations to enhance accessibility by
		providing alternative representations of data or information. They serve as an additional layer
		of communication for users with different needs or preferences, allowing them to interpret
		charts more effectively. Patterns are particularly useful for individuals who may have
		difficulty distinguishing between colors or who rely on screen readers.
	</p>

	<h1>Key Benefits:</h1>
	<ul>
		<li>Enhanced contrast beyond color alone</li>
		<li>Accessibility for color vision differences</li>
		<li>Clear visual differentiation between data series</li>
		<li>Print-friendly chart reproduction</li>
		<li>Compliance with accessibility standards</li>
		<li>Universal design principles</li>
	</ul>

	<h1>Pattern Library</h1>
	<p>Explore the available pattern types and their interactive customization options:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />
	<h1>DefinePatterns Component</h1>
	<p>
		The DefinePatterns component is a valuable feature in the Rokkit Chart library that enables the
		creation and application of patterns to chart elements. It supports various types of patterns
		and provides options for customization.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<h1>Component Properties</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul>
				<li><strong>patterns</strong>: Array of pattern definitions</li>
				<li><strong>size</strong>: Pattern element size (default: 10)</li>
				<li><strong>id</strong>: Unique identifier for SVG usage</li>
				<li><strong>component</strong>: Pattern type component</li>
			</ul>
		</div>

		<div data-card>
			<h1>Style Properties</h1>
			<ul>
				<li><strong>fill</strong>: Pattern fill color</li>
				<li><strong>stroke</strong>: Pattern stroke color</li>
				<li><strong>strokeWidth</strong>: Line thickness</li>
				<li><strong>opacity</strong>: Pattern transparency</li>
			</ul>
		</div>
	</div>
	<h1>Multi-Series Charts</h1>
	<p>
		When working with charts that display multiple data series, combining different patterns with
		colors provides the clearest visual distinction and maximum accessibility.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<h1>Pattern Selection Guidelines</h1>
	<ul>
		<li><strong>Contrast</strong>: Choose patterns that differ significantly in visual texture</li>
		<li><strong>Density</strong>: Vary pattern density to create hierarchy</li>
		<li><strong>Direction</strong>: Use different line directions (vertical, diagonal, cross)</li>
		<li><strong>Combination</strong>: Pair patterns with distinct colors for redundant encoding</li>
	</ul>
	<h1>Accessibility Benefits</h1>
	<p>
		Patterns offer several benefits for accessibility in charts, making data visualization more
		inclusive and effective for all users.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Enhanced Contrast</h1>
			<p>
				By using patterns in addition to colors, charts become more accessible to users who may have
				difficulty distinguishing between certain colors. The patterns provide an additional visual
				cue that improves the contrast between different data elements.
			</p>
		</div>

		<div data-card>
			<h1>Alternative Representation</h1>
			<p>
				Patterns serve as an alternative representation of data, especially for users who rely on
				screen readers or have color vision deficiencies. They convey information through tactile or
				visual means, allowing users to interpret charts more accurately.
			</p>
		</div>

		<div data-card>
			<h1>Clearer Communication</h1>
			<p>
				Patterns help convey complex information more clearly by providing visual differentiation
				between data categories or groups. This clarity aids all users in understanding the chart's
				content and relationships.
			</p>
		</div>

		<div data-card>
			<h1>Universal Design</h1>
			<p>
				Following universal design principles, patterns make charts accessible to a broader audience
				including users with various visual capabilities, different display technologies, and
				diverse viewing conditions.
			</p>
		</div>
	</div>
	<h1>Available Pattern Types</h1>
	<p>
		The Rokkit Chart library provides a comprehensive set of pattern types, each designed for
		specific use cases and visual requirements.
	</p>

	<h1>Pattern Categories</h1>
	<ul>
		<li><strong>Linear Patterns</strong>: Stripes, lines, and directional elements</li>
		<li><strong>Dot Patterns</strong>: Circles, dots, and point-based textures</li>
		<li><strong>Cross Patterns</strong>: Grid, cross-hatch, and intersection designs</li>
		<li><strong>Custom Patterns</strong>: Extensible system for brand-specific designs</li>
	</ul>
	<h1>Implementation Best Practices</h1>
	<p>
		Follow these guidelines to effectively implement patterns in your chart visualizations while
		maintaining accessibility and visual clarity.
	</p>

	<h1>Design Guidelines</h1>
	<ul>
		<li>Always combine patterns with color for redundant encoding</li>
		<li>Test patterns at different sizes and zoom levels</li>
		<li>Ensure sufficient contrast between pattern and background</li>
		<li>Use consistent pattern sizing across related charts</li>
		<li>Provide legend entries that show both color and pattern</li>
		<li>Consider pattern performance with large datasets</li>
	</ul>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand patterns, explore symbols for data point visualization, or learn about
			building complete chart implementations with the Plot component.
		</p>
		<span>
			<a href="/chart-elements/symbols" class="button is-primary">
				Symbols
				<span class="ml-2">→</span>
			</a>
			<a href="/charts/plot" class="button is-primary">
				Plot Charts
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
