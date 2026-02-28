import type { Page } from '@playwright/test'

export const modes = ['light', 'dark'] as const
export type Mode = (typeof modes)[number]

/** Navigate to a component's Play page and wait for it to be ready */
export async function goToPlayPage(page: Page, component: string) {
	await page.goto(`/elements/${component}/play`)
	await page.waitForLoadState('networkidle')
}

/** Set color mode directly on the document element */
export async function setMode(page: Page, mode: Mode) {
	await page.evaluate((m) => document.documentElement.setAttribute('data-mode', m), mode)
}
