<script>
	import { Code } from '$lib/components/Story'
	import oldWay from './snippets/00-old-way.js?raw'
	import rokkitWay from './snippets/01-rokkit-way.svelte?raw'
	import defaultMapping from './snippets/02-default-mapping.svelte?raw'
	import primitives from './snippets/03-primitives.svelte?raw'
	import nested from './snippets/04-nested.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		The <code>fields</code> prop is Rokkit's core concept. Instead of reshaping your data to match component
		contracts, you tell components which fields in your data map to which roles.
	</p>

	<h2>The Problem</h2>
	<p>
		Most UI libraries force you to transform your API data into their expected shape. If your API
		returns <code>&#123; name, id &#125;</code> but the component expects
		<code>&#123; label, key &#125;</code>, you write adapter code everywhere.
	</p>
	<Code content={oldWay} language="javascript" />

	<h2>The Rokkit Way</h2>
	<p>Pass a <code>fields</code> object that maps component roles to your data's property names:</p>
	<Code content={rokkitWay} language="svelte" />

	<h2>Standard Field Roles</h2>
	<table>
		<thead>
			<tr>
				<th>Role</th>
				<th>Purpose</th>
				<th>Components</th>
			</tr>
		</thead>
		<tbody>
			<tr><td><code>text</code></td><td>Display label</td><td>All</td></tr>
			<tr><td><code>value</code></td><td>Unique identifier for selection</td><td>All</td></tr>
			<tr><td><code>icon</code></td><td>Icon class name</td><td>List, Menu, Select, Tabs</td></tr>
			<tr><td><code>children</code></td><td>Nested items</td><td>List, Tree, Menu</td></tr>
			<tr><td><code>description</code></td><td>Secondary text</td><td>List, Card</td></tr>
			<tr><td><code>disabled</code></td><td>Item disabled state</td><td>List, Menu, Select</td></tr>
			<tr><td><code>component</code></td><td>Per-item Svelte component</td><td>List</td></tr>
			<tr
				><td><code>snippet</code></td><td>Named snippet for per-item rendering</td><td
					>List, Select</td
				></tr
			>
		</tbody>
	</table>

	<h2>Default Mapping</h2>
	<p>
		When no <code>fields</code> prop is provided, Rokkit uses the field names directly. So if your
		data already has <code>text</code> and <code>value</code> properties, no mapping is needed.
	</p>
	<Code content={defaultMapping} language="svelte" />

	<h2>Primitive Arrays</h2>
	<p>
		For arrays of strings or numbers, each item is used as both <code>text</code> and
		<code>value</code> automatically:
	</p>
	<Code content={primitives} language="svelte" />

	<h2>Nested Data</h2>
	<p>
		Map the <code>children</code> field for hierarchical data. Groups with children render as collapsible
		sections in List and Tree, or as option groups in Select and Menu.
	</p>
	<Code content={nested} language="svelte" />

	<h2>Related</h2>
	<ul>
		<li><a href="/snippets">Snippets</a> — Customize rendering with access to mapped fields</li>
		<li><a href="/components/list">List</a> — See field mapping in action</li>
		<li><a href="/components/select">Select</a> — Dropdown with mapped fields</li>
	</ul>
</article>
