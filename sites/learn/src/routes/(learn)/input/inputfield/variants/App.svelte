<script>
	import { InputField } from '@rokkit/ui'
	
	let values = $state({
		text: '',
		email: '',
		password: '',
		number: 0,
		range: 25,
		date: new Date().toISOString().split('T')[0],
		color: '#3b82f6',
		checkbox: false
	})
</script>

<div class="space-y-4">
	<InputField name="text" type="text" label="Text Input" bind:value={values.text} />
	<InputField name="email" type="email" label="Email Input" bind:value={values.email} />
	<InputField name="password" type="password" label="Password Input" bind:value={values.password} />
	<InputField name="number" type="number" label="Number Input" bind:value={values.number} />
	<InputField name="range" type="range" label="Range Input" bind:value={values.range} />
	<InputField name="date" type="date" label="Date Input" bind:value={values.date} />
	<InputField name="color" type="color" label="Color Input" bind:value={values.color} />
	<InputField name="checkbox" type="checkbox" label="Checkbox Input" bind:value={values.checkbox} />
</div>

<pre class="mt-6 text-sm">{JSON.stringify(values, null, 2)}</pre>