import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ListBindingTest from './ListBindingTest.svelte'
import TreeBindingTest from './TreeBindingTest.svelte'
import List from '../src/components/List.svelte'

/**
 * List and Tree declare `value = $bindable()` and document it as bindable, but
 * used to never write it — only Select did. These cover the write-back now that
 * they do, and the race surface it opens: `value` is an input (it decides
 * `data-active` and which group is expanded) AND an output.
 */

const flat = [
	{ label: 'Alpha', value: 'a' },
	{ label: 'Beta', value: 'b' },
	{ label: 'Gamma', value: 'c', disabled: true }
]

const grouped = [
	{
		label: 'Group One',
		value: 'g1',
		children: [
			{ label: 'Alpha', value: 'a' },
			{ label: 'Beta', value: 'b' }
		]
	},
	{ label: 'Group Two', value: 'g2', children: [{ label: 'Gamma', value: 'c' }] }
]

const bound = (c: HTMLElement) => c.querySelector('[data-bound-value]')?.textContent
const log = (c: HTMLElement) => c.querySelector('[data-select-log]')?.textContent
const writes = (c: HTMLElement) => Number(c.querySelector('[data-write-count]')?.textContent)
const items = (c: HTMLElement) => [...c.querySelectorAll('[data-list-item]')] as HTMLElement[]

describe('List — two-way value', () => {
	it('selecting a row writes the bound value', async () => {
		const { container } = render(ListBindingTest, { items: flat })
		expect(bound(container)).toBe('—')

		await fireEvent.click(items(container)[1])
		expect(bound(container)).toBe('b')
	})

	it('still calls onselect, with the same value it wrote', async () => {
		const { container } = render(ListBindingTest, { items: flat })
		await fireEvent.click(items(container)[0])
		expect(log(container)).toBe('a')
		expect(bound(container)).toBe('a')
	})

	it('marks the newly selected row active without the parent doing anything', async () => {
		const { container } = render(ListBindingTest, { items: flat })
		await fireEvent.click(items(container)[1])
		const active = container.querySelectorAll('[data-list-item][data-active="true"]')
		expect(active).toHaveLength(1)
		expect(active[0].textContent).toContain('Beta')
	})

	it("a consumer's own assignment in onselect wins — the write lands first", async () => {
		// Proves ordering: if List wrote AFTER notifying, 'b' would clobber this.
		const { container } = render(ListBindingTest, {
			items: flat,
			override: (v: unknown) => `picked:${v}`
		})
		await fireEvent.click(items(container)[1])
		expect(bound(container)).toBe('picked:b')
	})

	it('re-selecting the active row publishes nothing new', async () => {
		const { container } = render(ListBindingTest, { items: flat, initial: 'b' })
		expect(bound(container)).toBe('b')
		const before = writes(container)

		await fireEvent.click(items(container)[1])
		await fireEvent.click(items(container)[1])

		// onselect still fires each time — it reports activation, not change.
		expect(log(container)).toBe('b,b')
		// …but the bound value never changed, so no consumer was re-notified.
		expect(bound(container)).toBe('b')
		expect(writes(container)).toBe(before)
	})

	it('does not write for a disabled row', async () => {
		const { container } = render(ListBindingTest, { items: flat, initial: 'a' })
		const disabled = items(container)[2]
		expect(disabled.hasAttribute('disabled')).toBe(true)
		// Bypass the DOM guard the way a keyboard action would reach it.
		await fireEvent.click(disabled)
		expect(bound(container)).toBe('a')
	})

	it('an inbound value change still drives the active row', async () => {
		const { container } = render(List, { items: flat, value: 'a' })
		expect(container.querySelector('[data-list-item][data-active="true"]')?.textContent).toContain(
			'Alpha'
		)
	})

	it('selecting inside a collapsed group expands that group and collapses the rest', async () => {
		const { container } = render(ListBindingTest, {
			items: grouped,
			collapsible: true,
			initial: 'a'
		})
		// Seeded value opens its own group only.
		expect(container.querySelectorAll('[data-list-group][aria-expanded="true"]')).toHaveLength(1)

		// A group header toggles just itself — it must NOT write value.
		const collapsed = container.querySelector(
			'[data-list-group][aria-expanded="false"]'
		) as HTMLElement
		await fireEvent.click(collapsed)
		expect(container.querySelectorAll('[data-list-group][aria-expanded="true"]')).toHaveLength(2)
		expect(bound(container)).toBe('a')
		expect(log(container)).toBe('')

		// Selecting the row in the newly-opened group re-anchors expansion there.
		const gamma = items(container).find((el) => el.textContent?.includes('Gamma'))!
		await fireEvent.click(gamma)
		expect(bound(container)).toBe('c')
		expect(container.querySelectorAll('[data-list-group][aria-expanded="true"]')).toHaveLength(1)
	})

	it('settles without re-entering its own effects', async () => {
		// A write that fed back into moveToValue → syncExpandedGroups → write would
		// blow the effect budget and warn. Nothing on the console means it settled.
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const { container } = render(ListBindingTest, { items: grouped, collapsible: true })

		for (const label of ['Alpha', 'Beta']) {
			const row = items(container).find((el) => el.textContent?.includes(label))
			if (row) await fireEvent.click(row)
		}

		expect(spy).not.toHaveBeenCalled()
		expect(warn).not.toHaveBeenCalled()
		spy.mockRestore()
		warn.mockRestore()
	})
})

describe('Tree — two-way value', () => {
	const tree = [
		{
			label: 'src',
			value: 'src',
			children: [
				{ label: 'index.ts', value: 'index' },
				{ label: 'main.ts', value: 'main' }
			]
		}
	]

	/**
	 * Tree roots start collapsed and a parent row is not selectable (its Wrapper is
	 * built without `collapsible`, so activating a parent is a no-op), so the leaf
	 * has to be revealed through the toggle button first.
	 */
	async function expandRootAndPick(container: HTMLElement, label: string) {
		await fireEvent.click(container.querySelector('[data-tree-toggle-btn]') as HTMLElement)
		const leaf = [...container.querySelectorAll('[data-tree-item-content]')].find((el) =>
			el.textContent?.includes(label)
		)
		expect(leaf, `no tree leaf matching ${label} after expanding`).toBeTruthy()
		await fireEvent.click(leaf as HTMLElement)
	}

	it('selecting a node writes the bound value and calls onselect', async () => {
		const { container } = render(TreeBindingTest, { items: tree })
		expect(bound(container)).toBe('—')
		await expandRootAndPick(container, 'index.ts')
		expect(bound(container)).toBe('index')
		expect(log(container)).toBe('index')
	})

	it("a consumer's own assignment in onselect wins", async () => {
		const { container } = render(TreeBindingTest, {
			items: tree,
			override: (v: unknown) => `node:${v}`
		})
		await expandRootAndPick(container, 'main.ts')
		expect(bound(container)).toBe('node:main')
	})

	it('activating a parent row writes nothing', async () => {
		const { container } = render(TreeBindingTest, { items: tree, initial: 'index' })
		const parent = container.querySelector('[data-tree-item-content]') as HTMLElement
		await fireEvent.click(parent)
		expect(bound(container)).toBe('index')
		expect(log(container)).toBe('')
	})
})
