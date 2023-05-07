<script>
	import { Tabs } from '@rokkit/core'
	import Controls from './Controls.svelte'
	let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value
	let options = [
		{ label: 'Editable', value: false, items: [false, true] },
		{ label: 'Below', value: false, items: [false, true] },
		{ label: 'Align', value: 'left', items: ['left', 'center', 'right'] }
	]
</script>

<Controls bind:options />

<div class="flex flex-col" class:flex-col-reverse={options[1].value}>
	<Tabs
		{items}
		bind:value
		editable={options[0].value}
		below={options[1].value}
		align={options[2].value}
	/>
	<pre>
	{JSON.stringify(value)}
</pre>
</div>
