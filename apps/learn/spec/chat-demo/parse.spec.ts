import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
	buildSystemPrompt,
	parseCompletion,
	inferFenceLanguage,
	wrapBareJSON,
	findBalancedBraceEnd,
	splitSuggestions,
	toolNameToFence
} from '../../src/lib/chat-demo/parse'
import { routeViaLLM, setEngine, llm, resetWebLLMEngine } from '../../src/lib/chat-demo/llm.svelte'

function okResponse(body: unknown) {
	return { ok: true, json: async () => body } as unknown as Response
}

function errorResponse(status: number, body: string) {
	return {
		ok: false,
		status,
		text: async () => body
	} as unknown as Response
}

describe('toolNameToFence', () => {
	it('maps the five mount tools to fence languages', () => {
		expect(toolNameToFence('mount_bar_chart')).toBe('plot')
		expect(toolNameToFence('mount_table')).toBe('table')
		expect(toolNameToFence('mount_form')).toBe('form')
		expect(toolNameToFence('mount_list')).toBe('list')
		expect(toolNameToFence('mount_stepper')).toBe('stepper')
	})
	it('returns null for unknown tool names', () => {
		expect(toolNameToFence('mount_whatever')).toBeNull()
		expect(toolNameToFence('')).toBeNull()
		expect(toolNameToFence(undefined as unknown as string)).toBeNull()
	})
})

describe('inferFenceLanguage', () => {
	it('maps schema to form', () => {
		expect(inferFenceLanguage({ schema: { type: 'object' }, data: {} })).toBe('form')
	})
	it('maps columns+rows to table', () => {
		expect(inferFenceLanguage({ columns: ['a'], rows: [] })).toBe('table')
	})
	it('maps steps to stepper', () => {
		expect(inferFenceLanguage({ steps: [{ text: 'x' }] })).toBe('stepper')
	})
	it('maps items whose first element has a query to suggestions', () => {
		expect(
			inferFenceLanguage({ items: [{ label: 'Go', query: 'show me' }] })
		).toBe('suggestions')
	})
	it('maps plain items to list', () => {
		expect(inferFenceLanguage({ items: [{ label: 'A' }] })).toBe('list')
		expect(inferFenceLanguage({ items: ['a', 'b'] })).toBe('list')
	})
	it('maps geoms+data to plot', () => {
		expect(inferFenceLanguage({ data: [], geoms: [{ type: 'bar' }] })).toBe('plot')
	})
	it('maps data with x or y to plot', () => {
		expect(inferFenceLanguage({ data: [], x: 'q' })).toBe('plot')
		expect(inferFenceLanguage({ data: [], y: 'v' })).toBe('plot')
	})
	it('returns null for non-objects, arrays, and unknown shapes', () => {
		expect(inferFenceLanguage(null)).toBeNull()
		expect(inferFenceLanguage('plot')).toBeNull()
		expect(inferFenceLanguage(42)).toBeNull()
		expect(inferFenceLanguage([{ data: [] }])).toBeNull()
		expect(inferFenceLanguage({ arbitrary: true })).toBeNull()
	})
	it('suggestions wins over list for chip-like items', () => {
		expect(inferFenceLanguage({ items: [{ label: 'a', query: 'q' }], x: 'q' })).toBe('suggestions')
	})
})

describe('findBalancedBraceEnd', () => {
	it('returns the matching close for a flat object', () => {
		expect(findBalancedBraceEnd('{ "a": 1 }', 0)).toBe(9)
	})
	it('handles nested braces', () => {
		expect(findBalancedBraceEnd('{ "a": { "b": [1, 2] } }', 0)).toBe(23)
	})
	it('skips braces inside string literals', () => {
		const s = '{ "a": "{not closing}" }'
		expect(s[findBalancedBraceEnd(s, 0)]).toBe('}')
	})
	it('respects escaped quotes inside strings', () => {
		const s = '{ "a": "say \\"hi\\" {x}" }'
		expect(s[findBalancedBraceEnd(s, 0)]).toBe('}')
	})
	it('returns -1 when braces are unbalanced', () => {
		expect(findBalancedBraceEnd('{ "a": 1', 0)).toBe(-1)
		expect(findBalancedBraceEnd('{ "a": "}" ', 0)).toBe(-1)
	})
})

describe('wrapBareJSON', () => {
	it('wraps a bare plot blob in a plot fence', () => {
		const src = 'Here it is {"data":[{"q":"Q1","v":1}],"x":"q","y":"v","geoms":[{"type":"bar"}]}'
		expect(wrapBareJSON(src)).toBe(
			'Here it is ```plot\n{"data":[{"q":"Q1","v":1}],"x":"q","y":"v","geoms":[{"type":"bar"}]}\n```'
		)
	})
	it('leaves existing fences untouched and does not re-wrap inside them', () => {
		const src = '```plot\n{"data":[],"geoms":[{"type":"bar"}]}\n```'
		expect(wrapBareJSON(src)).toBe(src)
	})
	it('leaves unknown-shaped JSON blobs alone', () => {
		const src = 'raw {"hello":"world"} end'
		expect(wrapBareJSON(src)).toBe(src)
	})
	it('leaves malformed JSON blobs alone', () => {
		const src = 'broken { not json'
		expect(wrapBareJSON(src)).toBe(src)
	})
	it('wraps multiple bare blobs', () => {
		const src = '{"steps":[{"text":"a"}]} and {"columns":["a"],"rows":[]}'
		expect(wrapBareJSON(src)).toBe(
			'```stepper\n{"steps":[{"text":"a"}]}\n``` and ```table\n{"columns":["a"],"rows":[]}\n```'
		)
	})
	it('copies an unterminated fence to the end', () => {
		const src = 'start ```plot\n{"data":[]'
		expect(wrapBareJSON(src)).toBe(src)
	})
})

describe('splitSuggestions', () => {
	it('splits a markdown body with a suggestions fence into two blocks', () => {
		const src =
			'Here is the chart.\n\n```suggestions\n{"intro":"Try","items":[{"label":"Group","query":"group it"}]}\n```'
		const blocks = splitSuggestions(src)
		expect(blocks[0]).toEqual({ kind: 'markdown', markdown: 'Here is the chart.' })
		expect(blocks[1]).toEqual({
			kind: 'suggestions',
			intro: 'Try',
			items: [{ label: 'Group', query: 'group it' }]
		})
	})
	it('drops malformed suggestion items and caps at six', () => {
		const items = Array.from({ length: 9 }, (_, i) => ({ label: `L${i}`, query: `q${i}` }))
		items.push({ bad: true })
		const src = `\`\`\`suggestions\n${JSON.stringify({ intro: 'Try', items })}\n\`\`\``
		const blocks = splitSuggestions(src)
		expect(blocks).toHaveLength(1)
		expect(blocks[0].kind).toBe('suggestions')
		if (blocks[0].kind === 'suggestions') {
			expect(blocks[0].items).toHaveLength(6)
			expect(blocks[0].items[0]).toEqual({ label: 'L0', query: 'q0' })
		}
	})
	it('drops malformed suggestions JSON silently', () => {
		const src = '```suggestions\n{ nope\n```'
		const blocks = splitSuggestions(src)
		expect(blocks).toEqual([{ kind: 'prose', text: '(empty response)' }])
	})
	it('returns an empty prose block when nothing remains', () => {
		const blocks = splitSuggestions('```suggestions\n{"items":[{"label":"a","query":"q"}]}\n```')
		expect(blocks).toEqual([
			{ kind: 'suggestions', intro: undefined, items: [{ label: 'a', query: 'q' }] }
		])
	})
	it('extracts multiple suggestions fences', () => {
		const src =
			'a\n\n```suggestions\n{"items":[{"label":"A","query":"a"}]}\n```\n\nb\n\n```suggestions\n{"items":[{"label":"B","query":"b"}]}\n```'
		const blocks = splitSuggestions(src)
		expect(blocks[0]).toEqual({ kind: 'markdown', markdown: 'a\n\n\n\nb' })
		expect(blocks).toHaveLength(3)
	})
})

describe('parseCompletion', () => {
	it('returns empty prose for a missing message', () => {
		expect(parseCompletion({ choices: [] })).toEqual([{ kind: 'prose', text: '(empty response)' }])
		expect(parseCompletion({})).toEqual([{ kind: 'prose', text: '(empty response)' }])
	})
	it('returns empty prose for empty content', () => {
		expect(parseCompletion({ choices: [{ message: { content: '  ' } }] })).toEqual([
			{ kind: 'prose', text: '(empty response)' }
		])
	})
	it('passes markdown content through splitSuggestions', () => {
		const blocks = parseCompletion({
			choices: [{ message: { content: 'Hello ```plot\n{"data":[]}\n```' } }]
		})
		expect(blocks[0]).toEqual({ kind: 'markdown', markdown: 'Hello ```plot\n{"data":[]}\n```' })
	})
	it('converts tool calls into markdown fences with optional prose first', () => {
		const blocks = parseCompletion({
			choices: [
				{
					message: {
						content: 'Making a chart',
						tool_calls: [
							{
								function: { name: 'mount_bar_chart', arguments: '{"data":[]}' }
							},
							{
								function: { name: 'mount_unknown', arguments: '{}' }
							},
							{
								function: { arguments: '{}' }
							}
						]
					}
				}
			]
		})
		expect(blocks).toEqual([
			{ kind: 'prose', text: 'Making a chart' },
			{ kind: 'markdown', markdown: '\n```plot\n{"data":[]}\n```\n' }
		])
	})
	it('emits only the prose block when tool calls map to nothing', () => {
		const blocks = parseCompletion({
			choices: [{ message: { content: 'hi', tool_calls: [{ function: { name: 'x' } }] } }]
		})
		expect(blocks).toEqual([{ kind: 'prose', text: 'hi' }])
	})
})

describe('buildSystemPrompt', () => {
	it('produces a multi-section prompt containing the key rules', () => {
		const prompt = buildSystemPrompt()
		expect(prompt).toContain('# HARD OUTPUT RULES')
		expect(prompt).toContain('# SAFETY (NON-NEGOTIABLE)')
		expect(prompt).toContain('# SCOPE (STRICT)')
		expect(prompt).toContain('<examples>')
		expect(prompt).toContain('```suggestions')
		expect(prompt).toContain('<decline_template>')
	})
})

describe('routeViaLLM', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn())
		setEngine('openrouter')
		llm.enabled = true
		llm.provider = 'openrouter'
	})
	afterEach(() => {
		vi.unstubAllGlobals()
		resetWebLLMEngine()
	})

	it('routes a successful OpenRouter completion through parseCompletion', async () => {
		vi.mocked(fetch).mockResolvedValue(
			okResponse({
				choices: [{ message: { content: 'Hello ```plot\n{"data":[]}\n```' } }]
			})
		)
		const blocks = await routeViaLLM('hello')
		expect(fetch).toHaveBeenCalledWith('/api/llm/openrouter', expect.objectContaining({ method: 'POST' }))
		expect(blocks[0]).toEqual({ kind: 'markdown', markdown: 'Hello ```plot\n{"data":[]}\n```' })
	})

	it('maps 429 to the rate-limited block with switch suggestion', async () => {
		vi.mocked(fetch).mockResolvedValue(errorResponse(429, 'slow down'))
		const blocks = await routeViaLLM('retry me')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'Rate-limited by the free provider',
			message: 'slow down',
			hint: 'Try a different free model, retry in a moment, or switch to Web-LLM (one-time browser download).'
		})
		expect(blocks[1]).toEqual({
			kind: 'suggestions',
			intro: 'Or',
			items: [
				{
					label: 'Switch to Web-LLM (downloads ~2 GB)',
					query: '__switch_to_webllm',
					action: { kind: 'switch-provider', provider: 'webllm' }
				},
				{ label: 'Retry', query: 'retry me' }
			]
		})
	})

	it('maps 404 to the model-unavailable block naming the configured model', async () => {
		llm.openRouterModel = 'meta-llama/llama-3.3-70b-instruct:free'
		vi.mocked(fetch).mockResolvedValue(errorResponse(404, 'nope'))
		const blocks = await routeViaLLM('q')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'Model unavailable (meta-llama/llama-3.3-70b-instruct:free)',
			hint: 'Pick another model from the dropdown — the free model list rotates.'
		})
	})

	it('maps an AbortError to the 408 timeout block', async () => {
		const abort = new DOMException('The operation was aborted', 'AbortError')
		vi.mocked(fetch).mockRejectedValue(abort)
		const blocks = await routeViaLLM('q')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'OpenRouter timed out',
			message: 'timed out after 90s — the free-tier provider didn\'t respond in time',
			hint: 'Free-tier latency varies. Retry, pick a smaller/faster model, or switch to Web-LLM.'
		})
	})

	it('maps 503 to the unreachable block', async () => {
		vi.mocked(fetch).mockResolvedValue(errorResponse(503, 'unavailable'))
		const blocks = await routeViaLLM('q')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'OpenRouter unreachable',
			hint: 'Switch to Web-LLM if this keeps failing, or retry.'
		})
	})

	it('maps an unknown status to a generic OpenRouter block', async () => {
		vi.mocked(fetch).mockResolvedValue(errorResponse(500, 'boom'))
		const blocks = await routeViaLLM('q')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'OpenRouter 500',
			message: 'boom',
			hint: 'Switch to Web-LLM if this keeps failing, or retry.'
		})
	})

	it('truncates long details to 240 chars and keeps the full text in details', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('x'.repeat(300)))
		const blocks = await routeViaLLM('q')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'OpenRouter request failed',
			message: `${'x'.repeat(240)}…`,
			details: 'x'.repeat(300)
		})
	})

	it('maps a non-status error to a generic failure block', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('network down'))
		const blocks = await routeViaLLM('q')
		expect(blocks[0]).toMatchObject({
			kind: 'error',
			title: 'OpenRouter request failed',
			message: 'network down'
		})
	})

	it('routes webllm to the unavailable block when WebGPU is absent', async () => {
		setEngine('webllm')
		llm.provider = 'webllm'
		const blocks = await routeViaLLM('q')
		expect(blocks).toEqual([
			{
				kind: 'error',
				title: 'Web-LLM unavailable',
				message: 'WebGPU is not available in this browser.',
				hint: 'Switch back to OpenRouter, or check that this browser has WebGPU enabled.'
			}
		])
	})
})
