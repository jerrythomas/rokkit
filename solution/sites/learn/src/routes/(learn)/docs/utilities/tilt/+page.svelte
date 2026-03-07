<script>
	// @ts-nocheck
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		Tilt creates a parallax 3D tilt effect that responds to mouse movement. Wrap any element to
		give it an interactive depth effect with configurable rotation limits, perspective, and
		optional brightness adjustments.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { Tilt } from '@rokkit/ui'
</script>

<Tilt maxRotation={10} perspective={600}>
  <div class="w-48 h-32 rounded-xl bg-blue-500 shadow-lg">
    Hover me
  </div>
</Tilt>`}
	/>
</article>
