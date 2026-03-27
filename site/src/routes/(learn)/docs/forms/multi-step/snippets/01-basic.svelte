<script>
	import { FormRenderer } from '@rokkit/forms'

	const schema = {
		type: 'object',
		properties: {
			firstName: { type: 'string', required: true },
			lastName: { type: 'string' },
			email: { type: 'string', required: true, format: 'email' },
			password: { type: 'string', required: true, minLength: 8 }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				type: 'step',
				label: 'Personal Info',
				elements: [
					{ scope: '#/firstName', label: 'First Name' },
					{ scope: '#/lastName', label: 'Last Name' }
				]
			},
			{
				type: 'step',
				label: 'Account Setup',
				elements: [
					{ scope: '#/email', label: 'Email' },
					{ scope: '#/password', label: 'Password' }
				]
			}
		]
	}

	let data = $state({})

	async function handleSubmit(formData) {
		console.log('Submitted:', formData)
	}
</script>

<FormRenderer bind:data {schema} {layout} onsubmit={handleSubmit} />
