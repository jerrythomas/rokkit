import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Drilling (#165) in a real browser: the key press jsdom cannot synthesise, the explorer keeping
 * a drill across a selection, and a host that loads each level — pending, then the new level,
 * then back up without a refetch.
 */
const openDiagram = async (page: Page, variant: string) => {
	await page.goto(`/app/graph?variant=${variant}`)
	await expect(page.locator('[data-graph-explorer]')).toBeVisible()
}

/** A containment box by its label's name. */
const box = (page: Page, name: string) =>
	page.locator('[data-graph-cluster]').filter({
		has: page.locator('[data-graph-cluster-label]', { hasText: new RegExp(`^${name} ·`) })
	})

const crumbs = (page: Page) => page.locator('[data-graph-drill-crumb]')

/**
 * Open a container by its own label strip. Its centre is covered by the boxes it contains, so a
 * centre click lands on a child — which is also what a reader aiming at the container avoids.
 */
const openBox = (page: Page, name: string) => box(page, name).first().click({ position: { x: 8, y: 6 } })

test.describe('graph drilling', () => {
	test('clicking a container opens it and the trail shows the way back', async ({ page }) => {
		await openDiagram(page, 'treemap')
		await openBox(page, 'ui')
		await expect(crumbs(page)).toHaveText(['All', 'rokkit', 'ui'])
		await expect(box(page, 'components').first()).toBeVisible()
		// Back to where the demo opens — `rokkit` — which is itself a drilled scope, so the trail
		// stays, now ending there.
		await crumbs(page).nth(1).click()
		await expect(crumbs(page)).toHaveText(['All', 'rokkit'])
		await expect(box(page, 'ui').first()).toBeVisible()
	})

	test('Enter on a focused container opens it — a real button', async ({ page }) => {
		await openDiagram(page, 'treemap')
		await box(page, 'chart').first().focus()
		await page.keyboard.press('Enter')
		await expect(crumbs(page).last()).toHaveText('chart')
	})

	test('selecting a box after drilling keeps the drill — the explorer does not reset it', async ({
		page
	}) => {
		await openDiagram(page, 'treemap')
		await openBox(page, 'ui')
		await expect(crumbs(page).last()).toHaveText('ui')
		await page.locator('[data-graph-cluster][data-graph-node-id]').first().click()
		await expect(crumbs(page).last()).toHaveText('ui')
	})

	test('a host that loads levels shows the load, then the level, then climbs back instantly', async ({
		page
	}) => {
		await openDiagram(page, 'lazy-treemap')
		await openBox(page, 'ui')
		await expect(page.locator('[data-graph-drill-status]')).toHaveText(/Loading/)
		await expect(page.locator('[data-graph-paper][data-graph-pending]')).toHaveCount(1)
		await expect(page.locator('[data-graph-drill-status]')).toHaveCount(0)
		await expect(page.locator('[data-graph-paper][data-graph-pending]')).toHaveCount(0)
		await expect(box(page, 'components').first()).toBeVisible()
		// The root level is already held, so climbing back is not a fetch: no loading state.
		await crumbs(page).nth(1).click()
		await expect(page.locator('[data-graph-drill-status]')).toHaveCount(0)
		await expect(box(page, 'ui').first()).toBeVisible()
	})
})
