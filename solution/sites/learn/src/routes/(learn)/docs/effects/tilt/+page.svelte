<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import { Tilt } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		Tilt creates a parallax 3D tilt effect that responds to mouse movement. Wrap any element to
		give it an interactive depth effect with configurable rotation limits and perspective. An
		optional brightness adjustment adds a subtle lighting cue as the card tilts.
	</p>

	<h2>Live Demo</h2>
	<p>Hover over the cards and move your mouse across them to see the 3D tilt effect.</p>

	<div class="rounded-lg border border-surface-z2 bg-surface-z0 p-8 flex flex-wrap gap-8 justify-center">
		<Tilt maxRotation={10} perspective={600}>
			<div class="w-48 h-32 rounded-xl bg-primary-z3 flex items-center justify-center shadow-lg cursor-pointer">
				<span class="text-sm font-semibold text-on-primary">Standard tilt (10°)</span>
			</div>
		</Tilt>

		<Tilt maxRotation={20} perspective={400} setBrightness={true}>
			<div class="w-48 h-32 rounded-xl bg-surface-z2 border border-surface-z3 flex items-center justify-center shadow-lg cursor-pointer">
				<span class="text-sm font-semibold text-surface-z7">Strong tilt + brightness</span>
			</div>
		</Tilt>

		<Tilt maxRotation={5} perspective={800}>
			<div class="w-48 h-48 rounded-xl bg-secondary-z3 flex items-center justify-center shadow-lg cursor-pointer">
				<span class="i-lucide:image text-4xl text-on-secondary"></span>
			</div>
		</Tilt>
	</div>

	<h2>Quick Start</h2>
	<Code content={`<script>
  import { Tilt } from '@rokkit/ui'
</\script>

<!-- Basic tilt — hover and move mouse -->
<Tilt maxRotation={10} perspective={600}>
  <div class="w-48 h-32 rounded-xl bg-blue-500 shadow-lg">
    Hover me
  </div>
</Tilt>

<!-- Stronger effect with brightness response -->
<Tilt maxRotation={20} perspective={400} setBrightness={true}>
  <div class="...">Enhanced depth</div>
</Tilt>`} language="svelte" />

	<h2>Props</h2>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>maxRotation</code></td><td><code>number</code></td><td><code>10</code></td><td>Maximum rotation angle in degrees</td></tr>
				<tr><td><code>perspective</code></td><td><code>number</code></td><td><code>600</code></td><td>CSS perspective value in pixels (lower = more dramatic)</td></tr>
				<tr><td><code>setBrightness</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Adjust brightness based on mouse Y position</td></tr>
			</tbody>
		</table>
	</div>

	<h2>Open in Playground</h2>
	<p>
		Tune all parameters interactively in the
		<a href="/playground/effects/tilt">Tilt playground</a>.
	</p>
</article>
