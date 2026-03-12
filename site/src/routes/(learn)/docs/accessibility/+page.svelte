<article data-article-root>
	<h1>Accessibility</h1>
	<p>
		All interactive Rokkit components support full keyboard navigation and ARIA out of the box. This
		is implemented via two primitives — controllers (state machines) and the
		<code>navigator</code> action (DOM binding) — that you can also use to build your own accessible components.
	</p>

	<h2>Overview</h2>
	<ul>
		<li>Arrow key navigation in all lists, trees, menus, and selects</li>
		<li>Home / End to jump to first / last item</li>
		<li>Enter / Space to select</li>
		<li>Escape to close dropdowns and restore focus</li>
		<li>ARIA roles, states, and properties on all interactive elements</li>
		<li>Focus management: focus returns to trigger on close</li>
	</ul>

	<h2>Keyboard Navigation</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Every Rokkit component includes full keyboard navigation and ARIA support out of the box. No
		configuration required.
	</p>

	<h3>The Navigator Pattern</h3>
	<p>
		Rokkit uses a Svelte action called <code>navigator</code> that attaches keyboard handlers to any
		container element. Combined with a <code>ListController</code>, it provides:
	</p>
	<ul>
		<li>Arrow key navigation (up/down, left/right)</li>
		<li>Home/End to jump to first/last item</li>
		<li>Enter/Space to select</li>
		<li>Type-ahead search to jump to matching items</li>
		<li>Proper ARIA roles and attributes</li>
		<li>Focus management and visible focus indicators</li>
	</ul>

	<h3>Keyboard Shortcuts</h3>
	<table>
		<thead>
			<tr>
				<th>Key</th>
				<th>Action</th>
				<th>Context</th>
			</tr>
		</thead>
		<tbody>
			<tr
				><td><code>ArrowDown</code></td><td>Move to next item</td><td>Lists, Menus, Selects</td></tr
			>
			<tr
				><td><code>ArrowUp</code></td><td>Move to previous item</td><td>Lists, Menus, Selects</td
				></tr
			>
			<tr><td><code>ArrowRight</code></td><td>Expand group / next tab</td><td>Trees, Tabs</td></tr>
			<tr><td><code>ArrowLeft</code></td><td>Collapse group / prev tab</td><td>Trees, Tabs</td></tr>
			<tr><td><code>Home</code></td><td>First item</td><td>All</td></tr>
			<tr><td><code>End</code></td><td>Last item</td><td>All</td></tr>
			<tr><td><code>Enter</code> / <code>Space</code></td><td>Select item</td><td>All</td></tr>
			<tr><td><code>Escape</code></td><td>Close dropdown</td><td>Select, Menu</td></tr>
			<tr><td>Type character</td><td>Jump to matching item</td><td>Lists, Selects</td></tr>
		</tbody>
	</table>

	<h3>Tree Navigation</h3>
	<p>
		In tree-style components (List with <code>collapsible</code>, Tree), the keyboard follows the
		WAI-ARIA TreeView pattern:
	</p>
	<ul>
		<li><code>ArrowRight</code> on a collapsed group — expands it</li>
		<li><code>ArrowRight</code> on an expanded group — moves focus to first child</li>
		<li><code>ArrowLeft</code> on a child — moves focus to parent group</li>
		<li><code>ArrowLeft</code> on an expanded group — collapses it</li>
		<li><code>ArrowRight</code> on a leaf item — does nothing (no children)</li>
	</ul>

	<h3>ARIA Support</h3>
	<p>Components automatically apply correct ARIA roles and attributes:</p>
	<table>
		<thead>
			<tr><th>Component</th><th>Container Role</th><th>Item Role</th></tr>
		</thead>
		<tbody>
			<tr
				><td>List</td><td><code>navigation</code></td><td
					><code>button</code> / <code>link</code></td
				></tr
			>
			<tr><td>Tree</td><td><code>tree</code></td><td><code>treeitem</code></td></tr>
			<tr><td>Menu</td><td><code>menu</code></td><td><code>menuitem</code></td></tr>
			<tr><td>Select</td><td><code>listbox</code></td><td><code>option</code></td></tr>
			<tr><td>Tabs</td><td><code>tablist</code></td><td><code>tab</code></td></tr>
		</tbody>
	</table>
	<p>
		Selected items receive <code>aria-selected="true"</code>, expanded groups get
		<code>aria-expanded</code>, and disabled items have <code>aria-disabled="true"</code>.
	</p>

	<h3>Type-Ahead Search</h3>
	<p>
		In List and Select components, typing characters jumps to the first matching item. The search
		matches against the display text (the <code>text</code> field) and resets after a brief pause. This
		works automatically — no configuration needed.
	</p>

	<h3>Focus Management</h3>
	<p>
		When a dropdown opens (Select, Menu), focus moves to the first item or the currently selected
		item. When it closes, focus returns to the trigger element. Tab key moves focus out of the
		component entirely, following standard web behavior.
	</p>

	<h2>Tooltips</h2>
	<p class="text-surface-z5">Coming soon.</p>

	<h2>Internationalization</h2>
	<p class="text-surface-z5">Coming soon.</p>
</article>
