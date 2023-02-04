<script>
	import { List } from '@rokkit/core'
	import { items } from './data.js'

	let fields = { text: 'name', image: 'profile' }
</script>

<List {items} {fields} />
