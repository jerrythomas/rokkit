<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import ShineDemo from './snippets/demo.svelte'
	import demoCode from './snippets/demo.svelte?raw'
</script>

<article data-article-root>
	<p>
		Shine creates a specular lighting effect that follows the cursor, giving elements a dynamic
		glossy appearance. Built on SVG filters, it simulates a point light source moving over a
		surface. Hover any element below to see it in action.
	</p>

	<h2>Live Demo</h2>
	<p>Hover over the cards — the specular highlight follows your cursor.</p>
	<ShineDemo />
	<Code content={demoCode} language="svelte" />

	<h2>Props</h2>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>color</code></td><td><code>string</code></td><td><code>rgb(var(--primary-500))</code></td><td>Light color</td></tr>
				<tr><td><code>radius</code></td><td><code>number</code></td><td><code>300</code></td><td>Light source height — controls spread</td></tr>
				<tr><td><code>depth</code></td><td><code>number</code></td><td><code>1</code></td><td>Gaussian blur depth</td></tr>
				<tr><td><code>surfaceScale</code></td><td><code>number</code></td><td><code>2</code></td><td>Surface height for the light filter</td></tr>
				<tr><td><code>specularConstant</code></td><td><code>number</code></td><td><code>0.75</code></td><td>Reflection intensity</td></tr>
				<tr><td><code>specularExponent</code></td><td><code>number</code></td><td><code>120</code></td><td>Focus of the light source (higher = brighter)</td></tr>
				<tr><td><code>class</code></td><td><code>string</code></td><td>—</td><td>CSS class forwarded to the wrapper element</td></tr>
			</tbody>
		</table>
	</div>

	<h2>Open in Playground</h2>
	<p>
		Adjust all lighting parameters interactively in the
		<a href="/playground/effects/shine">Shine playground</a>.
	</p>
</article>
