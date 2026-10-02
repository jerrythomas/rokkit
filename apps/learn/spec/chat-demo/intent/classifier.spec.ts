/* The LLM as a classifier. The prompt is built from the catalogue — a search shortlist of
 * demos, the screen demo's variants and prop schema — and asks for one JSON Interpretation.
 * Whatever comes back is parsed field by field; the client validates it like any other
 * reading. The same prompt serves OpenRouter (built on the server) and WebLLM (in the browser).
 */
import { describe, it, expect } from 'vitest'
import { classifierMessages, parseClassification } from '../../../src/lib/chat-demo/intent/classifier'
import { validate } from '../../../src/lib/chat-demo/intent/validate'
import { act } from '../../../src/lib/chat-demo/intent/act'
import type { DemoBlock } from '../../../src/lib/chat-demo/types'

describe('classifierMessages', () => {
	const [system, user] = classifierMessages({
		message: 'make it vertical',
		screen: { demo: 'tabs', props: {} },
		recent: ['show me tabs'],
		shortlist: ['tabs', 'tree']
	})

	it('asks for one JSON object in the Interpretation shape', () => {
		expect(system.role).toBe('system')
		expect(system.content).toMatch(/"intent"/)
		expect(system.content).toMatch(/show.*modify.*reshape.*explain.*clarify/s)
	})

	it('lists the shortlisted demos, and the screen demo’s variants and props', () => {
		expect(system.content).toMatch(/tree/)
		expect(system.content).toMatch(/orientation: horizontal \| vertical/)
		expect(system.content).toMatch(/with-icons/)
	})

	it('gives the model the message, the screen and what was said before', () => {
		expect(user.role).toBe('user')
		expect(user.content).toMatch(/make it vertical/)
		expect(user.content).toMatch(/show me tabs/)
		expect(user.content).toMatch(/tabs/)
	})

	it('stays small enough for a free model', () => {
		expect(system.content.length + user.content.length).toBeLessThan(6000)
	})
})

describe('parseClassification', () => {
	it('reads a JSON reply, keeping only the known fields', () => {
		const text = '{"intent":"modify","demo":"tabs","props":{"orientation":"vertical"},"confidence":0.8,"script":"alert(1)"}'
		expect(parseClassification(text)).toEqual({ intent: 'modify', demo: 'tabs', props: { orientation: 'vertical' }, confidence: 0.8 })
	})

	it('finds the object inside prose or a fence', () => {
		expect(parseClassification('Sure!\n```json\n{"intent":"show","demo":"tree"}\n```')).toMatchObject({ intent: 'show', demo: 'tree' })
	})

	it('defaults and clamps the confidence', () => {
		expect(parseClassification('{"intent":"show","demo":"tree"}')?.confidence).toBe(0.7)
		expect(parseClassification('{"intent":"show","demo":"tree","confidence":7}')?.confidence).toBe(1)
	})

	it('is null for a reply with no readable intent', () => {
		expect(parseClassification('I think you want a tree.')).toBeNull()
		expect(parseClassification('{"intent":"launch","demo":"tree"}')).toBeNull()
	})
})

describe('a show that carries generated data', () => {
	const sales = [
		{ quarter: 'Q1', sales: 120 },
		{ quarter: 'Q2', sales: 150 },
		{ quarter: 'Q3', sales: 170 }
	]

	it('charts the data, inferring its axes', () => {
		const reading = validate({ intent: 'show', demo: 'chart', data: sales, confidence: 0.9 }, null)
		const chart = act(reading, null).find((b): b is DemoBlock => b.kind === 'demo')
		expect(chart).toMatchObject({ demo: 'chart', props: { x: 'quarter', y: 'sales' }, data: sales })
	})

	it('drops data a show cannot use: oversized, nested, or for a demo without data', () => {
		const big = Array.from({ length: 201 }, (_, i) => ({ i }))
		expect(validate({ intent: 'show', demo: 'chart', data: big, confidence: 1 }, null).data).toBeUndefined()
		expect(validate({ intent: 'show', demo: 'table', data: [{ a: { deep: 1 } }], confidence: 1 }, null).data).toBeUndefined()
		expect(validate({ intent: 'show', demo: 'tabs', data: sales, confidence: 1 }, null).data).toBeUndefined()
	})
})
