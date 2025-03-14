<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { componentTypes } from './types'
	import Wrapper from './wrappers/Wrapper.svelte'
	import Item from './Item.svelte'
	import Tabs from './Tabs.svelte'
	import FieldLayout from './FieldLayout.svelte'
	import { noop } from '@rokkit/core'

	const registry = $state({})
	setContext('registry', registry)

	import { deriveSchemaFromValue, deriveLayoutFromValue, getSchemaWithLayout } from './lib'

	let { value, schema = null, layout = null, using = {}, onchange = noop } = $props()

	registry.editors = { ...componentTypes, ...using?.editors }
	registry.components = { default: Item, ...using?.components }
	registry.wrappers = { default: Wrapper, ...using?.wrappers }
	registry.navigators = { default: Tabs, ...using?.navigators }

	let schemaWithLayout = $derived.by(() => {
		return getSchemaWithLayout(
			schema ?? deriveSchemaFromValue(value),
			layout ?? deriveLayoutFromValue(value)
		)
	})
</script>

<FieldLayout schema={schemaWithLayout} bind:value {onchange} />
