<script>
	import { slide } from 'svelte/transition'

	let className = ''
	export { className as class }
</script>

<scroll
	in:slide={{ duration: 250 }}
	out:slide={{ duration: 250 }}
	class="flex flex-col absolute w-full top-9 overflow-scroll {className}"
>
	<slot />
</scroll>
