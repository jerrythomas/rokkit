<script>
	import { FieldMapper } from '@rokkit/core'
	import { Switch, Item } from '@rokkit/ui'

	let mapping = new FieldMapper({}, { default: Item })
	let options = [
		{ text: 'Sun', icon: 'i-rokkit:mode-light' },
		{ text: 'Moon', icon: 'i-rokkit:mode-dark' }
	]
	let value = null
</script>

<h1>Switch</h1>
<Switch bind:value {mapping} {options} />
