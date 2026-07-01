import { describe, it, expect, beforeEach } from 'vitest'
import {
	conversations,
	startNew,
	clearAll,
	getCurrentId,
	summarizeTitle,
	bucketByRecency
} from '../../src/lib/koan/conversations.svelte'

describe('conversations — startNew dedup', () => {
	beforeEach(() => {
		clearAll()
	})

	it('app surface: same title upserts (one row, refreshed, moved to top, current)', () => {
		const first = startNew('app', 'Tabs')
		const created = conversations[0].updatedAt
		startNew('app', 'Table')
		const again = startNew('app', 'Tabs')

		const tabsRows = conversations.filter((c) => c.surface === 'app' && c.title === 'Tabs')
		expect(tabsRows.length).toBe(1)
		expect(again).toBe(first)
		expect(conversations[0].id).toBe(first)
		expect(conversations[0].turns.length).toBe(1)
		expect(getCurrentId()).toBe(first)
		expect(Date.parse(conversations[0].updatedAt)).toBeGreaterThanOrEqual(Date.parse(created))
	})

	it('app surface: different titles create separate rows', () => {
		startNew('app', 'Tabs')
		startNew('app', 'Table')
		expect(conversations.filter((c) => c.surface === 'app').length).toBe(2)
	})

	it('chat surface: same title always appends (no dedup)', () => {
		startNew('chat', 'Build a chart')
		startNew('chat', 'Build a chart')
		expect(conversations.filter((c) => c.surface === 'chat').length).toBe(2)
	})

	it('does not dedup across surfaces with the same title', () => {
		startNew('app', 'Chart')
		startNew('chat', 'Chart')
		expect(conversations.length).toBe(2)
	})
})

describe('summarizeTitle', () => {
	it('strips leading filler + article and caps length', () => {
		expect(summarizeTitle('show me a bar chart of quarterly revenue')).toBe('Bar chart of quarterly revenue')
		expect(summarizeTitle('Can you build me a sign-up form')).toBe('Sign-up form')
		expect(summarizeTitle('generate a Q3 sales scenario and chart it')).toBe('Q3 sales scenario and chart it')
	})
	it('collapses whitespace and capitalizes', () => {
		expect(summarizeTitle('  line   chart  ')).toBe('Line chart')
	})
	it('falls back for empty/filler-only input', () => {
		expect(summarizeTitle('   ')).toBe('New chat')
	})
})

describe('chat conversations — mode tag + rail filter', () => {
	beforeEach(() => clearAll())
	it('startNew records mode + summary title for chat surface', () => {
		startNew('chat', 'show me a bar chart', 'openrouter')
		expect(conversations[0].mode).toBe('openrouter')
		expect(conversations[0].title).toBe('Bar chart')
	})
	it('bucketByRecency filters chat by mode', () => {
		startNew('chat', 'a', 'simulated')
		startNew('chat', 'b', 'openrouter')
		const sim = bucketByRecency('chat', 'simulated')
		const all = [...sim.today, ...sim.yesterday, ...sim.earlier]
		expect(all.every((c) => c.mode === 'simulated')).toBe(true)
		expect(all.length).toBe(1)
	})
	it('app conversations are unaffected by the mode filter', () => {
		startNew('app', 'Tabs')
		expect(conversations[0].mode).toBeUndefined()
	})
})
