<article data-article-root>
	<p>
		A lightweight inline SVG sparkline. No axes, no legend. Safe to embed in table cells, cards, and
		text flow. Supports line, bar, and area variants.
	</p>

	<h2>Basic usage</h2>
	<p>Pass a numeric array directly:</p>
	<pre><code
			>{`<script>
  import { Sparkline } from '@rokkit/chart'
<\/script>

<Sparkline data={[12, 45, 23, 67, 34, 89]} />`}</code
		></pre>

	<h2>Object array with field</h2>
	<p>When your data is an array of objects, provide a <code>field</code> name:</p>
	<pre><code>{`<Sparkline data={rows} field="revenue" type="bar" color="danger" />`}</code></pre>

	<h2>Area type</h2>
	<p>Use <code>type="area"</code> for a filled sparkline:</p>
	<pre><code>{`<Sparkline data={rows} field="value" type="area" width={120} height={32} />`}</code
		></pre>

	<h2>Inline in text</h2>
	<p>
		Sparklines are <code>display: block</code> SVGs — wrap in an inline container to flow with text:
	</p>
	<pre><code
			>{`<span style="display: inline-block; vertical-align: middle;">
  <Sparkline data={trend} width={60} height={16} />
</span>`}</code
		></pre>

	<h2>Props</h2>
	<table>
		<thead>
			<tr>
				<th>Prop</th>
				<th>Type</th>
				<th>Default</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>data</code></td>
				<td><code>number[] | object[]</code></td>
				<td><code>[]</code></td>
				<td>Series data</td>
			</tr>
			<tr>
				<td><code>field</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name when data is objects</td>
			</tr>
			<tr>
				<td><code>type</code></td>
				<td><code>'line' | 'bar' | 'area'</code></td>
				<td><code>'line'</code></td>
				<td>Chart type</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td><code>'primary'</code></td>
				<td>Semantic color role (uses --color-role-500/300)</td>
			</tr>
			<tr>
				<td><code>width</code></td>
				<td><code>number</code></td>
				<td><code>80</code></td>
				<td>SVG width in pixels</td>
			</tr>
			<tr>
				<td><code>height</code></td>
				<td><code>number</code></td>
				<td><code>24</code></td>
				<td>SVG height in pixels</td>
			</tr>
			<tr>
				<td><code>min</code></td>
				<td><code>number</code></td>
				<td>auto</td>
				<td>Y domain minimum override</td>
			</tr>
			<tr>
				<td><code>max</code></td>
				<td><code>number</code></td>
				<td>auto</td>
				<td>Y domain maximum override</td>
			</tr>
		</tbody>
	</table>

	<h2>Color theming</h2>
	<p>
		Sparkline uses <code>--color-role-500</code> for strokes and bars, and
		<code>--color-role-300</code> for area fills. These follow the same CSS variable convention as
		the rest of Rokkit's theme system. No <code>data-chart-*</code> attributes — the component is too
		small to theme individually.
	</p>
</article>
