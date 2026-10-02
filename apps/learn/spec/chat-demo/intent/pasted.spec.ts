/* Pasted or uploaded data goes through the same engine as everything else: its shape is
 * inferred, and it becomes the screen — so "make it striped" or "as a chart" works on the
 * user's own data exactly as on a demo's sample.
 */
import { describe, it, expect } from 'vitest'
import { pastedBlocks } from '../../../src/lib/chat-demo/intent/pasted'
import type { Block, DemoBlock } from '../../../src/lib/chat-demo/types'

const demoOf = (blocks: Block[]) => blocks.find((b): b is DemoBlock => b.kind === 'demo')
const noteOf = (blocks: Block[]) => blocks.find((b) => b.kind === 'data-note')

describe('pastedBlocks', () => {
	it('puts a single record on screen as an editable form, with its schema inferred', () => {
		const blocks = pastedBlocks('json', { name: 'Ada', age: 36 })
		expect(demoOf(blocks)).toMatchObject({ demo: 'form', data: { name: 'Ada', age: 36 } })
		expect(demoOf(blocks)?.props.schema).toBeTruthy()
		expect(noteOf(blocks)).toMatchObject({ shape: 'record', source: 'json' })
	})

	it('charts a small categorical/numeric table', () => {
		const rows = [
			{ city: 'Oslo', temp: 4 },
			{ city: 'Rome', temp: 18 }
		]
		expect(demoOf(pastedBlocks('csv', rows))).toMatchObject({ demo: 'chart', props: { x: 'city', y: 'temp' }, data: rows })
	})

	it('tables rows too wide to chart', () => {
		const rows = [{ a: 'x', b: 1, c: 2, d: 3, e: 4 }]
		expect(demoOf(pastedBlocks('json', rows))).toMatchObject({ demo: 'table', data: rows })
	})

	it('lists primitives', () => {
		expect(demoOf(pastedBlocks('json', ['alpha', 'beta']))).toMatchObject({
			demo: 'list',
			data: [{ label: 'alpha' }, { label: 'beta' }]
		})
	})

	it('shows what it cannot place as JSON, with no screen', () => {
		const blocks = pastedBlocks('json', 42)
		expect(blocks.some((b) => b.kind === 'code')).toBe(true)
		expect(demoOf(blocks)).toBeUndefined()
	})

	it('leads with the user’s own words when they gave some', () => {
		const [lead] = pastedBlocks('json', { name: 'Ada' }, '  Show me Ada  ')
		expect(lead).toMatchObject({ kind: 'prose' })
		expect(lead.kind === 'prose' && lead.text).toMatch(/^For "Show me Ada"/)
	})
})
