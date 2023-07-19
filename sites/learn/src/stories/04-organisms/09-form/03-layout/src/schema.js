export const schema = {
	type: 'object',
	properties: {
		first_name: { type: 'string', required: true },
		last_name: { type: 'string', required: true },
		gender: { type: 'string', required: true },
		age: { type: 'number', min: 18, max: 99 }
	}
}
