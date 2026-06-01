import type { DemoMeta } from '../../types'
import { buttonDocs } from './docs'

const meta: DemoMeta = {
	id: 'button',
	title: 'Button',
	description: 'Text + icon trigger with disabled, loading, and link modes — the canonical interactive primitive.',
	keywords: [
		'button', 'buttons', 'trigger', 'click', 'action', 'submit',
		'icon-button', 'cta', 'call-to-action', 'link-button'
	],
	category: 'navigation',
	icon: '押',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_button',
		description:
			'Mount a Button gallery on the canvas. Use when the user asks about buttons, click triggers, or comparing icon vs label vs link modes.',
		parameters: {
			label: 'Button text',
			icon: 'optional left icon class',
			href: 'optional URL — renders as a link'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'label', type: 'string', desc: 'Button text (or use children)' },
			{ name: 'icon', type: 'string', desc: 'Left-side icon class (e.g. `i-mdi:download`)' },
			{ name: 'iconRight', type: 'string', desc: 'Right-side icon class' },
			{ name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", desc: 'HTML button type — relevant in form contexts' },
			{ name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable interaction' },
			{ name: 'loading', type: 'boolean', default: 'false', desc: 'Show a spinner; suppress click' },
			{ name: 'href', type: 'string', desc: 'When set, renders as `<a>` instead of `<button>`' },
			{ name: 'target', type: 'string', desc: 'Link target (`_blank` etc.)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [
			{ name: 'onclick', signature: '(event) => void', desc: 'Fires on click (suppressed when disabled or loading)' }
		],
		attrs: [
			{ selector: '[data-button]', desc: 'Root element (carries data-loading, data-disabled)' },
			{ selector: '[data-button-icon]', desc: 'Icon span (left or right)' },
			{ selector: '[data-button-label]', desc: 'Label span' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — label + click',
			lang: 'svelte',
			code: `<script>
  import { Button } from '@rokkit/ui'
</script>

<Button onclick={() => console.log('clicked')}>Save</Button>`
		},
		{
			id: 'icons',
			title: 'With icons',
			lang: 'svelte',
			code: `<Button icon="i-mdi:download">Download</Button>
<Button icon="i-mdi:heart" aria-label="Like" />
<Button label="Next" iconRight="i-mdi:arrow-right" />`
		},
		{
			id: 'states',
			title: 'States — disabled, loading',
			lang: 'svelte',
			code: `<Button disabled>Disabled</Button>
<Button loading>Saving...</Button>`
		},
		{
			id: 'link',
			title: 'Link mode',
			lang: 'svelte',
			code: `<Button href="/dashboard">Dashboard</Button>
<Button href="https://github.com/..." target="_blank">Repo</Button>`
		}
	],
	docs: buttonDocs
}

export default meta
