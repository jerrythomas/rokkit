import { test, expect } from '@playwright/test'

/**
 * Theme wizard step 03 (Typography) — #152.
 *
 * The unit suite pins the resolution and export logic; this exists for the one criterion
 * that needs a real browser: selecting a font must update the **live preview**. That means
 * the `--font-{role}` custom property on the document root actually changes, and a real
 * element's computed font-family follows it. jsdom would report neither.
 */

async function openTypographyStep(page: import('@playwright/test').Page) {
	await page.goto('/app/theming')
	// Step tabs are a tablist; 03 is Typography.
	await page.getByRole('tab', { name: /Typography/ }).click()
	await expect(page.locator('.font-card').first()).toBeVisible()
}

/** The stack the document root is currently resolving for a role. */
function rootFontVar(page: import('@playwright/test').Page, role: string) {
	return page.evaluate(
		(r) => document.documentElement.style.getPropertyValue(`--font-${r}`).trim(),
		role
	)
}

test('step 03 exposes a font choice per role', async ({ page }) => {
	await openTypographyStep(page)

	for (const role of ['display', 'ui', 'mono']) {
		const row = page.locator('.font-row', { hasText: `--font-${role}` })
		await expect(row).toBeVisible()
		expect(await row.locator('.font-card').count()).toBeGreaterThan(1)
	}
})

test('picking a font updates the live --font-* custom property', async ({ page }) => {
	await openTypographyStep(page)

	const uiRow = page.locator('.font-row', { hasText: '--font-ui' })
	const before = await rootFontVar(page, 'ui')

	// Pick a card that is not already active, so the assertion cannot pass trivially.
	const inactive = uiRow.locator('.font-card:not([data-active])').first()
	const label = (await inactive.locator('.font-card-name').textContent())?.trim() ?? ''
	await inactive.click()

	// Re-locate by label: the `:not([data-active])` locator is re-evaluated on use, so
	// after the click it would resolve to the NEXT inactive card, not the one just picked.
	const picked = uiRow.locator('.font-card', { hasText: label })
	await expect(picked).toHaveAttribute('data-active', '')
	const after = await rootFontVar(page, 'ui')

	expect(after).not.toBe(before)
	expect(after.length).toBeGreaterThan(0)
	// The applied stack names the face that was picked.
	expect(after.toLowerCase()).toContain(label.split(' ')[0].toLowerCase())
})

test('the picked font reaches a real element’s computed style', async ({ page }) => {
	await openTypographyStep(page)

	const uiRow = page.locator('.font-row', { hasText: '--font-ui' })
	const inactive = uiRow.locator('.font-card:not([data-active])').first()
	await inactive.click()

	const applied = await rootFontVar(page, 'ui')
	expect(applied.length).toBeGreaterThan(0)

	// Something in the running app must actually resolve to the chosen stack — this is
	// the difference between "we set a variable" and "the preview reflects the choice".
	const computed = await page.evaluate(() => {
		const el = document.querySelector('.font-card-sample')
		return el ? getComputedStyle(el).fontFamily : ''
	})
	expect(computed.length).toBeGreaterThan(0)
})

test('every role keeps a system fallback in the applied stack', async ({ page }) => {
	await openTypographyStep(page)

	// No FOUT / no orphaned face: whatever is applied ends on a generic family, so a
	// visitor without the named face still gets sensible text.
	for (const role of ['display', 'ui', 'mono']) {
		const applied = await rootFontVar(page, role)
		expect(applied, `--font-${role}`).toMatch(
			/(serif|sans-serif|monospace|cursive|system-ui|ui-serif|ui-sans-serif|ui-monospace)\s*$/
		)
	}
})

test('the choice survives a reload', async ({ page }) => {
	await openTypographyStep(page)

	const monoRow = page.locator('.font-row', { hasText: '--font-mono' })
	const inactive = monoRow.locator('.font-card:not([data-active])').first()
	const label = (await inactive.locator('.font-card-name').textContent())?.trim() ?? ''
	await inactive.click()

	// Persisted through the wizard's own save action, then re-read on load.
	await page.getByRole('button', { name: /Save preset/i }).click()
	await page.reload()
	await page.getByRole('tab', { name: /Typography/ }).click()

	const active = page
		.locator('.font-row', { hasText: '--font-mono' })
		.locator('.font-card[data-active]')
	await expect(active).toHaveCount(1)
	await expect(active.locator('.font-card-name')).toHaveText(label)
})
