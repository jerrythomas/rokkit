/**
 * Page coverage tests — every doc page must:
 *   1. Load without error (h1 visible, non-empty)
 *   2. Show the article content area
 *   3. Show the sidebar navigation list
 */
import { test, expect } from '@playwright/test'

// ─── Page inventory ───────────────────────────────────────────────────────────
// All routes with a +page.svelte under (learn)/docs, excluding /play sub-routes
// (those are playground embeds, covered by component e2e tests)

const GETTING_STARTED = [
	'/docs/getting-started/introduction',
	'/docs/getting-started/installation',
	'/docs/getting-started/quick-start'
]

const DATA_BINDING = [
	'/docs/data-binding/overview',
	'/docs/data-binding/field-mapping',
	'/docs/data-binding/data-sources'
]

const COMPOSABILITY = ['/docs/composability/overview', '/docs/composability/snippets']

const THEMING = [
	'/docs/theming/overview',
	'/docs/theming/color-system',
	'/docs/theming/styling',
	'/docs/theming/density',
	'/docs/theming/whitelabeling'
]

const ACCESSIBILITY = [
	'/docs/accessibility/overview',
	'/docs/accessibility/keyboard-navigation',
	'/docs/accessibility/tooltips',
	'/docs/accessibility/i18n'
]

const TOOLCHAIN = [
	'/docs/toolchain/overview',
	'/docs/toolchain/cli',
	'/docs/toolchain/icon-sets'
]

const UTILITIES = [
	'/docs/utilities/overview',
	'/docs/utilities/state-management',
	'/docs/utilities/navigator',
	'/docs/utilities/controllers',
	'/docs/utilities/icons',
	'/docs/utilities/connector',
	'/docs/utilities/reveal',
	'/docs/utilities/shine',
	'/docs/utilities/tilt',
	'/docs/utilities/custom-primitives'
]

const FORMS = [
	'/docs/forms',
	'/docs/forms/conditional-fields',
	'/docs/forms/multi-step'
]

const CHARTS = [
	'/docs/charts/overview',
	'/docs/charts/bar-chart',
	'/docs/charts/line-chart',
	'/docs/charts/sparkline',
	'/docs/charts/scatter',
	'/docs/charts/pie-donut',
	'/docs/charts/interactivity',
	'/docs/charts/animation',
	'/docs/charts/accessibility'
]

const COMPONENTS = [
	'/docs/components/avatar',
	'/docs/components/badge',
	'/docs/components/breadcrumbs',
	'/docs/components/button',
	'/docs/components/calendar',
	'/docs/components/card',
	'/docs/components/carousel',
	'/docs/components/code',
	'/docs/components/data-table',
	'/docs/components/divider',
	'/docs/components/drop-down',
	'/docs/components/floating-action',
	'/docs/components/floating-navigation',
	'/docs/components/forms',
	'/docs/components/grid',
	'/docs/components/item',
	'/docs/components/lazy-tree',
	'/docs/components/list',
	'/docs/components/menu',
	'/docs/components/message',
	'/docs/components/multi-select',
	'/docs/components/palette-manager',
	'/docs/components/pill',
	'/docs/components/progress',
	'/docs/components/range',
	'/docs/components/rating',
	'/docs/components/select',
	'/docs/components/stack',
	'/docs/components/stepper',
	'/docs/components/switch',
	'/docs/components/table',
	'/docs/components/tabs',
	'/docs/components/timeline',
	'/docs/components/toggle',
	'/docs/components/toolbar',
	'/docs/components/tree',
	'/docs/components/upload-progress',
	'/docs/components/upload-target'
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function checkPage(page: any, url: string) {
	await page.goto(url)
	await page.waitForLoadState('networkidle')

	// h1 must be visible and non-empty
	const h1 = page.locator('main h1').first()
	await expect(h1).toBeVisible()
	const heading = await h1.textContent()
	expect(heading?.trim().length).toBeGreaterThan(0)

	// Article content area must be present
	await expect(page.locator('[data-article-root]')).toBeVisible()

	// Sidebar nav list must be rendered
	const sidebar = page.locator('aside[aria-label="Site navigation"]')
	await expect(sidebar).toBeVisible()
	const navList = sidebar.locator('[data-list]')
	await expect(navList).toBeVisible()
	// Groups render as data-list-group, leaves as data-list-item; both have data-path
	const navItems = navList.locator('[data-path]')
	const count = await navItems.count()
	expect(count).toBeGreaterThan(0)
}

// ─── Test suites ─────────────────────────────────────────────────────────────

test.describe('Getting Started pages', () => {
	for (const url of GETTING_STARTED) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Data Binding pages', () => {
	for (const url of DATA_BINDING) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Composability pages', () => {
	for (const url of COMPOSABILITY) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Theming pages', () => {
	for (const url of THEMING) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Accessibility pages', () => {
	for (const url of ACCESSIBILITY) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Toolchain pages', () => {
	for (const url of TOOLCHAIN) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Utilities pages', () => {
	for (const url of UTILITIES) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Forms pages', () => {
	for (const url of FORMS) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Charts pages', () => {
	for (const url of CHARTS) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})

test.describe('Components pages', () => {
	for (const url of COMPONENTS) {
		test(`${url} has content and navigation`, async ({ page }) => {
			await checkPage(page, url)
		})
	}
})
