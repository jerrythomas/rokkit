import { test, expect, type Page } from '@playwright/test'
import {
	attachDiagnostics,
	formatDiagnostics,
	problemCount
} from './console-collector.mjs'

/**
 * Screen smoke gate — every screen renders, and does so without runtime noise.
 *
 * Each screen asserts three things:
 *   1. a marker element it can't render without actually appeared,
 *   2. the interaction below ran (where one is defined), and
 *   3. nothing landed on the console / pageerror / failed-request channels.
 *
 * The interactions are the point. A load-only sweep would pass whether or not
 * the code behind a screen works, so screens covering recently-refactored paths
 * DRIVE them: opening the Select dropdown runs its requestAnimationFrame focus
 * chain, typing in SearchFilter runs the operator tables, clicking a chart mark
 * runs buildSelectDetail, and so on. `interact` throwing fails the screen.
 *
 * Deliberately not a replacement for the feature specs — those assert what a
 * screen DOES. This one asserts that no screen is broken or shouting.
 */

type Screen = {
	path: string
	/** Something the screen cannot render without. */
	marker: string
	/** Exercise the code the screen exists for. Must throw if it can't. */
	interact?: (page: Page) => Promise<void>
	/** Why this screen is in the list, when it isn't obvious. */
	note?: string
}

const SCREENS: Screen[] = [
	{ path: '/', marker: 'main' },
	{ path: '/app', marker: 'main' },
	{ path: '/app/catalog', marker: 'main' },
	{ path: '/components', marker: 'main' },

	{
		path: '/app/select',
		marker: '[data-select-trigger]',
		note: 'Select.svelte — the open handler was split into handleOpened / focusFocusedItem / scrollIntoDropdown',
		interact: async (page) => {
			await page.locator('[data-select-trigger]').first().click()
			// The rAF focus chain runs here; if it throws, pageerror catches it.
			await expect(page.locator('[data-select-dropdown]').first()).toBeVisible()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Enter')
			await expect(page.locator('[data-select-dropdown]').first()).toBeHidden()
		}
	},
	{
		// The marker is the regression guard for the seeded selection: List derives
		// group expansion from the active value, so if `listValue` ever goes back to
		// null this screen fails with "never rendered its marker" — which is exactly
		// how the demo used to arrive, three collapsed headers and no items.
		path: '/app/list',
		marker: '[data-list-item]',
		note: 'seeded-selection first paint + navigator accordion-trigger branch and wrapper extend/range',
		interact: async (page) => {
			// Exactly one group open on arrival: the one holding the seeded item.
			await expect(page.locator('[data-list-group][aria-expanded="true"]')).toHaveCount(1)

			// Toggling a COLLAPSED header goes through navigator's
			// data-accordion-trigger path; the count going to 2 proves it expanded
			// that group without collapsing the seeded one.
			await page.locator('[data-list-group][aria-expanded="false"]').first().click()
			await expect(page.locator('[data-list-group][aria-expanded="true"]')).toHaveCount(2)

			// Selecting an item in the newly-opened group re-anchors expansion there
			// and collapses the rest. It has to be a DIFFERENT item than the seeded
			// one: expansion is recomputed by an effect on `value`, so re-selecting
			// the already-active row changes nothing and nothing would collapse.
			// This also covers List honouring `bind:value`: it writes the selection
			// back itself, so no onselect workaround is needed for the row to move.
			await page.locator('[data-list-item]').filter({ hasText: 'Theme' }).first().click()
			await expect(page.locator('[data-list-group][aria-expanded="true"]')).toHaveCount(1)
			await expect(
				page.locator('[data-list-item][data-active="true"]'),
				'selecting a row did not move the active item — is bind:value honoured?'
			).toHaveCount(1)

			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowUp')
		}
	},
	{
		path: '/app/multiselect',
		marker: 'main',
		note: 'wrapper #toggleSelected / #navigableSpan / #replaceSelection',
		interact: async (page) => {
			const trigger = page.locator('[data-multiselect-trigger], [data-select-trigger]').first()
			await trigger.click()
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('Enter')
			await page.keyboard.press('Escape')
		}
	},
	{
		path: '/app/tree',
		marker: 'main',
		note: 'navigator nested expand/collapse',
		interact: async (page) => {
			const node = page.locator('[data-tree-item-content], [data-tree-item]').first()
			await expect(node).toBeVisible()
			await node.click()
			await page.keyboard.press('ArrowRight')
			await page.keyboard.press('ArrowDown')
			await page.keyboard.press('ArrowLeft')
		}
	},
	{ path: '/app/tree-table', marker: 'main', note: 'data/nest.js walkSegments config+acc split' },
	{ path: '/app/toolbar', marker: 'main', note: 'toolbar navigator' },

	{
		path: '/app/chart',
		marker: '[data-plot-geom]',
		note: 'chart geoms + buildSelectDetail named-bag signature',
		interact: async (page) => {
			const geom = page.locator('[data-plot-geom]').first()
			await expect(geom).toBeVisible()
			// Clicking a mark runs the geom's onselect → buildSelectDetail({...}).
			const mark = page.locator('[data-plot-geom] circle, [data-plot-geom] rect, [data-plot-geom] path').first()
			await mark.click({ force: true, position: { x: 2, y: 2 } })
		}
	},
	{
		path: '/app/sparkline',
		marker: 'svg',
		note: 'Sparkline highlightIndices — $derived.by + seen.add() became $derived(new Set(flatMap))'
	},
	{
		path: '/app/search-filter',
		marker: '[data-search-filter] input',
		note: 'matchesFilter — NUMERIC_OPS / TEXT_OPS tables replacing a complexity-24 chain',
		interact: async (page) => {
			const input = page.locator('[data-search-filter] input').first()
			// Exercises the text path, then the numeric path, then a regex-free
			// free-text search across every cell (no column named).
			await input.fill('role:engineer')
			await page.keyboard.press('Enter')
			await input.fill('age>30')
			await page.keyboard.press('Enter')
			await input.fill('active')
			await page.keyboard.press('Enter')
		}
	},
	{
		path: '/app/code-group',
		marker: 'main',
		note: 'CodeGroup insertPath + Object.create(null) lookup'
	},
	{
		path: '/app/theming',
		marker: 'main',
		note: 'data/skins.ts rewriteSkinStyle → overrideDeclarations + cssBlock'
	},
	{ path: '/app/lock-mode', marker: 'main', note: 'actions/themable syncWithStorage + applyThemeAttrs' },
	{
		path: '/app/markdown-renderer',
		marker: 'main',
		note: 'blocks FormPlugin sanitiseLookup allowlist + PlotPlugin specSummary/buildExportSvg'
	},
	{ path: '/app/form', marker: 'main' },
	{ path: '/app/palette-manager', marker: 'main' },
	{ path: '/app/table', marker: 'main' },
	{ path: '/app/tabs', marker: 'main' },
	{ path: '/app/menu', marker: 'main' },

	{
		path: '/chat',
		marker: 'main',
		note: 'chat-demo parse.ts / infer.ts / router.ts'
	},

	{ path: '/guides/getting-started', marker: 'main' },
	{
		path: '/guides/charts',
		marker: 'main',
		note: 'live plot fences → PlotPlugin, and the guide type scale'
	},
	{ path: '/guides/forms', marker: 'main', note: 'live form fences → FormPlugin' },
	{ path: '/guides/theming', marker: 'main' },

	{ path: '/embed/gallery?style=rokkit&mode=light&skin=default', marker: '.gallery' },
	{ path: '/embed/states?style=minimal&mode=dark&skin=ocean', marker: '[data-state-harness]' }
]

for (const screen of SCREENS) {
	test(`screen: ${screen.path}`, async ({ page, baseURL }, testInfo) => {
		const found = attachDiagnostics(page)

		const response = await page.goto(`${baseURL ?? 'http://localhost:4173'}${screen.path}`, {
			waitUntil: 'networkidle',
			timeout: 20_000
		})
		expect(response?.status(), `${screen.path} did not return 2xx/3xx`).toBeLessThan(400)

		await expect(
			page.locator(screen.marker).first(),
			`${screen.path} never rendered its marker (${screen.marker})`
		).toBeVisible({ timeout: 10_000 })

		if (screen.interact) await screen.interact(page)

		// Give a mid-flight effect or a late chunk a chance to fail loudly before
		// we declare the screen clean.
		await page.waitForTimeout(150)

		if (problemCount(found) > 0) {
			await testInfo.attach('diagnostics.txt', {
				body: formatDiagnostics(screen.path, found),
				contentType: 'text/plain'
			})
		}

		expect(
			problemCount(found),
			`Runtime problems on ${screen.path}${screen.note ? ` (${screen.note})` : ''}:\n${formatDiagnostics(screen.path, found)}`
		).toBe(0)
	})
}
