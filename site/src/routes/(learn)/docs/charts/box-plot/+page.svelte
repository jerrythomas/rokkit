<article data-article-root>
	<p>
		A data-driven SVG box plot for distribution analysis. Computes quartile statistics (min, Q1,
		median, Q3, max) from raw observations and renders whisker boxes per category.
	</p>

	<h2>Basic usage</h2>
	<p>
		Pass raw observations with a categorical <code>x</code> field and a numeric <code>y</code>
		field. The chart computes all statistics automatically:
	</p>
	<pre><code
			>{`<script>
  import { BoxPlot } from '@rokkit/chart'

  const data = [
    { class: 'compact', hwy: 29 },
    { class: 'compact', hwy: 32 },
    { class: 'suv',     hwy: 17 },
    { class: 'suv',     hwy: 20 },
    // ...more observations
  ]
<\/script>

<BoxPlot data={data} x="class" y="hwy" />`}</code
		></pre>

	<h2>Color coding</h2>
	<p>
		Use <code>fill</code> to color boxes by a categorical field. Enable <code>legend</code> to show the
		color key:
	</p>
	<pre><code>{`<BoxPlot data={data} x="class" y="hwy" fill="drv" legend />`}</code></pre>

	<h2>Statistics computed</h2>
	<p>For each group, the chart computes:</p>
	<ul>
		<li><strong>min</strong> — lowest value</li>
		<li><strong>Q1</strong> — 25th percentile</li>
		<li><strong>median</strong> — 50th percentile</li>
		<li><strong>Q3</strong> — 75th percentile</li>
		<li><strong>max</strong> — highest value</li>
	</ul>
	<p>
		The box spans Q1–Q3, the whiskers extend to min/max, and the median line is drawn across the
		box.
	</p>

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
		See also <a href="/docs/charts/violin-plot">ViolinPlot</a> for a continuous distribution shape alternative.
	</p>
</article>
