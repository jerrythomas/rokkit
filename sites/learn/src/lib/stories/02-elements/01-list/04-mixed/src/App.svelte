<script>
	import { List, Item } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import { items } from './data.js'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'

	let fields = { text: 'name', image: 'photo', component: 'type' }
	let mapping = new FieldMapper(fields, { default: Item, odd: Odd, even: Even })
</script>

<List {items} {mapping} />
