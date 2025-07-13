<script>
	import { Accordion } from '@rokkit/ui'
	import Link from './Link.svelte'
	
	const data = [
		{
			name: 'Documentation Links',
			values: [
				{ name: 'Getting Started', url: '/welcome/getting-started' },
				{ name: 'Components', url: '/elements/list' },
				{ name: 'Theming', url: '/theming/colors' }
			]
		},
		{
			name: 'External Resources',
			values: [
				{ name: 'Svelte', url: 'https://svelte.dev', target: '_blank' },
				{ name: 'TypeScript', url: 'https://typescriptlang.org', target: '_blank' }
			]
		}
	]

	const fields = {
		text: 'name',
		children: 'values',
		url: 'url'
	}
	
	const using = { link: Link }
</script>

<Accordion items={data} {fields} {using} />