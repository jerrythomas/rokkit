<script>
	import { InputField, Switch } from '@rokkit/organisms'

	let selected
	let value
	let options = [
		{ id: 'option1', text: 'Option 1' },
		{ id: 'option2', text: 'Option 2' },
		{ id: 'option3', text: 'Option 3' }
	]
</script>

<InputField bind:value type="switch" label="Enter a value" {options} />
<p>Selected Value: <b>{value}</b></p>

<Switch
	bind:value={selected}
	{options}
	on:change={(event) => (value = event.detail.item.id)}
/>
