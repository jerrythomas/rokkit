<script>
	import { Item } from '@rokkit/elements'
	import { FieldMapper } from '@rokkit/core'
	let value = { name: 'A Heart Icon', symbol: 'i-rokkit:heart-filled' }
	let mapping = new FieldMapper({ text: 'name', icon: 'symbol' })
</script>

<p class="mt-6">Field Mapping example</p>
<item class="border-neutral-subtle flex w-full gap-2 rounded-md border p-2">
	<Item {value} {mapping} />
</item>
