<article data-article-root>
	<p>
		A responsive tile grid for displaying and selecting from a collection of items. Uses CSS
		<code>grid</code> with <code>auto-fill</code> columns so tiles flow naturally at any viewport
		width. Keyboard navigation moves focus between tiles with arrow keys. Accepts the same field
		mapping and snippet patterns as <code>List</code>.
	</p>

	<h2>Basic Example</h2>
	<p>
		Pass an array of objects. The <code>label</code> and <code>icon</code> fields are displayed in
		each tile by default. Bind <code>value</code> to track the selected item.
	</p>

	<div data-card>
		<pre><code
				>{`<script>
  import { Grid } from '@rokkit/ui'

  const items = [
    { label: 'Dashboard', icon: 'i-glyph:home' },
    { label: 'Reports', icon: 'i-glyph:chart' },
    { label: 'Settings', icon: 'i-glyph:settings' }
  ]

  let selected = $state(null)
<\/script>

<Grid {items} bind:value={selected} />`}</code
			></pre>
	</div>

	<h2>Tile Size Control</h2>
	<p>
		Use <code>minSize</code> to control the minimum tile width. The grid fills available columns
		automatically. Use <code>size</code> for the content size variant (<code>sm</code>,
		<code>md</code>, <code>lg</code>).
	</p>

	<div data-card>
		<pre><code>{`<Grid {items} minSize="80px" size="sm" bind:value />`}</code></pre>
	</div>

	<h2>Custom Tile Content</h2>
	<p>
		Use the <code>itemContent</code> snippet to replace what renders inside each tile. The snippet
		receives a <code>ProxyItem</code> — use <code>proxy.label</code>,
		<code>proxy.icon</code>, and <code>proxy.get('field')</code>.
	</p>

	<div data-card>
		<pre><code
				>{`{#snippet itemContent(proxy)}
  <div class="flex flex-col items-center gap-1 p-2">
    <span class="{proxy.icon} text-2xl text-secondary-z7"></span>
    <span class="text-xs font-medium">{proxy.label}</span>
    <span class="text-xs text-surface-z5">{proxy.get('count')} items</span>
  </div>
{/snippet}

<Grid {items} {itemContent} bind:value />`}</code
			></pre>
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>items</strong>: Array of objects</li>
				<li><strong>fields</strong>: Remap data keys to component fields</li>
				<li><strong>value</strong> (bindable): Currently selected item value</li>
				<li>
					<strong>size</strong>: Content size — <code>sm</code>, <code>md</code>, <code>lg</code>
				</li>
				<li>
					<strong>minSize</strong>: Minimum tile width (CSS value, default <code>120px</code>)
				</li>
				<li><strong>gap</strong>: Grid gap (CSS value, default <code>1rem</code>)</li>
				<li><strong>disabled</strong>: Disable all tiles</li>
				<li><strong>label</strong>: ARIA label for the grid container</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>
		<div data-card>
			<h2>Snippets</h2>
			<ul>
				<li><strong>itemContent(proxy)</strong>: Custom content inside each tile button</li>
				<li>
					<strong>[name](proxy)</strong>: Per-item snippet — set <code>item.snippet = 'name'</code>
				</li>
			</ul>
			<h2>Events</h2>
			<ul>
				<li><strong>onselect(value, proxy)</strong>: Fired when a tile is selected</li>
			</ul>
		</div>
	</div>
</article>
