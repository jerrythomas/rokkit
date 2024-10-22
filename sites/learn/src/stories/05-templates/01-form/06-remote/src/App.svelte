<script>
	import { Form } from '@rokkit/ui'

	const schema = {
		type: 'object',
		properties: {
			gender: { type: 'enum', required: true, enum: ['male', 'female'] }
		}
	}
	const layout = {
		elements: [
			{
				label: 'Gender',
				scope: '#/gender',
				editor: 'switch'
			}
		]
	}

	let value = $state({})
</script>

<Form {schema} {layout} bind:value />
<pre>{JSON.stringify(value, null, 2)}</pre>
