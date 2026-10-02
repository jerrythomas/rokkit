import { test, expect, type Page } from '@playwright/test'
import { gotoHydrated } from './helpers'

/**
 * The Koan /app shell reads a message with the chat's interpreter: it opens any catalogue
 * demo (it used to reach 14 and open Tabs for the rest), sets the canvas demo's props in
 * place, opens docs for a how-to, and asks back rather than guessing.
 */
/** The shell's composer, by its placeholder (landing, or a demo on the canvas). */
const composer = (page: Page) => page.getByRole('textbox', { name: /Ask anything|Refine/ })
const say = async (page: Page, text: string) => {
	const box = composer(page)
	await box.fill(text)
	// The shell's composer sends on ⌘/Ctrl+Enter (plain Enter is a newline).
	await box.press('ControlOrMeta+Enter')
}

test('opens a demo the shell could not reach before', async ({ page }) => {
	await gotoHydrated(page, '/app')
	await say(page, 'show me badges')
	await expect(page).toHaveURL(/\/app\/badge$/, { timeout: 8000 })
})

test('sets a prop on the demo on the canvas, without leaving it', async ({ page }) => {
	await gotoHydrated(page, '/app/tabs')
	await say(page, 'align them to the end')
	await expect(page.locator('[data-tabs][data-align="end"]').first()).toBeVisible()
	await expect(page).toHaveURL(/\/app\/tabs$/)
})

test('switches the canvas demo to a variant it names', async ({ page }) => {
	await gotoHydrated(page, '/app/tabs')
	await say(page, 'with icons please')
	await expect(page).toHaveURL(/\/app\/tabs\?variant=with-icons/)
})

test('a how-to opens the docs; an unplaceable message is asked back', async ({ page }) => {
	await gotoHydrated(page, '/app/tabs')
	await say(page, 'how does keyboard navigation work?')
	await expect(page.getByText('Docs · concepts')).toBeVisible()

	await say(page, 'hmm')
	await expect(page).toHaveURL(/\/app$/)
	await expect(composer(page)).toHaveValue('hmm')
})

test('asking back shows the closest demos to pick from', async ({ page }) => {
	await gotoHydrated(page, '/app/tabs')
	await say(page, 'choose several options')
	await expect(page).toHaveURL(/\/app$/)
	// Pick by title: Select's description mentions MultiSelect.
	const byTitle = (title: string) =>
		page.locator('[data-composer-suggestion]').filter({ has: page.locator('[data-suggestion-title]', { hasText: new RegExp(`^${title}$`) }) })
	await expect(byTitle('Select')).toBeVisible()
	await expect(byTitle('Multi-Select')).toBeVisible()

	await byTitle('Multi-Select').click()
	await expect(page).toHaveURL(/\/app\/multiselect/, { timeout: 8000 })
})

test('a how-to about another demo opens that demo on its docs', async ({ page }) => {
	await gotoHydrated(page, '/app/tabs')
	await say(page, 'how does the tree work?')
	await expect(page).toHaveURL(/\/app\/tree$/, { timeout: 8000 })
	await expect(page.getByText('Docs · concepts')).toBeVisible()
	await expect(page.getByText('Tree Select — design intent')).toBeVisible()
})

test('a prop set by message survives a reload', async ({ page }) => {
	// Tweaks are saved into the conversation, so start one the way a user does.
	await gotoHydrated(page, '/app')
	await say(page, 'show me tabs')
	await expect(page).toHaveURL(/\/app\/tabs$/, { timeout: 8000 })
	await say(page, 'align them to the end')
	await expect(page.locator('[data-tabs][data-align="end"]').first()).toBeVisible()
	await page.reload()
	await expect(page.locator('body')).toHaveAttribute('data-hydrated', 'true')
	await expect(page.locator('[data-tabs][data-align="end"]').first()).toBeVisible()
})
