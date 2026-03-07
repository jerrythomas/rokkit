<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import { Reveal } from '@rokkit/ui'

	let replayKey = $state(0)
	function replay() { replayKey++ }
</script>

<article data-article-root>
	<p>
		Reveal provides scroll-triggered entry animations. Elements fade and slide into view when they
		enter the viewport. Supports configurable direction, distance, duration, delay, and stagger
		for animating multiple children sequentially.
	</p>

	<h2>Live Demo</h2>
	<p>Click <strong>Replay</strong> to re-trigger the animation.</p>

	<div class="rounded-lg border border-surface-z2 bg-surface-z0 p-6 flex flex-col items-center gap-6">
		<button
			type="button"
			onclick={replay}
			class="px-4 py-2 rounded-md bg-primary-z3 text-on-primary text-sm font-medium hover:bg-primary-z4 transition-colors"
		>
			Replay Animation
		</button>

		{#key replayKey}
			<Reveal direction="up" duration={500}>
				<div class="w-64 h-28 rounded-xl bg-surface-z2 border border-surface-z3 flex items-center justify-center shadow">
					<span class="text-sm font-semibold text-surface-z7">Single element — slides up</span>
				</div>
			</Reveal>

			<div class="flex gap-4 flex-wrap justify-center">
				<Reveal direction="left" duration={400} stagger={120}>
					{#each ['Card 1', 'Card 2', 'Card 3'] as label}
						<div class="w-32 h-20 rounded-xl bg-primary-z2 border border-primary-z3 flex items-center justify-center shadow">
							<span class="text-xs font-medium text-primary-z8">{label}</span>
						</div>
					{/each}
				</Reveal>
			</div>
		{/key}
	</div>

	<h2>Quick Start</h2>
	<Code content={`<script>
  import { Reveal } from '@rokkit/ui'
</\script>

<!-- Single element fades in from below -->
<Reveal direction="up" duration={600}>
  <div>This content fades in</div>
</Reveal>

<!-- Staggered children animate in sequence -->
<Reveal direction="left" stagger={100}>
  {#each items as item}
    <div>{item.name}</div>
  {/each}
</Reveal>`} language="svelte" />

	<h2>Props</h2>
	<div class="overflow-x-auto">
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>direction</code></td><td><code>'up' | 'down' | 'left' | 'right' | 'none'</code></td><td><code>'up'</code></td><td>Slide direction</td></tr>
				<tr><td><code>distance</code></td><td><code>string</code></td><td><code>'1.5rem'</code></td><td>Slide distance (any CSS length)</td></tr>
				<tr><td><code>duration</code></td><td><code>number</code></td><td><code>600</code></td><td>Animation duration in ms</td></tr>
				<tr><td><code>delay</code></td><td><code>number</code></td><td><code>0</code></td><td>Delay before animation starts in ms</td></tr>
				<tr><td><code>stagger</code></td><td><code>number</code></td><td><code>0</code></td><td>Delay increment per child in ms (for sequential animation)</td></tr>
				<tr><td><code>once</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Only animate once on first enter</td></tr>
				<tr><td><code>threshold</code></td><td><code>number</code></td><td><code>0.1</code></td><td>Intersection ratio (0–1) to trigger</td></tr>
				<tr><td><code>easing</code></td><td><code>string</code></td><td><code>'cubic-bezier(0.4, 0, 0.2, 1)'</code></td><td>CSS easing function</td></tr>
			</tbody>
		</table>
	</div>

	<h2>Open in Playground</h2>
	<p>
		Explore all properties interactively in the
		<a href="/playground/effects/reveal">Reveal playground</a>.
	</p>
</article>
