<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import itemSnippet from './snippets/snippets/00-item-snippet.svelte?raw'
	import perItem from './snippets/snippets/01-per-item.svelte?raw'
	import groupSnippet from './snippets/snippets/02-group-snippet.svelte?raw'
	import perItemComponent from './snippets/snippets/03-per-item-component.svelte?raw'
	import interactive from './snippets/snippets/04-interactive.svelte?raw'
</script>

<article data-article-root>
	<h1>Composability</h1>
	<p>
		Every Rokkit component exposes named snippet slots. Pass a snippet to replace any part of the
		component's rendering — item content, group headers, empty states — without forking the component
		or fighting with CSS overrides.
	</p>

	<h2>Overview</h2>
	<p>
		Svelte 5 snippets are the clean equivalent of render props or slot content. They keep your
		customization logic co-located with your usage, not inside the library.
	</p>

	<h2>Snippets &amp; Customization</h2>
	<p class="text-[1.0625rem] leading-7 text-surface-z6 mb-8">
		Svelte snippets give you full control over how each item renders — without wrapping
		components or forking source code. The component handles data logic, keyboard navigation,
		and ARIA; you control the pixels.
	</p>

	<h3>Item Snippets</h3>
	<p>
		Every collection component accepts an <code>itemContent</code> snippet that receives a
		<code>ProxyItem</code>. Use <code>proxy.label</code>, <code>proxy.icon</code>, and
		<code>proxy.get('field')</code> to access mapped values:
	</p>
	<Code content={itemSnippet} language="svelte" />

	<h3>The ProxyItem API</h3>
	<p>
		Snippets receive a <code>ProxyItem</code> instance that provides a unified interface
		to the underlying data, regardless of whether it's an object or a primitive:
	</p>
	<table>
		<thead>
			<tr><th>Property / Method</th><th>Returns</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>proxy.label</code></td><td>string</td><td>Mapped display text</td></tr>
			<tr><td><code>proxy.icon</code></td><td>string</td><td>Mapped icon class</td></tr>
			<tr><td><code>proxy.href</code></td><td>string</td><td>Mapped href (renders as <code>&lt;a&gt;</code>)</td></tr>
			<tr><td><code>proxy.value</code></td><td>any</td><td>The original raw item</td></tr>
			<tr><td><code>proxy.disabled</code></td><td>boolean</td><td>Whether the item is disabled</td></tr>
			<tr><td><code>proxy.expanded</code></td><td>boolean</td><td>Expand state for groups</td></tr>
			<tr><td><code>proxy.get('field')</code></td><td>any</td><td>Read any field by name</td></tr>
		</tbody>
	</table>

	<h3>Per-Item Snippets</h3>
	<p>
		Set <code>item.snippet = 'name'</code> to route specific items to named snippets.
		Items without a <code>snippet</code> field use the default <code>itemContent</code>
		snippet:
	</p>
	<Code content={perItem} language="svelte" />

	<h3>Group Snippets</h3>
	<p>
		For nested data, use <code>groupContent</code> to customize how group headers render:
	</p>
	<Code content={groupSnippet} language="svelte" />

	<h3>Per-Item Components</h3>
	<p>
		Map a <code>component</code> field to render entirely different Svelte components for
		different items:
	</p>
	<Code content={perItemComponent} language="svelte" />

	<h3>Interactive Snippets</h3>
	<p>
		Snippets support full Svelte reactivity. Embed checkboxes, toggles, or inputs inside
		list items. Use <code>e.stopPropagation()</code> on the control's click to prevent
		the List from also triggering item selection:
	</p>
	<Code content={interactive} language="svelte" />
</article>
