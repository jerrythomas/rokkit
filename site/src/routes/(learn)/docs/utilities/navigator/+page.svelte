<article data-article-root>
	<p>
		The <code>navigator</code> Svelte action connects a controller to a container element. It
		intercepts keyboard events, routes them through the controller, and syncs DOM focus and ARIA
		state in response.
	</p>

	<h2>Usage</h2>
	<pre><code>&lt;ul use:navigator=&#123;&#123; controller, onselect &#125;&#125;&gt;</code></pre>

	<h2>Options</h2>
	<table>
		<thead>
			<tr><th>Option</th><th>Type</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>controller</code></td><td
					><code>ListController | NestedController</code></td
				><td>The state machine to bind</td></tr
			>
			<tr
				><td><code>onselect</code></td><td><code>(value) =&gt; void</code></td><td
					>Called when an item is selected</td
				></tr
			>
			<tr
				><td><code>onchange</code></td><td><code>(value) =&gt; void</code></td><td
					>Called on any navigation change</td
				></tr
			>
		</tbody>
	</table>

	<h2>How it works</h2>
	<p>
		The navigator reads <code>data-path</code> attributes on child elements to identify items. Set
		<code>data-path</code> on each item element and the navigator handles keyboard routing,
		type-ahead search, and ARIA attribute updates automatically.
	</p>
	<p>
		Clicks on <code>data-path</code> elements are intercepted by the navigator — do not add
		separate <code>onclick</code> handlers on those elements, as this causes double-handling.
	</p>

	<h2>Related</h2>
	<ul>
		<li><a href="/docs/utilities/controllers">Controllers</a> — state machines used with the navigator</li>
		<li><a href="/docs/utilities/custom-primitives">Custom Primitives</a> — building accessible components</li>
		<li><a href="/docs/utilities/actions">Actions</a> — other available Svelte actions</li>
	</ul>
</article>
