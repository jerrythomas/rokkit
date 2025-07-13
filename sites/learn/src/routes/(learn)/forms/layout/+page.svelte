<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Layout - Forms | Learn Rokkit</title>
	<meta
		name="description"
		content="Control form layout with rows, columns, and groups in Rokkit forms"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>📐</span>Form Layout</h1>
				<p>
					Control form layout with rows, columns, and groups
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			Form layout control allows you to organize fields into logical groups, rows, and columns for better visual organization and user experience. Rokkit forms provide flexible layout options that work responsively across different screen sizes.
		</p>

		<h3>Key Features:</h3>
		<ul>
			<li>Row and column-based field organization</li>
			<li>Responsive layout that adapts to screen size</li>
			<li>Field grouping with visual separators</li>
			<li>Flexible sizing and spacing controls</li>
			<li>Consistent alignment and padding</li>
			<li>Accessibility-friendly structure</li>
		</ul>

		<h3>Layout Example</h3>
		<p>
			Here's how layout schemas organize form fields into structured layouts:
		</p>

		<StoryViewer {...storyBuilder.getExample('layout')} />
	</section>

	<!-- Layout Schema -->
	<section>
		<h2>Layout Schema Structure</h2>
		<p>
			Layout schemas define how form fields are arranged using a hierarchical structure of rows, columns, and groups.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<h3>Layout Elements</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Container Elements</h4>
				<ul>
					<li><strong>row</strong>: Horizontal field containers</li>
					<li><strong>column</strong>: Vertical field stacks</li>
					<li><strong>group</strong>: Logical field groupings</li>
					<li><strong>section</strong>: Major form sections</li>
				</ul>
			</div>

			<div data-card>
				<h4>Sizing Properties</h4>
				<ul>
					<li><strong>width</strong>: Field width (1-12 grid)</li>
					<li><strong>span</strong>: Column span for fields</li>
					<li><strong>offset</strong>: Left margin spacing</li>
					<li><strong>flex</strong>: Flexible sizing behavior</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Responsive Design -->
	<section>
		<h2>Responsive Layout</h2>
		<p>
			Form layouts automatically adapt to different screen sizes, ensuring optimal usability across devices.
		</p>

		<h3>Breakpoint Behavior</h3>
		<ul>
			<li><strong>Desktop</strong>: Full multi-column layouts with all specified widths</li>
			<li><strong>Tablet</strong>: Reduced columns with adjusted spacing</li>
			<li><strong>Mobile</strong>: Single-column stack for optimal touch interaction</li>
			<li><strong>Auto-sizing</strong>: Fields resize based on content and constraints</li>
		</ul>

		<h3>Mobile Optimization</h3>
		<ul>
			<li>Automatic single-column layouts on small screens</li>
			<li>Increased touch targets for better accessibility</li>
			<li>Optimized label positioning and field spacing</li>
			<li>Scroll-friendly form sections</li>
		</ul>
	</section>

	<!-- Field Grouping -->
	<section>
		<h2>Field Grouping</h2>
		<p>
			Group related fields together to create logical sections and improve form comprehension.
		</p>

		<h3>Grouping Strategies</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Semantic Grouping</h4>
				<ul>
					<li>Personal information</li>
					<li>Address details</li>
					<li>Payment information</li>
					<li>Preferences and settings</li>
				</ul>
			</div>

			<div data-card>
				<h4>Visual Separators</h4>
				<ul>
					<li>Section headers and dividers</li>
					<li>Card-based group containers</li>
					<li>Color-coded sections</li>
					<li>Collapsible group panels</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Advanced Layout -->
	<section>
		<h2>Advanced Layout Patterns</h2>
		<p>
			Create sophisticated form layouts using advanced patterns for complex data entry scenarios.
		</p>

		<h3>Complex Layout Types</h3>
		<ul>
			<li><strong>Multi-column</strong>: Side-by-side field arrangements</li>
			<li><strong>Nested groups</strong>: Hierarchical field organization</li>
			<li><strong>Conditional layouts</strong>: Dynamic layout based on field values</li>
			<li><strong>Wizard steps</strong>: Multi-page form layouts</li>
			<li><strong>Master-detail</strong>: List and detail view combinations</li>
			<li><strong>Grid layouts</strong>: Table-like field arrangements</li>
		</ul>

		<h3>Layout Customization</h3>
		<ul>
			<li>Custom CSS classes for specific styling</li>
			<li>Field-level layout overrides</li>
			<li>Theme integration for consistent appearance</li>
			<li>Animation and transition effects</li>
		</ul>
	</section>

	<!-- Performance -->
	<section>
		<h2>Layout Performance</h2>
		<p>
			Efficient layout rendering ensures smooth user experience even with complex form structures.
		</p>

		<h3>Optimization Techniques</h3>
		<ul>
			<li><strong>Lazy rendering</strong>: Render visible sections first</li>
			<li><strong>Virtual scrolling</strong>: Handle very long forms efficiently</li>
			<li><strong>Layout caching</strong>: Reuse computed layouts</li>
			<li><strong>Progressive enhancement</strong>: Basic layout first, enhancements second</li>
		</ul>
	</section>

	<!-- Accessibility -->
	<section>
		<h2>Layout Accessibility</h2>
		<p>
			Form layouts maintain accessibility standards while providing flexible visual organization.
		</p>

		<h3>Accessibility Features</h3>
		<ul>
			<li>Logical tab order maintained across layout changes</li>
			<li>Screen reader friendly structure and navigation</li>
			<li>High contrast support for visual separators</li>
			<li>Keyboard navigation between form sections</li>
			<li>ARIA landmarks for form structure</li>
			<li>Focus management during dynamic layout changes</li>
		</ul>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand form layout, explore validation techniques, advanced form features, or learn about input components.
		</p>
		<span>
			<a href="/forms/validation" class="button is-primary">
				Validation
				<span class="ml-2">→</span>
			</a>
			<a href="/forms/advanced" class="button is-primary">
				Advanced Features
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>