<script>
	import { Accordion } from '@rokkit/core'
	import { items } from './data.js'

	let fields = { text: 'category', fields: { text: 'name', image: 'photo' } }
</script>

<Accordion {items} {fields} />
