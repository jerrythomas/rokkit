<article data-article-root>
	<p>
		Renders a Markdown string to sanitized HTML. Fenced code blocks can be intercepted by
		<strong>plugins</strong> — Svelte components that receive the raw code block text and render it
		as live UI instead of highlighted source. Used by <code>@rokkit/blocks</code> to embed charts,
		tables, and diagrams inside Markdown documents.
	</p>

	<h2>Basic usage</h2>
	<p>Pass a Markdown string to the <code>markdown</code> prop:</p>
	<pre><code>{`<script>
  import { MarkdownRenderer } from '@rokkit/ui'
<\/script>

<MarkdownRenderer markdown={content} />`}</code></pre>

	<p>
		HTML output is sanitized with <a href="https://github.com/cure53/DOMPurify">DOMPurify</a> before
		rendering. Raw <code>&lt;script&gt;</code> tags and other dangerous content are stripped.
	</p>

	<h2>Plugins</h2>
	<p>
		Plugins intercept fenced code blocks by language tag and render them as Svelte components. Pass
		an array of plugins via the <code>plugins</code> prop:
	</p>
	<pre><code>{`import { PlotPlugin, TablePlugin, MermaidPlugin } from '@rokkit/blocks'

<MarkdownRenderer
  markdown={content}
  plugins={[PlotPlugin, TablePlugin, MermaidPlugin]}
/>`}</code></pre>

	<p>
		Any fenced code block whose language matches a plugin's <code>language</code> field is rendered
		by that plugin's Svelte component (receiving <code>code</code> as a prop). Unmatched blocks fall
		back to standard highlighted HTML.
	</p>

	<h2>@rokkit/blocks plugins</h2>
	<table>
		<thead>
			<tr><th>Plugin</th><th>Language</th><th>Renders</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>PlotPlugin</code></td>
				<td><code>plot</code></td>
				<td><code>PlotChart</code> or <code>FacetPlot</code> from <code>@rokkit/chart</code></td>
			</tr>
			<tr>
				<td><code>TablePlugin</code></td>
				<td><code>table</code></td>
				<td><code>Table</code> from <code>@rokkit/ui</code></td>
			</tr>
			<tr>
				<td><code>SparklinePlugin</code></td>
				<td><code>sparkline</code></td>
				<td><code>Sparkline</code> from <code>@rokkit/chart</code></td>
			</tr>
			<tr>
				<td><code>MermaidPlugin</code></td>
				<td><code>mermaid</code></td>
				<td>Mermaid diagram (requires <code>mermaid</code> peer dep)</td>
			</tr>
		</tbody>
	</table>

	<h2>Custom plugins</h2>
	<p>A plugin is a plain object with <code>language</code> and <code>component</code>:</p>
	<pre><code>{`// my-plugin.js
import MyWidget from './MyWidget.svelte'

export const MyPlugin = {
  language: 'widget',
  component: MyWidget  // receives { code: string }
}

// MyWidget.svelte — receives \`code\` as a prop:
// let { code } = $props()
// const config = JSON.parse(code)`}</code></pre>

	<h2>Props</h2>
	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>markdown</code></td>
				<td><code>string</code></td>
				<td>—</td>
				<td>Markdown source string to render</td>
			</tr>
			<tr>
				<td><code>plugins</code></td>
				<td><code>MarkdownPlugin[]</code></td>
				<td><code>[]</code></td>
				<td>Code block plugins — intercept fenced blocks by language</td>
			</tr>
		</tbody>
	</table>

	<h2>Related</h2>
	<ul>
		<li><a href="/docs/toolkit/blocks">Blocks</a> — <code>@rokkit/blocks</code> plugin package</li>
		<li><a href="/docs/components/code">Code</a> — syntax-highlighted static code block</li>
	</ul>
</article>
