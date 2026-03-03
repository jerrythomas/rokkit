import { test, expect } from '@playwright/test'
import { goToPlayPage, setTheme, setMode, themes, modes } from './helpers'

test.describe('Tree', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'tree')
	})

	// ─── Keyboard navigation ────────────────────────────────────────

	test.describe('keyboard navigation', () => {
		test('ArrowDown navigates through visible nodes', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')
			await items.first().focus()

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowUp navigates back through nodes', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')
			await items.nth(2).focus()

			await page.keyboard.press('ArrowUp')
			await expect(items.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowUp')
			await expect(items.first()).toBeFocused()
		})

		test('Home moves to first node', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')

			// Focus a node in the middle
			await items.nth(3).focus()
			await page.keyboard.press('Home')
			await expect(items.first()).toBeFocused()
		})

		test('End moves to last visible node', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')

			await items.first().focus()
			await page.keyboard.press('End')
			await expect(items.last()).toBeFocused()
		})

		test('ArrowLeft on expanded node collapses it', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const nodes = tree.locator('[data-tree-node]')
			const firstItem = tree.locator('[data-tree-item-content]').first()

			// Tree starts expanded — first node is "src" with children
			const firstNode = nodes.first()
			await expect(firstNode).toHaveAttribute('data-tree-expanded')

			await firstItem.focus()
			await page.keyboard.press('ArrowLeft')

			// Node should collapse
			await expect(firstNode).not.toHaveAttribute('data-tree-expanded')
		})

		test('ArrowRight on collapsed node expands it', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const nodes = tree.locator('[data-tree-node]')
			const firstItem = tree.locator('[data-tree-item-content]').first()

			// Collapse first
			await firstItem.focus()
			await page.keyboard.press('ArrowLeft')
			await expect(nodes.first()).not.toHaveAttribute('data-tree-expanded')

			// Expand
			await page.keyboard.press('ArrowRight')
			await expect(nodes.first()).toHaveAttribute('data-tree-expanded')
		})

		test('Enter selects a node', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')

			// Navigate to a leaf node and select it
			await items.first().focus()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Enter')

			const activeNode = tree.locator('[data-tree-node][data-active]')
			await expect(activeNode).toHaveCount(1)
		})

		test('Space selects a node', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')

			await items.first().focus()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Space')

			const activeNode = tree.locator('[data-tree-node][data-active]')
			await expect(activeNode).toHaveCount(1)
		})
	})

	// ─── Mouse interaction ──────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click on item selects it', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const items = tree.locator('[data-tree-item-content]')
			await items.nth(2).click()

			const activeNodes = tree.locator('[data-tree-node][data-active]')
			await expect(activeNodes).toHaveCount(1)
		})

		test('click on toggle button expands/collapses node', async ({ page }) => {
			const tree = page.locator('[data-tree]')
			const firstNode = tree.locator('[data-tree-node]').first()
			const toggleBtn = firstNode.locator('[data-tree-toggle-btn]')

			// First node starts expanded
			await expect(firstNode).toHaveAttribute('data-tree-expanded')

			// Click toggle to collapse
			await toggleBtn.click()
			await expect(firstNode).not.toHaveAttribute('data-tree-expanded')

			// Click toggle to expand
			await toggleBtn.click()
			await expect(firstNode).toHaveAttribute('data-tree-expanded')
		})
	})

	// ─── Visual snapshots ───────────────────────────────────────────

	test.describe('visual snapshots', () => {
		for (const theme of themes) {
			for (const mode of modes) {
				test(`${theme}/${mode} - expanded state`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const tree = page.locator('[data-tree]')
					await expect(tree).toHaveScreenshot(`tree-${theme}-${mode}-expanded.png`)
				})

				test(`${theme}/${mode} - with selection`, async ({ page }) => {
					await setTheme(page, theme)
					await setMode(page, mode)

					const tree = page.locator('[data-tree]')
					const items = tree.locator('[data-tree-item-content]')
					await items.nth(2).click()

					await expect(tree).toHaveScreenshot(`tree-${theme}-${mode}-selected.png`)
				})
			}
		}
	})
})
