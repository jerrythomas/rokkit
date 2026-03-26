<script>
	// @ts-nocheck
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		FloatingAction provides a floating action button (FAB) that expands to reveal a set of actions.
		Supports radial, vertical, or horizontal expansion with configurable positioning.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { FloatingAction } from '@rokkit/ui'

  const actions = [
    { label: 'Edit', value: 'edit', icon: 'i-glyph:edit' },
    { label: 'Copy', value: 'copy', icon: 'i-glyph:copy' },
    { label: 'Share', value: 'share', icon: 'i-glyph:share' }
  ]
</script>

<FloatingAction items={actions} icon="i-glyph:add-circle" onselect={(v) => console.log(v)} />`}
	/>
</article>
