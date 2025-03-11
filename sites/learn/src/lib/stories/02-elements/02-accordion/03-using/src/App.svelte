<script>
	import { Accordion } from '@rokkit/ui'
	import { FieldMapper } from '@rokkit/core'
	import Link from './Link.svelte'
	import { data } from './data.js'

	const fields = {
		text: 'name',
		children: 'values',
		isOpen: 'isOpen',
		image: 'photo',
		url: 'source'
	}
	let items = $state(data)
	let mapping = new FieldMapper(fields, { default: Link })
</script>

<Accordion bind:items {mapping} />
