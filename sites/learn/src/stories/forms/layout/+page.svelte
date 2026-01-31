<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		Form layout control allows you to organize fields into logical groups, rows, and columns for
		better visual organization and user experience. Rokkit forms provide flexible layout options
		that work responsively across different screen sizes.
	</p>

	<h1>Key Features:</h1>
	<ul>
		<li>Row and column-based field organization</li>
		<li>Responsive layout that adapts to screen size</li>
		<li>Field grouping with visual separators</li>
		<li>Flexible sizing and spacing controls</li>
		<li>Consistent alignment and padding</li>
		<li>Accessibility-friendly structure</li>
	</ul>

	<h1>Layout Example</h1>
	<p>Here's how layout schemas organize form fields into structured layouts:</p>

	<StoryViewer {...storyBuilder.getExample('layout')} />
	<h1>Layout Schema Structure</h1>
	<p>
		Layout schemas define how form fields are arranged using a hierarchical structure of rows,
		columns, and groups.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<h1>Layout Elements</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Container Elements</h1>
			<ul>
				<li><strong>row</strong>: Horizontal field containers</li>
				<li><strong>column</strong>: Vertical field stacks</li>
				<li><strong>group</strong>: Logical field groupings</li>
				<li><strong>section</strong>: Major form sections</li>
			</ul>
		</div>

		<div data-card>
			<h1>Sizing Properties</h1>
			<ul>
				<li><strong>width</strong>: Field width (1-12 grid)</li>
				<li><strong>span</strong>: Column span for fields</li>
				<li><strong>offset</strong>: Left margin spacing</li>
				<li><strong>flex</strong>: Flexible sizing behavior</li>
			</ul>
		</div>
	</div>
	<h1>Responsive Layout</h1>
	<p>
		Form layouts automatically adapt to different screen sizes, ensuring optimal usability across
		devices.
	</p>

	<h1>Breakpoint Behavior</h1>
	<ul>
		<li><strong>Desktop</strong>: Full multi-column layouts with all specified widths</li>
		<li><strong>Tablet</strong>: Reduced columns with adjusted spacing</li>
		<li><strong>Mobile</strong>: Single-column stack for optimal touch interaction</li>
		<li><strong>Auto-sizing</strong>: Fields resize based on content and constraints</li>
	</ul>

	<h1>Mobile Optimization</h1>
	<ul>
		<li>Automatic single-column layouts on small screens</li>
		<li>Increased touch targets for better accessibility</li>
		<li>Optimized label positioning and field spacing</li>
		<li>Scroll-friendly form sections</li>
	</ul>
	<h1>Field Grouping</h1>
	<p>Group related fields together to create logical sections and improve form comprehension.</p>

	<h1>Grouping Strategies</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Semantic Grouping</h1>
			<ul>
				<li>Personal information</li>
				<li>Address details</li>
				<li>Payment information</li>
				<li>Preferences and settings</li>
			</ul>
		</div>

		<div data-card>
			<h1>Visual Separators</h1>
			<ul>
				<li>Section headers and dividers</li>
				<li>Card-based group containers</li>
				<li>Color-coded sections</li>
				<li>Collapsible group panels</li>
			</ul>
		</div>
	</div>
	<h1>Advanced Layout Patterns</h1>
	<p>Create sophisticated form layouts using advanced patterns for complex data entry scenarios.</p>

	<h1>Complex Layout Types</h1>
	<ul>
		<li><strong>Multi-column</strong>: Side-by-side field arrangements</li>
		<li><strong>Nested groups</strong>: Hierarchical field organization</li>
		<li><strong>Conditional layouts</strong>: Dynamic layout based on field values</li>
		<li><strong>Wizard steps</strong>: Multi-page form layouts</li>
		<li><strong>Master-detail</strong>: List and detail view combinations</li>
		<li><strong>Grid layouts</strong>: Table-like field arrangements</li>
	</ul>

	<h1>Layout Customization</h1>
	<ul>
		<li>Custom CSS classes for specific styling</li>
		<li>Field-level layout overrides</li>
		<li>Theme integration for consistent appearance</li>
		<li>Animation and transition effects</li>
	</ul>
	<h1>Layout Performance</h1>
	<p>
		Efficient layout rendering ensures smooth user experience even with complex form structures.
	</p>

	<h1>Optimization Techniques</h1>
	<ul>
		<li><strong>Lazy rendering</strong>: Render visible sections first</li>
		<li><strong>Virtual scrolling</strong>: Handle very long forms efficiently</li>
		<li><strong>Layout caching</strong>: Reuse computed layouts</li>
		<li><strong>Progressive enhancement</strong>: Basic layout first, enhancements second</li>
	</ul>
	<h1>Layout Accessibility</h1>
	<p>Form layouts maintain accessibility standards while providing flexible visual organization.</p>

	<h1>Accessibility Features</h1>
	<ul>
		<li>Logical tab order maintained across layout changes</li>
		<li>Screen reader friendly structure and navigation</li>
		<li>High contrast support for visual separators</li>
		<li>Keyboard navigation between form sections</li>
		<li>ARIA landmarks for form structure</li>
		<li>Focus management during dynamic layout changes</li>
	</ul>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand form layout, explore validation techniques, advanced form features, or
			learn about input components.
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
