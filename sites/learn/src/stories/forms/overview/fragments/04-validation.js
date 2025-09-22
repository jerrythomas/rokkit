export const schema = [
	{
		key: 'name',
		label: 'Name',
		type: 'input',
		description: 'Enter your name',
		props: {
			type: 'text',
			required: true,
			minLength: 2
		}
	},
	{
		key: 'email',
		label: 'Email',
		type: 'input',
		description: 'Enter your email address',
		props: {
			type: 'email',
			required: true
		}
	}
]
