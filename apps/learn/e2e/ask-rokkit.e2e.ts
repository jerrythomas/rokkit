import { test, expect } from '@playwright/test'

test('nav says Ask Rokkit, not Chat demo', async ({ page }) => {
	await page.goto('/chat')
	const nav = page.locator('[data-site-nav]')
	await expect(nav.getByText('Ask Rokkit', { exact: true })).toBeVisible()
	await expect(nav.getByText('Chat demo', { exact: true })).toHaveCount(0)
})

test('/chat shows the three engine cards', async ({ page }) => {
	await page.goto('/chat')
	await expect(page.locator('[data-mode-card]')).toHaveCount(3)
})

test('an unknown mode redirects to the picker', async ({ page }) => {
	await page.goto('/chat/bogus')
	await expect(page).toHaveURL(/\/chat$/)
	await expect(page.locator('[data-mode-card]')).toHaveCount(3)
})

test('entering Simulated via an example chip yields a response', async ({ page }) => {
	await page.goto('/chat')
	const simCard = page.locator('[data-mode-card]', { hasText: 'Simulated' })
	await simCard.locator('[data-mode-examples] button').first().click()
	await expect(page).toHaveURL(/\/chat\/simulated/)
	// The scripted router responds synchronously; the first block rendered is a
	// prose block ([data-block-kind="prose"]) which appears before the chart.
	await expect(page.locator('[data-block-kind]').first()).toBeVisible({ timeout: 8000 })
})
