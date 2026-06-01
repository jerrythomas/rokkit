<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A contextual action menu that opens on click. Supports icons, grouped items, keyboard
		navigation, and custom alignment.
	</p>

	<h2>Basic Example</h2>
	<p>A simple action menu with icons:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Grouped Items</h2>
	<p>
		Organize menu items into visual groups using <code>children</code>. Groups have headers but
		keyboard navigation moves through all leaf items.
	</p>

	<StoryViewer {...storyBuilder.getExample('groups')} />

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of menu items (objects or primitives)</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>label</strong>: Button label</li>
				<li><strong>icon</strong>: Button icon</li>
				<li><strong>align</strong>: Dropdown alignment (<code>start</code>, <code>end</code>)</li>
				<li><strong>direction</strong>: Open direction (<code>down</code>, <code>up</code>)</li>
				<li><strong>showArrow</strong>: Show dropdown arrow</li>
				<li><strong>disabled</strong>: Disable the menu</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h2>Snippets</h2>
			<ul>
				<li>
					<strong>itemContent(proxy)</strong>: Custom rendering for menu items
				</li>
				<li>
					<strong>groupContent(proxy)</strong>: Custom rendering for group headers
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
			<li><strong>proxy.get('field')</strong>: Read any field by name</li>
		</ul>
	</div>

	<div data-card>
		<h2>Events</h2>
		<ul>
			<li>
				<strong>onselect(value, proxy)</strong>: Fired when an item is selected — receives the raw
				item value and its ProxyItem
			</li>
		</ul>
	</div>
</article>
