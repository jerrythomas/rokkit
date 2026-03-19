<script>
	import { Code } from '$lib/components/Story'
	import proxyItem from './snippets/00-proxy-item.svelte?raw'
	import listController from './snippets/01-list-controller.svelte?raw'
	import vibeStore from './snippets/02-vibe.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		<code>@rokkit/states</code> provides reactive state primitives, navigation controllers, and application
		stores. These are the building blocks used internally by all Rokkit components — and available for
		building custom accessible UI.
	</p>

	<h2>ProxyItem — view mapping</h2>
	<p>
		A read-only view that resolves field mappings for a single item. Used by all Rokkit components
		to normalize data access via the <code>fields</code> prop:
	</p>
	<Code content={proxyItem} language="svelte" />
	<p>
		<code>ProxyTree</code> is the hierarchical version, used for tree data.
		<code>LazyProxyItem</code>
		defers field resolution until accessed.
	</p>

	<h2>ListController — navigation state</h2>
	<p>
		Manages focus and selection state for a flat or grouped list. No DOM dependency — works in tests
		without a browser. Used with the <code>navigator</code> action from
		<code>@rokkit/actions</code>:
	</p>
	<Code content={listController} language="svelte" />

	<h2>TableController — tabular navigation</h2>
	<p>
		Manages row/column focus for data tables. Provides <code>moveRow(delta)</code>,
		<code>moveCol(delta)</code>, and cell selection. Used internally by the Table component.
	</p>

	<h2>vibe — reactive theming store</h2>
	<p>
		Tracks the current theme attributes on the <code>&lt;html&gt;</code> element. Read it to know
		the active style, mode, and palette. <code>ThemeSwitcherToggle</code> from
		<code>@rokkit/app</code> writes to <code>vibe</code> when the user switches themes:
	</p>
	<Code content={vibeStore} language="svelte" />

	<h2>All exports</h2>
	<table>
		<thead>
			<tr><th>Export</th><th>Type</th><th>Purpose</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>ProxyItem</code></td><td>class</td><td
					>Read-only field-mapped view of one item</td
				></tr
			>
			<tr
				><td><code>LazyProxyItem</code></td><td>class</td><td
					>ProxyItem with deferred field resolution</td
				></tr
			>
			<tr
				><td><code>ProxyTree</code></td><td>class</td><td>Hierarchical ProxyItem for tree data</td
				></tr
			>
			<tr
				><td><code>Wrapper</code></td><td>class</td><td
					>Reactive model wrapper with change tracking</td
				></tr
			>
			<tr
				><td><code>LazyWrapper</code></td><td>class</td><td>Wrapper with lazy-loading support</td
				></tr
			>
			<tr
				><td><code>ListController</code></td><td>class</td><td
					>Flat/grouped list navigation state</td
				></tr
			>
			<tr
				><td><code>TableController</code></td><td>class</td><td>Row/column navigation for tables</td
				></tr
			>
			<tr
				><td><code>vibe</code></td><td>store</td><td
					>Reactive current-theme state (style/mode/palette)</td
				></tr
			>
			<tr
				><td><code>messages</code></td><td>store</td><td
					>App-level notification/toast message queue</td
				></tr
			>
			<tr><td><code>watchMedia</code></td><td>function</td><td>Reactive media query watcher</td></tr
			>
			<tr
				><td><code>defaultBreakpoints</code></td><td>object</td><td
					>Standard breakpoint definitions for watchMedia</td
				></tr
			>
			<tr
				><td><code>BASE_FIELDS</code></td><td>object</td><td
					>Default field mapping (label/value/icon/etc.)</td
				></tr
			>
		</tbody>
	</table>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/utilities/actions">@rokkit/actions</a> — The <code>navigator</code> action pairs
			with controllers
		</li>
		<li>
			<a href="/docs/utilities/app">@rokkit/app</a> — <code>ThemeSwitcherToggle</code> writes to
			<code>vibe</code>
		</li>
		<li>
			<a href="/docs/utilities/controllers">Controllers</a> — Overview of the controller pattern
		</li>
	</ul>
</article>
