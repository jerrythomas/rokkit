<script>
	import { fly, fade } from 'svelte/transition'

	let className = ''
	export { className as class }
</script>

<slide
	in:fade={{ duration: 250 }}
	out:fade={{ duration: 250 }}
	class="flex flex-col absolute w-full top-9 overflow-scroll {className}"
>
	<slot />
</slide>
