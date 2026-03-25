<article data-article-root>
	<p>
		A data-driven SVG violin plot that shows the full distribution shape of numeric data per
		category. Uses kernel density estimation based on quartiles to draw symmetric violin shapes.
		Wider sections indicate more observations at that value.
	</p>

	<h2>Basic usage</h2>
	<p>
		Pass raw observations with a categorical <code>x</code> field and a numeric <code>y</code>
		field:
	</p>
	<pre><code
			>{`<script>
  import { ViolinPlot } from '@rokkit/chart'

  const data = [
    { class: 'compact', hwy: 29 },
    { class: 'compact', hwy: 32 },
    { class: 'suv',     hwy: 17 },
    { class: 'suv',     hwy: 20 },
    // ...more observations
  ]
<\/script>

<ViolinPlot data={data} x="class" y="hwy" />`}</code
		></pre>

	<h2>Color coding</h2>
	<p>Use <code>fill</code> to color violins by category:</p>
	<pre><code>{`<ViolinPlot data={data} x="class" y="hwy" fill="drv" legend />`}</code></pre>

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
				<td>Raw observations array</td>
			</tr>
			<tr>
				<td><code>x</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Categorical grouping field</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Numeric value field (raw observations)</td>
			</tr>
			<tr>
				<td><code>fill</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Color channel field</td>
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

	<p>
		See also <a href="/docs/charts/box-plot">BoxPlot</a> — rectangular boxes with discrete quartile
		lines compared to the continuous curved shape here.
	</p>
</article>
