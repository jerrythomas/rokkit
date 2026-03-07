<script>
	// @ts-nocheck
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		Reveal provides scroll-triggered entry animations. Elements fade and slide into view when they
		enter the viewport. Supports configurable direction, distance, duration, delay, and stagger
		for animating multiple children sequentially.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { Reveal } from '@rokkit/ui'
</script>

<Reveal direction="up" duration={600}>
  <div>This content fades in from below</div>
</Reveal>`}
	/>
</article>
