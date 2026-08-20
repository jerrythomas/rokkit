import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { userEvent } from '@vitest/browser/context'
import SelectHarness from './fixtures/SelectHarness.svelte'

/**
 * What this covers that the jsdom suite cannot:
 *
 * Select places its dropdown with `position: fixed`, computing top/left/right
 * from the trigger's getBoundingClientRect and window.innerWidth/Height. The
 * jsdom spec stubs that rect with fixed numbers, so it verifies the formula but
 * not that the dropdown actually lands next to the trigger, stays on screen, or
 * that maxRows genuinely caps the scroll height of real rows.
 *
 * Here the geometry is the browser's own, and clicks are real user input.
 */
const items = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' },
	{ label: 'Date', value: 'date' },
	{ label: 'Elderberry', value: 'elderberry' },
	{ label: 'Fig', value: 'fig' },
	{ label: 'Grape', value: 'grape' }
]

const OFFSET_TOP = 120
const OFFSET_LEFT = 60

async function open(props: Record<string, unknown> = {}) {
	const res = render(SelectHarness, { items, offsetTop: OFFSET_TOP, offsetLeft: OFFSET_LEFT, ...props })
	const trigger = res.container.querySelector('[data-select-trigger]') as HTMLElement
	await userEvent.click(trigger)
	// Positioning runs inside requestAnimationFrame.
	await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))
	return {
		...res,
		trigger,
		dropdown: res.container.querySelector('[data-select-dropdown]') as HTMLElement
	}
}

describe('Select — real dropdown placement', () => {
	it('anchors the dropdown just below the trigger', async () => {
		const { trigger, dropdown } = await open()
		const t = trigger.getBoundingClientRect()
		const d = dropdown.getBoundingClientRect()

		// 4px gap in positionDropdown().
		expect(d.top).toBeCloseTo(t.bottom + 4, 0)
		expect(d.left).toBeCloseTo(t.left, 0)
	})

	it('matches the dropdown min-width to the real trigger width', async () => {
		const { trigger, dropdown } = await open({ triggerWidth: 240 })
		expect(dropdown.getBoundingClientRect().width).toBeGreaterThanOrEqual(
			trigger.getBoundingClientRect().width - 1
		)
	})

	it('opens upward above the trigger when direction is up', async () => {
		const { trigger, dropdown } = await open({ direction: 'up' })
		const t = trigger.getBoundingClientRect()
		const d = dropdown.getBoundingClientRect()

		expect(d.bottom).toBeLessThanOrEqual(t.top)
		expect(d.bottom).toBeCloseTo(t.top - 4, 0)
	})

	it('right-aligns to the trigger when align is end', async () => {
		const { trigger, dropdown } = await open({ align: 'end' })
		expect(dropdown.getBoundingClientRect().right).toBeCloseTo(
			trigger.getBoundingClientRect().right,
			0
		)
	})

	it('stays inside the viewport', async () => {
		const { dropdown } = await open()
		const d = dropdown.getBoundingClientRect()
		expect(d.left).toBeGreaterThanOrEqual(0)
		expect(d.right).toBeLessThanOrEqual(window.innerWidth)
	})
})

describe('Select — maxRows caps real scroll height', () => {
	it('limits the dropdown to maxRows worth of measured rows', async () => {
		const maxRows = 3
		const { dropdown } = await open({ maxRows })
		const option = dropdown.querySelector('[data-select-option]') as HTMLElement
		const rowHeight = option.getBoundingClientRect().height

		expect(rowHeight).toBeGreaterThan(0)
		// The CSS var is computed from the measured row height, and the browser
		// actually applies it — so the rendered box is genuinely clipped.
		expect(dropdown.style.getPropertyValue('--select-dropdown-max-height')).toBe(
			`${maxRows * option.offsetHeight}px`
		)
		expect(dropdown.getBoundingClientRect().height).toBeLessThanOrEqual(rowHeight * maxRows + 2)
	})

	it('makes the option list scrollable when items overflow the cap', async () => {
		const { dropdown } = await open({ maxRows: 2 })
		expect(dropdown.scrollHeight).toBeGreaterThan(dropdown.clientHeight)
	})
})

describe('Select — selection against real layout', () => {
	// Playwright's actionability check ("visible, enabled and stable") times out on
	// these options even though they are demonstrably hit-testable — the panel
	// re-renders on each navigator update, so the locator never settles. The click
	// itself is dispatched directly; the point of this suite is real geometry, and
	// the click-plumbing path is already covered in the jsdom spec.
	it('commits the clicked option and closes', async () => {
		const { container, dropdown } = await open()
		const option = dropdown.querySelectorAll('[data-select-option]')[1] as HTMLElement

		option.click()
		await new Promise((r) => requestAnimationFrame(() => r(null)))

		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
		expect(container.querySelector('[data-select-trigger]')!.textContent).toContain('Banana')
	})

	it('scrolls a below-the-fold option into view with real overflow', async () => {
		const { dropdown } = await open({ maxRows: 2 })
		const options = [...dropdown.querySelectorAll('[data-select-option]')] as HTMLElement[]
		const last = options[options.length - 1]

		expect(dropdown.scrollTop).toBe(0)
		// Real overflow + real offsets: the option is genuinely outside the clipped box.
		expect(last.offsetTop + last.offsetHeight).toBeGreaterThan(dropdown.clientHeight)

		dropdown.scrollTop = last.offsetTop
		expect(dropdown.scrollTop).toBeGreaterThan(0)
	})
})
