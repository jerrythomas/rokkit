<article data-article-root>
	<p>
		A reactive filter context that links multiple charts and filter controls. Wrap charts and filter
		widgets inside <code>&lt;CrossFilter&gt;</code> — when a filter is applied, all charts with
		<code>filterable</code> geoms automatically dim or hide the excluded data.
	</p>

	<h2>Basic usage</h2>
	<pre><code>{`<script>
  import { CrossFilter, FilterBar, FilterSlider, BarChart } from '@rokkit/chart'
<\/script>

<CrossFilter mode="dim">
  <!-- Filter controls -->
  <FilterBar data={orders} field="category" valueField="amount" />
  <FilterSlider field="price" min={0} max={500} label="Price" />

  <!-- Chart reacts automatically -->
  <BarChart data={orders} x="category" y="amount" stat="sum" />
</CrossFilter>`}</code></pre>

	<p>
		Click a bar in <code>FilterBar</code> to toggle that category. Drag the handles in
		<code>FilterSlider</code> to set a numeric range. The main chart dims excluded bars.
	</p>

	<h2>CrossFilter props</h2>
	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>crossfilter</code></td>
				<td><code>CrossFilterInstance</code></td>
				<td>—</td>
				<td>External instance — created internally if omitted</td>
			</tr>
			<tr>
				<td><code>mode</code></td>
				<td><code>'dim' | 'hide'</code></td>
				<td><code>'dim'</code></td>
				<td>How unselected data appears — dimmed or fully hidden</td>
			</tr>
			<tr>
				<td><code>filters</code></td>
				<td><code>FilterState</code> (bindable)</td>
				<td>—</td>
				<td>Bind to read the active filter state externally</td>
			</tr>
		</tbody>
	</table>

	<h2>FilterBar</h2>
	<p>
		A compact bar chart used as a categorical filter control. Click a bar to toggle inclusion of
		that category. Supports multi-select — clicking additional bars adds them to the filter.
	</p>
	<pre><code>{`<FilterBar
  data={mpg}
  field="class"
  valueField="hwy"
  stat="count"
  width={280}
  height={110}
/>`}</code></pre>

	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>data</code></td><td><code>Object[]</code></td><td><code>[]</code></td><td>Data rows</td></tr>
			<tr><td><code>field</code></td><td><code>string</code></td><td>—</td><td>Categorical dimension field</td></tr>
			<tr><td><code>valueField</code></td><td><code>string</code></td><td>—</td><td>Numeric value field for bar height</td></tr>
			<tr><td><code>stat</code></td><td><code>string</code></td><td><code>'sum'</code></td><td>Aggregation: <code>sum</code>, <code>count</code>, <code>mean</code></td></tr>
			<tr><td><code>width</code></td><td><code>number</code></td><td><code>300</code></td><td>Width in pixels</td></tr>
			<tr><td><code>height</code></td><td><code>number</code></td><td><code>120</code></td><td>Height in pixels</td></tr>
			<tr><td><code>mode</code></td><td><code>'light' | 'dark'</code></td><td><code>'light'</code></td><td>Palette mode</td></tr>
		</tbody>
	</table>

	<h2>FilterSlider</h2>
	<p>
		A dual-handle range slider for filtering a continuous numeric field. Drag either handle to set
		the min or max of the active range.
	</p>
	<pre><code>{`<FilterSlider field="hwy" min={10} max={44} step={1} label="Highway MPG" />`}</code></pre>

	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>field</code></td><td><code>string</code></td><td>—</td><td>Continuous field to filter</td></tr>
			<tr><td><code>min</code></td><td><code>number</code></td><td>—</td><td>Range minimum</td></tr>
			<tr><td><code>max</code></td><td><code>number</code></td><td>—</td><td>Range maximum</td></tr>
			<tr><td><code>step</code></td><td><code>number</code></td><td><code>0.1</code></td><td>Slider step increment</td></tr>
			<tr><td><code>label</code></td><td><code>string</code></td><td><code>''</code></td><td>Display label</td></tr>
		</tbody>
	</table>

	<h2>createCrossFilter()</h2>
	<p>
		Create a crossfilter instance manually to share across components or control programmatically:
	</p>
	<pre><code>{`import { createCrossFilter, CrossFilter, BarChart } from '@rokkit/chart'

const cf = createCrossFilter()

// Pass the instance to CrossFilter
// <CrossFilter crossfilter={cf}>...</CrossFilter>

// Control it programmatically
cf.toggleCategorical('region', 'North')   // toggle one value
cf.setRange('price', [10, 100])            // set numeric range
cf.clear('region')                         // clear one dimension
cf.clearAll()                              // clear all filters
cf.isFiltered('region')                    // boolean
cf.isSelected('region', 'North')           // boolean
cf.version                                 // reactive integer, increments on every change`}</code></pre>

	<h2>External filter binding</h2>
	<pre><code>{`<script>
  let activeFilters = $state({})
<\/script>

<CrossFilter bind:filters={activeFilters} mode="hide">
  <FilterBar data={data} field="category" valueField="sales" />
  <BarChart {data} x="category" y="sales" />
</CrossFilter>

<pre>{JSON.stringify(activeFilters, null, 2)}</pre>`}</code></pre>

	<h2>Related</h2>
	<ul>
		<li><a href="/docs/charts/bar-chart">BarChart</a> — main chart type used in CrossFilter demos</li>
		<li><a href="/docs/charts/overview">Charts overview</a> — geom types and the PlotChart API</li>
	</ul>
</article>
