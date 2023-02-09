<script>
	import { List } from '@rokkit/core'
	import { items } from './data.js'

	let fields = { text: 'name', image: 'photo' }
</script>

<List {items} {fields} />
