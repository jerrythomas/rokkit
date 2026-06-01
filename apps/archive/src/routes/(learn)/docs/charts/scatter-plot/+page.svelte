<article data-article-root>
	<p>
		A data-driven SVG scatter plot for correlation and distribution analysis. Supports color coding,
		variable point size (bubble chart), custom markers, data labels, and hover tooltips.
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
		Use <code>color</code> to assign palette colors by category. Enable <code>legend</code> to show the
		color key:
	</p>
	<pre><code
			>{`<ScatterPlot data={data} x="sessions" y="conversions" color="channel" legend />`}</code
		></pre>

	<h2>Bubble chart</h2>
	<p>Map a numeric field to <code>size</code> to vary point radius:</p>
	<pre><code>{`<ScatterPlot data={data} x="sessions" y="conversions" size="orders" />`}</code></pre>

	<h2>Data labels and tooltip</h2>
	<pre><code
			>{`<!-- Label each point with y value -->
<ScatterPlot ... label />

<!-- Custom label -->
<ScatterPlot ... label={(d) => d.channel} />

<!-- Hover tooltip -->
<ScatterPlot ... tooltip />

<!-- Custom tooltip -->
<ScatterPlot ... tooltip={(d) => \`\${d.channel}: \${d.conversions} conversions\`} />`}</code
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
				<td>Field for X axis (numeric)</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for Y axis (numeric)</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for palette color assignment</td>
			</tr>
			<tr>
				<td><code>size</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for point size (bubble chart)</td>
			</tr>
			<tr>
				<td><code>symbol</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for marker symbol assignment</td>
			</tr>
			<tr>
				<td><code>label</code></td>
				<td><code>boolean | string | (data) => string</code></td>
				<td><code>false</code></td>
				<td>Show value labels at each point</td>
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
