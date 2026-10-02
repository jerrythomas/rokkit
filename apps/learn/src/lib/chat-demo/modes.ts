/**
 * The Ask Rokkit engines as a single descriptor — one source for the picker
 * cards, route validation, and route↔engine mapping. Model defaults come from
 * llm.svelte.ts; interpretation lives in intent/ (local and System One) and
 * llm.svelte.ts (the LLM modes).
 */
import { DEFAULT_OPENROUTER_MODEL, DEFAULT_WEBLLM_MODEL } from './llm.svelte'

export type ChatMode = 'simulated' | 'systemone' | 'openrouter' | 'webllm'
export const CHAT_MODES: ChatMode[] = ['simulated', 'systemone', 'openrouter', 'webllm']

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
	/** A server backend the mode needs; its card shows only when the server reports it. */
	needsBackend?: 'systemone'
}

export const MODES: ModeCard[] = [
	{
		mode: 'simulated',
		label: 'Simulated',
		icon: 'i-mdi:script-text-outline',
		blurb: 'Instant and offline — follows up on whatever is on screen.',
		capabilities: 'Shows any demo in the catalogue, then changes it, re-charts its data or explains it from the docs as you follow up. No AI, works offline.',
		examples: [
			'Show me a bar chart of quarterly revenue',
			'Show me a sortable table of products',
			'Build a sign-up form'
		],
		needsModel: false
	},
	{
		mode: 'systemone',
		label: 'System One',
		icon: 'i-mdi:brain',
		blurb: 'A local classifier reads the follow-ups Simulated would ask back about.',
		capabilities:
			'Everything Simulated does, plus vague wording — “bigger rows”, “smaller” — read by a System One model on a local Ollama. Shown when the server has OLLAMA_URL.',
		examples: ['Show me a sortable table', 'Something with nested folders'],
		needsModel: false,
		needsBackend: 'systemone'
	},
	{
		mode: 'openrouter',
		label: 'OpenRouter',
		icon: 'i-mdi:cloud-outline',
		blurb: 'A free hosted model reads your request — and can make up data to show.',
		capabilities: 'A free model reads what you ask and picks the demo, its settings, or invented data to chart — then follow up as in Simulated. Needs network; the key stays server-side.',
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
		capabilities: 'Reads your request like OpenRouter, but the model runs in your browser via WebGPU. One-time ~0.7–2 GB download, then offline.',
		examples: [
			'Invent a startup’s monthly burn and plot it',
			'Build a newsletter signup form'
		],
		needsModel: true,
		defaultModel: DEFAULT_WEBLLM_MODEL
	}
]

/** The server backends `GET /api/chat/interpret` reports. */
export type Backends = { systemone: boolean }

/** The cards to offer: a mode that needs a backend only when the server has it. */
export function visibleModes(backends: Backends): ModeCard[] {
	return MODES.filter((m) => !m.needsBackend || backends[m.needsBackend])
}

export function cardFor(mode: ChatMode): ModeCard {
	return MODES.find((c) => c.mode === mode)!
}
