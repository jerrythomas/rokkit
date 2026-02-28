<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A flexible, keyboard-navigable list component for displaying and selecting from collections of
		items. Supports primitives, nested groups, field mapping, and fully customizable item rendering
		via snippets.
	</p>

	<!-- Basic Example -->
	<h2>Basic Example</h2>
	<p>
		Pass an array of objects with <code>label</code> and optionally <code>icon</code> fields. Bind
		<code>value</code> to track the current selection and use <code>onselect</code> for a callback.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<!-- Primitives -->
	<h2>Primitive Arrays</h2>
	<p>
		Pass a plain array of strings or numbers — no objects required. Each primitive becomes both the
		display text and the selected value.
	</p>

	<StoryViewer {...storyBuilder.getExample('primitives')} />

	<!-- Nested Groups -->
	<h2>Nested Groups</h2>
	<p>
		Items with a <code>children</code> array are rendered as collapsible groups. Add the
		<code>collapsible</code> prop to allow toggling. Keyboard navigation with arrow keys moves
		through all visible items; left/right keys collapse and expand groups.
	</p>

	<StoryViewer {...storyBuilder.getExample('nested')} />

	<!-- Field Mapping -->
	<h2>Field Mapping</h2>
	<p>
		Your data rarely matches the component's default field names. Use the <code>fields</code> prop
		to remap — for example, mapping <code>name</code> → text and <code>path</code> → value without
		altering your data.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<StoryViewer {...storyBuilder.getExample('mapping')} />

	<!-- Custom Icons -->
	<h2>Custom Icons</h2>
	<p>
		Override the default expand/collapse chevrons with any icon via the <code>icons</code> prop.
		Here we use folder icons to make a file-tree style list.
	</p>

	<StoryViewer {...storyBuilder.getExample('icons')} />

	<!-- Item Snippet -->
	<h2>Custom Item Rendering</h2>
	<p>
		Use the <code>itemContent</code> snippet to fully control what appears inside each list item.
		The snippet receives a <code>ProxyItem</code> — use <code>proxy.text</code>,
		<code>proxy.icon</code>, and <code>proxy.get('fieldName')</code> to access any field. Here
		each item shows a status badge alongside the icon and label.
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<StoryViewer {...storyBuilder.getExample('snippets')} />

	<!-- Per-Item Snippet -->
	<h2>Per-Item Snippets</h2>
	<p>
		For items that need entirely different layouts, set <code>item.snippet = 'name'</code> to route
		each item to a named snippet. Items without a <code>snippet</code> field fall back to
		<code>itemContent</code> (or the default renderer). Here fruits and vegetables get distinct
		treatments.
	</p>

	<Code {...storyBuilder.getFragment(3)} />

	<StoryViewer {...storyBuilder.getExample('mixed')} />

	<!-- Interactive Snippets -->
	<h2>Interactive Elements in Snippets</h2>
	<p>
		Snippets support full Svelte reactivity — you can embed checkboxes, toggles, or inputs.
		Use <code>proxy.value</code> to access the original item and mutate it directly. Call
		<code>e.stopPropagation()</code> on the control's click to prevent the List from also
		triggering item selection.
	</p>

	<StoryViewer {...storyBuilder.getExample('interactive')} />

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of objects or primitives</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>value</strong> (bindable): Currently selected item value</li>
				<li><strong>collapsible</strong>: Allow groups to be expanded/collapsed</li>
				<li><strong>icons</strong>: Override the expand/collapse icons</li>
				<li><strong>disabled</strong>: Disable the entire list</li>
				<li><strong>size</strong>: Size variant (<code>sm</code>, <code>md</code>, <code>lg</code>)</li>
			</ul>
		</div>

		<div data-card>
			<h2>Snippets</h2>
			<ul>
				<li>
					<strong>itemContent(proxy)</strong>: Custom rendering for leaf items
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
			<li><strong>proxy.text</strong>: Mapped display text</li>
			<li><strong>proxy.icon</strong>: Mapped icon class</li>
			<li><strong>proxy.href</strong>: Mapped href (renders an <code>&lt;a&gt;</code>)</li>
			<li><strong>proxy.value</strong>: The original raw item (object or primitive)</li>
			<li><strong>proxy.disabled</strong>: Whether the item is disabled</li>
			<li><strong>proxy.expanded</strong>: Expand state for groups</li>
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
