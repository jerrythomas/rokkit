<script>
	import { Code } from '$lib/components/Story'
	import globalMapping from './snippets/00-global-mapping.js?raw'
	import perComponent from './snippets/01-per-component.svelte?raw'
	import itemIcons from './snippets/02-item-icons.svelte?raw'
	import installCollection from './snippets/03-install-collection.sh?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit uses semantic icon names that you map to actual icon classes in your UnoCSS
		configuration. This lets you swap icon sets project-wide without changing component code.
	</p>

	<h2>Global Icon Mapping</h2>
	<p>
		Define your icon mapping in your <code>uno.config.js</code> using the Rokkit theme helper.
		Components reference icons by semantic name (e.g., <code>expand</code>, <code>check</code>), and
		you decide which actual icon to use:
	</p>
	<Code content={globalMapping} language="javascript" />

	<h2>Semantic Icon Names</h2>
	<p>Components use these semantic names internally. Map each to your preferred icon:</p>
	<table>
		<thead>
			<tr><th>Name</th><th>Used By</th><th>Purpose</th></tr>
		</thead>
		<tbody>
			<tr><td><code>expand</code></td><td>Select, Tree, List</td><td>Expand/open indicator</td></tr>
			<tr
				><td><code>collapse</code></td><td>Select, Tree, List</td><td>Collapse/close indicator</td
				></tr
			>
			<tr><td><code>check</code></td><td>MultiSelect, Toggle</td><td>Selected/checked state</td></tr
			>
			<tr><td><code>close</code></td><td>Menu, Select</td><td>Close/dismiss action</td></tr>
			<tr><td><code>add</code></td><td>Tabs</td><td>Add new item</td></tr>
			<tr><td><code>remove</code></td><td>Tabs, Pill</td><td>Remove/delete item</td></tr>
			<tr><td><code>sort-asc</code></td><td>Table</td><td>Ascending sort indicator</td></tr>
			<tr><td><code>sort-desc</code></td><td>Table</td><td>Descending sort indicator</td></tr>
		</tbody>
	</table>

	<h2>Per-Component Overrides</h2>
	<p>
		Override icons for a specific component instance without affecting global defaults. Pass an <code
			>icons</code
		> prop with the names you want to change:
	</p>
	<Code content={perComponent} language="svelte" />

	<h2>Item-Level Icons</h2>
	<p>
		Map an <code>icon</code> field in your data to display per-item icons. The icon value should be a
		UnoCSS icon class:
	</p>
	<Code content={itemIcons} language="svelte" />

	<h2>Icon Collections</h2>
	<p>Rokkit works with any UnoCSS icon collection. Popular choices:</p>
	<ul>
		<li><code>@iconify-json/solar</code> — Solar icon set (used by default Rokkit theme)</li>
		<li><code>@iconify-json/lucide</code> — Clean, minimal line icons</li>
		<li><code>@iconify-json/mdi</code> — Material Design Icons</li>
		<li><code>@iconify-json/heroicons</code> — Heroicons by Tailwind</li>
	</ul>
	<Code content={installCollection} language="bash" />

	<h2>Related</h2>
	<ul>
		<li><a href="/styling">Styling</a> — Theme architecture and CSS customization</li>
		<li><a href="/color-system">Color System</a> — Semantic color tokens</li>
	</ul>
</article>
