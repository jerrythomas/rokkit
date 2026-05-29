<article data-article-root>
	<p>
		<code>@rokkit/blocks</code> provides plugins for <code>MarkdownRenderer</code> that render fenced
		code blocks as live Svelte components instead of plain highlighted code.
	</p>

	<h2>Install</h2>
	<pre><code>{`import { PlotPlugin, TablePlugin, SparklinePlugin, MermaidPlugin } from '@rokkit/blocks'`}</code></pre>

	<h2>Usage</h2>
	<p>
		Pass one or more plugins to <code>MarkdownRenderer</code> via the <code>plugins</code> prop. Any
		fenced code block whose language matches a plugin will be rendered as a live component.
	</p>
	<pre><code>{`<script>
  import { MarkdownRenderer } from '@rokkit/ui'
  import { PlotPlugin, TablePlugin, MermaidPlugin } from '@rokkit/blocks'
<\/script>

<MarkdownRenderer {content} plugins={[PlotPlugin, TablePlugin, MermaidPlugin]} />`}</code></pre>

	<h2>Plugins</h2>
	<table>
		<thead>
			<tr>
				<th>Plugin</th>
				<th>Language</th>
				<th>Renders</th>
				<th>Peer dep</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><code>PlotPlugin</code></td>
				<td><code>plot</code></td>
				<td><code>Plot</code> or <code>FacetPlot</code> from <code>@rokkit/chart</code></td>
				<td><code>@rokkit/chart</code></td>
			</tr>
			<tr>
				<td><code>TablePlugin</code></td>
				<td><code>table</code></td>
				<td><code>Table</code> from <code>@rokkit/ui</code></td>
				<td><code>@rokkit/ui</code></td>
			</tr>
			<tr>
				<td><code>SparklinePlugin</code></td>
				<td><code>sparkline</code></td>
				<td><code>Sparkline</code> from <code>@rokkit/chart</code></td>
				<td><code>@rokkit/chart</code></td>
			</tr>
			<tr>
				<td><code>MermaidPlugin</code></td>
				<td><code>mermaid</code></td>
				<td>Mermaid diagram</td>
				<td><code>mermaid ≥ 11</code> (optional)</td>
			</tr>
		</tbody>
	</table>

	<h2>PlotPlugin</h2>
	<p>The code block body must be valid JSON matching the chart spec.</p>
	<pre><code>{`\`\`\`plot
{
  "type": "bar",
  "data": [...],
  "x": "category",
  "y": "value",
  "fill": "category"
}
\`\`\``}</code></pre>

	<h2>TablePlugin</h2>
	<p>The code block body must be valid JSON — either an array of objects or <code>{'{ data, fields }'}</code>.</p>
	<pre><code>{`\`\`\`table
[{"name":"Alice","age":30},{"name":"Bob","age":25}]
\`\`\``}</code></pre>

	<h2>SparklinePlugin</h2>
	<p>The code block body must be valid JSON matching the sparkline spec.</p>
	<pre><code>{`\`\`\`sparkline
{"values":[10,20,15,30,25],"type":"line","color":"primary"}
\`\`\``}</code></pre>

	<h2>MermaidPlugin</h2>
	<p>Requires <code>mermaid ≥ 11</code> as a peer dependency. The code block body is passed directly to Mermaid.</p>
	<pre><code>{`\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\``}</code></pre>
</article>
