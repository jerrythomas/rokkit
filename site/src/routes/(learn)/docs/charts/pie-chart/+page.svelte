<article data-article-root>
	<p>
		A data-driven SVG pie chart for part-to-whole comparisons. Built on
		<code>ChartBrewer</code> for reactive data binding with palette-based color coding and optional
		legend.
	</p>

	<h2>Basic usage</h2>
	<p>
		Map your label and value fields. Use <code>label</code> for slice labels and <code>y</code> for
		values:
	</p>
	<pre><code
			>{`<script>
  import { PieChart } from '@rokkit/chart'

  const data = [
    { segment: 'Mobile', share: 42 },
    { segment: 'Desktop', share: 35 },
    { segment: 'Tablet', share: 15 },
    { segment: 'Other', share: 8 }
  ]
<\/script>

<PieChart data={data} label="segment" y="share" color="segment" />`}</code
		></pre>

	<h2>Legend</h2>
	<p>Enable the legend to show slice labels with their assigned colors:</p>
	<pre><code>{`<PieChart data={data} label="segment" y="share" color="segment" legend />`}</code></pre>

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
				<td><code>Object[]</code></td>
				<td><code>[]</code></td>
				<td>Chart data array</td>
			</tr>
			<tr>
				<td><code>label</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for slice labels</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for slice values</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for palette color assignment</td>
			</tr>
			<tr>
				<td><code>width</code></td>
				<td><code>number</code></td>
				<td><code>400</code></td>
				<td>SVG width in pixels</td>
			</tr>
			<tr>
				<td><code>height</code></td>
				<td><code>number</code></td>
				<td><code>400</code></td>
				<td>SVG height in pixels</td>
			</tr>
			<tr>
				<td><code>mode</code></td>
				<td><code>'light' | 'dark'</code></td>
				<td><code>'light'</code></td>
				<td>Color palette mode</td>
			</tr>
			<tr>
				<td><code>legend</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Show color legend</td>
			</tr>
		</tbody>
	</table>
</article>
