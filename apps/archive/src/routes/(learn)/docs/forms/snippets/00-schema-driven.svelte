<script>
	import { FormRenderer } from '@rokkit/forms'

	let data = $state({
		name: '',
		email: '',
		role: 'user'
	})

	const schema = {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			email: { type: 'string', format: 'email', required: true },
			role: { type: 'string', enum: ['admin', 'user', 'guest'] }
		}
	}
</script>

<FormRenderer
	bind:data
	{schema}
	onsubmit={async (data, { isValid }) => {
		if (isValid) await saveUser(data)
	}}
/>
