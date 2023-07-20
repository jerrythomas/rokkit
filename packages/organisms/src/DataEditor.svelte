<script>
	import FieldLayout from './FieldLayout.svelte'
	import {
		deriveSchemaFromValue,
		deriveLayoutFromValue,
		getSchemaWithLayout
	} from './lib/fields'

	export let value
	export let schema
	export let layout
	export let using

	let schemaWithLayout
	$: if (!schema) schema = deriveSchemaFromValue(value)
	$: if (!layout) layout = deriveLayoutFromValue(value)
	$: schemaWithLayout = getSchemaWithLayout(schema, layout)
</script>

<FieldLayout schema={schemaWithLayout} bind:value {using} />
