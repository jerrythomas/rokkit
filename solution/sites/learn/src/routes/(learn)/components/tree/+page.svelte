<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A hierarchical tree component for navigating nested data. Supports tree-line connectors,
		expand/collapse, field mapping, keyboard navigation, and custom item rendering via snippets.
	</p>

	<!-- Basic Example -->
	<h2>Basic Example</h2>
	<p>
		Pass a nested array of objects with <code>text</code>, <code>value</code>, and optional
		<code>icon</code> and <code>children</code> fields. Nodes with <code>children</code> arrays
		are rendered as expandable branches.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<!-- No Lines -->
	<h2>No Lines</h2>
	<p>
		Set <code>showLines=&#123;false&#125;</code> to use simple indentation instead of tree-line
		connectors. Useful for a cleaner, more compact appearance.
	</p>

	<StoryViewer {...storyBuilder.getExample('no-lines')} />

	<!-- Field Mapping -->
	<h2>Field Mapping</h2>
	<p>
		Use the <code>fields</code> prop to remap your data keys — for example, mapping
		<code>name</code> → text and <code>id</code> → value without altering your data.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<StoryViewer {...storyBuilder.getExample('mapping')} />

	<!-- Custom Icons -->
	<h2>Custom Icons</h2>
	<p>
		Override the default expand/collapse chevrons with any icon via the <code>icons</code> prop.
		Here we use folder icons for a file-manager style tree.
	</p>

	<StoryViewer {...storyBuilder.getExample('icons')} />

	<!-- Snippets -->
	<h2>Custom Item Rendering</h2>
	<p>
		Use the <code>itemContent</code> snippet to control what appears inside each tree node.
		The snippet receives a <code>ProxyItem</code> — use <code>proxy.label</code>,
		<code>proxy.icon</code>, and <code>proxy.get('fieldName')</code> to access any field.
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<StoryViewer {...storyBuilder.getExample('snippets')} />

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of nested objects</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>value</strong> (bindable): Currently selected item value</li>
				<li><strong>showLines</strong>: Show tree-line connectors (default: true)</li>
				<li><strong>icons</strong>: Override the expand/collapse icons</li>
				<li><strong>size</strong>: Size variant (<code>sm</code>, <code>md</code>, <code>lg</code>)</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h2>Snippets</h2>
			<ul>
				<li>
					<strong>itemContent(proxy)</strong>: Custom rendering for tree nodes
				</li>
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
			<li><strong>proxy.label</strong>: Mapped display text</li>
			<li><strong>proxy.icon</strong>: Mapped icon class</li>
			<li><strong>proxy.href</strong>: Mapped href (renders an <code>&lt;a&gt;</code>)</li>
			<li><strong>proxy.value</strong>: The original raw item (object or primitive)</li>
			<li><strong>proxy.disabled</strong>: Whether the item is disabled</li>
			<li><strong>proxy.expanded</strong>: Expand state for branch nodes</li>
			<li><strong>proxy.hasChildren</strong>: Whether the node has children</li>
			<li><strong>proxy.get('field')</strong>: Read any field by name</li>
		</ul>
	</div>

	<div data-card>
		<h2>Events</h2>
		<ul>
			<li>
				<strong>onselect(value, proxy)</strong>: Fired when a node is selected — receives the raw
				item value and its ProxyItem
			</li>
		</ul>
	</div>
</article>
