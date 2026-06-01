<article data-article-root>
	<p>
		A data-driven SVG pie/donut chart for part-to-whole comparisons. Supports palette color coding,
		patterns, percentage labels, custom label functions, hover tooltips, and aggregation stats.
	</p>

	<h2>Basic usage</h2>
	<p>
		Map <code>y</code> to the value field and <code>fill</code> to the grouping field:
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

<PieChart {data} y="share" fill="segment" />`}</code
		></pre>

	<h2>Donut chart</h2>
	<p>
		Set <code>innerRadius</code> (0–1) to cut a hole in the centre:
	</p>
	<pre><code>{`<PieChart {data} y="share" fill="segment" innerRadius={0.5} />`}</code></pre>

	<h2>Aggregation</h2>
	<p>
		When data has multiple rows per group, use <code>stat</code> to aggregate before slicing:
	</p>
	<pre><code
			>{`<!-- Sum all rows per segment (default) -->
<PieChart {data} y="share" fill="segment" stat="sum" />

<!-- Equal slices by row count -->
<PieChart {data} y="share" fill="segment" stat="count" />`}</code
		></pre>

	<h2>Custom labels</h2>
	<p>
		Slices ≥ 5% show a <code>pct%</code> label by default. Override with <code>labelFn</code>:
	</p>
	<pre><code
			>{`<!-- Show raw value rounded to 2 decimals -->
<PieChart {data} y="share" fill="segment" labelFn={(d) => d.share.toFixed(2)} />`}</code
		></pre>

	<h2>Tooltip</h2>
	<p>
		Pass <code>tooltip</code> to show a hover tooltip. The default shows all row fields plus the computed
		slice percentage:
	</p>
	<pre><code
			>{`<!-- Default key-value tooltip with % -->
<PieChart {data} y="share" fill="segment" tooltip />

<!-- Custom tooltip -->
<PieChart {data} y="share" fill="segment" tooltip={(d) => \`\${d.segment}: \${d.share}%\`} />`}</code
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
				<td><code>Object[]</code></td>
				<td><code>[]</code></td>
				<td>Chart data array</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for slice values</td>
			</tr>
			<tr>
				<td><code>fill</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for slice color assignment and labels</td>
			</tr>
			<tr>
				<td><code>pattern</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for pattern fill assignment</td>
			</tr>
			<tr>
				<td><code>stat</code></td>
				<td><code>string</code></td>
				<td><code>'sum'</code></td>
				<td
					><code>sum</code>, <code>mean</code>, <code>min</code>, <code>max</code>,
					<code>count</code></td
				>
			</tr>
			<tr>
				<td><code>innerRadius</code></td>
				<td><code>number</code></td>
				<td><code>0</code></td>
				<td>Donut hole size as fraction of radius (0–1)</td>
			</tr>
			<tr>
				<td><code>labelFn</code></td>
				<td><code>(data) => string</code></td>
				<td>—</td>
				<td>Override slice label (default: <code>pct%</code>)</td>
			</tr>
			<tr>
				<td><code>tooltip</code></td>
				<td><code>boolean | (data) => string</code></td>
				<td><code>false</code></td>
				<td>Hover tooltip showing row data + slice %</td>
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
