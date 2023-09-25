export const schema = {
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
