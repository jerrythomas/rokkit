/**
 * Starter hints — categorized prompt chips shown on an empty conversation.
 *
 * Four types (chart / table / form / list) cover the demo's core surface.
 * `pickStarterHints()` returns exactly four hints (one per type) with the
 * specific prompt inside each type picked at random, so a returning user sees
 * a slightly different starting set every time without losing the sense that
 * these four categories are what the demo is for.
 *
 * Every prompt is written so it works across all three modes:
 *   - Simulated: matches the scripted router's keywords (bar/line/grouped
 *     bar, sortable table, sign-up form, grouped list, …).
 *   - OpenRouter / Web-LLM: the system prompt in llm.svelte.ts routes any of
 *     these into the matching fence type (```plot / ```table / ```form / ```list).
 */
export interface StarterHint {
	kind: 'chart' | 'table' | 'form' | 'list'
	label: string
	icon: string
	prompt: string
}

const HINTS_BY_KIND: Record<StarterHint['kind'], Omit<StarterHint, 'kind'>[]> = {
	chart: [
		{ label: 'Bar chart', icon: 'i-mdi:chart-bar', prompt: 'Show me a bar chart of quarterly revenue' },
		{ label: 'Grouped bar', icon: 'i-mdi:chart-bar', prompt: 'Show a grouped bar chart of revenue by product' },
		{ label: 'Stacked bar', icon: 'i-mdi:chart-bar-stacked', prompt: 'Show a stacked bar chart of revenue by product' },
		{ label: 'Line chart', icon: 'i-mdi:chart-line', prompt: 'Show monthly revenue as a line chart' }
	],
	table: [
		{ label: 'Sortable table', icon: 'i-mdi:table', prompt: 'Show me a sortable table of products' },
		{ label: 'Top-N table', icon: 'i-mdi:table', prompt: 'Show a table of the top 5 EVs by range' },
		{ label: 'Editable rows', icon: 'i-mdi:table-edit', prompt: 'Show an editable table of tasks' },
		{ label: 'Mixed cell types', icon: 'i-mdi:table-column', prompt: 'Show a table with text, number, date, and boolean columns' }
	],
	form: [
		{ label: 'Sign-up form', icon: 'i-mdi:form-select', prompt: 'Build a sign-up form' },
		{ label: 'Newsletter', icon: 'i-mdi:email-outline', prompt: 'Build a newsletter subscription form' },
		{ label: 'Support ticket', icon: 'i-mdi:ticket-outline', prompt: 'Build a support ticket form with priority and description' },
		{ label: 'Country → city', icon: 'i-mdi:earth', prompt: 'Build a form with cascading country and city dropdowns' }
	],
	list: [
		{ label: 'Grouped list', icon: 'i-mdi:format-list-bulleted', prompt: 'Show a grouped settings list' },
		{ label: 'Collapsible menu', icon: 'i-mdi:menu', prompt: 'Show a collapsible list of mail folders' },
		{ label: 'Nav with icons', icon: 'i-mdi:navigation-outline', prompt: 'Show a navigation list with icons' },
		{ label: 'Flat options', icon: 'i-mdi:list-status', prompt: 'Show a flat list of view options' }
	]
}

const KINDS: StarterHint['kind'][] = ['chart', 'table', 'form', 'list']

function pickOne<T>(pool: T[]): T {
	return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Returns exactly four hints — one per type — with the specific prompt inside
 * each type picked at random.
 */
export function pickStarterHints(): StarterHint[] {
	return KINDS.map((kind) => ({ kind, ...pickOne(HINTS_BY_KIND[kind]) }))
}
