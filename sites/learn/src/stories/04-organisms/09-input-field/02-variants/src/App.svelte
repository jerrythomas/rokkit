<script>
	import { InputField } from '@rokkit/organisms'

	let value = {
		toggle: 'water',
		rating: 3,
		radio: 'male'
	}
	let gender = ['male', 'female']
	let options = [
		{ value: 'water', text: 'Water' },
		{ value: 'tea', text: 'Tea' },
		{ value: 'coffee', text: 'Coffee' }
	]
</script>

<InputField
	bind:value={value.toggle}
	type="switch"
	label="Enter a value"
	{options}
/>
<InputField
	bind:value={value.rating}
	type="rating"
	label="select a rating"
	max={5}
/>
<InputField
	bind:value={value.radio}
	type="radio"
	label="Gender"
	options={gender}
	class="horizontal"
/>

<pre>{JSON.stringify(value, null, 2)}</pre>
