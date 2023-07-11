<script>
	import List from './List.svelte'
	import FormFields from './FormFields.svelte'

	let className = ''
	export { className as class }
	export let path = []
	export let value = []
	export let schema = []
	export let using = {}
	export let actions = {}
	export let navigator = List
	let item

	function updatePath(item) {
		let index = value.indexOf(item)

		return index
			? [
					...path.slice(0, path.length - 1),
					path.slice(path.length - 1) + '[' + index + ']'
			  ]
			: []
	}
	$: location = updatePath(item)
</script>

<section class="flex {className}">
	{#if navigator}
		<svelte:component this={navigator} items={value} bind:value={item} />
	{/if}

	<wrap-items>
		<!-- Array actions add, remove -->
		<FormFields bind:value={item} {schema} {using} path={location} />
	</wrap-items>
</section>
