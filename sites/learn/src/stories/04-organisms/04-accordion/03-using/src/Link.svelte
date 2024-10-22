<script>
	import { defaultFields } from '@rokkit/core'
	import { Item } from '@rokkit/ui'

	let { value, fields = defaultFields } = $props();

	let target = $derived(fields.target ? value[fields.target] : '')
</script>

<a class="flex flex-grow flex-row items-center" href={value[fields.url]} {target} tabindex="-1">
	<Item {value} {fields} />
</a>
