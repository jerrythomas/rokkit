<script>
	import TexturedShape from './TexturedShape.svelte'

	export let pattern
	export let shape = 'circle'
	// export let type
	export let fill
	export let stroke
	export let isCurrent = false

	const size = 40
</script>

<button
	class="bg-gray-100 rounded shadow-md w-10 h-10 p-1 flex items-center justify-center hover:bg-primary-300"
	class:isCurrent
	on:click
	on:mouseover
	on:mouseleave
	on:focus
>
	<TexturedShape {pattern} {fill} {stroke} {shape} {size} />
</button>

<style>
	.isCurrent {
		@apply bg-primary-200;
	}
</style>
