<script>
	import { run } from 'svelte/legacy'

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

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {any} [schema]
	 * @property {any} [layout]
	 * @property {any} [using]
	 */

	/** @type {Props} */
	let {
		value = $bindable(),
		schema = $bindable(null),
		layout = $bindable(null),
		using = {}
	} = $props()

	let schemaWithLayout = $derived(getSchemaWithLayout(schema, layout))

	function handle() {
		dispatch('change', value)
	}
	$effect(() => {
		registry.set({
			editors: { ...componentTypes, ...using?.editors },
			components: { default: Item, ...using?.components },
			wrappers: { default: Wrapper, ...using?.wrappers },
			navigators: { default: Tabs, ...using?.navigators }
		})
	})
	$effect(() => {
		if (!schema) schema = deriveSchemaFromValue(value)
	})
	$effect(() => {
		if (!layout) layout = deriveLayoutFromValue(value)
	})
</script>

<FieldLayout schema={schemaWithLayout} bind:value on:change={handle} />
