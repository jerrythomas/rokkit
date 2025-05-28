<script>
	import { setContext } from 'svelte'
	// import { writable } from 'svelte/store'
	import Wrapper from '..//Wrapper.svelte'
	import Item from '../Item.svelte'
	import Tabs from '../Tabs.svelte'
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
