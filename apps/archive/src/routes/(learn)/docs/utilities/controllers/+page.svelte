<article data-article-root>
	<p>
		Controllers are plain JavaScript objects that manage interaction state — which item is focused,
		what is selected, whether groups are expanded. They have no DOM dependency and can be tested
		without a browser.
	</p>

	<h2>Available controllers</h2>
	<ul>
		<li>
			<strong>ListController</strong> — flat and grouped list navigation with single/multi-select;
			supports nested tree navigation when used with the <code>navigator</code> action
		</li>
		<li><strong>NestedController</strong> — tree navigation with expand/collapse</li>
		<li><strong>TabularController</strong> — row/column navigation for data tables</li>
	</ul>

	<h2>ListController</h2>
	<p>
		Manages a flat or grouped list. Items are identified by a <code>value</code> field. Supports single
		selection (default), multi-selection, and type-ahead search.
	</p>
	<table>
		<thead>
			<tr><th>Method</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>setItems(items, fields)</code></td><td>Load items with field mapping</td></tr>
			<tr><td><code>focusNext()</code></td><td>Move focus to next item</td></tr>
			<tr><td><code>focusPrev()</code></td><td>Move focus to previous item</td></tr>
			<tr><td><code>focusFirst()</code></td><td>Move focus to first item</td></tr>
			<tr><td><code>focusLast()</code></td><td>Move focus to last item</td></tr>
			<tr><td><code>select(value)</code></td><td>Select item by value</td></tr>
			<tr><td><code>search(char)</code></td><td>Type-ahead: jump to matching item</td></tr>
		</tbody>
	</table>

	<h2>NestedController</h2>
	<p>
		Extends ListController for hierarchical data. Tracks expanded/collapsed state per group using
		path keys. Follows WAI-ARIA TreeView keyboard patterns.
	</p>
	<table>
		<thead>
			<tr><th>Method</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>expand(path)</code></td><td
					>Expand group; if already expanded, move focus to first child</td
				></tr
			>
			<tr
				><td><code>collapse(path)</code></td><td
					>Collapse group; if on a child, move focus to parent</td
				></tr
			>
			<tr><td><code>toggle(path)</code></td><td>Toggle expand/collapse state</td></tr>
		</tbody>
	</table>

	<p>
		See <a href="/docs/utilities/states">@rokkit/states</a> for full API reference and usage examples.
	</p>
</article>
