<script>
	import { Code } from '$lib/components/Story'
	import themeSwitcher from './snippets/00-theme-switcher.svelte?raw'
	import tableOfContents from './snippets/01-table-of-contents.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		<code>@rokkit/app</code> provides higher-level components for SvelteKit layouts: a theme mode
		switcher and an on-page navigation component. Both integrate with
		<code>@rokkit/states</code> and <code>@rokkit/actions</code> internally.
	</p>

	<h2>ThemeSwitcherToggle</h2>
	<p>
		A compact toggle button for switching between <code>system</code>, <code>light</code>, and
		<code>dark</code> color modes. Reads and writes the <code>vibe</code> store from
		<code>@rokkit/states</code> — no props required for basic use:
	</p>
	<Code content={themeSwitcher} language="svelte" />
	<p>Props:</p>
	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>modes</code></td><td><code>ColorMode[]</code></td><td
					><code>['system','light','dark']</code></td
				><td>Which modes to include</td></tr
			>
			<tr
				><td><code>includeSystem</code></td><td><code>boolean</code></td><td><code>true</code></td
				><td>Shortcut to exclude system option</td></tr
			>
			<tr
				><td><code>showLabels</code></td><td><code>boolean</code></td><td><code>false</code></td><td
					>Show text labels alongside icons</td
				></tr
			>
			<tr
				><td><code>size</code></td><td><code>'sm'|'md'|'lg'</code></td><td><code>'sm'</code></td><td
					>Size variant</td
				></tr
			>
			<tr
				><td><code>icons</code></td><td>object</td><td>—</td><td
					>Override icon CSS classes per mode</td
				></tr
			>
			<tr
				><td><code>onchange</code></td><td><code>(mode) =&gt; void</code></td><td>—</td><td
					>Called when mode changes</td
				></tr
			>
		</tbody>
	</table>

	<h2>TableOfContents</h2>
	<p>
		Scans <code>h2</code> and <code>h3</code> headings inside a container element and renders an
		on-page navigation list. Uses <code>IntersectionObserver</code> to highlight the active section.
		In SvelteKit layouts, call <code>rescan()</code> after navigation to pick up headings from the new
		page:
	</p>
	<Code content={tableOfContents} language="svelte" />
	<p>Props and methods:</p>
	<table>
		<thead>
			<tr><th>Name</th><th>Type</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>container</code></td><td><code>string</code></td><td
					>ID of the element to scan for headings (default: <code>'main-content'</code>)</td
				></tr
			>
			<tr
				><td><code>rescan()</code></td><td>method</td><td
					>Re-scan headings after content changes. Bind the component and call from
					<code>afterNavigate</code>.</td
				></tr
			>
		</tbody>
	</table>
	<p>
		The rendered nav applies <code>data-toc-active</code> to the button matching the visible
		heading, and <code>data-toc-level</code> for indent styling.
	</p>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/utilities/states">@rokkit/states</a> — <code>vibe</code> store that ThemeSwitcherToggle
			reads/writes
		</li>
		<li>
			<a href="/docs/theming/overview">Theming Overview</a> — Data attributes controlled by ThemeSwitcherToggle
		</li>
	</ul>
</article>
