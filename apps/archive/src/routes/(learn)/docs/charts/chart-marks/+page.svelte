<article data-article-root>
	<p>
		Low-level building blocks for chart rendering: geometric <strong>symbols</strong> for marking
		data points, and <strong>patterns</strong> for accessibility-friendly fill textures. Both are
		used automatically by chart components when you set the <code>symbol</code> or
		<code>pattern</code> channel, but can also be used directly in custom SVG charts.
	</p>

	<h2>Symbols</h2>
	<p>
		The <code>Shape</code> component renders a named geometric symbol centered at (<code>x</code>,
		<code>y</code>). Nine shapes are available:
	</p>
	<pre><code
			>{`import Shape from '@rokkit/chart/symbols/Shape.svelte'

// circle, square, triangle, diamond, plus, asterisk, cross, heart, star
<svg>
  <Shape x={50} y={50} size={1} name="circle" fill="#93c5fd" stroke="#1d4ed8" thickness={1} />
</svg>`}</code
		></pre>

	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>x</code></td><td><code>number</code></td><td><code>0</code></td><td
					>Center x coordinate</td
				></tr
			>
			<tr
				><td><code>y</code></td><td><code>number</code></td><td><code>0</code></td><td
					>Center y coordinate</td
				></tr
			>
			<tr
				><td><code>size</code></td><td><code>number</code></td><td><code>1</code></td><td
					>Scale multiplier (1 = ~12px)</td
				></tr
			>
			<tr
				><td><code>name</code></td><td><code>string</code></td><td><code>'circle'</code></td><td
					>Symbol name</td
				></tr
			>
			<tr
				><td><code>fill</code></td><td><code>string</code></td><td><code>'none'</code></td><td
					>Fill color</td
				></tr
			>
			<tr
				><td><code>stroke</code></td><td><code>string</code></td><td><code>'currentColor'</code></td
				><td>Stroke color</td></tr
			>
			<tr
				><td><code>thickness</code></td><td><code>number</code></td><td><code>1</code></td><td
					>Stroke width</td
				></tr
			>
		</tbody>
	</table>

	<p>
		In line charts, assign symbols per series via the <code>symbol</code> channel — symbols are automatically
		cycled across series:
	</p>
	<pre><code>{`<LineChart data={data} x="month" y="value" color="series" symbol="series" />`}</code
		></pre>

	<h2>Patterns</h2>
	<p>
		Patterns add accessible, print-friendly fill textures to charts. They are especially useful when
		color alone is insufficient to distinguish series (color blindness, greyscale printing).
	</p>
	<p>
		Twenty pattern components are available from <code>@rokkit/chart/patterns</code>:
	</p>
	<pre><code
			>{`import { Dots, CrossHatch, Waves, Brick, DiagonalLines /* ... */ } from '@rokkit/chart/patterns'`}</code
		></pre>

	<p>Available patterns:</p>
	<ul>
		<li>
			<strong>Geometric:</strong> Dots, Circles, OutlineCircles, CircleGrid, Diamonds, DiamondOutline,
			Hexagons
		</li>
		<li>
			<strong>Lines:</strong> DiagonalLines, HorizontalLines, VerticalLines, CrossHatch, Zigzag, CurvedWave,
			Waves
		</li>
		<li>
			<strong>Textured:</strong> Brick, Checkerboard, Tile, Triangles, ScatteredTriangles, CrossDot
		</li>
	</ul>

	<p>
		Each pattern component accepts <code>size</code>, <code>fill</code>, and <code>stroke</code>
		props and renders into an SVG <code>&lt;pattern&gt;</code> element:
	</p>
	<pre><code
			>{`<svg>
  <defs>
    <pattern id="my-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
      <rect width="10" height="10" fill="#93c5fd" />
      <Dots fill="#1d4ed8" stroke="#1d4ed8" size={10} />
    </pattern>
  </defs>
  <rect width="200" height="100" fill="url(#my-pattern)" />
</svg>`}</code
		></pre>

	<h2>Using patterns in charts</h2>
	<p>
		Bar charts and area charts support a <code>pattern</code> channel. When set, each series gets both
		a fill color and a pattern texture:
	</p>
	<pre><code
			>{`<BarChart data={data} x="quarter" y="revenue" fill="region" pattern="region" legend />`}</code
		></pre>
	<p>
		The <code>fill</code> and <code>pattern</code> channels can map to different fields — for
		example, <code>fill</code> by region and <code>pattern</code> by product line — producing a grid of
		distinct color+texture combinations.
	</p>

	<h2>DefinePatterns</h2>
	<p>
		For custom SVG charts, <code>DefinePatterns</code> renders a <code>&lt;defs&gt;</code> block from
		a pattern array. This is what chart components use internally:
	</p>
	<pre><code
			>{`import { DefinePatterns } from '@rokkit/chart'

const patterns = [
  { id: 'p-dots', component: Dots, fill: '#93c5fd', stroke: '#1d4ed8' },
  { id: 'p-hatch', component: CrossHatch, fill: '#6ee7b7', stroke: '#065f46' }
]

<svg>
  <DefinePatterns {patterns} size={10} />
  <rect fill="url(#p-dots)" width="100" height="60" />
</svg>`}</code
		></pre>

	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>patterns</code></td><td><code>Pattern[]</code></td><td><code>[]</code></td><td
					>Array of pattern definitions</td
				></tr
			>
			<tr
				><td><code>size</code></td><td><code>number</code></td><td><code>10</code></td><td
					>Pattern tile size in pixels</td
				></tr
			>
			<tr
				><td><code>patternUnits</code></td><td><code>string</code></td><td
					><code>'userSpaceOnUse'</code></td
				><td>SVG patternUnits attribute</td></tr
			>
		</tbody>
	</table>
</article>
