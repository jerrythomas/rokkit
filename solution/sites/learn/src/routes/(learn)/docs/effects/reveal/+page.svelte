<script>
	// @ts-nocheck
	import { Demo } from '$lib/components/Story'
	import BasicDemo from './snippets/basic.svelte'
	import basicCode from './snippets/basic.svelte?raw'
	import StaggerDemo from './snippets/stagger.svelte'
	import staggerCode from './snippets/stagger.svelte?raw'
</script>

<article data-article-root>
	<p>
		Reveal provides scroll-triggered entry animations. Elements fade and slide into view when they
		enter the viewport. Supports configurable direction, distance, duration, delay, and stagger
		for animating multiple children sequentially.
	</p>

	<h2>Basic Reveal</h2>
	<p>
		Wrap any element with <code>Reveal</code> and it will animate into view when it enters the
		viewport. Click <strong>Replay</strong> to re-trigger the animation.
	</p>
	<Demo App={BasicDemo} code={basicCode} />

	<h2>Staggered Children</h2>
	<p>
		Set <code>stagger</code> (ms per child) to animate multiple children in sequence. The
		<code>class</code> prop is forwarded to the wrapper so you can control layout — use
		<code>class="flex gap-4"</code> to lay children out side by side.
	</p>
	<Demo App={StaggerDemo} code={staggerCode} />

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
				<tr><td><code>stagger</code></td><td><code>number</code></td><td><code>0</code></td><td>Delay increment per child in ms</td></tr>
				<tr><td><code>once</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Only animate once on first enter</td></tr>
				<tr><td><code>threshold</code></td><td><code>number</code></td><td><code>0.1</code></td><td>Intersection ratio (0–1) to trigger</td></tr>
				<tr><td><code>easing</code></td><td><code>string</code></td><td><code>'cubic-bezier(0.4, 0, 0.2, 1)'</code></td><td>CSS easing function</td></tr>
				<tr><td><code>class</code></td><td><code>string</code></td><td>—</td><td>CSS class forwarded to the wrapper element</td></tr>
			</tbody>
		</table>
	</div>

	<h2>Open in Playground</h2>
	<p>
		Explore all properties interactively in the
		<a href="/playground/effects/reveal">Reveal playground</a>.
	</p>
</article>
