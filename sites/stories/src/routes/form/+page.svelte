<script>
	import { Form, DataList } from '@svelte-spice/input'
	import { FormFields } from '@svelte-spice/form'

	let data = {
		name: 'hello',
		age: 20,
		data: [
			{ name: 'Panda', url: '/1', component: 'Link' },
			{ name: 'Monkey' },
			{ name: 'Viper', icon: 'sun', component: 'Link' }
		],
		male: false
	}
	let fields = [
		{
			key: 'name',
			type: 'text',
			props: { list: 'datalist' }
		},
		{ key: 'age', type: 'number', props: { label: 'Age' } },
		{ key: 'male', type: 'checkbox', props: { label: 'Male?' } },
		{
			key: 'data',
			type: 'array',
			props: {
				fields: [
					{ key: 'name', type: 'text' },
					{ key: 'url', type: 'text' },
					{ key: 'icon', type: 'text' },
					{
						key: 'component',
						type: 'text',
						props: { list: 'input-types', autocomplete: 'on' }
					}
				],
				closeable: true,
				add: true
			}
		}
	]

	$: console.log('form', data)
</script>

<content class="flex flex-col w-full p-4">
	<p>First auto Form</p>
	<Form>
		<DataList
			id="input-types"
			values={['text', 'json', 'number', 'checkbox', 'Link']}
		/>
		<FormFields bind:data {fields} />
	</Form>
</content>
