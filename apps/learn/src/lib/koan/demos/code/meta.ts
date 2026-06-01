import type { DemoMeta } from '../../types'
import { codeDocs } from './docs'

const meta: DemoMeta = {
	id: 'code',
	title: 'Code',
	description: 'Shiki-highlighted code block with hover-reveal copy button + optional line numbers.',
	keywords: [
		'code', 'syntax-highlight', 'shiki', 'snippet', 'codeblock',
		'highlight', 'copy-code'
	],
	category: 'content',
	icon: '碼',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_code',
		description: 'Mount a Code block on the canvas.',
		parameters: { code: 'string', language: 'Shiki language id', theme: 'light | dark' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'code', type: 'string', desc: 'The source to highlight' },
			{ name: 'language', type: 'string', default: "'text'", desc: 'Shiki language id (`javascript`, `svelte`, `bash`, …)' },
			{ name: 'theme', type: "'light' | 'dark'", default: "'dark'", desc: 'Shiki theme — drives code colors only, not surrounding chrome' },
			{ name: 'showLineNumbers', type: 'boolean', default: 'false', desc: 'Render line-number gutter' },
			{ name: 'showCopyButton', type: 'boolean', default: 'true', desc: 'Render the hover-reveal copy button' },
			{ name: 'labels', type: 'Record<string, string>', desc: 'Override the copy / copied labels (i18n)' },
			{ name: 'class', type: 'string', default: "''", desc: 'Extra CSS classes' }
		],
		events: [],
		attrs: [
			{ selector: '.code-block', desc: 'Root container (carries data-language, data-theme)' },
			{ selector: '.copy-button', desc: 'Copy-to-clipboard button (carries data-copied while flashing)' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic — JavaScript',
			lang: 'svelte',
			code: `<script>
  import { Code } from '@rokkit/ui'

  const example = \`function greet(name) {
  return \\\`Hello, \\\${name}!\\\`
}\`
</script>

<Code code={example} language="javascript" />`
		},
		{
			id: 'svelte',
			title: 'Svelte with line numbers',
			lang: 'svelte',
			code: `<Code code={component} language="svelte" showLineNumbers />`
		},
		{
			id: 'light',
			title: 'Light theme',
			lang: 'svelte',
			code: `<Code code={example} language="json" theme="light" />`
		}
	],
	docs: codeDocs
}

export default meta
