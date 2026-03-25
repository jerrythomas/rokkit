<article data-article-root>
	<p>
		An animated chart that steps through discrete frames of a dataset — one frame per distinct value
		of a field such as <code>year</code> or <code>quarter</code>. Axes are fixed across all frames
		so values are always comparable. Includes play/pause, scrub, and speed controls.
	</p>

	<h2>Basic usage</h2>
	<p>
		Pass <code>animate.by</code> to name the field whose distinct values become frames. Provide the
		same <code>x</code>, <code>y</code>, and <code>geoms</code> you would with <code>Plot</code>:
	</p>
	<pre><code
		>{`<script>
  import { AnimatedPlot } from '@rokkit/chart'
  import { browser } from '$app/environment'
  import { mpg } from './data/mpg.js'
<\/script>

{#if browser}
  <AnimatedPlot
    data={mpg}
    animate={{ by: 'year' }}
    x="class"
    y="hwy"
    geoms={[{ type: 'bar', stat: 'mean' }]}
  />
{/if}`}</code
	></pre>

	<p>
		The <code>{'{#if browser}'}</code> guard is required because <code>AnimatedPlot</code> uses
		<code>requestAnimationFrame</code>, which is not available during server-side rendering.
	</p>

	<h2>Playback options</h2>
	<p>
		Control playback speed and looping via the <code>animate</code> object. Users can also adjust
		speed interactively via the timeline controls:
	</p>
	<pre><code
		>{`<AnimatedPlot
  data={data}
  animate={{
    by: 'year',
    duration: 600,   <!-- ms per frame at 1× speed -->
    loop: true       <!-- restart after the last frame -->
  }}
  x="class" y="hwy"
  geoms={[{ type: 'bar', stat: 'mean' }]}
/>`}</code
	></pre>

	<h2>Color encoding</h2>
	<p>
		Use <code>color</code> to assign palette colors by a field. The color domain is fixed across all
		frames so categories keep consistent colors as the animation plays:
	</p>
	<pre><code
		>{`<AnimatedPlot
  data={mpg}
  animate={{ by: 'year', loop: true }}
  x="class" y="hwy"
  color="drv"
  geoms={[{ type: 'bar', stat: 'mean' }]}
  legend
/>`}</code
	></pre>

	<h2>Geom types</h2>
	<p>
		Any geom supported by <code>Plot</code> can be animated: <code>bar</code>,
		<code>line</code>, <code>point</code>, <code>area</code>. Missing data combinations for a frame
		are automatically filled with zero so bars and lines animate smoothly between frames:
	</p>
	<pre><code
		>{`<!-- Animated line chart over time -->
<AnimatedPlot
  data={data}
  animate={{ by: 'quarter' }}
  x="month" y="sales"
  color="region"
  geoms={[{ type: 'line' }]}
/>`}</code
	></pre>

	<h2>Timeline controls</h2>
	<p>The built-in timeline renders below the chart and provides:</p>
	<ul>
		<li><strong>Play / Pause</strong> — start or stop auto-advance</li>
		<li><strong>Scrub slider</strong> — jump directly to any frame</li>
		<li><strong>Frame label</strong> — shows the current frame's key value</li>
		<li><strong>Speed selector</strong> — 0.5×, 1×, 2×, 4× multipliers</li>
	</ul>
	<p>
		The animation also respects the <code>prefers-reduced-motion</code> media query — when set,
		auto-play is disabled.
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
				<td>Full dataset containing all frames</td>
			</tr>
			<tr>
				<td><code>animate</code></td>
				<td><code>&#123; by, duration?, loop? &#125;</code></td>
				<td>—</td>
				<td>Required. Animation configuration (see below)</td>
			</tr>
			<tr>
				<td><code>x</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for the X axis</td>
			</tr>
			<tr>
				<td><code>y</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for the Y axis</td>
			</tr>
			<tr>
				<td><code>color</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for palette color assignment (consistent across frames)</td>
			</tr>
			<tr>
				<td><code>geoms</code></td>
				<td><code>GeomSpec[]</code></td>
				<td><code>[]</code></td>
				<td>Geom specs — same format as <code>Plot</code></td>
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
			<tr>
				<td><code>mode</code></td>
				<td><code>'light' | 'dark'</code></td>
				<td><code>'light'</code></td>
				<td>Color palette mode</td>
			</tr>
		</tbody>
	</table>

	<h2>animate object</h2>
	<table>
		<thead>
			<tr>
				<th>Key</th>
				<th>Type</th>
				<th>Default</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>by</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field whose distinct values become frames, in sorted order</td>
			</tr>
			<tr>
				<td><code>duration</code></td>
				<td><code>number</code></td>
				<td><code>800</code></td>
				<td>Milliseconds per frame at 1× speed</td>
			</tr>
			<tr>
				<td><code>loop</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Restart from the first frame after the last</td>
			</tr>
		</tbody>
	</table>
</article>
