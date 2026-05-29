<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		Tables display tabular data with sortable columns and keyboard navigation. Built on the same
		navigator pattern as List, the Table component auto-derives columns from your data or accepts
		custom column definitions with labels, formatters, and alignment.
	</p>

	<h2>Notable features:</h2>
	<ul>
		<li>Auto-derives columns from data keys — get started with just an array of objects</li>
		<li>Click column headers to sort (ascending → descending → none)</li>
		<li>Hold Shift and click to sort by multiple columns</li>
		<li>Keyboard navigation with arrow keys, Home, End, and Enter to select</li>
		<li>Custom columns with labels, width, alignment, and cell formatters</li>
		<li>Compose with SearchFilter for powerful filtering</li>
	</ul>

	<h2>Basic Example</h2>
	<p>
		Pass an array of objects to the <code>data</code> prop. The Table auto-derives column headers from
		the object keys. Click a row to select it:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<h2>Sorting</h2>
	<p>
		All columns are sortable by default. Click a column header to cycle through ascending,
		descending, and unsorted states. Hold <strong>Shift</strong> while clicking to add secondary sort
		columns.
	</p>

	<StoryViewer {...storyBuilder.getExample('sorting')} />

	<!-- Properties Documentation -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Properties</h2>
			<ul>
				<li><strong>data</strong>: Array of objects to display as rows</li>
				<li><strong>columns</strong>: Optional column definitions (auto-derived if omitted)</li>
				<li><strong>value</strong>: Currently selected row value</li>
				<li><strong>caption</strong>: Table caption text (also sets aria-label)</li>
				<li>
					<strong>size</strong>: Size variant — <code>sm</code>, <code>md</code>, <code>lg</code>
				</li>
				<li><strong>striped</strong>: Alternate row background colors</li>
				<li><strong>disabled</strong>: Disable interaction</li>
			</ul>
		</div>

		<div data-card>
			<h2>Events</h2>
			<ul>
				<li><strong>onselect</strong>: Triggered when a row is selected (click or Enter)</li>
				<li><strong>onsort</strong>: Triggered when sort state changes</li>
			</ul>
		</div>
	</div>

	<h2>Custom Columns</h2>
	<p>
		Provide a <code>columns</code> array to control which fields are shown, their labels, width, alignment,
		and how values are formatted. Here's an example column definition:
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<p>
		The <code>formatter</code> function receives the cell value and the full row object, returning a
		display string. Set <code>sortable: false</code> on a column to disable sorting for that column.
	</p>

	<StoryViewer {...storyBuilder.getExample('custom-columns')} />

	<h2>Filtering with SearchFilter</h2>
	<p>
		The <code>SearchFilter</code> component parses search queries into structured filters. Compose it
		with Table by passing the filtered data:
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<p>
		SearchFilter supports free text search (matches all columns), <code>column:value</code> syntax,
		and comparison operators like <code>age&gt;30</code>, <code>salary&gt;=90000</code>.
	</p>

	<StoryViewer {...storyBuilder.getExample('filtering')} />

	<!-- Snippets Documentation -->
	<div data-card>
		<h3>Available Snippets</h3>
		<ul>
			<li><strong>header</strong>: Custom header row rendering</li>
			<li>
				<strong>row</strong>: Custom row rendering (receives row data, columns, index, isSelected)
			</li>
			<li><strong>cell</strong>: Custom cell rendering (receives value, column, row)</li>
			<li><strong>empty</strong>: Custom empty state when no data</li>
		</ul>
	</div>
</article>
