export const schema = {
	type: 'object',
	properties: {
		name: { type: 'string', required: true },
		email: { type: 'email', required: true },
		age: { type: 'number', min: 18, max: 99 }
	}
}
