import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * The guides' scale is the heading default (#152, option a), styled by `[data-heading]` rules.
 *
 * 1. Zero visual change — the computed type of each level is pinned to what the guides drew
 *    BEFORE they moved onto the hook, so the move provably changed nothing.
 * 2. They really use the `[data-heading]` hook — an element anywhere takes a level by
 *    attribute, and a later rule with the same selector overrides the guides' headings.
 */
const PINNED = {
	h1: { size: '28px', weight: '700', leading: '33.6px' },
	h2: { size: '18px', weight: '600', leading: '23.4px' },
	h3: { size: '14.5px', weight: '600', leading: 'normal' },
	p: { size: '14px', weight: '400', leading: '23.1px' }
} as const

const typeOf = (page: import('@playwright/test').Page, selector: string) =>
	page.locator(`.guide-page ${selector}`).first().evaluate((el) => {
		const cs = getComputedStyle(el)
		return { size: cs.fontSize, weight: cs.fontWeight, leading: cs.lineHeight }
	})

test('every guide level renders exactly as it did before the scale', async ({ page }) => {
	await gotoHydrated(page, '/guides/skins')
	for (const [selector, expected] of Object.entries(PINNED)) {
		expect(await typeOf(page, selector), selector).toEqual(expected)
	}
})

test('any element takes a level by data-heading', async ({ page }) => {
	await gotoHydrated(page, '/guides/skins')
	const type = await page.evaluate(() => {
		const el = document.createElement('span')
		el.setAttribute('data-heading', '2')
		el.textContent = 'A card title'
		document.body.append(el)
		const cs = getComputedStyle(el)
		return { size: cs.fontSize, weight: cs.fontWeight, leading: cs.lineHeight }
	})
	expect(type).toEqual(PINNED.h2)
})

test('a user rule with the same selector overrides the guides’ heading', async ({ page }) => {
	await gotoHydrated(page, '/guides/skins')
	await page.addStyleTag({ content: "[data-heading='1'], [data-prose] h1 { font-size: 40px; font-weight: 400 }" })
	expect(await typeOf(page, 'h1')).toMatchObject({ size: '40px', weight: '400' })
})
