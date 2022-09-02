export const variants = [{ title: 'Default', summary: '', attr: {} }]
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
		key: 'maxLength',
		type: 'input',
		props: { type: 'number', value: null }
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
		key: 'disabled',
		type: 'checkbox',
		props: {}
	},
	{
		key: 'status',
		type: 'list',
		props: {
			items: ['default', 'pass', 'fail', 'warn'],
			value: 'default'
		}
	},
	{
		key: 'message',
		type: 'input',
		props: { type: 'textarea', value: 'a message to the end user.' }
	}
]
