<script>
	import { fly, fade } from 'svelte/transition'

	let height
	let wrapper

	export let direction = 'down'

	$: down = direction === 'down'
	$: height = (wrapper ? wrapper.clientHeight : 72) * (down ? -1 : 1)
</script>

<scroll
	bind:this={wrapper}
	in:fly={{ y: height, duration: 500 }}
	out:fade={{ duration: 250 }}
	class="flex flex-col absolute h-full w-full h-60 top-12 overflow-scroll {$$props.class}"
>
	<slot />
</scroll>
