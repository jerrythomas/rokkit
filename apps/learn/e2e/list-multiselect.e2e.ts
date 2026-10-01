import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

/** List multi-select (#153) in a real browser: modifier clicks, the themed selection, the readout. */
test.describe('list multi-select', () => {
	const rows = '[data-list] [data-list-item]'

	test('click, ctrl/⌘-click and shift-click build the selection, and the theme paints it', async ({ page }) => {
		await gotoHydrated(page, '/app/list?variant=multiselect')
		const items = page.locator(rows)
		await expect(items.first()).toBeVisible()
		// How a row is painted. Styles mark a selection differently — a fill in some, an inset
		// bar and primary text in zen-sumi — so compare the whole signature, not one property.
		const paint = (i: number) =>
			items.nth(i).evaluate((el) => {
				const cs = getComputedStyle(el)
				return [cs.backgroundColor, cs.color, cs.borderLeftWidth, cs.borderLeftColor].join(' | ')
			})
		const rest = await paint(1)

		await items.nth(0).click()
		await items.nth(2).click({ modifiers: ['ControlOrMeta'] })
		await expect(page.locator(`${rows}[data-selected="true"]`)).toHaveCount(2)
		await items.nth(4).click({ modifiers: ['Shift'] })
		await expect(page.locator(`${rows}[data-selected="true"]`)).toHaveCount(3)

		expect(await paint(2)).not.toBe(rest)
		await expect(page.locator('[data-list-selection]')).toContainText('3 selected')
	})
})
