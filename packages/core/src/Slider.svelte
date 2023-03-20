<script>
	import { slide, fade } from 'svelte/transition'

	let className = 'menu'
	export { className as class }
	export let top
	export let offset = -top
</script>

<scroll
	in:slide={{ duration: 50, y: offset }}
	out:fade={{ duration: 50 }}
	style:top="{top}px"
	class="flex flex-col absolute w-full z-10 overflow-scroll {className}"
>
	<slot />
</scroll>
