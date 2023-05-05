<script>
	import { Accordion, Link } from '@rokkit/core'
	import { items } from './data.js'

	const fields = {
		text: 'category',
		children: 'values',
		isOpen: 'isOpen',
		fields: {
			text: 'name',
			image: 'photo',
			url: 'source'
		}
	}
	const using = { default: Link }
</script>

<Accordion {items} {fields} {using} />
