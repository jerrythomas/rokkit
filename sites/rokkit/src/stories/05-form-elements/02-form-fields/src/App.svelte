<script>
	import { FormFields } from '@rokkit/form'

	let data = { a: 'one', b: 'two', x: 10, c: { d: 'three', e: 'four' } }
	const fields = [
		{ key: 'a', type: 'input', props: { type: 'text', label: 'a' } },
		{ key: 'b', type: 'input', props: { type: 'textarea', label: 'b' } },
		{ key: 'x', type: 'input', props: { type: 'number', label: 'x' } },
		{
			key: 'c',
			type: 'object',
			props: {
				label: 'c',
				mapping: [
					{ key: 'd', type: 'input', props: { type: 'text', label: 'd' } },
					{ key: 'e', type: 'input', props: { type: 'textarea', label: 'e' } }
				]
			}
		}
	]
</script>

<FormFields mapping={fields} bind:data />
