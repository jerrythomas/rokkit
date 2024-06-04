<script>
	import { Tabs } from '@rokkit/ui'
	import Controls from './Controls.svelte'
	let options = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
	let value
	let properties = [
		{ label: 'Below', value: false, options: [false, true] },
		{ label: 'Align', value: 'left', options: ['left', 'center', 'right'] }
	]
</script>

<Controls bind:properties />

<div class="flex flex-col" class:flex-col-reverse={options[0].value}>
	<Tabs {options} bind:value below={properties[0].value} align={properties[1].value} />
	<pre>
	{JSON.stringify(value)}
</pre>
</div>
