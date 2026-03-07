<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import { Shine } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		Shine creates a specular lighting effect that follows the cursor, giving elements a dynamic
		glossy appearance. Built on SVG filters, it simulates a point light source moving over a
		surface. Hover any element below to see it in action.
	</p>

	<h2>Live Demo</h2>
	<p>Hover over the cards to see the specular lighting effect follow your cursor.</p>

	<div class="rounded-lg border border-surface-z2 bg-surface-z0 p-8 flex flex-wrap gap-8 justify-center">
		<Shine radius={300} depth={1} surfaceScale={2}>
			<div class="w-48 h-32 rounded-xl bg-primary-z3 flex items-center justify-center shadow-lg cursor-pointer">
				<span class="text-sm font-semibold text-on-primary">Primary surface</span>
			</div>
		</Shine>

		<Shine radius={200} depth={2} specularExponent={80} color="rgb(var(--secondary-500))">
			<div class="w-48 h-32 rounded-xl bg-secondary-z3 flex items-center justify-center shadow-lg cursor-pointer">
				<span class="text-sm font-semibold text-on-secondary">Secondary tint</span>
			</div>
		</Shine>

		<Shine radius={400} depth={1} surfaceScale={3}>
			<div class="w-48 h-48 rounded-xl bg-surface-z2 border border-surface-z3 flex items-center justify-center shadow-lg cursor-pointer">
				<span class="i-lucide:diamond text-4xl text-surface-z5"></span>
			</div>
		</Shine>
	</div>

	<h2>Quick Start</h2>
	<Code content={`<script>
  import { Shine } from '@rokkit/ui'
</\script>

<!-- Wrap any element — hover to see the effect -->
<Shine radius={300} depth={1} surfaceScale={2}>
  <div class="w-48 h-32 rounded-xl bg-blue-500">
    Hover for shine
  </div>
</Shine>

<!-- Custom light color -->
<Shine color="rgb(var(--secondary-500))" specularExponent={80}>
  <div class="...">Secondary shine</div>
</Shine>`} language="svelte" />

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
			</tbody>
		</table>
	</div>

	<h2>Open in Playground</h2>
	<p>
		Adjust all lighting parameters interactively in the
		<a href="/playground/effects/shine">Shine playground</a>.
	</p>
</article>
