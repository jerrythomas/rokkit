import { test, expect } from '@playwright/test'
import { gotoHydrated, setMode, setStyle } from './helpers'

// The guide reading pane is an inner scroll container (<main id="guides-main">).
// SvelteKit restores window scroll, not inner containers, so its scroll position
// used to carry over between guides. It must reset to the top on a page switch.
test('guide reading pane scroll resets on switching guides', async ({ page }) => {
	await gotoHydrated(page, '/guides/charts')
	const main = page.locator('#guides-main')
	await expect(main).toBeVisible()

	// Scroll the reading pane down — the charts guide is long enough to scroll.
	await main.evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
	expect(await main.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

	// Client-side navigate to a different guide via the rail.
	await page.locator('.rail a[data-list-item]:not([data-active])').first().click()
	await expect(page).not.toHaveURL(/\/guides\/charts$/)

	// The reading pane is back at the top.
	await expect.poll(() => main.evaluate((el) => el.scrollTop)).toBe(0)
})

/**
 * The rail is the rokkit List — grouped by category, not collapsible, links by href — and its
 * look comes from zen-sumi's List styles, not from rail css. Group headings are mono micro-labels
 * and items read as 13px ink body text, in both modes.
 */
const railStyles = (page: import('@playwright/test').Page) =>
	page.evaluate(() => {
		const rail = document.querySelector('.rail')!
		const group = rail.querySelector('[data-list] [data-list-group]')!
		const item = rail.querySelector('[data-list] [data-list-item]:not([data-active])')!
		/** A token's colour as the browser computes it, to compare like with like. */
		const token = (name: string) => {
			const probe = document.createElement('span')
			probe.style.color = `var(${name})`
			document.body.append(probe)
			const value = getComputedStyle(probe).color
			probe.remove()
			return value
		}
		const g = getComputedStyle(group)
		const i = getComputedStyle(item)
		return {
			group: {
				font: g.fontFamily.split(',')[0].replaceAll(/["']/g, '').trim(),
				size: g.fontSize,
				weight: g.fontWeight,
				tracking: g.letterSpacing,
				transform: g.textTransform,
				margin: g.margin,
				colorIsInkMute: g.color === token('--ink-mute')
			},
			item: {
				font: i.fontFamily.split(',')[0].replaceAll(/["']/g, '').trim(),
				size: i.fontSize,
				weight: i.fontWeight,
				padding: i.padding,
				colorIsInk: i.color === token('--ink')
			}
		}
	})

test('the guides rail is a grouped rokkit List', async ({ page }) => {
	await gotoHydrated(page, '/guides/charts')
	const list = page.locator('.rail [data-list]')
	await expect(list).toHaveCount(1)
	await expect(list.locator('[data-list-group]')).toHaveText([
		'basics',
		'data',
		'design',
		'workflows',
		'advanced'
	])
	await expect(list.locator('a[data-list-item][aria-current="page"]')).toHaveAttribute(
		'href',
		'/guides/charts'
	)
})

for (const mode of ['light', 'dark'] as const) {
	test(`the guides rail takes zen-sumi's List look in ${mode}`, async ({ page }) => {
		await gotoHydrated(page, '/guides/charts')
		await setStyle(page, 'zen-sumi')
		await setMode(page, mode)
		expect(await railStyles(page)).toEqual({
			group: {
				font: 'JetBrains Mono',
				size: '10px',
				weight: '500',
				tracking: '1.2px',
				transform: 'uppercase',
				margin: '14px 8px 6px',
				colorIsInkMute: true
			},
			item: {
				font: 'Inter',
				size: '13px',
				weight: '400',
				padding: '6px 8px',
				colorIsInk: true
			}
		})
	})
}

test('a rail link navigates to its guide', async ({ page }) => {
	await gotoHydrated(page, '/guides/charts')
	const target = page.locator('.rail a[data-list-item][href="/guides/theming"]')
	await target.click()
	await expect(page).toHaveURL(/\/guides\/theming$/)
	await expect(target).toHaveAttribute('aria-current', 'page')
})
