<article data-article-root>
	<p>
		A data-driven SVG scatter plot for correlation and distribution analysis. Built on
		<code>ChartBrewer</code> for reactive data binding with optional gridlines, color coding, and
		legend.
	</p>

	<h2>Basic usage</h2>
	<p>Map numeric fields to <code>x</code> and <code>y</code> props:</p>
	<pre><code
			>{`<script>
  import { ScatterPlot } from '@rokkit/chart'

  const data = [
    { sessions: 120, conversions: 18 },
    { sessions: 340, conversions: 45 },
    { sessions: 200, conversions: 22 },
    { sessions: 480, conversions: 71 }
  ]
<\/script>

<ScatterPlot data={data} x="sessions" y="conversions" />`}</code
		></pre>

	<h2>Color coding</h2>
	<p>
		Pass a <code>color</code> field to assign palette colors by category. Enable
		<code>legend</code> to show the color key:
	</p>
	<pre><code
			>{`<ScatterPlot
  data={data}
  x="sessions"
  y="conversions"
  color="channel"
  legend
/>`}</code
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
				<td>Field name for the X axis (numeric)</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for the Y axis (numeric)</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for palette color assignment</td>
			</tr>
			<tr>
				<td><code>size</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field name for point size channel</td>
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
