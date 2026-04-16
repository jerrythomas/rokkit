<script lang="ts">
	import type { Snippet } from 'svelte'

	interface NavContentProps {
		/** Layout orientation */
		orientation?: 'horizontal' | 'vertical'
		/** Nav panel width (horizontal) or height (vertical) */
		navSize?: string
		/** Collapse nav on small screens */
		collapsible?: boolean
		/** Nav panel snippet */
		nav: Snippet
		/** Content panel snippet */
		content: Snippet
		/** Additional CSS class */
		class?: string
	}

	const {
		orientation = 'horizontal',
		navSize = '280px',
		collapsible = true,
		nav,
		content,
		class: className = ''
	}: NavContentProps = $props()
</script>

<div
	data-nav-content
	data-orientation={orientation}
	data-collapsible={collapsible || undefined}
	class={className || undefined}
	style:--nav-size={navSize}
>
	<div data-nav-content-nav>
		{@render nav()}
	</div>
	<div data-nav-content-main>
		{@render content()}
	</div>
</div>
