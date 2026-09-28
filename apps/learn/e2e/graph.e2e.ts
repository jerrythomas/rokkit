import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { setStyle } from './helpers'

/**
 * Covers what a unit test cannot: that each control visibly changes the render, that every
 * preset kind is distinguishable, and that the non-dbd dataset renders through field mapping
 * alone.
 *
 * Controls live in the composer's toggled details slab (same as chart and sparkline), so each
 * test that touches one opens the drawer first.
 */
const openControls = async (page: Page) => {
	await page.locator('.composer-tweak-toggle').click()
	await expect(page.locator('[data-graph-controls]')).toBeVisible()
}

/**
 * Scoped to [data-graph-controls] on purpose: the app shell has its own "Density" control, so
 * an unscoped getByLabel('Density') matches two elements and hangs on strict mode.
 */
const setControl = async (page: Page, label: string, value: string) => {
	await page.locator('[data-graph-controls]').getByLabel(label, { exact: true }).selectOption(value)
}

test.describe('graph demo', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app/graph')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()
	})

	test('renders nodes, edges and clusters', async ({ page }) => {
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
		await expect(page.locator('[data-graph-edge]').first()).toBeAttached()
		await expect(page.locator('[data-graph-cluster]').first()).toBeVisible()
	})

	test('density full shows more rows than density names', async ({ page }) => {
		await openControls(page)

		await setControl(page, 'Density', 'names')
		await expect(page.locator('[data-graph-row]')).toHaveCount(0)

		await setControl(page, 'Density', 'full')
		expect(await page.locator('[data-graph-row]').count()).toBeGreaterThan(0)
	})

	test('switching to the neighborhood layout drops the clusters', async ({ page }) => {
		await page.locator('[data-graph-node]').first().click()
		await openControls(page)
		await setControl(page, 'Layout', 'neighborhood')

		await expect(page.locator('[data-graph-cluster]')).toHaveCount(0)
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
	})

	test('every preset node kind is rendered', async ({ page }) => {
		for (const kind of ['table', 'view', 'matview', 'function', 'procedure', 'enum']) {
			await expect(page.locator(`[data-graph-node][data-node-kind="${kind}"]`).first(), kind)
				.toBeVisible()
		}
	})

	// Every style ships its own graph.css — each is self-contained, so a style with none
	// would render structure and no colour at all. Swept per style rather than pinned to one.
	for (const style of ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi'] as const) {
		test(`the ${style} theme tells the node kinds apart`, async ({ page }) => {
			await setStyle(page, style)

			const accents = new Set<string>()
			for (const kind of ['table', 'view', 'matview', 'function', 'procedure', 'enum']) {
				const node = page.locator(`[data-graph-node][data-node-kind="${kind}"]`).first()
				accents.add(
					await node.evaluate((el) =>
						getComputedStyle(el).getPropertyValue('--node-accent').trim()
					)
				)
			}

			// Rendered is not enough — the theme must actually distinguish them. zen-sumi is
			// deliberately the narrowest (single accent, ink tones elsewhere), so 1 would mean
			// the stylesheet never loaded rather than a deliberate choice.
			expect(accents.size, style).toBeGreaterThan(1)
		})

		test(`the ${style} theme paints the node card`, async ({ page }) => {
			// The failure this catches is a MISSING stylesheet: without one, the card keeps the
			// base structure and falls back to a transparent background, which reads as "looks
			// a bit plain" rather than as an error.
			await setStyle(page, style)

			const background = await page
				.locator('[data-graph-node]')
				.first()
				.evaluate((el) => getComputedStyle(el).backgroundColor)

			expect(background, style).not.toBe('rgba(0, 0, 0, 0)')
			expect(background, style).not.toBe('transparent')
		})
	}

	test('differentiating by pattern sets a pattern instead of a group fill', async ({ page }) => {
		await openControls(page)
		await setControl(page, 'Differentiate by', 'pattern')

		await expect(page.locator('[data-graph-cluster]').first()).toHaveAttribute(
			'style',
			/--group-pattern/
		)
	})

	test('the non-dbd dataset renders through field mapping alone', async ({ page }) => {
		await openControls(page)
		await setControl(page, 'Dataset', 'service-calls')

		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
		await expect(page.locator('[data-graph-edge]').first()).toBeAttached()
		// Its groups are teams, not schemas — proof the mapping drove it.
		await expect(page.locator('[data-node-group="commerce"]').first()).toBeAttached()
	})

	test('selecting a node highlights its edges and dims the rest', async ({ page }) => {
		await page.locator('[data-graph-node]').first().click()

		await expect(page.locator('[data-node-state="selected"]')).toHaveCount(1)
		await expect(page.locator('[data-edge-state="highlight"]').first()).toBeAttached()
		await expect(page.locator('[data-node-state="dim"]').first()).toBeAttached()
	})

	test('switching arrange visibly changes the layout', async ({ page }) => {
		const positions = () =>
			page
				.locator('[data-graph-node]')
				.evaluateAll((els) =>
					els.map((el) => `${(el as HTMLElement).style.left},${(el as HTMLElement).style.top}`).join('|')
				)

		await openControls(page)
		await setControl(page, 'Arrange', 'untangle')
		const untangled = await positions()

		await setControl(page, 'Arrange', 'a-z')
		expect(await positions()).not.toBe(untangled)
	})

	test('zooming in scales the diagram past its fit', async ({ page }) => {
		const scaleOf = () =>
			page
				.locator('[data-graph-world]')
				.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)

		const fitted = await scaleOf()

		await openControls(page)
		await setControl(page, 'Zoom', '2')

		expect(await scaleOf()).toBeCloseTo(fitted * 2, 3)
	})

	test('a zoomed diagram scrolls instead of clipping', async ({ page }) => {
		// Zoom with no pan gesture is only usable if the overflow is reachable. The canvas
		// scrolls, which a trackpad and a keyboard both drive.
		await openControls(page)
		await setControl(page, 'Zoom', '3')

		const overflows = await page
			.locator('[data-graph-paper]')
			.evaluate((el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)

		expect(overflows).toBe(true)
	})

	test('switching edge style changes the drawn path', async ({ page }) => {
		const firstPath = () =>
			page.locator('[data-graph-edge] path').first().getAttribute('d')

		await openControls(page)
		await setControl(page, 'Edge style', 'curved')
		const curved = await firstPath()

		await setControl(page, 'Edge style', 'orthogonal')
		expect(await firstPath()).not.toBe(curved)
	})

	test('a one-rule data-node-kind override actually changes the rendered colour', async ({
		page
	}) => {
		// The docs demonstrate the SYNTAX; this proves the mechanism — including the
		// specificity, which is the part a consumer gets wrong. Each style scopes its rules
		// under [data-style], so a bare `[data-node-kind='table']` is (0,1,1) against the
		// theme's (0,2,0) and silently loses. The documented snippet matches it.
		const table = page.locator('[data-graph-node][data-node-kind="table"]').first()
		const read = () =>
			table.evaluate((el) => getComputedStyle(el).getPropertyValue('--node-accent').trim())

		const before = await read()

		await page.addStyleTag({ content: "[data-node-kind='table'] { --node-accent: rgb(1, 2, 3); }" })
		expect(await read(), 'an under-specific override must NOT win').toBe(before)

		await page.addStyleTag({
			content: "[data-style] [data-node-kind='table'] { --node-accent: rgb(1, 2, 3); }"
		})
		expect(await read()).toBe('rgb(1, 2, 3)')
	})

	test('the entity table is keyboard reachable and drives the entity view', async ({ page }) => {
		await openControls(page)
		await setControl(page, 'View', 'entities')

		// Rows are @rokkit/ui Table rows with a roving tabindex — exactly one tab stop at rest.
		const rows = page.locator('[data-table-row]')
		await expect(rows.first()).toBeVisible()
		expect(
			await rows.evaluateAll((els) => els.filter((el) => (el as HTMLElement).tabIndex === 0).length)
		).toBe(1)

		await rows.first().focus()
		await page.keyboard.press('Enter')

		await setControl(page, 'View', 'entity')
		await expect(page.locator('[data-graph-entity]')).toBeVisible()
		await expect(page.locator('[data-graph-column]').first()).toBeVisible()
	})

	test('selection made in the diagram is what the entity view shows', async ({ page }) => {
		// One GraphState behind all three views — this is the claim that makes that visible.
		const node = page.locator('[data-graph-node]').first()
		const label = await node.locator('[data-graph-node-title]').innerText()
		await node.click()

		await openControls(page)
		await setControl(page, 'View', 'entity')

		await expect(page.locator('[data-graph-entity-title]')).toHaveText(label)
	})
})
