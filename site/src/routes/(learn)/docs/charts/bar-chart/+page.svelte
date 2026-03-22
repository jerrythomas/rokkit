<article data-article-root>
	<p>
		A data-driven SVG bar chart with palette-based color coding, optional gridlines, and a legend.
		Built on <code>ChartBrewer</code> for reactive data binding.
	</p>

	<h2>Basic usage</h2>
	<p>Map your data fields to the <code>x</code> and <code>y</code> props:</p>
	<pre><code
			>{`<script>
  import { BarChart } from '@rokkit/chart'

  const sales = [
    { category: 'Q1', revenue: 42000 },
    { category: 'Q2', revenue: 58000 },
    { category: 'Q3', revenue: 51000 },
    { category: 'Q4', revenue: 73000 }
  ]
<\/script>

<BarChart data={sales} x="category" y="revenue" />`}</code
		></pre>

	<h2>Color coding</h2>
	<p>
		Pass a <code>color</code> field to assign palette colors by category. Enable
		<code>legend</code> to show the color key:
	</p>
	<pre><code
			>{`<BarChart
  data={sales}
  x="category"
  y="revenue"
  color="region"
  legend
/>`}</code
		></pre>

	<h2>Grid and dimensions</h2>
	<p>
		Gridlines are on by default. Set <code>grid={false}</code> to hide them. Use
		<code>width</code> and <code>height</code> to control the SVG size:
	</p>
	<pre><code>{`<BarChart data={sales} x="category" y="revenue" grid={false} width={400} height={300} />`}</code
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
				<td><code>x</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for the X axis (categories)</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for the Y axis (values)</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for palette color assignment</td>
			</tr>
			<tr>
				<td><code>pattern</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for pattern fill assignment</td>
			</tr>
			<tr>
				<td><code>fill</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for fill channel</td>
			</tr>
			<tr>
				<td><code>size</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for size channel</td>
			</tr>
			<tr>
				<td><code>width</code></td>
				<td><code>number</code></td>
				<td><code>600</code></td>
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
				<td><code>grid</code></td>
				<td><code>boolean</code></td>
				<td><code>true</code></td>
				<td>Show horizontal gridlines</td>
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
