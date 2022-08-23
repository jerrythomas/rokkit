<script>
	import { fly, fade } from 'svelte/transition'

	let height

	export let direction = 'down'

	$: down = direction === 'down'
</script>

<slide
	bind:clientHeight={height}
	in:fly={{ y: height * (down ? -1 : 1), duration: 500 }}
	out:fade={{ duration: 250 }}
	class="flex flex-col absolute w-full overflow-scroll {$$props.class}"
>
	<slot />
</slide>
