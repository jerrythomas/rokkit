/**
 * The three Ask Rokkit engines as a single descriptor — one source for the
 * picker cards, route validation, and route↔engine mapping. Model defaults
 * come from llm.svelte.ts; the actual inference lives there and in router.ts.
 */
import { DEFAULT_OPENROUTER_MODEL, DEFAULT_WEBLLM_MODEL } from './llm.svelte'

export type ChatMode = 'simulated' | 'openrouter' | 'webllm'
export const CHAT_MODES: ChatMode[] = ['simulated', 'openrouter', 'webllm']

export function isChatMode(x: unknown): x is ChatMode {
	return typeof x === 'string' && (CHAT_MODES as string[]).includes(x)
}

export interface ModeCard {
	mode: ChatMode
	label: string
	icon: string
	blurb: string
	capabilities: string
	examples: string[]
	needsModel: boolean
	defaultModel?: string
}

export const MODES: ModeCard[] = [
	{
		mode: 'simulated',
		label: 'Simulated',
		icon: 'i-mdi:script-text-outline',
		blurb: 'Instant canned demos — no AI, works offline.',
		capabilities: 'A fixed set of chart, table, form and list examples rendered from scripted data.',
		examples: [
			'Show me a bar chart of quarterly revenue',
			'Show me a sortable table of products',
			'Build a sign-up form'
		],
		needsModel: false
	},
	{
		mode: 'openrouter',
		label: 'OpenRouter',
		icon: 'i-mdi:cloud-outline',
		blurb: 'A hosted LLM builds live components from any prompt.',
		capabilities: 'Any prompt → live charts / tables / forms / lists. Needs network; the API key stays server-side. Pick a free model.',
		examples: [
			'Generate a Q3 sales scenario and chart it',
			'Make a table of the top 5 EVs by range'
		],
		needsModel: true,
		defaultModel: DEFAULT_OPENROUTER_MODEL
	},
	{
		mode: 'webllm',
		label: 'Web LLM',
		icon: 'i-mdi:laptop',
		blurb: 'A model runs in your browser — fully private.',
		capabilities: 'Same generation as OpenRouter, but the model runs locally via WebGPU. One-time ~0.7–2 GB download, then offline.',
		examples: [
			'Invent a startup’s monthly burn and plot it',
			'Build a newsletter signup form'
		],
		needsModel: true,
		defaultModel: DEFAULT_WEBLLM_MODEL
	}
]

export function cardFor(mode: ChatMode): ModeCard {
	return MODES.find((c) => c.mode === mode)!
}
