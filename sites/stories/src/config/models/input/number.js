export const variants = [
	{ title: 'Default', summary: '', attr: { pattern: '[0-9]*' } },
	{ title: 'Disabled', summary: '', attr: { disabled: true } },
	{ title: 'Success', summary: '', attr: { status: 'pass' } },
	{ title: 'Error', summary: '', attr: { status: 'fail' } }
]
export const props = {
	label: 'Some label',
	value: 'some value'
}
export const fields = [
	{
		key: 'label',
		type: 'input',
		props: { type: 'text' }
	},
	{
		key: 'min',
		type: 'input',
		props: { type: 'number', value: null }
	},
	{
		key: 'max',
		type: 'input',
		props: { type: 'number', value: 10 }
	},
	{
		key: 'placeholder',
		type: 'input',
		props: { type: 'text', value: null }
	},
	{
		key: 'required',
		type: 'checkbox',
		props: {}
	},
	{
		key: 'message',
		type: 'input',
		props: { type: 'text', value: null }
	}
]
