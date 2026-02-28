<script>
	import { Code } from '$lib/components/Story'
	import fetchDocs from './snippets/00-fetch-docs.sh?raw'
	import aiUsage from './snippets/01-ai-usage.sh?raw'
	import serverEndpoint from './snippets/02-server-endpoint.ts?raw'
</script>

<article data-article-root>
	<p class="text-[1.0625rem] leading-7 text-surface-z6 mb-8">
		Rokkit provides LLM-friendly documentation at standardized <code>llms.txt</code> endpoints.
		Give these URLs to AI assistants for accurate, up-to-date component knowledge.
	</p>

	<h2>How It Works</h2>
	<p>
		Each component exposes a plain-text Markdown endpoint at a predictable URL. The content
		includes props, snippets, examples, and usage patterns — optimized for LLM consumption
		rather than human browsing.
	</p>
	<Code content={fetchDocs} language="bash" />

	<h2>Available Endpoints</h2>
	<p>
		Every documented component has an <code>llms.txt</code> endpoint. Here are all available
		endpoints:
	</p>
	<table>
		<thead>
			<tr><th>Component</th><th>Endpoint</th></tr>
		</thead>
		<tbody>
			<tr><td>Index (all)</td><td><a href="/docs/llms.txt" target="_blank"><code>/docs/llms.txt</code></a></td></tr>
			<tr><td>Accordion</td><td><a href="/docs/components/accordion/llms.txt" target="_blank"><code>/docs/components/accordion/llms.txt</code></a></td></tr>
			<tr><td>Breadcrumbs</td><td><a href="/docs/components/breadcrumbs/llms.txt" target="_blank"><code>/docs/components/breadcrumbs/llms.txt</code></a></td></tr>
			<tr><td>Button</td><td><a href="/docs/components/button/llms.txt" target="_blank"><code>/docs/components/button/llms.txt</code></a></td></tr>
			<tr><td>Card</td><td><a href="/docs/components/card/llms.txt" target="_blank"><code>/docs/components/card/llms.txt</code></a></td></tr>
			<tr><td>Checkbox</td><td><a href="/docs/components/checkbox/llms.txt" target="_blank"><code>/docs/components/checkbox/llms.txt</code></a></td></tr>
			<tr><td>Dropdown (Menu)</td><td><a href="/docs/components/dropdown/llms.txt" target="_blank"><code>/docs/components/dropdown/llms.txt</code></a></td></tr>
			<tr><td>FloatingActions</td><td><a href="/docs/components/floating-actions/llms.txt" target="_blank"><code>/docs/components/floating-actions/llms.txt</code></a></td></tr>
			<tr><td>Form</td><td><a href="/docs/components/form/llms.txt" target="_blank"><code>/docs/components/form/llms.txt</code></a></td></tr>
			<tr><td>Icon</td><td><a href="/docs/components/icon/llms.txt" target="_blank"><code>/docs/components/icon/llms.txt</code></a></td></tr>
			<tr><td>List</td><td><a href="/docs/components/list/llms.txt" target="_blank"><code>/docs/components/list/llms.txt</code></a></td></tr>
			<tr><td>MultiSelect</td><td><a href="/docs/components/multiselect/llms.txt" target="_blank"><code>/docs/components/multiselect/llms.txt</code></a></td></tr>
			<tr><td>Panel</td><td><a href="/docs/components/panel/llms.txt" target="_blank"><code>/docs/components/panel/llms.txt</code></a></td></tr>
			<tr><td>ProgressBar</td><td><a href="/docs/components/progress-bar/llms.txt" target="_blank"><code>/docs/components/progress-bar/llms.txt</code></a></td></tr>
			<tr><td>RadioGroup</td><td><a href="/docs/components/radiogroup/llms.txt" target="_blank"><code>/docs/components/radiogroup/llms.txt</code></a></td></tr>
			<tr><td>Range</td><td><a href="/docs/components/range/llms.txt" target="_blank"><code>/docs/components/range/llms.txt</code></a></td></tr>
			<tr><td>Rating</td><td><a href="/docs/components/rating/llms.txt" target="_blank"><code>/docs/components/rating/llms.txt</code></a></td></tr>
			<tr><td>SearchFilter</td><td><a href="/docs/components/search-filter/llms.txt" target="_blank"><code>/docs/components/search-filter/llms.txt</code></a></td></tr>
			<tr><td>Select</td><td><a href="/docs/components/select/llms.txt" target="_blank"><code>/docs/components/select/llms.txt</code></a></td></tr>
			<tr><td>Stepper</td><td><a href="/docs/components/stepper/llms.txt" target="_blank"><code>/docs/components/stepper/llms.txt</code></a></td></tr>
			<tr><td>Switch</td><td><a href="/docs/components/switch/llms.txt" target="_blank"><code>/docs/components/switch/llms.txt</code></a></td></tr>
			<tr><td>Table</td><td><a href="/docs/components/table/llms.txt" target="_blank"><code>/docs/components/table/llms.txt</code></a></td></tr>
			<tr><td>Tabs</td><td><a href="/docs/components/tabs/llms.txt" target="_blank"><code>/docs/components/tabs/llms.txt</code></a></td></tr>
			<tr><td>Toggle</td><td><a href="/docs/components/toggle/llms.txt" target="_blank"><code>/docs/components/toggle/llms.txt</code></a></td></tr>
			<tr><td>Toolbar</td><td><a href="/docs/components/toolbar/llms.txt" target="_blank"><code>/docs/components/toolbar/llms.txt</code></a></td></tr>
			<tr><td>Tree</td><td><a href="/docs/components/tree/llms.txt" target="_blank"><code>/docs/components/tree/llms.txt</code></a></td></tr>
			<tr><td>TreeTable</td><td><a href="/docs/components/tree-table/llms.txt" target="_blank"><code>/docs/components/tree-table/llms.txt</code></a></td></tr>
		</tbody>
	</table>

	<h2>Usage with AI Assistants</h2>
	<p>
		Point your AI assistant to the relevant endpoint when asking about Rokkit components.
		Examples:
	</p>
	<Code content={aiUsage} language="bash" />

	<h2>What's Included</h2>
	<p>
		Each <code>llms.txt</code> endpoint includes:
	</p>
	<ul>
		<li><strong>Component overview</strong> — What it does and when to use it</li>
		<li><strong>Props table</strong> — All props with types, defaults, and descriptions</li>
		<li><strong>Snippets</strong> — Available customization snippets and their arguments</li>
		<li><strong>Code examples</strong> — Common usage patterns with runnable code</li>
		<li><strong>Field mapping</strong> — How data maps to the component</li>
		<li><strong>Keyboard shortcuts</strong> — Navigation and interaction keys</li>
	</ul>

	<h2>Adding LLM Docs to a Component</h2>
	<p>
		To enable LLM documentation for a component:
	</p>
	<ol>
		<li>Set <code>"llms": true</code> in the component's <code>meta.json</code></li>
		<li>Create a <code>llms.txt/+server.ts</code> route that returns plain text</li>
	</ol>
	<Code content={serverEndpoint} language="typescript" />

	<h2>Related</h2>
	<ul>
		<li><a href="/introduction">Introduction</a> — Overview of Rokkit's architecture</li>
		<li><a href="/field-mapping">Field Mapping</a> — How data maps to component props</li>
	</ul>
</article>
