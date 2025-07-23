<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The Table component allows you to visualize an object array in a table format. To get started
		you just need to provide the data, and the component will automatically generate columns based
		on the object keys.
	</p>

	<h1>Notable features:</h1>
	<ul>
		<li>Automatic column generation from object keys</li>
		<li>Custom column configuration with sorting and formatting</li>
		<li>Tree table support for hierarchical data</li>
		<li>Caption and header customization</li>
		<li>Responsive design that adapts to screen sizes</li>
		<li>Sorting and filtering capabilities</li>
	</ul>

	<h1>Basic Example</h1>
	<p>Here's a simple example of a Table component with automatic column generation:</p>

	<StoryViewer {...storyBuilder.getExample('introduction')} />
	<h1>Auto-Generated Columns</h1>
	<p>
		The simplest way to use the Table component is to provide just the data. The component will
		automatically create columns for each property in your objects.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<p>
		You can also provide a caption for the table using the `caption` property to improve
		accessibility and provide context for the data.
	</p>
	<h1>Custom Columns</h1>
	<p>
		You can customize the columns of the Table component by using the `columns` prop. This allows
		you to control which columns are displayed, their order, labels, and behavior.
	</p>

	<StoryViewer {...storyBuilder.getExample('columns')} />

	<p>Column configuration options:</p>
	<Code {...storyBuilder.getFragment(1)} />

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Column Properties</h1>
			<ul>
				<li><strong>name</strong>: The object property key to display</li>
				<li><strong>label</strong>: Header text for the column</li>
				<li><strong>sortable</strong>: Enable sorting for this column</li>
				<li><strong>formatter</strong>: Function to format cell values</li>
			</ul>
		</div>

		<div data-card>
			<h1>Column Benefits</h1>
			<ul>
				<li>Exclude unwanted columns</li>
				<li>Reorder column display</li>
				<li>Add custom formatting</li>
				<li>Control sorting behavior</li>
			</ul>
		</div>
	</div>
	<h1>Tree Table</h1>
	<p>
		The Table component supports hierarchical data display through tree table functionality. This is
		useful for nested data structures like organizational charts or file systems.
	</p>

	<StoryViewer {...storyBuilder.getExample('tree-table')} />

	<h1>Tree Table Features:</h1>
	<ul>
		<li><strong>Expandable rows</strong>: Click to expand/collapse child rows</li>
		<li><strong>Visual hierarchy</strong>: Indentation shows data relationships</li>
		<li><strong>Nested sorting</strong>: Sort within each level of the hierarchy</li>
		<li><strong>Selective expansion</strong>: Control which branches are expanded</li>
	</ul>
	<h1>Advanced Features</h1>
	<p>
		The Table component supports various advanced features for complex data visualization needs.
	</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Data Manipulation</h1>
			<ul>
				<li>Column sorting (ascending/descending)</li>
				<li>Data filtering and search</li>
				<li>Pagination for large datasets</li>
				<li>Custom cell renderers</li>
			</ul>
		</div>

		<div data-card>
			<h1>Accessibility & UX</h1>
			<ul>
				<li>Keyboard navigation support</li>
				<li>Screen reader compatibility</li>
				<li>Responsive breakpoints</li>
				<li>Loading and empty states</li>
			</ul>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the Table component works, explore other data-driven components
			like Tree and Accordion, or learn about form components.
		</p>
		<span>
			<a href="/elements/tree" class="button is-primary">
				Tree
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/accordion" class="button is-primary">
				Accordion
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
