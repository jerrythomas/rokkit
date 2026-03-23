<article data-article-root>
	<p>
		A data-driven SVG bubble chart for three-variable correlation. Like a scatter plot but with a
		<code>size</code> channel that scales circle radius to a numeric field, making a third dimension
		visible. Built on <code>ChartBrewer</code>.
	</p>

	<h2>Basic usage</h2>
	<p>
		Map numeric fields to <code>x</code>, <code>y</code>, and <code>size</code>:
	</p>
	<pre><code
			>{`<script>
  import { BubbleChart } from '@rokkit/chart'

  const data = [
    { cty: 18, hwy: 29, displ: 2.0 },
    { cty: 21, hwy: 29, displ: 1.8 },
    { cty: 14, hwy: 17, displ: 5.3 },
    // ...
  ]
<\/script>

<BubbleChart data={data} x="cty" y="hwy" size="displ" />`}</code
		></pre>

	<h2>Color coding</h2>
	<p>
		Add a <code>color</code> field to assign palette colors by category:
	</p>
	<pre><code
			>{`<BubbleChart
  data={data}
  x="cty"
  y="hwy"
  size="displ"
  color="class"
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
				<td>X axis field (numeric)</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Y axis field (numeric)</td>
			</tr>
			<tr>
				<td><code>size</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Bubble size field (numeric, mapped via sqrt scale)</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Color channel field</td>
			</tr>
			<tr>
				<td><code>symbol</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Symbol shape channel field</td>
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
				<td>Show gridlines</td>
			</tr>
			<tr>
				<td><code>legend</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Show legend</td>
			</tr>
		</tbody>
	</table>

	<h2>Size scale</h2>
	<p>
		The <code>size</code> field is mapped using a square-root scale (<code>scaleSqrt</code>) so
		that bubble <em>area</em> is proportional to the data value, not radius. This is perceptually
		correct — doubling the value doubles the visible area, not a misleadingly doubled radius.
	</p>
</article>
