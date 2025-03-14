<script>
	import { slide, fade } from 'svelte/transition'

	let { class: className = 'menu', top = 16, offset = -top, children } = $props()
</script>

<scroll
	in:slide={{ duration: 50, y: offset }}
	out:fade={{ duration: 50 }}
	style:top="{top}px"
	class="absolute z-10 flex w-full flex-col overflow-scroll {className}"
>
	{@render children?.()}
</scroll>
