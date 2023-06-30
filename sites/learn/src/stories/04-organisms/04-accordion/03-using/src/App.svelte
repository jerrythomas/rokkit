<script>
	import { Accordion } from '@rokkit/organisms'
	import Link from './Link.svelte'
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
