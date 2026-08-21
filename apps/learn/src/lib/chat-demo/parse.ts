/**
 * Turn an OpenAI-compatible completion into the `Block[]` the chat UI renders.
 *
 * This is the block-pipeline façade: low-level fence/brace scanning lives in
 * `scan.ts`, and the system prompt + fence-language vocabulary live in
 * `prompt.ts`. Both are re-exported here so consumers import from a single
 * module. Pre-processes weak-model output (bare `{...}` blobs with no fence,
 * `suggestions` fences, tool calls) into markdown the renderer's plugin
 * system understands.
 */
import type { Block } from './types'
import { wrapBareJSON } from './scan'
import { toolNameToFence } from './prompt'

export { buildSystemPrompt, inferFenceLanguage, toolNameToFence } from './prompt'
export { findBalancedBraceEnd, wrapBareJSON } from './scan'

type ToolCall = { function?: { name?: string; arguments?: string } }

/** A fresh block list, so no caller can mutate a shared constant. */
const emptyResponse = (): Block[] => [{ kind: 'prose', text: '(empty response)' }]

/** The assistant message from a completion, or null when there isn't one. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messageOf = (result: any) => result?.choices?.[0]?.message ?? null

/**
 * Each recognised tool call as a markdown fence the renderer's plugin system
 * understands. The naming convention: tool `mount_bar_chart` → fence language
 * `plot`, `mount_table` → `table`. Unrecognised names are dropped.
 */
function toolCallFences(toolCalls: ToolCall[]): string[] {
	return toolCalls
		.map((call) => ({
			lang: toolNameToFence(call.function?.name ?? ''),
			args: call.function?.arguments ?? '{}'
		}))
		.filter((f) => f.lang)
		.map((f) => `\n\`\`\`${f.lang}\n${f.args}\n\`\`\`\n`)
}

/** Prose (if any) followed by one markdown block holding every tool fence. */
function blocksFromToolCalls(content: string, toolCalls: ToolCall[]): Block[] {
	const blocks: Block[] = []
	if (content) blocks.push({ kind: 'prose', text: content })
	const fences = toolCallFences(toolCalls)
	if (fences.length > 0) blocks.push({ kind: 'markdown', markdown: fences.join('') })
	return blocks
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCompletion(result: any): Block[] {
	const message = messageOf(result)
	if (!message) return emptyResponse()

	const content = String(message.content ?? '').trim()

	// 1. OpenAI-style tool_calls (web-llm + paid OpenRouter routes).
	const toolCalls = (message.tool_calls ?? []) as ToolCall[]
	if (toolCalls.length > 0) return blocksFromToolCalls(content, toolCalls)

	// 2. Markdown body (preferred — the system prompt asks for it). Passed
	// through verbatim; MarkdownRenderer + the plugin set turn ```plot,
	// ```table, ```form, ```list, ```stepper fences into live components.
	return content ? splitSuggestions(content) : emptyResponse()
}

/**
 * Pull any ```suggestions``` fences out of a markdown body into their own
 * SuggestionsBlock(s) so BlockList renders them as clickable chips at the
 * end of the turn (matching the scripted-router shape). MarkdownRenderer
 * has no plugin for "suggestions", so leaving them inline would render as
 * raw code blocks.
 */
const SUGGESTIONS_FENCE = /```suggestions\s*\n([\s\S]*?)```/gi
/** A model-supplied suggestion is only usable with both a label and a query. */
const isSuggestion = (i: unknown): i is { label: string; query: string } =>
	typeof i === 'object' &&
	i !== null &&
	typeof (i as { label?: unknown }).label === 'string' &&
	typeof (i as { query?: unknown }).query === 'string'

/** One fence body → a suggestions block, or null when malformed or empty. */
function parseSuggestionsFence(body: unknown): Block | null {
	try {
		const parsed = JSON.parse(String(body).trim())
		const items: unknown[] = Array.isArray(parsed?.items) ? parsed.items : []
		const safeItems = items.filter(isSuggestion).slice(0, 6)
		if (safeItems.length === 0) return null
		return {
			kind: 'suggestions',
			intro: typeof parsed?.intro === 'string' ? parsed.intro : undefined,
			items: safeItems.map((i) => ({ label: i.label, query: i.query }))
		}
	} catch {
		// Malformed JSON — drop silently rather than show a code block.
		return null
	}
}

export function splitSuggestions(rawContent: string): Block[] {
	const suggestions: Block[] = []
	const remaining = wrapBareJSON(rawContent).replace(SUGGESTIONS_FENCE, (_, body) => {
		const block = parseSuggestionsFence(body)
		if (block) suggestions.push(block)
		return ''
	})
	const trimmed = remaining.trim()
	const blocks: Block[] = []
	if (trimmed) blocks.push({ kind: 'markdown', markdown: trimmed })
	blocks.push(...suggestions)
	return blocks.length > 0 ? blocks : emptyResponse()
}
