<script>
	import Rating from '../base/Rating.svelte'

	export let id
	export let value = 0
	export let label
	export let max = 5
	export let readOnly = false
	export let states = { filled: 'i-carbon-star-filled', empty: 'i-carbon-star' }
</script>

<input-rating class="flex flex-col cursor-pointer select-none">
	<label for={id}>{label}</label>
	<Rating {id} bind:value {max} {readOnly} {states} on:change />
</input-rating>
