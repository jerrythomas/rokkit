import { test, expect } from '@playwright/test'
import { goToComponent, setTheme, setMode, themes, modes } from './helpers'

test.describe('Toolbar', () => {
	test.beforeEach(async ({ page }) => {
		await goToComponent(page, 'toolbar')
	})

	test.describe('keyboard navigation', () => {
		test('ArrowRight moves focus to next item', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			await first.focus()
			await page.keyboard.press('ArrowRight')

			const second = toolbar.locator('[data-toolbar-item]').nth(1)
			await expect(second).toBeFocused()
		})

		test('ArrowLeft moves focus to previous item', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			await first.focus()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('ArrowLeft')

			await expect(first).toBeFocused()
		})

		test('Home moves focus to first item', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			await first.focus()
			await page.keyboard.press('End')
			await page.keyboard.press('Home')

			await expect(first).toBeFocused()
		})

		test('End moves focus to last item', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			await first.focus()
			await page.keyboard.press('End')

			const last = toolbar.locator('[data-toolbar-item]').last()
			await expect(last).toBeFocused()
		})

		test('ArrowRight at last stays on last', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			const last = toolbar.locator('[data-toolbar-item]').last()
			await first.focus()
			await page.keyboard.press('End')
			await page.keyboard.press('ArrowRight')

			await expect(last).toBeFocused()
		})

		test('ArrowLeft at first stays on first', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			await first.focus()
			await page.keyboard.press('ArrowLeft')

			await expect(first).toBeFocused()
		})

		test('Enter triggers click on focused item', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const first = toolbar.locator('[data-toolbar-item]').first()
			await first.focus()
			await page.keyboard.press('Enter')

			// Check the "Last action" info field updated
			const info = page.locator('text=bold')
			await expect(info).toBeVisible()
		})

		test('navigation skips separator items', async ({ page }) => {
			// The first toolbar has a separator between items 3 and 4
			const toolbar = page.locator('[data-toolbar]').first()
			const items = toolbar.locator('[data-toolbar-item]')
			const third = items.nth(2)
			await third.focus()
			await page.keyboard.press('ArrowRight')

			// Should skip the separator and land on the 4th interactive item
			const fourth = items.nth(3)
			await expect(fourth).toBeFocused()
		})
	})

	test.describe('mouse interaction', () => {
		test('click triggers action', async ({ page }) => {
			const toolbar = page.locator('[data-toolbar]').first()
			const second = toolbar.locator('[data-toolbar-item]').nth(1)
			await second.click()

			// Check the "Last action" info field updated
			const info = page.locator('text=italic')
			await expect(info).toBeVisible()
		})
	})

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - default state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const toolbar = page.locator('[data-toolbar]').first()
					await expect(toolbar).toHaveScreenshot(`toolbar-${theme}-${mode}-default.png`)
				})

				test(`${theme}/${mode} - focused state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const toolbar = page.locator('[data-toolbar]').first()
					const first = toolbar.locator('[data-toolbar-item]').first()
					await first.focus()
					await page.keyboard.press('ArrowRight')

					await expect(toolbar).toHaveScreenshot(`toolbar-${theme}-${mode}-focused.png`)
				})
			}
		}
	})
})
