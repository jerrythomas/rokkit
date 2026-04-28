import type { Page } from '@playwright/test'

export type Locale = 'en' | 'es' | 'ar'
export type Mode = 'light' | 'dark'

const localePrefix: Record<Locale, string> = {
	en: '',
	es: '/es',
	ar: '/ar'
}

/**
 * Navigate to a demo app page in the given locale.
 * English has no URL prefix; Spanish uses /es; Arabic uses /ar.
 */
export async function goTo(page: Page, path: string, locale: Locale = 'en') {
	const prefix = localePrefix[locale]
	await page.goto(`${prefix}${path}`)
	await page.waitForLoadState('networkidle')
	await waitForFonts(page)
}

/** Set color mode via data-mode attribute on <body> */
export async function setMode(page: Page, mode: Mode) {
	await page.evaluate((m) => document.body.setAttribute('data-mode', m), mode)
	// Let CSS transitions settle
	await page.waitForTimeout(300)
}

/**
 * Wait for custom fonts to be loaded.
 * Prevents snapshots from capturing fallback fonts.
 */
async function waitForFonts(page: Page) {
	await page.evaluate(() => document.fonts.ready)
}

/**
 * Get the text direction for a locale.
 * Arabic is RTL, all others are LTR.
 */
export function textDirection(locale: Locale): 'ltr' | 'rtl' {
	return locale === 'ar' ? 'rtl' : 'ltr'
}
