<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A dropdown input for choosing one value from a list of options. Supports field mapping to adapt
		to any data shape, grouped options, filterable search, and fully customizable option rendering
		via snippets.
	</p>

	<!-- Basic Example -->
	<h2>Basic Example</h2>
	<p>
		Pass an array of objects with <code>label</code> and optionally <code>icon</code> fields. Bind
		<code>value</code> to track the selected value. Set <code>disabled: true</code> on any item to
		make it unselectable.
	</p>

	<Code {...storyBuilder.getFragment(0)} />
	<StoryViewer {...storyBuilder.getExample('properties')} />

	<!-- Field Mapping -->
	<h2>Field Mapping</h2>
	<p>
		Your data rarely matches the component's default field names (<code>label</code>,
		<code>value</code>). Use the <code>fields</code> prop to remap without transforming your data.
	</p>

	<Code {...storyBuilder.getFragment(1)} />
	<StoryViewer {...storyBuilder.getExample('fields')} />

	<!-- Grouped Options -->
	<h2>Grouped Options</h2>
	<p>
		Items with a <code>children</code> array are rendered as labelled option groups with a visual
		divider between groups. Only leaf items (children) are selectable — group headers are
		presentational.
	</p>

	<Code {...storyBuilder.getFragment(2)} />
	<StoryViewer {...storyBuilder.getExample('grouped')} />

	<!-- Filterable -->
	<h2>Filterable</h2>
	<p>
		Enable the <code>filterable</code> prop to add a search input at the top of the dropdown.
		Useful for long option lists. The filter matches against the display text of each option.
		Use <code>filterPlaceholder</code> to customize the search input hint.
	</p>

	<StoryViewer {...storyBuilder.getExample('filterable')} />

	<!-- Custom Option Snippet -->
	<h2>Custom Option Rendering</h2>
	<p>
		Use the <code>option</code> snippet to fully control what appears inside each dropdown option.
		The snippet receives a <code>ProxyItem</code> — use <code>proxy.text</code>,
		<code>proxy.icon</code>, and <code>proxy.get('fieldName')</code> to access any field.
	</p>

	<Code {...storyBuilder.getFragment(3)} />
	<StoryViewer {...storyBuilder.getExample('snippet')} />

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>options</strong>: Array of objects or grouped option arrays</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>value</strong> (bindable): Currently selected value</li>
				<li><strong>selected</strong> (bindable): Currently selected raw item object</li>
				<li><strong>placeholder</strong>: Text shown when nothing is selected</li>
				<li><strong>size</strong>: Size variant (<code>sm</code>, <code>md</code>, <code>lg</code>)</li>
				<li><strong>align</strong>: Dropdown alignment (<code>left</code>, <code>right</code>)</li>
				<li><strong>direction</strong>: Dropdown direction (<code>down</code>, <code>up</code>)</li>
				<li><strong>maxRows</strong>: Max visible rows before scroll (default: 5)</li>
				<li><strong>disabled</strong>: Disable the entire select</li>
				<li><strong>filterable</strong>: Show a search input in the dropdown</li>
				<li><strong>filterPlaceholder</strong>: Placeholder for the filter input</li>
				<li><strong>class</strong>: Additional CSS classes on the root element</li>
			</ul>
		</div>

		<div data-card>
			<h2>Snippets</h2>
			<ul>
				<li><strong>option(proxy)</strong>: Custom rendering for dropdown options</li>
				<li><strong>groupLabel(proxy)</strong>: Custom rendering for group headers</li>
				<li><strong>selectedValue(proxy)</strong>: Custom rendering in the trigger button</li>
				<li>
					<strong>[name](proxy)</strong>: Per-item snippet — set <code>item.snippet = 'name'</code>
				</li>
			</ul>
		</div>
	</div>

	<div data-card>
		<h2>ProxyItem API</h2>
		<p>Snippets receive a <code>ProxyItem</code> instance:</p>
		<ul>
			<li><strong>proxy.text</strong>: Mapped display text</li>
			<li><strong>proxy.icon</strong>: Mapped icon class</li>
			<li><strong>proxy.value</strong>: The extracted value field (primitive)</li>
			<li><strong>proxy.disabled</strong>: Whether the item is disabled</li>
			<li><strong>proxy.get('field')</strong>: Read any field by mapped or raw name</li>
		</ul>
	</div>

	<div data-card>
		<h2>Events</h2>
		<ul>
			<li>
				<strong>onchange(value, item)</strong>: Fired when selection changes — receives the
				extracted value and the raw item object
			</li>
		</ul>
	</div>
</article>
