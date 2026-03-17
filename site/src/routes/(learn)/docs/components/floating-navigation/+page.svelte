<script>
	// @ts-nocheck
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		FloatingNavigation provides floating nav dots that track scroll position through page sections.
		It anchors to a screen edge, expands on hover to reveal section labels, and supports
		intersection observer-based active section tracking.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { FloatingNavigation } from '@rokkit/ui'

  const items = [
    { label: 'Introduction', value: 'intro', icon: 'i-glyph:book', href: '#intro' },
    { label: 'Features', value: 'features', icon: 'i-glyph:star', href: '#features' },
    { label: 'Contact', value: 'contact', icon: 'i-glyph:letter', href: '#contact' }
  ]
</script>

<FloatingNavigation {items} value="intro" position="right" />`}
	/>
</article>
