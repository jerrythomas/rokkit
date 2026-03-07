<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import TiltDemo from './snippets/demo.svelte'
	import demoCode from './snippets/demo.svelte?raw'
</script>

<article data-article-root>
	<p>
		Tilt creates a parallax 3D tilt effect that responds to mouse movement. Wrap any element to
		give it an interactive depth effect with configurable rotation limits and perspective. An
		optional brightness adjustment adds a subtle lighting cue as the card tilts.
	</p>

	<h2>Live Demo</h2>
	<p>Hover over the cards and move your mouse across them to see the 3D tilt effect.</p>
	<TiltDemo />
	<Code content={demoCode} language="svelte" />

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
				<tr><td><code>class</code></td><td><code>string</code></td><td>—</td><td>CSS class forwarded to the wrapper element</td></tr>
			</tbody>
		</table>
	</div>

	<h2>Open in Playground</h2>
	<p>
		Tune all parameters interactively in the
		<a href="/playground/effects/tilt">Tilt playground</a>.
	</p>
</article>
