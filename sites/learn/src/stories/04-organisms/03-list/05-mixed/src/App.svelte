<script>
	import { List } from '@rokkit/organisms'
	import { items } from './data.js'
	import Odd from './Odd.svelte'
	import Even from './Even.svelte'

	let fields = { text: 'name', image: 'photo', component: 'type' }
	let using = { odd: Odd, even: Even }
</script>

<List {items} {using} {fields} />
