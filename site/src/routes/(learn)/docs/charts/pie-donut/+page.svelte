<article data-article-root>
	<p>
		A donut chart is a <code>PieChart</code> with a hole in the centre. Set
		<code>innerRadius</code> to a value between 0 and 1 to control the size of the hole.
	</p>

	<h2>Basic donut</h2>
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

<PieChart {data} y="share" fill="segment" innerRadius={0.5} legend />`}</code
		></pre>

	<h2>Choosing the hole size</h2>
	<p>
		<code>innerRadius</code> is a fraction of the outer radius:
	</p>
	<ul>
		<li><code>0</code> — solid pie (default)</li>
		<li><code>0.4</code> — thin donut</li>
		<li><code>0.6</code> — standard donut</li>
		<li><code>0.8</code> — wide ring</li>
	</ul>
	<p>
		Labels automatically reposition to the midpoint between the inner and outer radius when
		<code>innerRadius &gt; 0</code>.
	</p>

	<h2>With custom labels and tooltip</h2>
	<pre><code
			>{`<PieChart
  {data}
  y="share"
  fill="segment"
  innerRadius={0.55}
  labelFn={(d) => d.share.toFixed(1)}
  tooltip
  legend
/>`}</code
		></pre>

	<p>
		See <a href="/docs/charts/pie-chart">PieChart</a> for the full props reference.
	</p>
</article>
