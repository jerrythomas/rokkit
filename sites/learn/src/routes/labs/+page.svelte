<script>
	import { FieldMapper } from '@rokkit/core'
	import { Item, List } from '@rokkit/ui'

	let mapping = new FieldMapper({}, { default: Item })
	let options = [
		{ text: 'Sun', icon: 'i-rokkit:mode-light' },
		{ text: 'Moon', icon: 'i-rokkit:mode-dark' }
	]
	let value = null
</script>

<div class="flex flex-col items-center justify-center gap-4 p-4">
	<h1>List</h1>
	<!-- <Switch bind:value {mapping} {options} /> -->
	<List items={options} bind:value {mapping}></List>
</div>
