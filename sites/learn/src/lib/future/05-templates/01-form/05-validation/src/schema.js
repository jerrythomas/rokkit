export const schema = [
	{
		key: 'name',
		label: 'Name',
		type: 'input',
		description: 'Enter your name',
		props: {
			type: 'text'
		}
	},
	{
		key: 'gender',
		label: 'Gender',
		type: 'select',
		description: 'Select your gender',
		props: {
			items: ['male', 'female', 'other']
		}
	},
	{
		key: 'age',
		label: 'Age',
		type: 'input',
		description: 'Enter your age',
		props: {
			type: 'number'
		}
	},
	{
		key: 'bio',
		label: 'Bio',
		type: 'input',
		description: 'Enter your bio',
		props: {
			type: 'textarea',
			rows: 5,
			maxLength: 100
		}
	}
]
