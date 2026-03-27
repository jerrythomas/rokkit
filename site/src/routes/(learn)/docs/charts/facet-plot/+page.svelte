<article data-article-root>
	<p>
		A small-multiples chart that splits data into one panel per value of a categorical field. Each
		panel is an independent chart sharing the same x/y encoding and geom type. Color domains are
		kept consistent across panels so the same value always maps to the same color.
	</p>

	<h2>Basic usage</h2>
	<p>
		Pass <code>facet</code> with a <code>by</code> field to split the data. Provide <code>x</code>,
		<code>y</code>, and a <code>geoms</code> array the same way you would with
		<code>Plot</code>:
	</p>
	<pre><code
			>{`<script>
  import { FacetPlot } from '@rokkit/chart'
  import { mpg } from './data/mpg.js'
<\/script>

<FacetPlot
  data={mpg}
  facet={{ by: 'drv' }}
  x="class"
  y="hwy"
  geoms={[{ type: 'bar', stat: 'mean' }]}
/>`}</code
		></pre>

	<h2>Controlling the grid layout</h2>
	<p>
		Use <code>facet.cols</code> to set the number of columns. The default is the number of panels
		(up to 3). Use <code>width</code> to set the total grid width — each panel receives
		<code>width / cols</code> pixels.
	</p>
	<pre><code
			>{`<FacetPlot
  data={data}
  facet={{ by: 'year', cols: 2 }}
  x="class" y="hwy"
  geoms={[{ type: 'bar', stat: 'mean' }]}
  width={700}
  height={300}
/>`}</code
		></pre>

	<h2>Axis scales</h2>
	<p>
		<code>facet.scales</code> controls whether panels share axes. The default is
		<code>'fixed'</code>, which keeps the same y domain across all panels for honest comparison. Use
		<code>'free'</code> when each panel's range varies too much to share an axis.
	</p>
	<pre><code
			>{`<!-- Same y axis across all panels (default) -->
<FacetPlot ... facet={{ by: 'drv', scales: 'fixed' }} />

<!-- Each panel fits its own data range -->
<FacetPlot ... facet={{ by: 'drv', scales: 'free' }} />

<!-- Free y only, shared x -->
<FacetPlot ... facet={{ by: 'drv', scales: 'free_y' }} />`}</code
		></pre>

	<h2>Color encoding</h2>
	<p>
		Use <code>fill</code> to color bars (or points, lines) by a data field. The color domain is computed
		from all data before splitting, so the same value gets the same color in every panel:
	</p>
	<pre><code
			>{`<!-- Color bars by drive type — consistent across panels -->
<FacetPlot
  data={mpg}
  facet={{ by: 'cyl' }}
  x="class" y="hwy"
  fill="drv"
  geoms={[{ type: 'bar', stat: 'mean' }]}
  legend
/>`}</code
		></pre>

	<h2>Geom types</h2>
	<p>
		<code>geoms</code> accepts any geom type supported by <code>Plot</code>: <code>bar</code>,
		<code>line</code>, <code>point</code>, <code>area</code>. Each panel renders the same geom
		against its subset of data.
	</p>
	<pre><code
			>{`<!-- Faceted line chart -->
<FacetPlot
  data={data}
  facet={{ by: 'region' }}
  x="month" y="revenue"
  geoms={[{ type: 'line' }]}
/>

<!-- Faceted scatter plot -->
<FacetPlot
  data={data}
  facet={{ by: 'category' }}
  x="displ" y="hwy"
  geoms={[{ type: 'point' }]}
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
				<td>Full dataset — split into panels by the facet field</td>
			</tr>
			<tr>
				<td><code>facet</code></td>
				<td><code>&#123; by, cols?, scales? &#125;</code></td>
				<td>—</td>
				<td>Required. Facet configuration (see below)</td>
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
				<td><code>fill</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Field for palette color assignment (consistent across panels)</td>
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
				<td><code>900</code></td>
				<td>Total grid width in pixels (divided equally across columns)</td>
			</tr>
			<tr>
				<td><code>height</code></td>
				<td><code>number</code></td>
				<td><code>300</code></td>
				<td>Height of each panel in pixels</td>
			</tr>
			<tr>
				<td><code>panelWidth</code></td>
				<td><code>number</code></td>
				<td>—</td>
				<td>Override per-panel width (takes precedence over <code>width / cols</code>)</td>
			</tr>
			<tr>
				<td><code>panelHeight</code></td>
				<td><code>number</code></td>
				<td>—</td>
				<td>Override per-panel height</td>
			</tr>
			<tr>
				<td><code>grid</code></td>
				<td><code>boolean</code></td>
				<td><code>true</code></td>
				<td>Show gridlines in each panel</td>
			</tr>
			<tr>
				<td><code>legend</code></td>
				<td><code>boolean</code></td>
				<td><code>false</code></td>
				<td>Show color legend (rendered below the grid)</td>
			</tr>
			<tr>
				<td><code>mode</code></td>
				<td><code>'light' | 'dark'</code></td>
				<td><code>'light'</code></td>
				<td>Color palette mode</td>
			</tr>
		</tbody>
	</table>

	<h2>facet object</h2>
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
				<td>Field to facet by — one panel per distinct value</td>
			</tr>
			<tr>
				<td><code>cols</code></td>
				<td><code>number</code></td>
				<td>min(panels, 3)</td>
				<td>Number of columns in the panel grid</td>
			</tr>
			<tr>
				<td><code>scales</code></td>
				<td><code>'fixed' | 'free' | 'free_x' | 'free_y'</code></td>
				<td><code>'fixed'</code></td>
				<td>
					Whether panels share axes. <code>'fixed'</code> = same domain everywhere;
					<code>'free'</code> = each panel fits its own data
				</td>
			</tr>
		</tbody>
	</table>
</article>
