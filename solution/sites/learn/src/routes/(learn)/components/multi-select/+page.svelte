<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A dropdown input for selecting multiple values from a list of options. Supports field mapping
		to adapt to any data shape, grouped options, tag-style display with configurable overflow,
		and fully customizable option rendering via snippets.
	</p>

	<!-- Basic Example -->
	<h2>Basic Example</h2>
	<p>
		Pass an array of objects with <code>text</code> and optionally <code>value</code> fields.
		Bind <code>value</code> to track the selected values as an array. Selected items appear as
		tags in the trigger button.
	</p>

	<Code {...storyBuilder.getFragment(0)} />
	<StoryViewer {...storyBuilder.getExample('properties')} />

	<!-- Field Mapping -->
	<h2>Field Mapping</h2>
	<p>
		Your data rarely matches the component's default field names (<code>text</code>,
		<code>value</code>). Use the <code>fields</code> prop to remap without transforming your data.
	</p>

	<Code {...storyBuilder.getFragment(1)} />
	<StoryViewer {...storyBuilder.getExample('fields')} />

	<!-- Grouped Items -->
	<h2>Grouped Items</h2>
	<p>
		Items with a <code>children</code> array are rendered as labelled option groups with a visual
		divider between groups. Only leaf items (children) are selectable — group headers are
		presentational.
	</p>

	<StoryViewer {...storyBuilder.getExample('grouped')} />

	<!-- Tags Display -->
	<h2>Tags Display</h2>
	<p>
		Selected items are shown as tags in the trigger button. Use the <code>maxDisplay</code> prop
		to limit how many tags are visible — additional selections show as a
		<code>+N more</code> badge. This keeps the trigger compact when many items are selected.
	</p>

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of objects or grouped option arrays</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>value</strong> (bindable): Array of selected values</li>
				<li><strong>selected</strong> (bindable): Array of selected raw item objects</li>
				<li><strong>placeholder</strong>: Text shown when nothing is selected</li>
				<li><strong>size</strong>: Size variant (<code>sm</code>, <code>md</code>, <code>lg</code>)</li>
				<li><strong>maxDisplay</strong>: Max tags shown before "+N more" overflow badge</li>
				<li><strong>align</strong>: Dropdown alignment (<code>start</code>, <code>end</code>)</li>
				<li><strong>direction</strong>: Dropdown direction (<code>down</code>, <code>up</code>)</li>
				<li><strong>disabled</strong>: Disable the entire multi-select</li>
				<li><strong>class</strong>: Additional CSS classes on the root element</li>
			</ul>
		</div>

		<div data-card>
			<h2>Snippets</h2>
			<ul>
				<li><strong>itemContent(proxy)</strong>: Custom rendering for dropdown options</li>
				<li><strong>groupContent(proxy)</strong>: Custom rendering for group headers</li>
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
				<strong>onchange(values, items)</strong>: Fired when selection changes — receives the
				array of selected values and the array of selected raw item objects
			</li>
		</ul>
	</div>
</article>
