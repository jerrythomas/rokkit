<article data-article-root>
	<p>
		A search input that parses typed queries into structured filter objects. Supports plain text
		search, column-specific filters, comparison operators, and regex patterns. Filters are emitted
		as an array of <code>FilterObject</code> values suitable for filtering data arrays client-side.
	</p>

	<h2>Quick start</h2>
	<pre><code>{`<script>
  import { SearchFilter } from '@rokkit/ui'
  let filters = $state([])
<\/script>

<SearchFilter bind:filters placeholder="Search..." />

<!-- Apply filters to data -->
{#each data.filter(row => matchesFilters(row, filters)) as row}
  ...
{/each}`}</code></pre>

	<h2>Filter syntax</h2>
	<p>
		Users type queries in a natural syntax. Each token is parsed into a <code>FilterObject</code>
		with <code>column</code>, <code>operator</code>, and <code>value</code>.
	</p>
	<table>
		<thead>
			<tr><th>Input</th><th>Meaning</th><th>Operator</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>apple</code></td>
				<td>Full-text search across all columns (case-insensitive)</td>
				<td><code>~*</code></td>
			</tr>
			<tr>
				<td><code>name:alice</code></td>
				<td>Column <code>name</code> contains "alice" (case-insensitive)</td>
				<td><code>~*</code></td>
			</tr>
			<tr>
				<td><code>age&gt;30</code></td>
				<td>Column <code>age</code> greater than 30</td>
				<td><code>&gt;</code></td>
			</tr>
			<tr>
				<td><code>status!=active</code></td>
				<td>Column <code>status</code> not equal to "active"</td>
				<td><code>!=</code></td>
			</tr>
			<tr>
				<td><code>name~alice</code></td>
				<td>Column <code>name</code> matches regex "alice" (case-sensitive)</td>
				<td><code>~</code></td>
			</tr>
			<tr>
				<td><code>name~*alice</code></td>
				<td>Column <code>name</code> matches regex "alice" (case-insensitive)</td>
				<td><code>~*</code></td>
			</tr>
		</tbody>
	</table>

	<p>Multiple tokens can be combined in one query: <code>status:active age&gt;30 name:alice</code></p>

	<h2>Supported operators</h2>
	<p>
		<code>:</code> <code>=</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code>
		<code>&gt;=</code> <code>&lt;=</code> <code>~</code> <code>~*</code> <code>!~</code>
		<code>!~*</code>
	</p>
	<p>
		The <code>:</code> operator is shorthand for <code>~*</code> (case-insensitive contains). Tilde
		operators produce a <code>RegExp</code> value; others produce string or number.
	</p>

	<h2>Filter object shape</h2>
	<pre><code>{`{
  column?: string      // undefined = search all columns
  operator: string     // e.g. '~*', '>', '!='
  value: string | number | RegExp
}`}</code></pre>

	<h2>Props</h2>
	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>filters</code></td>
				<td><code>FilterObject[]</code> (bindable)</td>
				<td><code>[]</code></td>
				<td>Parsed filter array — bind to read current filters</td>
			</tr>
			<tr>
				<td><code>placeholder</code></td>
				<td><code>string</code></td>
				<td><code>'Search...'</code></td>
				<td>Input placeholder text</td>
			</tr>
			<tr>
				<td><code>debounce</code></td>
				<td><code>number</code></td>
				<td><code>300</code></td>
				<td>Delay in ms before parsing input</td>
			</tr>
			<tr>
				<td><code>size</code></td>
				<td><code>'sm' | 'md' | 'lg'</code></td>
				<td><code>'md'</code></td>
				<td>Input size variant</td>
			</tr>
			<tr>
				<td><code>onfilter</code></td>
				<td><code>(filters) =&gt; void</code></td>
				<td>—</td>
				<td>Called when filters change</td>
			</tr>
			<tr>
				<td><code>class</code></td>
				<td><code>string</code></td>
				<td><code>''</code></td>
				<td>Additional CSS classes</td>
			</tr>
		</tbody>
	</table>

	<h2>Snippets</h2>
	<p>
		Use the <code>tag</code> snippet to customise how each parsed filter is rendered as a chip:
	</p>
	<pre><code>{`<SearchFilter bind:filters>
  {#snippet tag(filter, remove)}
    <span class="chip">
      {filter.column ? filter.column + ': ' : ''}{String(filter.value)}
      <button onclick={remove}>×</button>
    </span>
  {/snippet}
</SearchFilter>`}</code></pre>

	<h2>Data attributes</h2>
	<table>
		<thead>
			<tr><th>Attribute</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>data-search-filter</code></td><td>Root element</td></tr>
			<tr><td><code>data-search-input</code></td><td>The text input</td></tr>
			<tr><td><code>data-search-clear</code></td><td>Clear button (shown when input has text)</td></tr>
			<tr><td><code>data-search-tags</code></td><td>Filter chip container</td></tr>
			<tr><td><code>data-search-tag</code></td><td>Individual filter chip</td></tr>
			<tr><td><code>data-size</code></td><td><code>'sm' | 'md' | 'lg'</code></td></tr>
		</tbody>
	</table>
</article>
