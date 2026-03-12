<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import oldWay from './field-mapping/snippets/00-old-way.js?raw'
	import rokkitWay from './field-mapping/snippets/01-rokkit-way.svelte?raw'
	import defaultMapping from './field-mapping/snippets/02-default-mapping.svelte?raw'
	import primitives from './field-mapping/snippets/03-primitives.svelte?raw'
	import nested from './field-mapping/snippets/04-nested.svelte?raw'
</script>

<article data-article-root>
	<h1>Data Binding</h1>
	<p>
		Rokkit is built around one principle: your data should drive your UI, not the other way around.
		Every selection component — <code>List</code>, <code>Select</code>, <code>Tree</code> — works with
		your data as-is via field mapping, not by forcing you to reshape it.
	</p>

	<h2>Overview</h2>
	<p>
		Most component libraries require your data to match a specific shape. A <code>Select</code>
		needs <code>&#123; label, value &#125;</code>, a <code>Tree</code> needs
		<code>&#123; name, children &#125;</code>. Every component has its own convention, so you write
		adapters everywhere.
	</p>
	<h3>The Rokkit Approach</h3>
	<p>
		Instead, every Rokkit component accepts a <code>fields</code> prop that maps your keys to the
		component's semantic fields. Your <code>&#123; name, id, nested &#125;</code> data works directly
		— no transformation, no adapter layer.
	</p>

	<h2>Field Mapping</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		The <code>fields</code> prop is Rokkit's core concept. Instead of reshaping your data to match component
		contracts, you tell components which fields in your data map to which roles.
	</p>

	<h3>The Problem</h3>
	<p>
		Most UI libraries force you to transform your API data into their expected shape. If your API
		returns <code>&#123; name, id &#125;</code> but the component expects
		<code>&#123; label, key &#125;</code>, you write adapter code everywhere.
	</p>
	<Code content={oldWay} language="javascript" />

	<h3>The Rokkit Way</h3>
	<p>Pass a <code>fields</code> object that maps component roles to your data's property names:</p>
	<Code content={rokkitWay} language="svelte" />

	<h3>Standard Field Roles</h3>
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

	<h3>Default Mapping</h3>
	<p>
		When no <code>fields</code> prop is provided, Rokkit uses the field names directly. So if your
		data already has <code>text</code> and <code>value</code> properties, no mapping is needed.
	</p>
	<Code content={defaultMapping} language="svelte" />

	<h3>Primitive Arrays</h3>
	<p>
		For arrays of strings or numbers, each item is used as both <code>text</code> and
		<code>value</code> automatically:
	</p>
	<Code content={primitives} language="svelte" />

	<h3>Nested Data</h3>
	<p>
		Map the <code>children</code> field for hierarchical data. Groups with children render as collapsible
		sections in List and Tree, or as option groups in Select and Menu.
	</p>
	<Code content={nested} language="svelte" />

	<h2>Data Sources</h2>
	<p class="text-surface-z5">Coming soon.</p>
</article>
