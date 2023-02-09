<script>
	import { Accordion } from '@rokkit/core'
	import { items } from './data.js'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'

	let fields = {
		text: 'category',
		data: 'values',
		fields: { component: 'type', text: 'name', image: 'photo' }
	}
	let using = { odd: Odd, even: Even }
</script>

<Accordion {items} {fields} {using} />
