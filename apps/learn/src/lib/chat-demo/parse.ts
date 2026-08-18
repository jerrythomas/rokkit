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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCompletion(result: any): Block[] {
	const choice = result?.choices?.[0]
	const message = choice?.message
	if (!message) return [{ kind: 'prose', text: '(empty response)' }]

	const content = String(message.content ?? '').trim()

	// 1. OpenAI-style tool_calls (web-llm + paid OpenRouter routes).
	// Convert each tool call into a markdown fence the renderer's plugin
	// system understands. The naming convention: tool `mount_bar_chart`
	// → fence language `plot`, `mount_table` → `table`, etc.
	const toolCalls = (message.tool_calls ?? []) as Array<{
		function?: { name?: string; arguments?: string }
	}>
	if (toolCalls.length > 0) {
		const blocks: Block[] = []
		if (content) blocks.push({ kind: 'prose', text: content })
		const out: string[] = []
		for (const call of toolCalls) {
			const name = call.function?.name
			if (!name) continue
			const lang = toolNameToFence(name)
			if (!lang) continue
			out.push(`\n\`\`\`${lang}\n${call.function?.arguments ?? '{}'}\n\`\`\`\n`)
		}
		if (out.length > 0) blocks.push({ kind: 'markdown', markdown: out.join('') })
		return blocks
	}

	// 2. Markdown body (preferred — the system prompt asks for it). Pass
	// through verbatim; MarkdownRenderer + the plugin set turn ```plot,
	// ```table, ```form, ```list, ```stepper fences into live components.
	if (content) return splitSuggestions(content)
	return [{ kind: 'prose', text: '(empty response)' }]
}

/**
 * Pull any ```suggestions``` fences out of a markdown body into their own
 * SuggestionsBlock(s) so BlockList renders them as clickable chips at the
 * end of the turn (matching the scripted-router shape). MarkdownRenderer
 * has no plugin for "suggestions", so leaving them inline would render as
 * raw code blocks.
 */
const SUGGESTIONS_FENCE = /```suggestions\s*\n([\s\S]*?)```/gi
export function splitSuggestions(rawContent: string): Block[] {
	const content = wrapBareJSON(rawContent)
	const suggestions: Block[] = []
	const remaining = content.replace(SUGGESTIONS_FENCE, (_, body) => {
		try {
			const parsed = JSON.parse(String(body).trim())
			const items: unknown[] = Array.isArray(parsed?.items) ? parsed.items : []
			const safeItems = items
				.filter((i: unknown): i is { label: string; query: string } =>
					typeof i === 'object' && i !== null
					&& typeof (i as { label?: unknown }).label === 'string'
					&& typeof (i as { query?: unknown }).query === 'string'
				)
				.slice(0, 6)
			if (safeItems.length > 0) {
				suggestions.push({
					kind: 'suggestions',
					intro: typeof parsed?.intro === 'string' ? parsed.intro : undefined,
					items: safeItems.map((i) => ({ label: i.label, query: i.query }))
				})
			}
		} catch {
			// Malformed JSON — drop silently rather than show a code block.
		}
		return ''
	})
	const trimmed = remaining.trim()
	const blocks: Block[] = []
	if (trimmed) blocks.push({ kind: 'markdown', markdown: trimmed })
	blocks.push(...suggestions)
	if (blocks.length === 0) blocks.push({ kind: 'prose', text: '(empty response)' })
	return blocks
}
