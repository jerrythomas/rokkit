<script>
	import { FieldLayout } from '@rokkit/form'
	import { fields } from './layout.js'

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
</script>

<FieldLayout bind:value={data} items={fields} />
