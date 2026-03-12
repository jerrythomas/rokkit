<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import valueBinding from './state-management/snippets/00-value-binding.svelte?raw'
	import changeEvents from './state-management/snippets/01-change-events.svelte?raw'
	import multiSelection from './state-management/snippets/02-multi-selection.svelte?raw'
	import tabsToggle from './state-management/snippets/03-tabs-toggle.svelte?raw'
	import globalMapping from './icons/snippets/00-global-mapping.js?raw'
	import perComponent from './icons/snippets/01-per-component.svelte?raw'
	import itemIcons from './icons/snippets/02-item-icons.svelte?raw'
	import installCollection from './icons/snippets/03-install-collection.sh?raw'
</script>

<article data-article-root>
	<h1>Utilities</h1>
	<p>
		Rokkit's interactivity is built on two composable primitives: <strong>controllers</strong>
		(pure state machines with no DOM dependency) and the <strong>navigator</strong> Svelte action (which
		binds a controller to the DOM, adds keyboard handlers, and manages ARIA attributes).
	</p>
	<p>
		The separation means you can use a controller in tests without a browser, and swap the visual
		rendering without touching the interaction logic. It also means you can build your own
		accessible components by reusing the same controllers Rokkit uses internally.
	</p>

	<h2>State Management</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit components use Svelte 5's <code>$state</code> and <code>$bindable</code> runes for clean, predictable
		state management. Every component follows the same binding pattern.
	</p>

	<h3>Value Binding</h3>
	<p>
		All selection components expose a <code>value</code> prop that can be bound. The value
		corresponds to the <code>value</code> field from your data (or the item itself for primitives):
	</p>
	<Code content={valueBinding} language="svelte" />

	<h3>Change Events</h3>
	<p>
		Use <code>onchange</code> or <code>onselect</code> for side effects when selection changes. The callback
		receives the new value:
	</p>
	<Code content={changeEvents} language="svelte" />

	<h3>Controlled vs Uncontrolled</h3>
	<p>Components work in both modes:</p>
	<ul>
		<li>
			<strong>Uncontrolled</strong> — Omit <code>bind:value</code>. The component manages its own
			state internally. Use <code>onchange</code> to react to changes.
		</li>
		<li>
			<strong>Controlled</strong> — Use <code>bind:value</code> to sync state with your application. The
			component and your state stay in sync automatically.
		</li>
	</ul>

	<h3>Multi-Selection</h3>
	<p>
		<code>MultiSelect</code> binds an array of values:
	</p>
	<Code content={multiSelection} language="svelte" />

	<h3>Tabs and Toggle</h3>
	<p>
		<code>Tabs</code> and <code>Toggle</code> also use <code>bind:value</code> with the same pattern:
	</p>
	<Code content={tabsToggle} language="svelte" />

	<h2>Navigator</h2>
	<p>
		The <code>navigator</code> Svelte action connects a controller to a container element. It intercepts
		keyboard events, routes them through the controller, and syncs the DOM focus and ARIA state in response.
	</p>
	<h3>Usage</h3>
	<pre><code>&lt;ul use:navigator=&#123;&#123; controller, onselect &#125;&#125;&gt;</code></pre>
	<p>Full API reference and examples coming soon.</p>

	<h2>Controllers</h2>
	<p>
		Controllers are plain JavaScript objects that manage interaction state — which item is focused,
		what is selected, whether groups are expanded. They have no DOM dependency and can be tested
		without a browser.
	</p>
	<h3>Available Controllers</h3>
	<ul>
		<li>
			<strong>ListController</strong> — flat and grouped list navigation with single/multi-select
		</li>
		<li><strong>NestedController</strong> — tree navigation with expand/collapse</li>
		<li><strong>TabularController</strong> — row/column navigation for data tables</li>
	</ul>
	<p>Full API reference and examples coming soon.</p>

	<h2>Icons</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit uses semantic icon names that you map to actual icon classes in your UnoCSS
		configuration. This lets you swap icon sets project-wide without changing component code.
	</p>

	<h3>Global Icon Mapping</h3>
	<p>
		Define your icon mapping in your <code>uno.config.js</code> using the Rokkit theme helper.
		Components reference icons by semantic name (e.g., <code>expand</code>, <code>check</code>), and
		you decide which actual icon to use:
	</p>
	<Code content={globalMapping} language="javascript" />

	<h3>Semantic Icon Names</h3>
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

	<h3>Per-Component Overrides</h3>
	<p>
		Override icons for a specific component instance without affecting global defaults. Pass an <code
			>icons</code
		> prop with the names you want to change:
	</p>
	<Code content={perComponent} language="svelte" />

	<h3>Item-Level Icons</h3>
	<p>
		Map an <code>icon</code> field in your data to display per-item icons. The icon value should be a
		UnoCSS icon class:
	</p>
	<Code content={itemIcons} language="svelte" />

	<h3>Icon Collections</h3>
	<p>Rokkit works with any UnoCSS icon collection. Popular choices:</p>
	<ul>
		<li><code>@iconify-json/solar</code> — Solar icon set (used by default Rokkit theme)</li>
		<li><code>@iconify-json/lucide</code> — Clean, minimal line icons</li>
		<li><code>@iconify-json/mdi</code> — Material Design Icons</li>
		<li><code>@iconify-json/heroicons</code> — Heroicons by Tailwind</li>
	</ul>
	<Code content={installCollection} language="bash" />

	<h2>Connector</h2>
	<p>
		The Connector component is a versatile utility that helps display connecting lines in nested
		tree views. It provides visual cues that help users understand the hierarchical relationships
		between items in tree structures.
	</p>
	<p>
		Full reference and interactive demo available on the <a href="/docs/utilities/connector"
			>Connector page</a
		>.
	</p>

	<h2>Custom Primitives</h2>
	<p class="text-surface-z5">Coming soon.</p>
</article>
