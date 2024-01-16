<script>
	import { Form } from '@rokkit/organisms'

	let schema = {
		type: 'object',
		properties: {
			logo: {
				type: 'string',
				default: 'your_logo_path.png'
			},
			name: {
				type: 'string',
				default: 'ROKKIT'
			}
		}
	}
	let layout = {
		type: 'vertical',
		elements: [
			{
				key: 'logo',
				scope: '#/logo'
			},
			{
				key: 'name',
				scope: '#/name'
			}
		]
	}
	let value = {
		theme: {
			logo: 'your_logo_path.png',
			name: 'ROKKIT'
		}
	}
</script>

<Form value={value.theme} {schema} {layout} />
