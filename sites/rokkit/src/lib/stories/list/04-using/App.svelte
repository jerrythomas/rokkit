<script>
	import { List, Link } from '@rokkit/core'
	import { items } from './data.js'

	let using = { default: Link }
	let fields = { text: 'name', image: 'photo', url: 'artist' }
</script>

<List {items} {using} {fields} />
