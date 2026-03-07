<script>
	// @ts-nocheck
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
    { label: 'Edit', value: 'edit', icon: 'i-lucide:edit' },
    { label: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
    { label: 'Share', value: 'share', icon: 'i-lucide:share' }
  ]
</script>

<FloatingAction items={actions} icon="i-lucide:plus" onselect={(v) => console.log(v)} />`}
	/>
</article>
