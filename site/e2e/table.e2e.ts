import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Table', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'table')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders table element', async ({ page }) => {
		const table = page.locator('[data-table]').first()
		await expect(table).toBeVisible()
	})

	test('auto-derived table renders all 8 rows', async ({ page }) => {
		const rows = page.locator('[data-table]').first().locator('[data-table-row]')
		await expect(rows).toHaveCount(8)
	})

	test('renders column headers', async ({ page }) => {
		const headers = page.locator('[data-table]').first().locator('[data-table-header-cell]')
		await expect(headers.first()).toBeVisible()
	})

	// ─── Row selection ───────────────────────────────────────────────

	test('clicking a row selects it', async ({ page }) => {
		const row = page.locator('[data-table]').first().locator('[data-table-row]').first()
		await row.click()

		await expect(row).toHaveAttribute('data-selected')
	})

	test('clicking a different row changes selection', async ({ page }) => {
		const table = page.locator('[data-table]').first()
		const rows = table.locator('[data-table-row]')

		await rows.first().click()
		await rows.nth(1).click()

		await expect(rows.first()).not.toHaveAttribute('data-selected')
		await expect(rows.nth(1)).toHaveAttribute('data-selected')
	})

	test('selected row value shown in info field', async ({ page }) => {
		const row = page.locator('[data-table]').first().locator('[data-table-row]').first()
		await row.click()

		// Info field "Selected" should update from '—'
		const info = page.locator('aside')
		await expect(info).not.toContainText('Selected—')
	})

	// ─── Column sorting ──────────────────────────────────────────────

	test('clicking a sortable header sorts the column', async ({ page }) => {
		const header = page
			.locator('[data-table]')
			.first()
			.locator('[data-table-header-cell][data-sortable]')
			.first()
		await header.click()

		await expect(header).toHaveAttribute('data-sort-order', 'ascending')
	})

	test('clicking sorted header again reverses sort order', async ({ page }) => {
		const header = page
			.locator('[data-table]')
			.first()
			.locator('[data-table-header-cell][data-sortable]')
			.first()
		await header.click()
		await header.click()

		await expect(header).toHaveAttribute('data-sort-order', 'descending')
	})

	// ─── Custom columns ──────────────────────────────────────────────

	test('custom columns table renders formatted salary', async ({ page }) => {
		const table = page.locator('[data-table]').nth(1)
		await expect(table).toContainText('$95,000')
	})

	// ─── SearchFilter integration ────────────────────────────────────

	test('search filter reduces visible rows', async ({ page }) => {
		const input = page.locator('[data-search-filter] [data-search-input]')
		await input.fill('department:Engineering')
		await page.waitForTimeout(400)

		// Engineering has 4 employees
		const filteredTable = page.locator('[data-table]').nth(2)
		const rows = filteredTable.locator('[data-table-row]')
		await expect(rows).toHaveCount(4)
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const table = page.locator('[data-table]').first()
					await expect(table).toHaveScreenshot(`table-${theme}-${mode}-default.png`)
				})
			}
		}
	})
})
