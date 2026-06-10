import MiniSearch from 'minisearch'

import gettingStartedContent from './getting-started/content.md?raw'
import dataBindingContent from './data-binding/content.md?raw'
import composabilityContent from './composability/content.md?raw'
import themingContent from './theming/content.md?raw'
import accessibilityContent from './accessibility/content.md?raw'
import formsContent from './forms/content.md?raw'
import chartsContent from './charts/content.md?raw'
import aiChatbotsContent from './ai-chatbots/content.md?raw'
import utilitiesContent from './utilities/content.md?raw'
import toolkitContent from './toolkit/content.md?raw'
import toolchainContent from './toolchain/content.md?raw'
import commandsContent from './commands/content.md?raw'
import skinsContent from './skins/content.md?raw'

export type GuideCategory = 'basics' | 'data' | 'design' | 'workflows' | 'advanced'

export interface Guide {
	slug: string
	title: string
	description: string
	category: GuideCategory
	content: string
}

// Hand-ordered — this order drives the TOC, index page, and category groupings.
export const guides: Guide[] = [
	{
		slug: 'getting-started',
		title: 'Getting Started',
		description: 'Install Rokkit, render your first component, understand the data-first model.',
		category: 'basics',
		content: gettingStartedContent
	},
	{
		slug: 'data-binding',
		title: 'Data Binding',
		description: 'Field mapping, bindable values, and the standard onchange / onselect events.',
		category: 'data',
		content: dataBindingContent
	},
	{
		slug: 'composability',
		title: 'Composability',
		description: 'Customise any component with snippets and proxy items — no forks, no overrides.',
		category: 'design',
		content: composabilityContent
	},
	{
		slug: 'theming',
		title: 'Theming & Design',
		description: 'Themes, layouts, design tokens, and how to build a brand-aware skin.',
		category: 'design',
		content: themingContent
	},
	{
		slug: 'skins',
		title: 'Skins',
		description: 'Named palette skins — define, switch at runtime, and apply dynamically with skinnable.',
		category: 'design',
		content: skinsContent
	},
	{
		slug: 'accessibility',
		title: 'Accessibility & i18n',
		description: 'Keyboard navigation, ARIA, focus management, and localisation.',
		category: 'design',
		content: accessibilityContent
	},
	{
		slug: 'forms',
		title: 'Forms',
		description: 'FormRenderer, FormBuilder, lookups, validation, and dynamic schemas.',
		category: 'workflows',
		content: formsContent
	},
	{
		slug: 'charts',
		title: 'Charts',
		description: 'Chart shapes, axes, data binding, and embedding charts in markdown.',
		category: 'workflows',
		content: chartsContent
	},
	{
		slug: 'ai-chatbots',
		title: 'AI Chatbots & Blocks',
		description: 'Building chat interfaces with the Blocks plugin and rich response composition.',
		category: 'workflows',
		content: aiChatbotsContent
	},
	{
		slug: 'utilities',
		title: 'Utilities',
		description: 'Small helpers, hooks, and supporting pieces that round out the toolkit.',
		category: 'advanced',
		content: utilitiesContent
	},
	{
		slug: 'toolkit',
		title: 'Toolkit',
		description: 'Controllers, actions, and the navigator pattern that powers keyboard nav.',
		category: 'advanced',
		content: toolkitContent
	},
	{
		slug: 'toolchain',
		title: 'Toolchain',
		description: 'Build, lint, test setup — the developer-side conventions Rokkit assumes.',
		category: 'advanced',
		content: toolchainContent
	},
	{
		slug: 'commands',
		title: 'Commands & Shortcuts',
		description: 'Register commands, bind keyboard shortcuts, and wire the CommandPalette.',
		category: 'advanced',
		content: commandsContent
	}
]

export function findGuide(slug: string): Guide | undefined {
	return guides.find((g) => g.slug === slug)
}

const index = new MiniSearch<Guide>({
	fields: ['title', 'description', 'content'],
	storeFields: ['slug', 'title', 'description', 'category'],
	idField: 'slug',
	searchOptions: { boost: { title: 3, description: 2 }, fuzzy: 0.2, prefix: true }
})
index.addAll(guides)

export interface SearchResult {
	slug: string
	title: string
	description: string
	category: GuideCategory
	score: number
}

export function searchGuides(query: string): SearchResult[] {
	const q = query.trim()
	if (!q) return []
	return index.search(q).map((r) => ({
		slug: r.id as string,
		title: r.title as string,
		description: r.description as string,
		category: r.category as GuideCategory,
		score: r.score
	}))
}

export function guidesByCategory(): Record<GuideCategory, Guide[]> {
	const out: Record<GuideCategory, Guide[]> = {
		basics: [],
		data: [],
		design: [],
		workflows: [],
		advanced: []
	}
	for (const g of guides) out[g.category].push(g)
	return out
}
