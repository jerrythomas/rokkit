<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import Wrapper from '../../src/wrappers/Wrapper.svelte'
	import { Item } from '@rokkit/molecules'
	import Tabs from '../../src/Tabs.svelte'
	const registry = writable({})
	setContext('registry', registry)

	export let render
	export let using
	export let properties = {}

	$: using = {
		editors: {},
		components: {},
		wrappers: {},
		navigators: {},
		...using
	}
	$: registry.set({
		editors: { ...using.editors },
		components: { default: Item, ...using.components },
		wrappers: { default: Wrapper, ...using.wrappers },
		navigators: { default: Tabs, ...using.navigators }
	})
</script>

<svelte:component this={render} {...properties} />
