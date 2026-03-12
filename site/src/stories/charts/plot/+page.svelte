<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The Plot component is a Svelte wrapper around the <a
			href="https://github.com/observablehq/plot"
			target="_blank"
			rel="noopener noreferrer">@observablehq/plot</a
		> library, providing an easy and efficient way to create interactive and customizable plots in your
		Svelte applications. It combines the power of Observable Plot's grammar of graphics with Rokkit's
		data-first design philosophy.
	</p>

	<h1>Key Features:</h1>
	<ul>
		<li>Built on Observable Plot's proven grammar of graphics</li>
		<li>Automatic data binding and reactive updates</li>
		<li>Extensive chart type support (scatter, line, bar, area, etc.)</li>
		<li>Integrated accessibility features</li>
		<li>Customizable styling and theming</li>
		<li>Performance optimized for large datasets</li>
	</ul>

	<h1>Interactive Demo</h1>
	<p>Explore the Plot component with real data and interactive controls:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />
	<h1>Basic Usage</h1>
	<p>
		The Plot component follows Rokkit's consistent API patterns, making it easy to create charts
		from your data with minimal configuration.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<h1>Core Properties</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Data & Mapping</h1>
			<ul>
				<li><strong>data</strong>: Array of data objects</li>
				<li><strong>x, y</strong>: Column names for axes</li>
				<li><strong>stroke, fill</strong>: Color encoding columns</li>
				<li><strong>symbol</strong>: Shape encoding column</li>
			</ul>
		</div>

		<div data-card>
			<h1>Presentation</h1>
			<ul>
				<li><strong>labels</strong>: Axis and title labels</li>
				<li><strong>legend</strong>: Show/hide legend</li>
				<li><strong>options</strong>: Advanced Plot.js options</li>
				<li><strong>width, height</strong>: Chart dimensions</li>
			</ul>
		</div>
	</div>

	<p>In this example, the Plot component creates a scatter plot where:</p>
	<ul>
		<li><code>data</code> contains the car dataset</li>
		<li><code>x="mpg"</code> maps miles per gallon to the x-axis</li>
		<li><code>y="hp"</code> maps horsepower to the y-axis</li>
		<li><code>stroke="mpg"</code> colors points based on fuel efficiency</li>
		<li><code>symbol="mpg"</code> varies point shapes by efficiency</li>
		<li><code>legend</code> enables the legend display</li>
		<li><code>labels</code> provides custom axis labels</li>
	</ul>
	<h1>Chart Types</h1>
	<p>
		The Plot component supports a wide variety of chart types through different property
		combinations. Observable Plot's grammar of graphics allows for flexible chart construction.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<h1>Chart Type Guide</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Point-Based Charts</h1>
			<ul>
				<li><strong>Scatter Plot</strong>: x, y, stroke, symbol properties</li>
				<li><strong>Bubble Chart</strong>: Add size encoding for third dimension</li>
				<li><strong>Strip Plot</strong>: Single axis with jittering</li>
			</ul>
		</div>

		<div data-card>
			<h1>Line & Area Charts</h1>
			<ul>
				<li><strong>Line Chart</strong>: Connected points over continuous x</li>
				<li><strong>Area Chart</strong>: Filled regions below lines</li>
				<li><strong>Multi-series</strong>: Use stroke for multiple lines</li>
			</ul>
		</div>

		<div data-card>
			<h1>Bar & Column Charts</h1>
			<ul>
				<li><strong>Bar Chart</strong>: Categorical comparisons</li>
				<li><strong>Stacked Bar</strong>: Part-to-whole relationships</li>
				<li><strong>Grouped Bar</strong>: Multiple series comparison</li>
			</ul>
		</div>

		<div data-card>
			<h1>Specialized Charts</h1>
			<ul>
				<li><strong>Histogram</strong>: Distribution visualization</li>
				<li><strong>Box Plot</strong>: Statistical summaries</li>
				<li><strong>Heatmap</strong>: 2D density or correlation</li>
			</ul>
		</div>
	</div>
	<h1>Advanced Customization</h1>
	<p>
		For complex visualizations, the Plot component supports advanced customization through the <code
			>options</code
		> property, which passes configuration directly to Observable Plot.
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<h1>Customization Options</h1>
	<ul>
		<li><strong>Layout</strong>: Margins, padding, dimensions, grid lines</li>
		<li><strong>Scales</strong>: Custom domains, ranges, and transformations</li>
		<li><strong>Styling</strong>: Colors, fonts, stroke widths, opacity</li>
		<li><strong>Interaction</strong>: Tooltips, zoom, pan, brush selection</li>
		<li><strong>Annotations</strong>: Reference lines, text labels, shapes</li>
		<li><strong>Faceting</strong>: Small multiples and subplot arrangements</li>
	</ul>
	<h1>Data Preparation</h1>
	<p>
		The Plot component works best with clean, well-structured data. Follow these guidelines for
		optimal chart performance and clarity.
	</p>

	<h1>Data Structure Best Practices</h1>
	<ul>
		<li><strong>Tidy Data</strong>: Each row represents one observation</li>
		<li><strong>Consistent Types</strong>: Ensure numeric columns are numbers, not strings</li>
		<li><strong>Date Handling</strong>: Convert date strings to Date objects</li>
		<li><strong>Missing Values</strong>: Handle null/undefined values appropriately</li>
		<li><strong>Categorical Data</strong>: Use consistent string values for categories</li>
		<li><strong>Performance</strong>: Consider data aggregation for large datasets</li>
	</ul>

	<h1>Data Transformation</h1>
	<p>
		Transform your data before passing it to the Plot component to ensure optimal visualization:
	</p>
	<ul>
		<li>Convert timestamps to Date objects for time series</li>
		<li>Calculate derived fields (percentages, ratios, rankings)</li>
		<li>Filter or aggregate data for performance</li>
		<li>Create categorical labels from numeric codes</li>
		<li>Normalize or scale data when comparing different units</li>
	</ul>
	<h1>Observable Plot Integration</h1>
	<p>
		The Plot component provides a Svelte-friendly interface to Observable Plot while preserving
		access to its full feature set. This integration offers the best of both worlds: Svelte's
		reactivity and Plot's powerful visualization grammar.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Rokkit Benefits</h1>
			<ul>
				<li>Automatic reactive updates</li>
				<li>Consistent API with other Rokkit components</li>
				<li>Built-in accessibility features</li>
				<li>Integrated theming system</li>
			</ul>
		</div>

		<div data-card>
			<h1>Observable Plot Power</h1>
			<ul>
				<li>Grammar of graphics approach</li>
				<li>Extensive chart type support</li>
				<li>High-performance rendering</li>
				<li>Rich customization options</li>
			</ul>
		</div>
	</div>

	<h1>When to Use Plot vs. Custom Charts</h1>
	<ul>
		<li>
			<strong>Use Plot for</strong>: Standard statistical charts, exploratory analysis, rapid
			prototyping
		</li>
		<li>
			<strong>Use Custom Charts for</strong>: Specialized visualizations, brand-specific designs,
			unique interactions
		</li>
	</ul>
	<h1>Performance Considerations</h1>
	<p>
		The Plot component is optimized for performance, but large datasets and complex visualizations
		require careful consideration of rendering strategies.
	</p>

	<h1>Optimization Strategies</h1>
	<ul>
		<li><strong>Data Sampling</strong>: Use representative samples for exploration</li>
		<li><strong>Aggregation</strong>: Pre-aggregate data for summary views</li>
		<li><strong>Progressive Loading</strong>: Load data incrementally for large datasets</li>
		<li><strong>Virtualization</strong>: Render only visible portions of large charts</li>
		<li><strong>Debouncing</strong>: Limit update frequency for interactive filters</li>
		<li><strong>Canvas Rendering</strong>: Use canvas marks for thousands of points</li>
	</ul>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand the Plot component, explore chart elements like symbols and patterns,
			or learn about other visualization components in the Rokkit ecosystem.
		</p>
		<span>
			<a href="/chart-elements/symbols" class="button is-primary">
				Chart Elements
				<span class="ml-2">→</span>
			</a>
			<a href="/chart-elements/palette" class="button is-primary">
				Color System
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
