<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root><h1>Introduction</h1>
		<p>
			A generic responsive layout component that renders different columns using components provided via the `items` property. The ResponsiveGrid automatically adapts to different screen sizes and provides flexible layout options.
		</p>

		<h1>Notable features:</h1>
		<ul>
			<li>Responsive grid layouts that adapt to screen breakpoints</li>
			<li>Component-based grid items with flexible props</li>
			<li>Customizable column and row configurations</li>
			<li>Small screen mode with alternative navigation</li>
			<li>CSS class customization for different layouts</li>
			<li>Value binding for selected grid items</li>
		</ul>

		<h1>Basic Example</h1>
		<p>
			Here's an example of a ResponsiveGrid with interactive size switching. Use the size toggle to see how the grid adapts:
		</p>

		<StoryViewer {...storyBuilder.getExample('introduction')} />
<h1>Properties</h1>
		<p>
			The ResponsiveGrid component provides comprehensive properties for flexible layout control.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Core Properties</h1>
				<ul>
					<li><strong>items</strong>: Array of component configurations to render</li>
					<li><strong>value</strong>: Currently selected grid item (bindable)</li>
					<li><strong>small</strong>: Enable small screen mode (boolean)</li>
					<li><strong>class</strong>: Custom CSS classes for grid styling</li>
				</ul>
			</div>

			<div data-card>
				<h1>Item Configuration</h1>
				<ul>
					<li><strong>component</strong>: Svelte component to render</li>
					<li><strong>name</strong>: Display name for the item</li>
					<li><strong>props</strong>: Properties to pass to the component</li>
				</ul>
			</div>
		</div>

		<p>Basic grid configuration:</p>
		<Code {...storyBuilder.getFragment(0)} />
<h1>Custom CSS Classes</h1>
		<p>
			You can customize the grid layout using CSS classes to control columns, rows, and responsive behavior.
		</p>

		<StoryViewer {...storyBuilder.getExample('custom-class')} />

		<p>Example CSS for responsive grid layouts:</p>
		<Code {...storyBuilder.getFragment(1)} />

		<h1>Responsive Patterns</h1>
		<p>
			The ResponsiveGrid works well with CSS Grid utilities to create adaptive layouts:
		</p>
		<ul>
			<li><strong>Small screens</strong>: Single column with navigation switching</li>
			<li><strong>Medium screens</strong>: Vertical stack (1 column, multiple rows)</li>
			<li><strong>Large screens</strong>: Multi-column grid (2x2, 3x3, etc.)</li>
		</ul>
<h1>Use Cases</h1>
		<p>
			The ResponsiveGrid is perfect for various layout scenarios where you need flexible, adaptive interfaces.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h1>Dashboard Layouts</h1>
				<ul>
					<li>Widget-based dashboards</li>
					<li>Chart and metric displays</li>
					<li>Administrative panels</li>
					<li>Analytics overviews</li>
				</ul>
			</div>

			<div data-card>
				<h1>Content Layouts</h1>
				<ul>
					<li>Image galleries</li>
					<li>Product showcases</li>
					<li>Feature comparisons</li>
					<li>Portfolio displays</li>
				</ul>
			</div>
		</div>
	
<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the ResponsiveGrid works, explore other layout components like NavContent and Stepper, or learn about data-driven components.
		</p>
		<span>
			<a href="/layout/nav-content" class="button is-primary">
				NavContent
				<span class="ml-2">→</span>
			</a>
			<a href="/layout/stepper" class="button is-primary">
				Stepper
				<span class="ml-2">→</span>
			</a>
		</span>
	
</article>