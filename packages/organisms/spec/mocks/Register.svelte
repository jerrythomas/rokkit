<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'

	const registry = writable({})
	setContext('registry', registry)

	export let components = {}
	export let render
	export let properties = {}

	$: registry.set(components)
</script>

<svelte:component this={render} {...properties} />
