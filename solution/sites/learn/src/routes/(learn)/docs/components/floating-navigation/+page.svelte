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
    { text: 'Introduction', value: 'intro', icon: 'i-lucide:book-open', href: '#intro' },
    { text: 'Features', value: 'features', icon: 'i-lucide:star', href: '#features' },
    { text: 'Contact', value: 'contact', icon: 'i-lucide:mail', href: '#contact' }
  ]
</script>

<FloatingNavigation {items} value="intro" position="right" />`}
	/>
</article>
