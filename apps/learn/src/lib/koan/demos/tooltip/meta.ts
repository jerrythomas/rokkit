import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'tooltip',
	title: 'Tooltip',
	description: 'Hover / focus tooltip — configurable position with auto-flip + Escape to dismiss.',
	keywords: [
		'tooltip', 'hint', 'hover-text', 'popover', 'aria-describedby',
		'contextual-help'
	],
	category: 'feedback',
	icon: '註',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_tooltip',
		description: 'Mount a Tooltip gallery on the canvas.',
		parameters: { position: 'top | right | bottom | left', delay: 'ms' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'content', type: 'string', default: "''", desc: 'Plain-text tooltip content (use `tooltipContent` snippet for rich content)' },
			{ name: 'position', type: "'top' | 'right' | 'bottom' | 'left'", default: "'top'", desc: 'Preferred side — auto-flips when it would overflow' },
			{ name: 'delay', type: 'number', default: '300', desc: 'Hover-in delay in ms (hides are immediate)' },
			{ name: 'class', type: 'string', desc: 'Extra CSS classes on the wrapper' },
			{ name: 'children', type: 'Snippet', desc: 'Trigger element (any focusable / hoverable content)' },
			{ name: 'tooltipContent', type: 'Snippet', desc: 'Rich tooltip body — overrides `content` when set' }
		],
		events: [],
		attrs: [
			{ selector: '[data-tooltip-root]', desc: 'Wrapper around the trigger' },
			{ selector: '[data-tooltip-content]', desc: 'Tooltip bubble (carries data-tooltip-position, data-tooltip-visible)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — top, default delay',
			lang: 'svelte',
			code: `<script>
  import { Tooltip, Button } from '@rokkit/ui'
</script>

<Tooltip content="Saves your changes" position="top">
  <Button>Save</Button>
</Tooltip>`
		},
		{
			id: 'positions',
			title: 'Four sides — auto-flips near edges',
			lang: 'svelte',
			code: `<Tooltip content="Top" position="top"><Button>Top</Button></Tooltip>
<Tooltip content="Right" position="right"><Button>Right</Button></Tooltip>
<Tooltip content="Bottom" position="bottom"><Button>Bottom</Button></Tooltip>
<Tooltip content="Left" position="left"><Button>Left</Button></Tooltip>`
		},
		{
			id: 'rich',
			title: 'Rich content snippet',
			lang: 'svelte',
			code: `<Tooltip position="bottom">
  <Button>Status</Button>
  {#snippet tooltipContent()}
    <div>
      <strong>Build</strong> passing
      <br /><strong>Deploy</strong> queued
    </div>
  {/snippet}
</Tooltip>`
		}
	],
	docs
}

export default meta
