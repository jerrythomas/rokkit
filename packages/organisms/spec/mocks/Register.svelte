<script>
	import { run } from 'svelte/legacy'

	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import Wrapper from '../../src/wrappers/Wrapper.svelte'
	import { Item } from '@rokkit/molecules'
	import Tabs from '../../src/Tabs.svelte'
	const registry = writable({})
	setContext('registry', registry)

	let { render, using = $bindable(), properties = {} } = $props()

	run(() => {
		using = {
			editors: {},
			components: {},
			wrappers: {},
			navigators: {},
			...using
		}
	})
	run(() => {
		registry.set({
			editors: { ...using.editors },
			components: { default: Item, ...using.components },
			wrappers: { default: Wrapper, ...using.wrappers },
			navigators: { default: Tabs, ...using.navigators }
		})
	})

	const SvelteComponent = $derived(render)
</script>

<SvelteComponent {...properties} />
