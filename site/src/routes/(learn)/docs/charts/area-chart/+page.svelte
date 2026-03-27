<article data-article-root>
	<p>
		A data-driven SVG area chart for visualizing cumulative trends and volumes over time. Supports
		multi-series stacking, pattern fills, and curve interpolation.
	</p>

	<h2>Basic usage</h2>
	<p>Map your data fields to the <code>x</code> and <code>y</code> props:</p>
	<pre><code
			>{`<script>
  import { AreaChart } from '@rokkit/chart'

  const data = [
    { month: 'Jan', revenue: 32000 },
    { month: 'Feb', revenue: 41000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 52000 }
  ]
<\/script>

<AreaChart data={data} x="month" y="revenue" />`}</code
		></pre>

	<h2>Color grouping</h2>
	<p>
		Use <code>fill</code> to assign palette colors per series. Enable <code>legend</code> to show the
		color key:
	</p>
	<pre><code>{`<AreaChart data={data} x="month" y="revenue" fill="region" legend />`}</code></pre>

	<h2>Stacked areas</h2>
	<p>Pass <code>stack</code> to stack areas by fill group:</p>
	<pre><code>{`<AreaChart data={data} x="month" y="revenue" fill="region" stack legend />`}</code
		></pre>

	<h2>Curve style</h2>
	<p>Control how segments are interpolated with <code>curve</code>:</p>
	<pre><code>{`<AreaChart data={data} x="month" y="revenue" curve="smooth" />`}</code></pre>

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
					><code>identity</code>, <code>sum</code>, <code>mean</code>, <code>min</code>,
					<code>max</code>, <code>count</code></td
				>
			</tr>
			<tr>
				<td><code>stack</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Stack areas by fill group</td>
			</tr>
			<tr>
				<td><code>curve</code></td>
				<td><code>'linear' | 'smooth' | 'step'</code></td>
				<td><code>'linear'</code></td>
				<td>Area interpolation style</td>
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
