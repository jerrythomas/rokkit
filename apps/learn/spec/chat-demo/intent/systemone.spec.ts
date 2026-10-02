/* System One answers choice and yes/no questions about a state. The chat asks it, in one
 * request: what the user wants (intent), which demo (over a search shortlist), and — for the
 * demo on screen — what each prop should become. Questions are built from the catalogue and
 * the prop schema; answers map back to an Interpretation the client validates as usual.
 */
import { describe, it, expect } from 'vitest'
import { questionsFor, fromAnswers, shortlistFor, MAX_OPTIONS } from '../../../src/lib/chat-demo/intent/systemone'
import type { ScreenSummary } from '../../../src/lib/chat-demo/intent/systemone'

const tabs: ScreenSummary = { demo: 'tabs', props: { orientation: 'horizontal' } }
const choice = (choice: string, confidence = 0.9, probabilities: Record<string, number> = { [choice]: 0.9 }) => ({
	type: 'choice' as const,
	choice,
	confidence,
	probabilities
})

describe('shortlistFor', () => {
	it('keeps the search hits and the demo on screen, within the choice limit', () => {
		const list = shortlistFor('something with nested folders', tabs)
		expect(list).toContain('tree')
		expect(list).toContain('tabs')
		expect(list.length).toBeLessThanOrEqual(MAX_OPTIONS)
	})

	it('falls back to starting points when the search finds nothing', () => {
		expect(shortlistFor('hmm', null).length).toBeGreaterThan(1)
	})
})

describe('questionsFor', () => {
	it('asks only show / explain / clarify when nothing is on screen', () => {
		const q = questionsFor('show me a tree', null, ['tree', 'list'])
		expect(Object.keys(q.intent.criteria)).toEqual(['show', 'explain', 'clarify'])
	})

	it('asks for the demo over the shortlist, described from the catalogue', () => {
		const q = questionsFor('show me a tree', null, ['tree', 'list'])
		expect(Object.keys(q.demo.criteria)).toEqual(['tree', 'list'])
		expect(q.demo.criteria.tree).toMatch(/tree/i)
	})

	it('asks what each prop of the demo on screen should become, with "unchanged" as an answer', () => {
		const q = questionsFor('make it vertical', tabs, ['tabs'])
		expect(Object.keys(q.intent.criteria)).toEqual(['show', 'modify', 'reshape', 'explain', 'clarify'])
		expect(Object.keys(q['prop:orientation'].criteria)).toEqual(['unchanged', 'horizontal', 'vertical'])
		expect(q['prop:orientation'].instructions).toMatch(/^Does the message ask to change/)
	})

	it('asks for a variant of the demo on screen', () => {
		const q = questionsFor('with icons', tabs, ['tabs'])
		expect(Object.keys(q.variant.criteria)[0]).toBe('none')
		expect(Object.keys(q.variant.criteria)).toEqual(expect.arrayContaining(['vertical', 'with-icons']))
	})
})

describe('fromAnswers', () => {
	it('reads a show of the chosen demo, at the intent’s confidence', () => {
		const i = fromAnswers({ intent: choice('show', 0.8), demo: choice('tree') }, 'show me a tree', null)
		expect(i).toEqual({ intent: 'show', demo: 'tree', confidence: 0.8 })
	})

	it('reads a modify from the prop and variant answers that are not "unchanged"', () => {
		const i = fromAnswers(
			{ intent: choice('modify'), demo: choice('tabs'), 'prop:orientation': choice('vertical'), 'prop:align': choice('unchanged'), variant: choice('none') },
			'make it vertical',
			tabs
		)
		expect(i).toMatchObject({ intent: 'modify', demo: 'tabs', props: { orientation: 'vertical' } })
		expect(i.variant).toBeUndefined()
	})

	it('keeps only prop answers it is sure of that change something', () => {
		const sure = (c: string) => choice(c, 0.9, { [c]: 0.9 })
		const unsure = (c: string) => choice(c, 0.3, { [c]: 0.4 })
		const i = fromAnswers(
			{ intent: choice('modify'), demo: choice('tabs'), 'prop:orientation': sure('horizontal'), 'prop:align': sure('center'), 'prop:position': unsure('after') },
			'center the tabs',
			tabs
		)
		expect(i.props).toEqual({ align: 'center' })
	})

	it('keeps a variant only when it is sure of it', () => {
		const unsure = choice('deep', 0.3, { deep: 0.45, none: 0.4 })
		const i = fromAnswers({ intent: choice('modify'), demo: choice('tree'), variant: unsure, 'prop:size': choice('sm') }, 'smaller', { demo: 'tree', props: {} })
		expect(i.variant).toBeUndefined()
		expect(i.props).toEqual({ size: 'sm' })
	})

	it('reads booleans as on/off', () => {
		const i = fromAnswers({ intent: choice('modify'), demo: choice('table'), 'prop:striped': choice('on') }, 'stripes', { demo: 'table', props: {} })
		expect(i.props).toEqual({ striped: true })
	})

	it('reads a reshape’s view', () => {
		const i = fromAnswers({ intent: choice('reshape'), demo: choice('table'), view: choice('chart') }, 'as a chart', { demo: 'table', props: {} })
		expect(i).toMatchObject({ intent: 'reshape', view: 'chart' })
	})

	it('explains the demo the question is about, with the question as the topic', () => {
		const i = fromAnswers({ intent: choice('explain'), demo: choice('tree') }, 'how does the tree sort?', tabs)
		expect(i).toMatchObject({ intent: 'explain', demo: 'tree' })
		expect(i.topic).toMatch(/sort/)
	})

	it('offers the most likely demos when unsure', () => {
		const i = fromAnswers(
			{ intent: choice('clarify', 0.2), demo: choice('select', 0.3, { select: 0.5, 'multi-select': 0.4, toggle: 0.1 }) },
			'choose several',
			null
		)
		expect(i.intent).toBe('clarify')
		expect(i.options?.map((o) => o.demo)).toEqual(['select', 'multi-select', 'toggle'])
	})
})
