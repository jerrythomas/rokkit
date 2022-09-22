<script>
	import InputNumber from './InputNumber.svelte'

	export let page
	export let max

	function next() {
		page = (page + 1) % max
	}
	function previous() {
		page = (page + max + 1) % max
	}
</script>

<btn-group class="flex flex-row gap-2 h-8 flex-shrink-0">
	<icon on:click={previous} class="previous-item" />
	<InputNumber bind:value={page} min={0} {max} />
	<icon on:click={next} class="next-item" />
</btn-group>
