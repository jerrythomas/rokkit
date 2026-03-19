import type { Page, Locator } from '@playwright/test'

export const themes = ['rokkit', 'minimal', 'material', 'glass'] as const
export type Theme = (typeof themes)[number]

export const modes = ['light', 'dark'] as const
export type Mode = (typeof modes)[number]

/** Navigate to a component's Playground page and wait for it to be ready */
export async function goToPlayPage(page: Page, component: string) {
	await page.goto(`/playground/components/${component}`)
	await page.waitForLoadState('networkidle')
}

/** Set theme via the Dropdown in the PlaySection toolbar */
export async function setTheme(page: Page, theme: Theme) {
	const themeDropdown = page.locator('[data-toolbar] [data-dropdown]')
	await themeDropdown.locator('[data-dropdown-trigger]').click()
	const option = page.locator('[data-dropdown-panel] [data-dropdown-option]').filter({
		hasText: new RegExp(`^${theme}$`, 'i')
	})
	await option.click()
}

/** Set color mode directly on the document element */
export async function setMode(page: Page, mode: Mode) {
	await page.evaluate((m) => document.documentElement.setAttribute('data-mode', m), mode)
}

export interface DropdownLocators {
	trigger: Locator
	dropdown: Locator
	items: Locator
}

/** Focus the trigger, press ArrowDown to open, and return the key locators */
export async function openDropdownViaKeyboard(
	page: Page,
	triggerSelector: string,
	dropdownSelector: string,
	itemSelector: string
): Promise<DropdownLocators> {
	const trigger = page.locator(triggerSelector).first()
	await trigger.focus()
	await page.keyboard.press('ArrowDown')
	const dropdown = page.locator(dropdownSelector).first()
	const items = dropdown.locator(itemSelector)
	return { trigger, dropdown, items }
}
