<script>
	// @ts-nocheck
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		Shine creates a specular lighting effect that follows the cursor, giving elements a dynamic
		glossy appearance. Configure the light radius, depth, surface scale, and specular properties.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { Shine } from '@rokkit/ui'
</script>

<Shine radius={300} depth={1} surfaceScale={2}>
  <div class="w-48 h-32 rounded-xl bg-blue-500">
    Hover for shine effect
  </div>
</Shine>`}
	/>
</article>
