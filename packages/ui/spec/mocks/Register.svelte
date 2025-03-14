<script>
	import { setContext } from 'svelte'
	// import { writable } from 'svelte/store'
	import Wrapper from '../../src/wrappers/Wrapper.svelte'
	import Item from '../../src/Item.svelte'
	import Tabs from '../../src/Tabs.svelte'
	const registry = $state({})
	setContext('registry', registry)

	let { Template, using, properties } = $props()

	using = {
		editors: {},
		components: {},
		wrappers: {},
		navigators: {},
		...using
	}
	registry.editors = { ...using.editors }
	registry.components = { default: Item, ...using.components }
	registry.wrappers = { default: Wrapper, ...using.wrappers }
	registry.navigators = { default: Tabs, ...using.navigators }
</script>

<Template {...properties} />
