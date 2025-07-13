<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Symbols - Chart Elements | Learn Rokkit</title>
	<meta
		name="description"
		content="Chart symbols for data point visualization and scatter plots"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>◆</span>Symbol System</h1>
				<p>
					Chart symbols for data point visualization and scatter plots
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Symbols are graphical representations used in charts to convey data points, categories, or other information visually. They provide a way to represent data in a concise and easily understandable manner. In charting, symbols can take various forms such as circles, squares, triangles, or custom shapes, and they can be customized with attributes like size, fill color, and stroke color to enhance their visual appeal and convey additional information.
		</p>

		<h3>Key Features:</h3>
		<ul>
			<li>Comprehensive library of built-in symbol shapes</li>
			<li>Customizable size, color, and stroke properties</li>
			<li>Consistent rendering across different chart types</li>
			<li>Accessibility-friendly design patterns</li>
			<li>Performance optimized for large datasets</li>
			<li>Extensible system for custom symbol creation</li>
		</ul>

		<h3>Symbol Library</h3>
		<p>
			Explore the available symbol types and interactive customization options:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
	</section>

	<!-- Symbol Component -->
	<section>
		<h2>Symbol Component</h2>
		<p>
			The Symbol component is a versatile tool used in charting libraries to generate and render symbols at specified coordinates on a chart. It supports creating multiple shapes with comprehensive customization options.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<h3>Component Properties</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Position & Size</h4>
				<ul>
					<li><strong>x</strong>: X-coordinate position</li>
					<li><strong>y</strong>: Y-coordinate position</li>
					<li><strong>size</strong>: Symbol size (radius/width)</li>
					<li><strong>name</strong>: Symbol type identifier</li>
				</ul>
			</div>

			<div data-card>
				<h4>Appearance</h4>
				<ul>
					<li><strong>fill</strong>: Interior color</li>
					<li><strong>stroke</strong>: Border color</li>
					<li><strong>strokeWidth</strong>: Border thickness</li>
					<li><strong>opacity</strong>: Transparency level</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Data Points -->
	<section>
		<h2>Data Point Visualization</h2>
		<p>
			Symbols excel at representing data points in scatter plots, line charts, and other visualizations where individual data values need distinct markers. Different symbol shapes can encode categorical information while colors represent continuous variables.
		</p>

		<Code {...storyBuilder.getFragment(1)} />

		<h3>Encoding Strategies</h3>
		<ul>
			<li><strong>Shape</strong>: Use different symbols for categorical data (circle, square, triangle)</li>
			<li><strong>Size</strong>: Encode quantitative values through symbol size</li>
			<li><strong>Color</strong>: Represent continuous variables or additional categories</li>
			<li><strong>Opacity</strong>: Show confidence levels or data quality</li>
		</ul>
	</section>

	<!-- Advanced Usage -->
	<section>
		<h2>Advanced Customization</h2>
		<p>
			Beyond basic properties, symbols support advanced customization for complex data visualization scenarios, including dynamic theming, conditional styling, and performance optimization.
		</p>

		<Code {...storyBuilder.getFragment(2)} />

		<h3>Advanced Features</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Dynamic Properties</h4>
				<ul>
					<li>Size based on data values</li>
					<li>Color mapping to continuous scales</li>
					<li>Conditional symbol selection</li>
					<li>Interactive state changes</li>
				</ul>
			</div>

			<div data-card>
				<h4>Theme Integration</h4>
				<ul>
					<li>Consistent color palette application</li>
					<li>Brand-specific symbol sets</li>
					<li>Context-aware styling</li>
					<li>Accessibility compliance</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Symbol Types -->
	<section>
		<h2>Available Symbol Types</h2>
		<p>
			The Rokkit Chart library provides a comprehensive set of symbol types, each optimized for different visualization contexts and data relationships.
		</p>

		<h3>Geometric Symbols</h3>
		<ul>
			<li><strong>circle</strong>: Universal data point marker, highest visual priority</li>
			<li><strong>square</strong>: Categorical data, good contrast with circles</li>
			<li><strong>triangle</strong>: Directional data, warnings, or special categories</li>
			<li><strong>diamond</strong>: High-importance data points, outliers</li>
		</ul>

		<h3>Specialized Symbols</h3>
		<ul>
			<li><strong>cross</strong>: Intersections, reference points, or negative values</li>
			<li><strong>star</strong>: Featured data, achievements, or ratings</li>
			<li><strong>plus</strong>: Additions, growth, or positive changes</li>
			<li><strong>arrow</strong>: Directional data, trends, or flows</li>
		</ul>
	</section>

	<!-- Best Practices -->
	<section>
		<h2>Design Best Practices</h2>
		<p>
			Follow these guidelines to create effective and accessible symbol-based visualizations that communicate data clearly and efficiently.
		</p>

		<h3>Visual Guidelines</h3>
		<ul>
			<li>Use consistent symbol sizes for data of equal importance</li>
			<li>Maintain sufficient contrast between symbols and backgrounds</li>
			<li>Limit the number of different symbol types in a single chart</li>
			<li>Pair symbols with colors for redundant encoding</li>
			<li>Test symbol clarity at different zoom levels and screen sizes</li>
			<li>Provide legends that clearly identify symbol meanings</li>
		</ul>

		<h3>Performance Considerations</h3>
		<ul>
			<li>Optimize symbol complexity for large datasets</li>
			<li>Use symbol clustering for dense scatter plots</li>
			<li>Consider canvas rendering for thousands of symbols</li>
			<li>Implement level-of-detail for interactive zooming</li>
		</ul>
	</section>

	<!-- Custom Symbols -->
	<section>
		<h2>Custom Symbol Development</h2>
		<p>
			Developers can extend the symbol library with custom designs that match specific brand requirements or domain-specific visualization needs.
		</p>

		<h3>Customization Options</h3>
		<ul>
			<li>SVG-based custom symbol definitions</li>
			<li>Brand-specific shape libraries</li>
			<li>Industry-standard symbol sets</li>
			<li>Icon integration for domain-specific data</li>
			<li>Animated symbols for time-series data</li>
			<li>Interactive symbols with hover and click behaviors</li>
		</ul>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand symbols, explore the complete charting system with the Plot component, or learn about color palettes and patterns for comprehensive data visualization.
		</p>
		<span>
			<a href="/charts/plot" class="button is-primary">
				Plot Charts
				<span class="ml-2">→</span>
			</a>
			<a href="/chart-elements/palette" class="button is-primary">
				Color Palette
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>