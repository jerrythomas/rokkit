<script>
	import { Form } from '@rokkit/ui'
	
	const schema = {
		type: 'object',
		properties: {
			first_name: { type: 'string', required: true },
			last_name: { type: 'string', required: true },
			gender: {
				type: 'enum',
				required: true,
				options: [
					{ id: 'M', value: 'Male' },
					{ id: 'F', value: 'Female' }
				],
				fields: { value: 'id', text: 'value' }
			},
			age: { type: 'number', min: 18, max: 99 }
		}
	}
	
	const layout = {
		type: 'vertical',
		elements: [
			{
				title: 'name',
				type: 'horizontal',
				elements: [
					{
						label: 'First Name',
						scope: '#/first_name'
					},
					{
						label: 'Last Name',
						scope: '#/last_name'
					}
				]
			},
			{
				label: 'gender',
				scope: '#/gender'
			},
			{
				label: 'age',
				scope: '#/age'
			}
		]
	}

	let value = $state({ first_name: '', last_name: '', gender: '', age: 25 })
</script>

<Form bind:value {schema} {layout} />
<pre class="mt-4 text-sm">{JSON.stringify(value, null, 2)}</pre>