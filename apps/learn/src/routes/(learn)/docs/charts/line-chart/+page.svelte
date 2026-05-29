<article data-article-root>
	<p>
		A data-driven SVG line chart for displaying trends and time series. Supports multi-series color
		coding, custom markers, curve styles, data labels, and hover tooltips.
	</p>

	<h2>Basic usage</h2>
	<p>Map your data fields to the <code>x</code> and <code>y</code> props:</p>
	<pre><code
			>{`<script>
  import { LineChart } from '@rokkit/chart'

  const data = [
    { month: 'Jan', revenue: 32000 },
    { month: 'Feb', revenue: 41000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 52000 }
  ]
<\/script>

<LineChart data={data} x="month" y="revenue" />`}</code
		></pre>

	<h2>Multi-series</h2>
	<p>
		Use <code>color</code> to split data into separate lines by a field. Enable
		<code>legend</code> to show the color key:
	</p>
	<pre><code>{`<LineChart data={data} x="month" y="revenue" color="region" legend />`}</code></pre>

	<h2>Curve style</h2>
	<p>Control how line segments are interpolated with <code>curve</code>:</p>
	<pre><code
			>{`<!-- Smooth bezier curve -->
<LineChart data={data} x="month" y="revenue" curve="smooth" />

<!-- Step (staircase) -->
<LineChart data={data} x="month" y="revenue" curve="step" />`}</code
		></pre>

	<h2>Data labels</h2>
	<p>Add <code>label</code> to show values at each point:</p>
	<pre><code
			>{`<!-- Show y value -->
<LineChart ... label />

<!-- Custom format -->
<LineChart ... label={(d) => \`$\${d.revenue.toLocaleString()}\`} />`}</code
		></pre>

	<h2>Tooltip</h2>
	<p>Pass <code>tooltip</code> to show a hover tooltip:</p>
	<pre><code
			>{`<!-- Default key-value tooltip -->
<LineChart ... tooltip />

<!-- Custom tooltip -->
<LineChart ... tooltip={(d) => \`\${d.month}: \${d.revenue}\`} />`}</code
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
				<td>Field for X axis</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for Y axis (values)</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for line color grouping</td>
			</tr>
			<tr>
				<td><code>symbol</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for marker symbol assignment</td>
			</tr>
			<tr>
				<td><code>stat</code></td>
				<td><code>string</code></td>
				<td><code>'identity'</code></td>
				<td
					><code>identity</code>, <code>sum</code>, <code>mean</code>, <code>min</code>,
					<code>max</code>, <code>count</code></td
				>
			</tr>
			<tr>
				<td><code>curve</code></td>
				<td><code>'linear' | 'smooth' | 'step'</code></td>
				<td><code>'linear'</code></td>
				<td>Line interpolation style</td>
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
