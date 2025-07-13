<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Table - Elements | Learn Rokkit</title>
	<meta
		name="description"
		content="Display tabular data with headers, footer & caption"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>📊</span>Table Component</h1>
				<p>
					Display tabular data with headers, footer & caption
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			The Table component allows you to visualize an object array in a table format. To get started you just need to provide the data, and the component will automatically generate columns based on the object keys.
		</p>

		<h3>Notable features:</h3>
		<ul>
			<li>Automatic column generation from object keys</li>
			<li>Custom column configuration with sorting and formatting</li>
			<li>Tree table support for hierarchical data</li>
			<li>Caption and header customization</li>
			<li>Responsive design that adapts to screen sizes</li>
			<li>Sorting and filtering capabilities</li>
		</ul>

		<h3>Basic Example</h3>
		<p>
			Here's a simple example of a Table component with automatic column generation:
		</p>

		<StoryViewer {...storyBuilder.getExample('introduction')} />
	</section>

	<!-- Auto-Generated Columns -->
	<section>
		<h2>Auto-Generated Columns</h2>
		<p>
			The simplest way to use the Table component is to provide just the data. The component will automatically create columns for each property in your objects.
		</p>

		<Code {...storyBuilder.getFragment(0)} />

		<p>
			You can also provide a caption for the table using the `caption` property to improve accessibility and provide context for the data.
		</p>
	</section>

	<!-- Custom Columns -->
	<section>
		<h2>Custom Columns</h2>
		<p>
			You can customize the columns of the Table component by using the `columns` prop. This allows you to control which columns are displayed, their order, labels, and behavior.
		</p>

		<StoryViewer {...storyBuilder.getExample('columns')} />

		<p>Column configuration options:</p>
		<Code {...storyBuilder.getFragment(1)} />

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Column Properties</h4>
				<ul>
					<li><strong>name</strong>: The object property key to display</li>
					<li><strong>label</strong>: Header text for the column</li>
					<li><strong>sortable</strong>: Enable sorting for this column</li>
					<li><strong>formatter</strong>: Function to format cell values</li>
				</ul>
			</div>

			<div data-card>
				<h4>Column Benefits</h4>
				<ul>
					<li>Exclude unwanted columns</li>
					<li>Reorder column display</li>
					<li>Add custom formatting</li>
					<li>Control sorting behavior</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Tree Table -->
	<section>
		<h2>Tree Table</h2>
		<p>
			The Table component supports hierarchical data display through tree table functionality. This is useful for nested data structures like organizational charts or file systems.
		</p>

		<StoryViewer {...storyBuilder.getExample('tree-table')} />

		<h3>Tree Table Features:</h3>
		<ul>
			<li><strong>Expandable rows</strong>: Click to expand/collapse child rows</li>
			<li><strong>Visual hierarchy</strong>: Indentation shows data relationships</li>
			<li><strong>Nested sorting</strong>: Sort within each level of the hierarchy</li>
			<li><strong>Selective expansion</strong>: Control which branches are expanded</li>
		</ul>
	</section>

	<!-- Advanced Features -->
	<section>
		<h2>Advanced Features</h2>
		<p>
			The Table component supports various advanced features for complex data visualization needs.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h4>Data Manipulation</h4>
				<ul>
					<li>Column sorting (ascending/descending)</li>
					<li>Data filtering and search</li>
					<li>Pagination for large datasets</li>
					<li>Custom cell renderers</li>
				</ul>
			</div>

			<div data-card>
				<h4>Accessibility & UX</h4>
				<ul>
					<li>Keyboard navigation support</li>
					<li>Screen reader compatibility</li>
					<li>Responsive breakpoints</li>
					<li>Loading and empty states</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready for more?</h3>
		<p>
			Now that you understand how the Table component works, explore other data-driven components like Tree and Accordion, or learn about form components.
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