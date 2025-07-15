<script>
	import { Form } from '@rokkit/ui'
	
	const schema = {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			email: { type: 'email', required: true },
			age: { type: 'number', min: 18, max: 99 }
		}
	}

	let value = $state({
		name: 'John Doe',
		email: 'john.doe@example.com',
		age: 30
	})
</script>

<Form bind:value {schema} />
<pre class="mt-4 text-sm">{JSON.stringify(value, null, 2)}</pre>