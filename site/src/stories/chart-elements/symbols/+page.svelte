<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root><h1>Introduction</h1>
		<p>
			Symbols are graphical representations used in charts to convey data points, categories, or other information visually. They provide a way to represent data in a concise and easily understandable manner. In charting, symbols can take various forms such as circles, squares, triangles, or custom shapes, and they can be customized with attributes like size, fill color, and stroke color to enhance their visual appeal and convey additional information.
		</p>

		<h1>Key Features:</h1>
		<ul>
			<li>Comprehensive library of built-in symbol shapes</li>
			<li>Customizable size, color, and stroke properties</li>
			<li>Consistent rendering across different chart types</li>
			<li>Accessibility-friendly design patterns</li>
			<li>Performance optimized for large datasets</li>
			<li>Extensible system for custom symbol creation</li>
		</ul>

		<h1>Symbol Library</h1>
		<p>
			Explore the available symbol types and interactive customization options:
		</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
<h1>Symbol Component</h1>
		<p>
			The Symbol component is a versatile tool used in charting libraries to generate and render symbols at specified coordinates on a chart. It supports creating multiple shapes with comprehensive customization options.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<h1>Component Properties</h1>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Position & Size</h1>
				<ul>
					<li><strong>x</strong>: X-coordinate position</li>
					<li><strong>y</strong>: Y-coordinate position</li>
					<li><strong>size</strong>: Symbol size (radius/width)</li>
					<li><strong>name</strong>: Symbol type identifier</li>
				</ul>
			</div>

			<div data-card>
				<h1>Appearance</h1>
				<ul>
					<li><strong>fill</strong>: Interior color</li>
					<li><strong>stroke</strong>: Border color</li>
					<li><strong>strokeWidth</strong>: Border thickness</li>
					<li><strong>opacity</strong>: Transparency level</li>
				</ul>
			</div>
		</div>
<h1>Data Point Visualization</h1>
		<p>
			Symbols excel at representing data points in scatter plots, line charts, and other visualizations where individual data values need distinct markers. Different symbol shapes can encode categorical information while colors represent continuous variables.
		</p>

		<Code {...storyBuilder.getFragment(1)} />

		<h1>Encoding Strategies</h1>
		<ul>
			<li><strong>Shape</strong>: Use different symbols for categorical data (circle, square, triangle)</li>
			<li><strong>Size</strong>: Encode quantitative values through symbol size</li>
			<li><strong>Color</strong>: Represent continuous variables or additional categories</li>
			<li><strong>Opacity</strong>: Show confidence levels or data quality</li>
		</ul>
<h1>Advanced Customization</h1>
		<p>
			Beyond basic properties, symbols support advanced customization for complex data visualization scenarios, including dynamic theming, conditional styling, and performance optimization.
		</p>

		<Code {...storyBuilder.getFragment(2)} />

		<h1>Advanced Features</h1>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Dynamic Properties</h1>
				<ul>
					<li>Size based on data values</li>
					<li>Color mapping to continuous scales</li>
					<li>Conditional symbol selection</li>
					<li>Interactive state changes</li>
				</ul>
			</div>

			<div data-card>
				<h1>Theme Integration</h1>
				<ul>
					<li>Consistent color palette application</li>
					<li>Brand-specific symbol sets</li>
					<li>Context-aware styling</li>
					<li>Accessibility compliance</li>
				</ul>
			</div>
		</div>
<h1>Available Symbol Types</h1>
		<p>
			The Rokkit Chart library provides a comprehensive set of symbol types, each optimized for different visualization contexts and data relationships.
		</p>

		<h1>Geometric Symbols</h1>
		<ul>
			<li><strong>circle</strong>: Universal data point marker, highest visual priority</li>
			<li><strong>square</strong>: Categorical data, good contrast with circles</li>
			<li><strong>triangle</strong>: Directional data, warnings, or special categories</li>
			<li><strong>diamond</strong>: High-importance data points, outliers</li>
		</ul>

		<h1>Specialized Symbols</h1>
		<ul>
			<li><strong>cross</strong>: Intersections, reference points, or negative values</li>
			<li><strong>star</strong>: Featured data, achievements, or ratings</li>
			<li><strong>plus</strong>: Additions, growth, or positive changes</li>
			<li><strong>arrow</strong>: Directional data, trends, or flows</li>
		</ul>
<h1>Design Best Practices</h1>
		<p>
			Follow these guidelines to create effective and accessible symbol-based visualizations that communicate data clearly and efficiently.
		</p>

		<h1>Visual Guidelines</h1>
		<ul>
			<li>Use consistent symbol sizes for data of equal importance</li>
			<li>Maintain sufficient contrast between symbols and backgrounds</li>
			<li>Limit the number of different symbol types in a single chart</li>
			<li>Pair symbols with colors for redundant encoding</li>
			<li>Test symbol clarity at different zoom levels and screen sizes</li>
			<li>Provide legends that clearly identify symbol meanings</li>
		</ul>

		<h1>Performance Considerations</h1>
		<ul>
			<li>Optimize symbol complexity for large datasets</li>
			<li>Use symbol clustering for dense scatter plots</li>
			<li>Consider canvas rendering for thousands of symbols</li>
			<li>Implement level-of-detail for interactive zooming</li>
		</ul>
<h1>Custom Symbol Development</h1>
		<p>
			Developers can extend the symbol library with custom designs that match specific brand requirements or domain-specific visualization needs.
		</p>

		<h1>Customization Options</h1>
		<ul>
			<li>SVG-based custom symbol definitions</li>
			<li>Brand-specific shape libraries</li>
			<li>Industry-standard symbol sets</li>
			<li>Icon integration for domain-specific data</li>
			<li>Animated symbols for time-series data</li>
			<li>Interactive symbols with hover and click behaviors</li>
		</ul>
	
<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
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
	
</article>