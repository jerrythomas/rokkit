<script>
	import { List } from '@rokkit/core'
	import { items } from './data.js'
	import PersonCard from './PersonCard.svelte'

	let using = { default: PersonCard }
</script>

<List {items} {using} />
