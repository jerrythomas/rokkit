export const variants = [
	{ title: 'Default', summary: '', attr: { min: 0, max: 10 } }
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
