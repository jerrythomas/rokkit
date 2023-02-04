<script>
	import { List } from '@rokkit/core'
	import { items } from './data.js'
	import MaleCard from './MaleCard.svelte'
	import FemaleCard from './FemaleCard.svelte'

	let fields = { component: 'gender' }
	let using = { Male: MaleCard, Female: FemaleCard }
</script>

<List {items} {using} {fields} />
