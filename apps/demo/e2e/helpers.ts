import type { Page } from '@playwright/test'

export type Locale = 'en' | 'es' | 'ar'
export type Mode = 'light' | 'dark'
export type Style = 'zen-sumi' | 'rokkit' | 'minimal' | 'material' | 'frosted'
export type Density = 'compact' | 'comfortable' | 'cozy'
export type Radius = 'sharp' | 'soft' | 'rounded' | 'pill'

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
	await page.waitForTimeout(300)
}

/** Set theme style via data-style attribute on <body> */
export async function setStyle(page: Page, style: Style) {
	await page.evaluate((s) => document.body.setAttribute('data-style', s), style)
	await page.waitForTimeout(150)
}

/** Set density via data-density attribute on <body> */
export async function setDensity(page: Page, density: Density) {
	await page.evaluate((d) => document.body.setAttribute('data-density', d), density)
	await page.waitForTimeout(150)
}

/** Set corner radius via data-radius attribute on <body> */
export async function setRadius(page: Page, radius: Radius) {
	await page.evaluate((r) => document.body.setAttribute('data-radius', r), radius)
	await page.waitForTimeout(150)
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
