<script>
	import { Form } from '@rokkit/ui'
	
	const schema = [
		{
			key: 'name',
			label: 'Name',
			type: 'input',
			description: 'Enter your name',
			props: {
				type: 'text',
				required: true,
				minLength: 2
			}
		},
		{
			key: 'email',
			label: 'Email',
			type: 'input',
			description: 'Enter your email address',
			props: {
				type: 'email',
				required: true
			}
		},
		{
			key: 'age',
			label: 'Age',
			type: 'input',
			description: 'Enter your age',
			props: {
				type: 'number',
				min: 18,
				max: 99,
				required: true
			}
		}
	]

	let value = $state({ name: '', email: '', age: null })
</script>

<Form bind:value {schema} />
<pre class="mt-4 text-sm">{JSON.stringify(value, null, 2)}</pre>