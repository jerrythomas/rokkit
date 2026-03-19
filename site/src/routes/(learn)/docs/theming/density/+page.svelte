<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import densityAttr from './snippets/00-density.html?raw'
</script>

<article data-article-root>
	<p>
		Density controls the spacing and sizing of all components globally. Set <code>data-density</code
		>
		on your root element:
	</p>
	<Code content={densityAttr} language="html" />
	<table>
		<thead>
			<tr><th>Value</th><th>Padding</th><th>Use case</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>comfortable</code></td><td>Default</td><td>General applications, dashboards</td
				></tr
			>
			<tr><td><code>compact</code></td><td>Reduced</td><td>Data-heavy UIs, power users</td></tr>
			<tr><td><code>cozy</code></td><td>Increased</td><td>Touch targets, consumer apps</td></tr>
		</tbody>
	</table>
	<p>
		The <code>ThemeSwitcherToggle</code> component exposes density switching when
		<code>mode="full"</code>. You can also set it programmatically via the <code>vibe</code> store
		from
		<code>@rokkit/app</code>:
	</p>
	<pre><code
			>{`import { vibe } from '@rokkit/app'
vibe.density = 'compact'`}</code
		></pre>
</article>
