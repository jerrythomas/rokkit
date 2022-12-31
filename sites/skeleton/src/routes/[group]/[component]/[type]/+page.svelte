<script>
	export let data
	import { FieldLayout } from '@rokkit/form'
	import NestedFields from './NestedFields.svelte'
	import Button from './Button.svelte'
	import Text from './Text.svelte'
	import Input from './Input.svelte'
	let value = {
		name: 'hello',
		pass: 20,
		data: [
			{ name: 'Panda', url: '/1', component: 'Link' },
			{ name: 'Monkey' },
			{ name: 'Viper', icon: 'sun', component: 'Link' }
		]
	}

	let items = [
		{
			class: 'card items-center',
			items: [
				{ component: 'Text', props: { value: 'Sign in with' } },
				{
					class: 'flex flex-row items-center justify-around gap-2',
					items: [
						{
							component: 'Button',
							props: { leftIcon: 'i-spice:menu' }
						},
						{
							component: 'Button',
							props: { icon: 'i-spice:themes' }
						},
						{
							component: 'Button',
							props: { icon: 'i-spice:properties' }
						}
					]
				}
			]
		},
		{
			class: 'card',
			items: [{ component: 'Input', key: 'name', props: { type: 'text' } }]
		},
		{
			class: 'card',
			items: [{ component: 'Input', key: 'pass', props: { type: 'text' } }]
		}
	]
	let using = { Text, Button, Input }
</script>

<div class="p-4 grid grid-cols-2 gap-5 ">
	<FieldLayout {items} class="flex flex-col gap-4" bind:value {using} />
	<pre class="bg-skin-100">{JSON.stringify(value, null, 2)}</pre>
</div>
<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<!-- <FormFields bind:data={value} mapping={fields} /> -->
