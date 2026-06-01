import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'
const meta: DemoMeta = {
	id: 'markdown-renderer',
	title: 'MarkdownRenderer',
	description: 'Sanitized Markdown → HTML with pluggable code blocks (charts, tables, diagrams).',
	keywords: [
		'markdown', 'md', 'renderer', 'docs', 'long-form',
		'plugins', 'rich-text', 'mdx-lite'
	],
	category: 'content',
	icon: '文',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_markdown_renderer',
		description: 'Mount a MarkdownRenderer on the canvas with sample prose.',
		parameters: { markdown: 'Markdown source string' }
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'markdown', type: 'string', desc: 'Markdown source to parse + render' },
			{ name: 'plugins', type: 'MarkdownPlugin[]', default: '[]', desc: 'Plugins that intercept fenced code blocks by language' },
			{ name: 'crossfilterWrapper', type: 'Component', desc: 'Optional wrapper that groups co-labelled plot blocks into a shared crossfilter' }
		],
		events: [],
		attrs: [
			{ selector: 'article + nested HTML', desc: 'Output is sanitized HTML — no specific data-* hooks, themes target tag selectors' }
		]
	},
	snippets: [
		{
			id: 'intro',
			title: 'Basic prose',
			lang: 'svelte',
			code: `<script>
  import { MarkdownRenderer } from '@rokkit/ui'

  const content = \`# Title

Body paragraph with **bold**, _italic_, and \\\`inline\\\` code.

- Bullet one
- Bullet two

\\\`\\\`\\\`javascript
console.log('hello')
\\\`\\\`\\\`\`
</script>

<MarkdownRenderer markdown={content} />`
		},
		{
			id: 'plugins',
			title: 'With block plugins',
			lang: 'svelte',
			code: `import { PlotPlugin, TablePlugin } from '@rokkit/blocks'

<MarkdownRenderer
  markdown={content}
  plugins={[PlotPlugin, TablePlugin]}
/>`
		}
	],
	docs
}

export default meta
