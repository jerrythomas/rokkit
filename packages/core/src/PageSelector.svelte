<script>
	import { Icon } from '@sparsh-ui/icons'
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
	<Icon name="previous" on:click={previous} class="previous" />
	<InputNumber bind:value={page} min={0} {max} />
	<Icon name="next" on:click={next} class="next" />
</btn-group>
