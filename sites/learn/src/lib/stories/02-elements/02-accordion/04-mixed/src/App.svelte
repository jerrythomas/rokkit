<script>
	import { Accordion, Item } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import { data } from './data.js'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'

	let fields = {
		text: 'name',
		children: 'values',
		component: 'type',
		image: 'photo'
	}
	let items = $state(data)
	let mapping = new FieldMapper(fields, { default: Item, odd: Odd, even: Even })
</script>

<Accordion bind:items {mapping} />
