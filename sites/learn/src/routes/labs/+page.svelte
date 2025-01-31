<script>
	import { FieldMapper } from '@rokkit/core'
	import { Switch, Item } from '@rokkit/ui'
	import DropDown from './DropDown.svelte'

	let mapping = new FieldMapper({}, { default: Item })
	let options = [
		{ text: 'Sun', icon: 'i-rokkit:mode-light' },
		{ text: 'Moon', icon: 'i-rokkit:mode-dark' }
	]
	let value = null
</script>

<div class="flex flex-col items-center justify-center gap-4 p-4">
	<h1>Switch</h1>
	<Switch bind:value {mapping} {options} />
	<DropDown {options} bind:value></DropDown>
</div>
