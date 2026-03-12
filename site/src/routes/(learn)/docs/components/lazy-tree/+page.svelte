<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A tree component with on-demand lazy-loaded children. Nodes with <code>children: true</code>
		(a boolean sentinel instead of an array) fetch their children asynchronously when expanded.
	</p>

	<!-- Basic Example -->
	<h2>Basic Example</h2>
	<p>
		Set <code>children: true</code> on nodes that should load children on demand, and provide an
		<code>onlazyload</code> callback that returns a promise resolving to an array of child items.
		A loading spinner appears while children are being fetched.
	</p>

	<Code {...storyBuilder.getFragment(0)} />
	<Code {...storyBuilder.getFragment(1)} />

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<!-- Nested Lazy Loading -->
	<h2>Nested Lazy Loading</h2>
	<p>
		Children returned by <code>onlazyload</code> can themselves have <code>children: true</code>,
		enabling progressive lazy loading at any depth. Here, expanding "Documents" reveals a "Projects"
		folder that also loads lazily.
	</p>

	<StoryViewer {...storyBuilder.getExample('nested')} />

	<!-- How it Works -->
	<h2>How it Works</h2>
	<p>
		LazyTree extends Tree with a <code>LazyProxyItem</code> that intercepts expansion. When a node
		with <code>children: true</code> is expanded:
	</p>
	<ol>
		<li>The node shows a loading spinner (<code>data-tree-loading</code>, <code>aria-busy</code>)</li>
		<li><code>onlazyload(item)</code> is called with the node's raw item</li>
		<li>The returned children replace the sentinel and the node expands</li>
		<li>Subsequent expansions use the cached children (no re-fetch)</li>
	</ol>

	<!-- Props Reference -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of nested objects</li>
				<li><strong>fields</strong>: Remap your data keys to component fields</li>
				<li><strong>value</strong> (bindable): Currently selected item value</li>
				<li><strong>lineStyle</strong>: Tree line style — <code>'none'</code>, <code>'solid'</code> (default), <code>'dashed'</code>, <code>'dotted'</code></li>
				<li><strong>icons</strong>: Override the expand/collapse icons</li>
				<li><strong>size</strong>: Size variant (<code>sm</code>, <code>md</code>, <code>lg</code>)</li>
				<li><strong>onlazyload</strong>: Async callback to fetch children</li>
				<li><strong>hasMore</strong>: Show a "Load More" button for root-level pagination</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h2>Data Attributes</h2>
			<ul>
				<li><strong>data-tree-loading</strong>: Present while children are being fetched</li>
				<li><strong>aria-busy</strong>: Set to true during loading</li>
				<li><strong>data-tree-spinner</strong>: The loading spinner element</li>
			</ul>
		</div>
	</div>

	<div data-card>
		<h2>Events</h2>
		<ul>
			<li>
				<strong>onselect(value, proxy)</strong>: Fired when a node is selected
			</li>
			<li>
				<strong>onlazyload(item)</strong>: Async callback — receives the node's raw item,
				must return a Promise resolving to an array of child items. Called with no args for root-level "Load More" pagination.
			</li>
		</ul>
	</div>
</article>
