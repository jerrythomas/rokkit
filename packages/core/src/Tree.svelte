<script>
	import NestedList from './NestedList.svelte'
	import { Text } from './items'
	import { defaultFields } from './constants'

	export let items = []
	export let fields = {}
	export let using = { default: Text }
	export let root = 'root'
	export let rtl = false

	$: fields = { ...defaultFields, ...fields }
	$: items =
		items.length == 1 ? items : [{ [fields.text]: root, [fields.data]: items }]
</script>

<NestedList {items} {fields} {using} {rtl} />
