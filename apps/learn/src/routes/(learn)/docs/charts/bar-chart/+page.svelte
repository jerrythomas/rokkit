<article data-article-root>
	<p>
		A data-driven SVG bar chart with palette-based color coding, optional gridlines, stacking, data
		labels, and hover tooltips.
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

	<h2>Color grouping</h2>
	<p>
		Use <code>fill</code> to assign palette colors by a field. Combine with <code>legend</code> to show
		the color key:
	</p>
	<pre><code>{`<BarChart data={sales} x="category" y="revenue" fill="region" legend />`}</code
		></pre>

	<h2>Stacking and aggregation</h2>
	<p>
		Pass <code>stack</code> to stack bars by color group. Use <code>stat</code> to aggregate multiple
		rows per group before plotting:
	</p>
	<pre><code
			>{`<BarChart data={sales} x="category" y="revenue" fill="region" stat="sum" stack />`}</code
		></pre>

	<h2>Data labels</h2>
	<p>
		Add <code>label</code> to show values above bars. Pass a function for custom formatting:
	</p>
	<pre><code
			>{`<!-- Show y value -->
<BarChart ... label />

<!-- Custom format -->
<BarChart ... label={(d) => \`$\${d.revenue.toLocaleString()}\`} />`}</code
		></pre>

	<h2>Tooltips</h2>
	<p>
		Pass <code>tooltip</code> to show a hover tooltip with the row data. Pass a function to customise
		the content:
	</p>
	<pre><code
			>{`<!-- Default key-value tooltip -->
<BarChart ... tooltip />

<!-- Custom tooltip -->
<BarChart ... tooltip={(d) => \`\${d.category}: \${d.revenue}\`} />`}</code
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
				<td>Field for the X axis (categories)</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for the Y axis (values)</td>
			</tr>
			<tr>
				<td><code>fill</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for palette color assignment</td>
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
				<td><code>'identity'</code></td>
				<td
					><code>sum</code>, <code>mean</code>, <code>min</code>, <code>max</code>,
					<code>count</code></td
				>
			</tr>
			<tr>
				<td><code>stack</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Stack bars by fill group</td>
			</tr>
			<tr>
				<td><code>label</code></td>
				<td><code>boolean | string | (data) => string</code></td>
				<td><code>false</code></td>
				<td>Value labels above bars</td>
			</tr>
			<tr>
				<td><code>tooltip</code></td>
				<td><code>boolean | (data) => string</code></td>
				<td><code>false</code></td>
				<td>Hover tooltip</td>
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
