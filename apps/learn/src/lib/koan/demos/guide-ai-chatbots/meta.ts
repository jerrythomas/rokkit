import type { DemoMeta } from '../../types'
import { guideContent } from './content'

const meta: DemoMeta = {
	id: 'guide-ai-chatbots',
	title: 'AI Chatbots & Blocks',
	description: 'Use @rokkit/blocks to let LLMs render charts, tables, forms, and lists from fenced markdown code blocks.',
	keywords: [
		'ai', 'chatbot', 'llm', 'blocks', 'markdown', 'plugins',
		'plot-plugin', 'table-plugin', 'form-plugin', 'list-plugin',
		'mermaid', 'crossfilter', 'rich-response', 'tool-use'
	],
	category: 'guide',
	icon: '機',
	load: () => import('./index.svelte'),
	inline: { capable: false },
	variants: [],
	snippets: [],
	docs: guideContent
}

export default meta
