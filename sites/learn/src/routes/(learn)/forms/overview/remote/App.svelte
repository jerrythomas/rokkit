<script>
	import { Form } from '@rokkit/ui'

	const schema = {
		type: 'object',
		properties: {
			username: { type: 'string', required: true },
			email: { type: 'email', required: true },
			password: { type: 'password', required: true, minLength: 8 }
		}
	}

	let value = $state({ username: '', email: '', password: '' })
	let loading = $state(false)
	let submitted = $state(false)
	
	async function handleSubmit() {
		loading = true
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000))
		loading = false
		submitted = true
	}
</script>

<Form bind:value {schema} />

<div class="mt-6 space-y-4">
	<button 
		class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" 
		onclick={handleSubmit}
		disabled={loading}
	>
		{loading ? 'Submitting...' : 'Submit Form'}
	</button>
	
	{#if submitted}
		<div class="p-4 bg-green-50 text-green-800 rounded">
			Form submitted successfully!
		</div>
	{/if}
</div>

<pre class="mt-4 text-sm">{JSON.stringify(value, null, 2)}</pre>