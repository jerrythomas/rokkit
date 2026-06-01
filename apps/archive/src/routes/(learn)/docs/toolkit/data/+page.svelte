<article data-article-root>
	<p>
		<code>@rokkit/data</code> is a tabular data manipulation package with a fluent
		<code>dataset()</code> pipeline for grouping, alignment, rollup aggregation, filling missing values,
		and set joins — plus standalone join functions and a declarative filter engine.
	</p>

	<h2>Import</h2>
	<pre><code>{`import { dataset, crossJoin, leftJoin, filterData } from '@rokkit/data'`}</code
		></pre>

	<h2>dataset() — fluent pipeline</h2>
	<p>
		<code>dataset(rows)</code> wraps an array of plain objects and returns a chainable
		<code>DataSet</code>. Call <code>.select()</code> at the end to execute the pipeline and get the result
		array back.
	</p>
	<pre><code
			>{`const result = dataset(rows)
  .where(row => row.active)
  .sortBy('name')
  .select()`}</code
		></pre>

	<h2>Chainable methods</h2>
	<table>
		<thead>
			<tr>
				<th>Method</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody>
			<tr><td><code>.where(predicate)</code></td><td>Keep rows matching a function</td></tr>
			<tr><td><code>.sortBy(...keys)</code></td><td>Sort ascending by one or more keys</td></tr>
			<tr><td><code>.rename(map)</code></td><td>Rename column keys</td></tr>
			<tr><td><code>.drop(...keys)</code></td><td>Remove columns</td></tr>
			<tr><td><code>.apply(fn)</code></td><td>Transform each row</td></tr>
			<tr
				><td><code>.fillNA(defaults)</code></td><td>Fill null/undefined values with defaults</td
				></tr
			>
			<tr
				><td><code>.update(value|fn)</code></td><td
					>Update rows matching the current <code>.where()</code></td
				></tr
			>
			<tr
				><td><code>.remove()</code></td><td
					>Delete rows matching the current <code>.where()</code></td
				></tr
			>
			<tr><td><code>.union(other)</code></td><td>Append rows from another dataset</td></tr>
			<tr
				><td><code>.minus(other)</code></td><td>Rows in this dataset not in <code>other</code></td
				></tr
			>
			<tr><td><code>.intersect(other)</code></td><td>Rows in both datasets</td></tr>
			<tr><td><code>.groupBy(...keys)</code></td><td>Group rows by one or more keys</td></tr>
			<tr
				><td><code>.alignBy(...keys)</code></td><td
					>Ensure all values of a key appear in every group</td
				></tr
			>
			<tr
				><td><code>.usingTemplate(obj)</code></td><td
					>Default field values for rows added by <code>alignBy</code></td
				></tr
			>
			<tr
				><td><code>.summarize(from, formulas)</code></td><td
					>Define aggregation formulas for <code>rollup</code></td
				></tr
			>
			<tr><td><code>.rollup()</code></td><td>Execute grouping and aggregation</td></tr>
			<tr
				><td><code>.innerJoin / .leftJoin / .rightJoin / .fullJoin</code></td><td
					>SQL-style joins with a condition function</td
				></tr
			>
			<tr><td><code>.crossJoin(other)</code></td><td>All combinations of two datasets</td></tr>
			<tr
				><td><code>.nestedJoin(other, cond)</code></td><td
					>Nest matching rows under a <code>children</code> key</td
				></tr
			>
			<tr
				><td><code>.semiJoin / .antiJoin</code></td><td
					>Filter by presence or absence of match in another dataset</td
				></tr
			>
			<tr><td><code>.select()</code></td><td>Execute pipeline and return the result array</td></tr>
		</tbody>
	</table>

	<h2>Aggregation — groupBy + rollup</h2>
	<p>
		<code>groupBy</code> + <code>rollup</code> groups rows and collects them into a nested
		<code>children</code> array per group. Add <code>summarize</code> to compute aggregate values instead:
	</p>
	<pre><code
			>{`import { mean, sum } from 'd3-array'

// Aggregate revenue by region
const byRegion = dataset(sales)
  .groupBy('region')
  .summarize(row => row.revenue, { revenue: sum })
  .rollup()
  .select()
// → [{ region: 'West', revenue: 142000 }, ...]

// Multiple group keys
dataset(sales)
  .groupBy('region', 'product')
  .summarize(row => row.revenue, { revenue: mean })
  .rollup()
  .select()`}</code
		></pre>

	<h2>alignBy — fill missing combinations</h2>
	<p>
		<code>alignBy</code> ensures every group contains a row for every value of the aligned field
		that exists anywhere in the dataset. Missing rows are filled using <code>usingTemplate</code>.
	</p>
	<p>
		A key use case is animation frames — ensuring every <code>(x, color)</code> group has a data point
		for every frame value (e.g. year), filling gaps with zero so bars animate smoothly rather than jumping
		in and out.
	</p>
	<pre><code
			>{`// Pre-aggregated: one row per (class, drv, year). Some groups may be missing certain years.
const complete = dataset(aggregated)
  .groupBy('class', 'drv')   // one group per (class, drv)
  .alignBy('year')            // ensure all years appear in every group
  .usingTemplate({ hwy: 0 }) // fill missing year rows with hwy = 0
  .rollup()
  .select()
// → [
//     { class: 'compact', drv: 'f', children: [{ year: 1999, hwy: 29 }, { year: 2008, hwy: 31 }] },
//     { class: 'suv',     drv: '4', children: [{ year: 1999, hwy: 0 },  { year: 2008, hwy: 15 }] }
//   ]

// Flatten children back to flat rows (strip the actual_flag marker added by alignBy):
const flat = complete.flatMap(row =>
  row.children.map(({ actual_flag: _, ...child }) => ({
    class: row.class, drv: row.drv, ...child
  }))
)`}</code
		></pre>
	<p>
		<code>alignBy</code> adds an <code>actual_flag</code> field to all child rows (1 = real data, 0 =
		filled by template). Strip it after flattening if not needed.
	</p>

	<h2>Joins</h2>
	<p>
		Join functions are available both as chainable methods on <code>DataSet</code> and as standalone functions
		on plain arrays:
	</p>
	<pre><code
			>{`import { innerJoin, leftJoin, crossJoin, antiJoin, semiJoin } from '@rokkit/data'

// leftJoin — all rows from first, matched rows from second
const enriched = leftJoin(products, categories, (p, c) => p.categoryId === c.id)

// crossJoin — all (size, color) combinations
const variants = crossJoin(sizes, colors)

// antiJoin — rows from first with NO match in second
const newItems = antiJoin(incoming, existing, (a, b) => a.id === b.id)

// semiJoin — rows from first WITH a match (no duplication)
const active = semiJoin(orders, activeCustomers, (o, c) => o.customerId === c.id)`}</code
		></pre>

	<h2>filterData — declarative filtering</h2>
	<pre><code
			>{`import { filterData, filterObjectArray } from '@rokkit/data'

// Apply multiple filter rules in sequence
const filtered = filterData(rows, [
  { column: 'status',  operator: '=',  value: 'active' },
  { column: 'revenue', operator: '>',  value: 1000 }
])

// Single filter — omit column to search across all fields
const search = filterObjectArray(rows, { operator: '~*', value: /rokkit/i })`}</code
		></pre>
	<p>
		Operators: <code>=</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>,
		<code>&gt;</code>, <code>&gt;=</code>, <code>~</code> (regex), <code>~*</code>,
		<code>!~</code>, <code>!~*</code>
	</p>

	<h2>ReactiveDataSet — Svelte 5 reactive wrapper</h2>
	<p>
		For use inside Svelte 5 components: <code>reactiveDataset(rows)</code> holds source data in
		<code>$state</code> and exposes a <code>rows</code> getter backed by <code>$derived</code>.
		Templates bind to <code>ds.rows</code> directly — no <code>.select()</code> needed. The derived result
		auto-recomputes whenever source data or configuration changes.
	</p>
	<pre><code
			>{`// dataset.svelte.js must be imported — rune compilation required
import { reactiveDataset } from '@rokkit/data/src/dataset.svelte.js'

const ds = reactiveDataset(rawRows)
ds.where(r => r.status === 'active').sortBy('name')

// In a template:
// {#each ds.rows as row}...{/each}

// CRUD — reactivity is automatic
ds.push({ id: 99, name: 'New', status: 'active' })
ds.remove(r => r.id === 5)
ds.update(r => r.status === 'pending', { status: 'active' })
ds.setData(freshRows)`}</code
		></pre>
	<p>
		<code>ReactiveDataSet</code> API: <code>.where(fn)</code>, <code>.apply(fn)</code>,
		<code>.sortBy(...fields)</code>, <code>.clearFilter()</code>, <code>.clearTransforms()</code>,
		<code>.setData(rows)</code>, <code>.push(row)</code>, <code>.remove(pred)</code>,
		<code>.update(pred, patch)</code>, <code>.snapshot()</code>.
	</p>

	<h2>Performance</h2>
	<p>
		Benchmarked with Bun on Apple Silicon, n=10 000 rows, 10 iterations each. Key improvements after
		native replacement of Ramda and lazy pipeline fusion:
	</p>
	<table>
		<thead>
			<tr>
				<th>Operation</th>
				<th>Before (ms)</th>
				<th>After (ms)</th>
				<th>Speedup</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>groupBy+alignBy+rollup</code></td>
				<td>0.628</td>
				<td>0.085</td>
				<td>7.4×</td>
			</tr>
			<tr>
				<td><code>groupBy+summarize+rollup</code></td>
				<td>1.193</td>
				<td>0.534</td>
				<td>2.2×</td>
			</tr>
			<tr>
				<td><code>where+apply+sortBy</code></td>
				<td>3.453</td>
				<td>1.328</td>
				<td>2.6×</td>
			</tr>
			<tr>
				<td><code>leftJoin</code></td>
				<td>39.36</td>
				<td>23.62</td>
				<td>1.7×</td>
			</tr>
		</tbody>
	</table>
	<p>
		The <code>alignBy</code> speedup comes from replacing a Ramda 5-step pipe with a native
		<code>Map</code>-based pass. The <code>where+apply+sortBy</code> speedup comes from lazy pipeline
		fusion: the filter is applied during the map pass so only matching rows are sorted.
	</p>
</article>
