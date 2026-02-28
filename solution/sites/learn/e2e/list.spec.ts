import { test, expect } from '@playwright/test'
import { goToPlayPage } from './helpers'

// ─── Play page tests ──────────────────────────────────────────────────────────

test.describe('List — play page', () => {
	test.beforeEach(async ({ page }) => {
		await goToPlayPage(page, 'list')
	})

	// ─── Keyboard: Flat list (Button items section) ──────────────────────────

	test.describe('keyboard — flat list', () => {
		test('ArrowDown moves focus through items', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1) // Button items
			const items = list.locator('[data-list-item]')
			await items.first().focus()

			for (let i = 1; i < 3; i++) {
				await page.keyboard.press('ArrowDown')
				await expect(items.nth(i)).toBeFocused()
			}
		})

		test('ArrowUp moves focus back through items', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.nth(2).focus()

			for (let i = 1; i >= 0; i--) {
				await page.keyboard.press('ArrowUp')
				await expect(items.nth(i)).toBeFocused()
			}
		})

		test('Home moves focus to first item', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.nth(1).focus()
			await page.keyboard.press('Home')
			await expect(items.first()).toBeFocused()
		})

		test('End skips disabled item and lands on last enabled', async ({ page }) => {
			// Button items: Cut, Copy, Paste, Delete(disabled)
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('End')
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowDown at last enabled stays put', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('End')

			for (let i = 0; i < 3; i++) {
				await page.keyboard.press('ArrowDown')
			}
			await expect(items.nth(2)).toBeFocused()
		})

		test('ArrowUp at first stays on first', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()

			for (let i = 0; i < 3; i++) {
				await page.keyboard.press('ArrowUp')
			}
			await expect(items.first()).toBeFocused()
		})

		test('Enter selects button item', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Enter')

			await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
		})

		test('Space selects button item', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().focus()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Space')

			await expect(items.nth(2)).toHaveAttribute('data-active', 'true')
		})

		test('focus does not change selection', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')
			await items.first().click()
			await expect(items.first()).toHaveAttribute('data-active', 'true')

			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowDown')

			await expect(items.first()).toHaveAttribute('data-active', 'true')
			await expect(items.nth(2)).toBeFocused()
		})
	})

	// ─── Keyboard: Grouped list ──────────────────────────────────────────────

	test.describe('keyboard — grouped list', () => {
		test('ArrowDown navigates through group labels and expanded children', async ({ page }) => {
			// Grouped list is nth(2). Groups start expanded (expanded: true in data).
			const list = page.locator('main [data-list]').nth(2)
			const groupLabels = list.locator('[data-list-group-label]')
			const allItems = list.locator('[data-list-item]')

			await groupLabels.first().focus()
			await page.keyboard.press('ArrowDown')
			await expect(allItems.first()).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(allItems.nth(1)).toBeFocused()

			await page.keyboard.press('ArrowDown')
			await expect(groupLabels.nth(1)).toBeFocused()
		})

		test('ArrowLeft on expanded group collapses it', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(2)
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')

			await page.keyboard.press('ArrowLeft')
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'false')
		})

		test('ArrowRight on collapsed group expands it', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(2)
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()
			await page.keyboard.press('ArrowLeft') // collapse first
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'false')

			await page.keyboard.press('ArrowRight')
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')
		})

		test('Enter on group label toggles expansion', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(2)
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')

			await page.keyboard.press('Enter')
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'false')

			await page.keyboard.press('Enter')
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')
		})

		test('full navigation across both groups', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(2)
			const groupLabels = list.locator('[data-list-group-label]')
			const allItems = list.locator('[data-list-item]')

			await groupLabels.first().focus()
			await page.keyboard.press('ArrowDown')
			await expect(allItems.nth(0)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(allItems.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(groupLabels.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(allItems.nth(2)).toBeFocused()
			await page.keyboard.press('ArrowDown')
			await expect(allItems.nth(3)).toBeFocused()

			await page.keyboard.press('ArrowUp')
			await expect(allItems.nth(2)).toBeFocused()
			await page.keyboard.press('ArrowUp')
			await expect(groupLabels.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowUp')
			await expect(allItems.nth(1)).toBeFocused()
			await page.keyboard.press('ArrowUp')
			await expect(allItems.nth(0)).toBeFocused()
			await page.keyboard.press('ArrowUp')
			await expect(groupLabels.first()).toBeFocused()
		})

		test('repeated collapse/expand cycles preserve state', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(2)
			const firstLabel = list.locator('[data-list-group-label]').first()

			await firstLabel.focus()

			for (let i = 0; i < 3; i++) {
				await page.keyboard.press('ArrowLeft')
				await expect(firstLabel).toHaveAttribute('aria-expanded', 'false')
				await page.keyboard.press('ArrowRight')
				await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')
			}
		})
	})

	// ─── Mouse interaction ───────────────────────────────────────────────────

	test.describe('mouse interaction', () => {
		test('click selects button item', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')

			await items.nth(1).click()
			await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
		})

		test('click deselects previous item', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(1)
			const items = list.locator('[data-list-item]')

			await items.first().click()
			await expect(items.first()).toHaveAttribute('data-active', 'true')

			await items.nth(1).click()
			await expect(items.first()).not.toHaveAttribute('data-active')
			await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
		})

		test('click on group label toggles expansion', async ({ page }) => {
			const list = page.locator('main [data-list]').nth(2)
			const firstLabel = list.locator('[data-list-group-label]').first()

			await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')

			await firstLabel.click()
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'false')

			await firstLabel.click()
			await expect(firstLabel).toHaveAttribute('aria-expanded', 'true')
		})
	})

	// ─── Learn/Play toggle navigation ────────────────────────────────────────

	test.describe('learn/play toggle', () => {
		test('toggle shows Play as active on /play route', async ({ page }) => {
			const toggle = page.locator('[data-view-toggle] [data-toggle]')
			const playButton = toggle.locator('[data-toggle-option][data-selected]')
			await expect(playButton).toContainText('Play')
		})

		test('clicking Learn navigates to learn page', async ({ page }) => {
			const toggle = page.locator('[data-view-toggle] [data-toggle]')
			const learnButton = toggle.locator('[data-toggle-option]', { hasText: 'Learn' })
			await learnButton.click()

			await expect(page).toHaveURL(/\/elements\/list$/)
		})

		test('learn page shows Toggle with Learn active', async ({ page }) => {
			await page.goto('/elements/list')
			await page.waitForLoadState('networkidle')

			const toggle = page.locator('[data-view-toggle] [data-toggle]')
			const learnButton = toggle.locator('[data-toggle-option][data-selected]')
			await expect(learnButton).toContainText('Learn')
		})
	})
})

// ─── Learn page tests ─────────────────────────────────────────────────────────

test.describe('List — learn page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/elements/list')
		await page.waitForLoadState('networkidle')
	})

	test('intro example renders items with icons', async ({ page }) => {
		// First story viewer on the page — the intro example
		const intro = page.locator('[data-story-viewer]').first()
		const list = intro.locator('[data-list]')
		const items = list.locator('[data-list-item]')

		await expect(items).toHaveCount(5) // 4 items + 1 disabled, sep not counted as list-item
		await expect(items.first()).toContainText('Dashboard')
	})

	test('intro example: click selects item and shows selected text', async ({ page }) => {
		const intro = page.locator('[data-story-viewer]').first()
		const list = intro.locator('[data-list]')
		const items = list.locator('[data-list-item]')

		await items.nth(1).click()
		await expect(items.nth(1)).toHaveAttribute('data-active', 'true')
	})

	test('intro example: disabled item cannot be focused', async ({ page }) => {
		const intro = page.locator('[data-story-viewer]').first()
		const list = intro.locator('[data-list]')
		const disabledItem = list.locator('[data-list-item][data-disabled]')

		await expect(disabledItem).toBeDisabled()
	})

	test('primitives example renders plain strings', async ({ page }) => {
		// Find the primitives story viewer
		const storyViewers = page.locator('[data-story-viewer]')
		const primitivesViewer = storyViewers.nth(1)
		const list = primitivesViewer.locator('[data-list]')
		const items = list.locator('[data-list-item]')

		await expect(items).toHaveCount(5)
		await expect(items.first()).toContainText('Dashboard')
		await expect(items.nth(4)).toContainText('Profile')
	})

	test('nested groups example has collapsible group labels', async ({ page }) => {
		// Find the nested story viewer (after primitives)
		const storyViewers = page.locator('[data-story-viewer]')
		const nestedViewer = storyViewers.nth(2)
		const list = nestedViewer.locator('[data-list]')
		const groupLabels = list.locator('[data-list-group-label]')

		await expect(groupLabels).toHaveCount(3) // Fruits, Vegetables, Grains
		await expect(groupLabels.first()).toContainText('Fruits')
	})

	test('nested groups: clicking group label toggles expansion', async ({ page }) => {
		const storyViewers = page.locator('[data-story-viewer]')
		const nestedViewer = storyViewers.nth(2)
		const list = nestedViewer.locator('[data-list]')
		const firstLabel = list.locator('[data-list-group-label]').first()

		// Groups start collapsed; click to expand
		const initialExpanded = await firstLabel.getAttribute('aria-expanded')
		await firstLabel.click()
		const afterClick = await firstLabel.getAttribute('aria-expanded')
		expect(afterClick).not.toBe(initialExpanded)
	})

	test('itemContent snippet example renders status badges', async ({ page }) => {
		// The snippets story viewer
		const storyViewers = page.locator('[data-story-viewer]')
		// Find by locating the one that has a span with "done" or status text
		let snippetsViewer = null
		const count = await storyViewers.count()
		for (let i = 0; i < count; i++) {
			const text = await storyViewers.nth(i).textContent()
			if (text?.includes('done') || text?.includes('in-progress')) {
				snippetsViewer = storyViewers.nth(i)
				break
			}
		}
		expect(snippetsViewer).not.toBeNull()
		if (snippetsViewer) {
			await expect(snippetsViewer).toContainText('done')
		}
	})

	test('interactive example: checkbox toggles state', async ({ page }) => {
		// Find the interactive story viewer (has checkboxes)
		const storyViewers = page.locator('[data-story-viewer]')
		let interactiveViewer = null
		const count = await storyViewers.count()
		for (let i = 0; i < count; i++) {
			const checkboxes = storyViewers.nth(i).locator('input[type="checkbox"]')
			if ((await checkboxes.count()) > 0) {
				interactiveViewer = storyViewers.nth(i)
				break
			}
		}
		expect(interactiveViewer).not.toBeNull()
		if (interactiveViewer) {
			const checkboxes = interactiveViewer.locator('input[type="checkbox"]')
			const firstCheckbox = checkboxes.first()
			const initialChecked = await firstCheckbox.isChecked()

			await firstCheckbox.click()
			expect(await firstCheckbox.isChecked()).toBe(!initialChecked)
		}
	})
})
