<article data-article-root>
	<p>
		A row of clickable color tiles for single or multi-select color/theme picking. Supports square,
		circle, and rounded shapes, three sizes, keyboard navigation, and custom tile content via a
		snippet.
	</p>

	<h2>Quick start</h2>
	<pre><code>{`<script>
  import { Swatch } from '@rokkit/ui'

  const colors = [
    { label: 'Red',   value: '#ef4444' },
    { label: 'Blue',  value: '#3b82f6' },
    { label: 'Green', value: '#22c55e' },
  ]
  let value = $state(null)
<\/script>

<Swatch options={colors} bind:value />

<!-- Multi-select, circle shape -->
<Swatch options={colors} bind:value multiple shape="circle" />`}</code></pre>

	<h2>Field mapping</h2>
	<p>
		Use <code>fields</code> to map your data properties to the roles Swatch expects:
	</p>
	<pre><code>{`const themes = [
  { name: 'Ocean',  hex: '#0ea5e9', border: '#0284c7' },
  { name: 'Forest', hex: '#22c55e', border: '#16a34a' },
]

<Swatch
  options={themes}
  fields={{ label: 'name', value: 'name', fill: 'hex', stroke: 'border' }}
  bind:value
/>`}</code></pre>

	<h2>Props</h2>
	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>options</code></td>
				<td><code>unknown[]</code></td>
				<td><code>[]</code></td>
				<td>Color/theme items</td>
			</tr>
			<tr>
				<td><code>fields</code></td>
				<td><code>Record&lt;string,string&gt;</code></td>
				<td><code>{'{}'}</code></td>
				<td>Field mapping — <code>label</code>, <code>value</code>, <code>fill</code>, <code>stroke</code>, <code>disabled</code></td>
			</tr>
			<tr>
				<td><code>value</code></td>
				<td><code>unknown</code> (bindable)</td>
				<td>—</td>
				<td>Selected value(s) — array when <code>multiple</code></td>
			</tr>
			<tr>
				<td><code>multiple</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Allow multiple selections</td>
			</tr>
			<tr>
				<td><code>shape</code></td>
				<td><code>'square' | 'circle' | 'rounded'</code></td>
				<td><code>'square'</code></td>
				<td>Tile shape</td>
			</tr>
			<tr>
				<td><code>size</code></td>
				<td><code>'sm' | 'md' | 'lg'</code></td>
				<td><code>'md'</code></td>
				<td>Tile size</td>
			</tr>
			<tr>
				<td><code>disabled</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Disable all swatches</td>
			</tr>
			<tr>
				<td><code>label</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Accessible group label (<code>aria-label</code>)</td>
			</tr>
			<tr>
				<td><code>onchange</code></td>
				<td><code>(value) =&gt; void</code></td>
				<td>—</td>
				<td>Called when selection changes</td>
			</tr>
			<tr>
				<td><code>class</code></td>
				<td><code>string</code></td>
				<td><code>''</code></td>
				<td>Additional CSS classes</td>
			</tr>
		</tbody>
	</table>

	<h2>Custom tile content</h2>
	<p>Use the <code>item</code> snippet to render anything inside each tile:</p>
	<pre><code>{`<Swatch options={themes} bind:value>
  {#snippet item(proxy, selected)}
    <span class:ring={selected} style="background:{proxy.get('fill')}" title={proxy.label}>
      {proxy.label[0]}
    </span>
  {/snippet}
</Swatch>`}</code></pre>

	<h2>Data attributes</h2>
	<table>
		<thead>
			<tr><th>Attribute</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>data-swatch</code></td><td>Root element</td></tr>
			<tr><td><code>data-swatch-item</code></td><td>Individual color tile button</td></tr>
			<tr><td><code>data-selected</code></td><td>Present on selected tile(s)</td></tr>
			<tr><td><code>data-swatch-size</code></td><td><code>'sm' | 'md' | 'lg'</code></td></tr>
			<tr><td><code>data-swatch-shape</code></td><td><code>'square' | 'circle' | 'rounded'</code></td></tr>
			<tr><td><code>data-swatch-multiple</code></td><td>Present when <code>multiple</code></td></tr>
		</tbody>
	</table>

	<h2>Accessibility</h2>
	<p>
		Single-select renders as <code>role="radiogroup"</code> with <code>role="radio"</code> tiles.
		Multi-select renders as <code>role="group"</code> with <code>role="checkbox"</code> tiles.
		Keyboard navigation is horizontal (left/right arrows).
	</p>

	<h2>Related</h2>
	<ul>
		<li><a href="/docs/components/palette-manager">PaletteManager</a> — full palette configuration UI using Swatch internally</li>
	</ul>
</article>
