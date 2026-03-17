<script>
	import { Code } from '$lib/components/Story'
	import datasetExample from './snippets/00-dataset.js?raw'
	import filterExample from './snippets/01-filter.js?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		<code>@rokkit/data</code> provides data manipulation utilities for tabular and hierarchical
		data. Use it to pre-process raw arrays before passing them to components — filtering, sorting,
		grouping, rollup aggregation, and formatting.
	</p>

	<h2>Dataset pipeline</h2>
	<p>
		<code>dataset(data)</code> returns a <code>DataSet</code> with a fluent chainable API:
	</p>
	<Code content={datasetExample} language="javascript" />
	<p>Available chainable methods:</p>
	<table>
		<thead>
			<tr><th>Method</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>.where(predicate)</code></td><td>Filter rows by predicate function</td></tr>
			<tr><td><code>.sortBy(key, asc?)</code></td><td>Sort by key (ascending by default)</td></tr>
			<tr><td><code>.groupBy(...keys)</code></td><td>Group rows by one or more keys</td></tr>
			<tr><td><code>.rollup()</code></td><td>Flatten grouped data back to rows</td></tr>
			<tr><td><code>.rename(map)</code></td><td>Rename column keys</td></tr>
			<tr><td><code>.drop(key)</code></td><td>Remove a column</td></tr>
			<tr><td><code>.fillNA(defaults)</code></td><td>Fill null/undefined values</td></tr>
			<tr><td><code>.apply(fn)</code></td><td>Transform each row</td></tr>
			<tr><td><code>.select()</code></td><td>Execute pipeline and return array</td></tr>
		</tbody>
	</table>

	<h2>Filtering</h2>
	<p>
		<code>filterData(rows, rules)</code> applies declarative filter rules. Each rule specifies a
		column, operator, and value:
	</p>
	<Code content={filterExample} language="javascript" />
	<p>
		Operators: <code>=</code>, <code>!=</code>, <code>&gt;</code>, <code>&gt;=</code>,
		<code>&lt;</code>, <code>&lt;=</code>, <code>contains</code>, <code>startsWith</code>,
		<code>endsWith</code>.
	</p>

	<h2>Formatter — value formatting</h2>
	<p>
		<code>createFormatter(rules)</code> builds a value formatter for display purposes:
	</p>
	<pre><code>import {'{'} createFormatter {'}'} from '@rokkit/data'

const fmt = createFormatter({'{'} currency: 'USD', locale: 'en-US' {'}'})
fmt.format(1234.5, 'currency')  // '$1,234.50'
fmt.format('2024-01-15', 'date')  // 'Jan 15, 2024'</code></pre>

	<h2>Hierarchy — tree data</h2>
	<p>
		<code>buildHierarchy(items, options)</code> converts flat data with parent/child references
		into a nested tree structure. <code>flattenHierarchy(tree)</code> does the reverse.
	</p>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/components/table">Table</a> — Displays tabular data; accepts pre-processed
			arrays
		</li>
		<li>
			<a href="/docs/components/tree">Tree</a> — Renders hierarchical data structures
		</li>
	</ul>
</article>
