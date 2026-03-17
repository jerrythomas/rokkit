import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('SearchFilter', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'search-filter')
	})

	// ─── Rendering ───────────────────────────────────────────────────

	test('renders search input', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await expect(input).toBeVisible()
	})

	test('renders no tags initially', async ({ page }) => {
		const tags = page.locator('[data-search-tag]')
		await expect(tags).toHaveCount(0)
	})

	// ─── Filter parsing ──────────────────────────────────────────────

	test('typing a simple term creates a filter tag', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('apple')
		// Trigger debounce by waiting or pressing Enter
		await page.keyboard.press('Enter')
		await page.waitForTimeout(400)

		const tags = page.locator('[data-search-tag]')
		await expect(tags).toHaveCount(1)
		await expect(tags.first()).toContainText('apple')
	})

	test('column:value syntax creates a named filter tag', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('name:alice')
		await page.waitForTimeout(400)

		const tags = page.locator('[data-search-tag]')
		await expect(tags).toHaveCount(1)
		await expect(tags.first()).toContainText('name')
		await expect(tags.first()).toContainText('alice')
	})

	test('multiple terms create multiple filter tags', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('name:alice age>30')
		await page.waitForTimeout(400)

		const tags = page.locator('[data-search-tag]')
		await expect(tags).toHaveCount(2)
	})

	// ─── Clear input ─────────────────────────────────────────────────

	test('clear button appears when input has text', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('test')

		const clearBtn = page.locator('[data-search-clear]')
		await expect(clearBtn).toBeVisible()
	})

	test('clear button removes input text and tags', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('hello')
		await page.waitForTimeout(400)

		await page.locator('[data-search-clear]').click()

		await expect(input).toHaveValue('')
		await expect(page.locator('[data-search-tag]')).toHaveCount(0)
	})

	// ─── Tag removal ─────────────────────────────────────────────────

	test('clicking remove on a tag removes it', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('foo bar')
		await page.waitForTimeout(400)

		await expect(page.locator('[data-search-tag]')).toHaveCount(2)

		await page.locator('[data-search-tag-remove]').first().click()
		await expect(page.locator('[data-search-tag]')).toHaveCount(1)
	})

	// ─── Active filters info ─────────────────────────────────────────

	test('info field updates when filters are applied', async ({ page }) => {
		const input = page.locator('[data-search-input]')
		await input.fill('test')
		await page.waitForTimeout(400)

		// Info field should show filter data, not '—'
		const info = page.locator('aside')
		await expect(info).not.toContainText('"Active filters"')
	})

	// ─── Visual snapshots ────────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - empty state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const filter = page.locator('[data-search-filter]')
					await expect(filter).toHaveScreenshot(`search-filter-${theme}-${mode}-empty.png`)
				})

				test(`${theme}/${mode} - with tags`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const input = page.locator('[data-search-input]')
					await input.fill('name:alice status:active')
					await page.waitForTimeout(400)

					const filter = page.locator('[data-search-filter]')
					await expect(filter).toHaveScreenshot(`search-filter-${theme}-${mode}-tags.png`)
				})
			}
		}
	})
})
