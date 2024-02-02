<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { componentTypes } from './types'
	import Wrapper from './wrappers/Wrapper.svelte'
	import { Item } from '@rokkit/molecules'
	import Tabs from './Tabs.svelte'
	import FieldLayout from './FieldLayout.svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()
	const registry = writable({})
	setContext('registry', registry)

	import { deriveSchemaFromValue, deriveLayoutFromValue, getSchemaWithLayout } from './lib'

	export let value
	export let schema = null
	export let layout = null
	export let using = {}

	let schemaWithLayout

	function handle(event) {
		dispatch('change', value)
	}
	$: registry.set({
		editors: { ...componentTypes, ...using?.editors },
		components: { default: Item, ...using?.components },
		wrappers: { default: Wrapper, ...using?.wrappers },
		navigators: { default: Tabs, ...using?.navigators }
	})
	$: if (!schema) schema = deriveSchemaFromValue(value)
	$: if (!layout) layout = deriveLayoutFromValue(value)
	$: schemaWithLayout = getSchemaWithLayout(schema, layout)
</script>

<FieldLayout schema={schemaWithLayout} bind:value on:change={handle} />
