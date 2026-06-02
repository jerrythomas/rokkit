<script lang="ts">
	import type { NavContentProps } from '../types/nav-content.js'

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
