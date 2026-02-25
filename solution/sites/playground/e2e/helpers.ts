import type { Page } from '@playwright/test'

export const themes = ['rokkit', 'minimal', 'material', 'glass'] as const
export type Theme = (typeof themes)[number]

export const modes = ['light', 'dark'] as const
export type Mode = (typeof modes)[number]

/** Set theme by clicking the theme button in the Playground sidebar */
export async function setTheme(page: Page, theme: Theme) {
	const btn = page.locator('aside button', { hasText: new RegExp(`^${theme}$`, 'i') })
	await btn.click()
}

/** Set color mode directly on the document element */
export async function setMode(page: Page, mode: Mode) {
	await page.evaluate((m) => document.documentElement.setAttribute('data-mode', m), mode)
}

/** Navigate to a component page and wait for it to be ready */
export async function goToComponent(page: Page, component: string) {
	await page.goto(`/components/${component}`)
	await page.waitForLoadState('networkidle')
}
