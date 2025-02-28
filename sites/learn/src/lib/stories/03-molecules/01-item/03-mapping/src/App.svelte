<script>
	import { Item } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	let value = { name: 'A Heart Icon', symbol: 'i-rokkit:heart-filled' }
	let mapping = new FieldMapper({ text: 'name', icon: 'symbol' })
</script>

<p class="mt-6">Field Mapping example</p>
<item>
	<Item {value} {mapping} />
</item>
