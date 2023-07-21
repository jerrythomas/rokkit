<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { componentTypes } from './types'
	import FieldLayout from './FieldLayout.svelte'

	const registry = writable({})
	setContext('registry', registry)

	import {
		deriveSchemaFromValue,
		deriveLayoutFromValue,
		getSchemaWithLayout
	} from './lib/fields'

	export let value
	export let schema = null
	export let layout = null
	export let using = {}

	let schemaWithLayout
	$: registry.set({ ...componentTypes, ...using })
	$: if (!schema) schema = deriveSchemaFromValue(value)
	$: if (!layout) layout = deriveLayoutFromValue(value)
	$: schemaWithLayout = getSchemaWithLayout(schema, layout)
</script>

<FieldLayout schema={schemaWithLayout} bind:value />
