<script>
	import { Item } from '@rokkit/core'

	let value = { name: 'A Heart Icon', symbol: 'i-rokkit:heart-filled' }
	let fields = { text: 'name', icon: 'symbol' }
</script>

<p class="mt-6">Field Mapping example</p>
<item>
	<Item {value} {fields} />
</item>
