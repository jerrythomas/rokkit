import { test, expect, type Page } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * Simulated mode holds a conversation: each turn reads what is on screen, so follow-ups —
 * typed or clicked — act on it instead of replaying a canned reply.
 */
const say = async (page: Page, text: string) => {
	const box = page.locator('[data-chat-composer] textarea')
	await box.fill(text)
	await box.press('Enter')
}
/** The demo block of the latest reply that has one. */
const lastDemo = (page: Page) => page.locator('[data-block-kind="demo"]').last()

test('a table, striped on request, then charted from the same rows', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')

	await say(page, 'show me a sortable table')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'table')
	await expect(lastDemo(page).locator('table')).toContainText('Laptop')

	await say(page, 'make the rows striped')
	await expect(page.locator('[data-block-kind="demo"]')).toHaveCount(2)
	await expect(lastDemo(page).locator('table')).toHaveAttribute('data-table-striped', 'true')

	await page.locator('[data-block-suggestion]', { hasText: 'As a chart' }).last().click()
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'chart')
	await expect(lastDemo(page).locator('svg').first()).toBeVisible()
})

test('a demo outside the old scripted routes mounts live, and its chips change it', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me tabs')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'tabs')
	await expect(lastDemo(page).locator('[data-demo-live]')).toBeVisible()

	await page.locator('[data-block-suggestion]', { hasText: 'Vertical orientation' }).last().click()
	await expect(lastDemo(page)).toHaveAttribute('data-variant', 'vertical')
})

test('a how-to is answered from the docs, and a vague message is asked back', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me a sortable table')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'table')

	await say(page, 'how do I sort the columns?')
	await expect(page.locator('[data-block-kind="markdown"]').last()).toContainText('Sorting')

	await say(page, 'hmm')
	await expect(page.locator('[data-block-kind="prose"]').last()).toContainText('not sure')
})

test('what the user selects feeds the chat: a chip for it, and "edit this row"', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me a sortable table')
	await lastDemo(page).locator('tbody tr', { hasText: 'Phone' }).click()

	const edit = page.locator('[data-block-suggestion]', { hasText: 'Edit “Phone”' })
	await expect(edit).toBeVisible()
	await edit.click()
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'form')
	await expect(lastDemo(page).locator('input').first()).toHaveValue('Phone')

	await say(page, 'show me a sortable table')
	await lastDemo(page).locator('tbody tr', { hasText: 'Monitor' }).click()
	await say(page, 'edit this row')
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'form')
	await expect(lastDemo(page).locator('input').first()).toHaveValue('Monitor')
})

test('the demo on screen has live controls that change it in place', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	await say(page, 'show me a sortable table')
	const controls = lastDemo(page).locator('[data-demo-adjust]')
	await controls.locator('summary').click()
	await controls.getByRole('switch').first().click()
	await expect(lastDemo(page).locator('table')).toHaveAttribute('data-table-striped', 'true')
	await expect(page.locator('[data-block-kind="demo"]')).toHaveCount(1)

	// Only the screen has controls: an older demo block does not.
	await say(page, 'show me tabs')
	await expect(page.locator('[data-block-kind="demo"]').first().locator('[data-demo-adjust]')).toHaveCount(0)
})

test('a line chart of data with repeated x per series draws one point per x', async ({ page }) => {
	await gotoHydrated(page, '/chat/simulated')
	const rows = [
		{ month: 'Jul', product: 'A', sales: 1 },
		{ month: 'Jul', product: 'A', sales: 2 },
		{ month: 'Aug', product: 'A', sales: 4 },
		{ month: 'Aug', product: 'B', sales: 3 }
	]
	await say(page, JSON.stringify(rows))
	await expect(lastDemo(page)).toHaveAttribute('data-demo', 'chart')

	await say(page, 'as a line chart')
	await expect(lastDemo(page)).toHaveAttribute('data-variant', 'line')
	// The plot's footer counts the rows it drew: Jul/A summed into one, so three, not four.
	await expect(lastDemo(page)).toContainText('rows [3]')
})
