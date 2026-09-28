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

/** Every kind `DEFAULT_ICONS` names, minus `matview` which is a declared alias. */
const KINDS = [
	'table',
	'view',
	'materialized_view',
	'function',
	'procedure',
	'trigger',
	'enum'
] as const

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

	test('the ER diagram admits ONLY table entities — no view, routine or trigger', async ({
		page
	}) => {
		// The whole ER/dependency split. A view is a derived projection and a routine is
		// behaviour; neither is an entity, and in dbd v2 neither has columns — so on an ER
		// canvas they render as orphan cards with nothing in them and no edges, which is what
		// this demo used to do.
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()

		for (const kind of ['view', 'materialized_view', 'matview', 'function', 'procedure', 'trigger']) {
			await expect(page.locator(`[data-graph-node][data-node-kind="${kind}"]`), kind).toHaveCount(0)
		}
		expect(await page.locator('[data-graph-node][data-node-kind="table"]').count()).toBeGreaterThan(
			0
		)
	})

	test('every ER node is connected — the diagram has no orphan', async ({ page }) => {
		// An orphan card in an ER diagram means the data put something there that has no
		// relationships, which is the symptom the split exists to remove.
		const orphans = await page.evaluate(() => {
			const edges = [...document.querySelectorAll('[data-graph-edge]')]
			const ends = new Set(
				edges.flatMap((e) => [e.getAttribute('data-edge-from'), e.getAttribute('data-edge-to')])
			)
			return [...document.querySelectorAll('[data-graph-node]')]
				.map((n) => n.getAttribute('data-graph-node') as string)
				.filter((id) => !ends.has(id))
		})

		expect(orphans).toEqual([])
	})

	test('the dependency view carries the entities and dbd’s verbs', async ({ page }) => {
		await page.goto('/app/graph?variant=schema-deps')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()

		for (const kind of ['view', 'materialized_view', 'function', 'procedure', 'trigger']) {
			expect(
				await page.locator(`[data-graph-node][data-node-kind="${kind}"]`).count(),
				kind
			).toBeGreaterThan(0)
		}

		// The coarse kind is what layouts branch on; the verb is what a reader and a theme see.
		await expect(page.locator('[data-graph-edge][data-edge-kind="reference"]')).toHaveCount(0)
		for (const verb of ['reads', 'writes', 'calls', 'member']) {
			expect(
				await page.locator(`[data-graph-edge][data-edge-relation="${verb}"]`).count(),
				verb
			).toBeGreaterThan(0)
		}
	})

	test('every node kind renders a DISTINCT icon, not a blank box', async ({ page }) => {
		// `i-graph-*` was defined in no config, collection or stylesheet, so every kind rendered
		// an identical empty 13x13 span while the class attribute looked perfectly correct.
		// Only a computed-style check in a real browser sees that.
		await page.goto('/app/graph?variant=schema-deps')
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()

		const icons = await page.evaluate(() => {
			const out: Record<string, string> = {}
			for (const n of document.querySelectorAll('[data-graph-node]')) {
				const kind = n.getAttribute('data-node-kind')
				const el = n.querySelector('[data-graph-node-icon]')
				if (!kind || !el || out[kind]) continue
				const cs = getComputedStyle(el)
				out[kind] = cs.maskImage !== 'none' ? cs.maskImage : cs.backgroundImage
			}
			return out
		})

		const kinds = Object.keys(icons)
		expect(kinds.length).toBeGreaterThan(4)
		for (const kind of kinds) expect(icons[kind], kind).not.toBe('none')
		expect(new Set(Object.values(icons)).size, 'each kind a different glyph').toBe(kinds.length)
	})

	test('a keyless entity says so at key density instead of only counting hidden rows', async ({
		page
	}) => {
		// An enum's labels are not keys, so at 'keys' its card collapses to a title plus
		// "+5 more" — indistinguishable from a card the reader collapsed, and reading as a
		// rendering failure rather than as a fact about the entity.
		await openControls(page)
		await setControl(page, 'Density', 'keys')

		const view = page.locator('[data-graph-node="public.order_status"] [data-graph-more]')
		await expect(view).toHaveText('no keys · 5 rows')

		// Italic is the visual half of the distinction and lives in the BUILT theme CSS, which
		// a component test cannot see — the point of asserting it out here.
		await expect(view).toHaveCSS('font-style', 'italic')

		const table = page.locator('[data-graph-node="public.orders"] [data-graph-more]')
		await expect(table).toHaveText(/^\+ \d+ more$/)
		await expect(table).toHaveCSS('font-style', 'normal')
	})

	test('a keyless card still expands to its rows', async ({ page }) => {
		await openControls(page)
		await setControl(page, 'Density', 'keys')

		// The schema is wider than the canvas, so it opens at a fit scale whose LOD tier hides
		// the more-row outright. Zooming in is what makes the control clickable at all — the
		// control is only an affordance once the reader is close enough to read it.
		const zoomIn = page.locator('[data-graph-zoom="in"]')
		for (let i = 0; i < 7; i++) await zoomIn.click()
		await expect(page.locator('[data-graph-paper]')).toHaveAttribute('data-graph-detail', 'full')

		const card = page.locator('[data-graph-node="public.order_status"]')
		await expect(card.locator('[data-graph-row]')).toHaveCount(0)

		await card.locator('[data-graph-more]').click()
		await expect(card.locator('[data-graph-row]')).toHaveCount(5)
		await expect(card.locator('[data-graph-more]')).toHaveText('show less')
	})

	test('switching to the neighborhood layout drops the clusters', async ({ page }) => {
		await page.locator('[data-graph-node]').first().click()
		await openControls(page)
		await setControl(page, 'Layout', 'neighborhood')

		await expect(page.locator('[data-graph-cluster]')).toHaveCount(0)
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
	})

	test('every preset node kind is rendered', async ({ page }) => {
		// The non-table kinds live in the DEPENDENCY view, not the ER one — a view and a routine
		// are not entities. `enum` stays on the ER side as a domain the columns reference.
		await page.goto('/app/graph?variant=schema-deps')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()

		for (const kind of KINDS) {
			await expect(page.locator(`[data-graph-node][data-node-kind="${kind}"]`).first(), kind)
				.toBeVisible()
		}
	})

	// Every style ships its own graph.css — each is self-contained, so a style with none
	// would render structure and no colour at all. Swept per style rather than pinned to one.
	for (const style of ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi'] as const) {
		test(`the ${style} theme tells the node kinds apart`, async ({ page }) => {
			await page.goto('/app/graph?variant=schema-deps')
			await expect(page.locator('[data-graph-explorer]')).toBeVisible()
			await setStyle(page, style)

			const accents = new Set<string>()
			for (const kind of KINDS) {
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

	test('the zoom controls are on the canvas and change the scale', async ({ page }) => {
		// On the canvas, not in a host app's drawer — driven here through the component's own
		// controls so this covers @rokkit/graph rather than the demo's chrome.
		const scaleOf = () =>
			page
				.locator('[data-graph-world]')
				.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)

		const fitted = await scaleOf()
		await page.locator('[data-graph-zoom="in"]').click()

		expect(await scaleOf()).toBeGreaterThan(fitted)

		await page.locator('[data-graph-zoom="reset"]').click()
		expect(await scaleOf()).toBeCloseTo(fitted, 3)
	})

	test('a zoomed diagram scrolls instead of clipping', async ({ page }) => {
		// Zoom is only usable if the overflow is reachable — the canvas scrolls and drags.
		for (let i = 0; i < 4; i++) await page.locator('[data-graph-zoom="in"]').click()

		const overflows = await page
			.locator('[data-graph-paper]')
			.evaluate((el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)

		expect(overflows).toBe(true)
	})

	test('ctrl+wheel zooms the diagram rather than the page', async ({ page }) => {
		// A trackpad pinch reports as ctrl+wheel. Without preventDefault the browser zooms
		// the whole page, which reads as the component ignoring the gesture.
		const scaleOf = () =>
			page
				.locator('[data-graph-world]')
				.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)

		const before = await scaleOf()
		await page.locator('[data-graph-paper]').dispatchEvent('wheel', {
			deltaY: -120,
			ctrlKey: true
		})

		expect(await scaleOf()).toBeGreaterThan(before)
	})

	test('all three examples are reachable as variant chips, not just via a control', async ({
		page
	}) => {
		// The variants were declared in meta and surfaced nowhere: the layout renders variant
		// chips only in its GENERIC demo branch, and graph has its own conversation component.
		for (const label of ['ER diagram', 'Schema dependencies', 'Call graph']) {
			await expect(page.getByRole('button', { name: label }), label).toBeVisible()
		}

		await page.getByRole('button', { name: 'Schema dependencies' }).click()
		await expect(page).toHaveURL(/variant=schema-deps/)
		await expect(page.locator('[data-graph-node][data-node-kind="view"]').first()).toBeAttached()

		await page.getByRole('button', { name: 'Call graph' }).click()
		await expect(page).toHaveURL(/variant=call-graph/)
		await expect(page.locator('[data-node-group="commerce"]').first()).toBeAttached()
	})

	test('a neighbourhood re-centres on the neighbour you click, so you can keep walking', async ({
		page
	}) => {
		// The interaction a call-graph reader actually performs: centre a symbol, look at what
		// calls it, step onto one of those, repeat. It works because `focus` defaults to the
		// selection — but nothing pinned it, so a future change to that default could quietly
		// turn the view into a dead end.
		await page.locator('[data-graph-node]').first().click()
		await openControls(page)
		await setControl(page, 'Layout', 'neighborhood')

		const focused = () => page.locator('[data-node-state="selected"]').getAttribute('data-graph-node')
		const before = await focused()

		await page.locator('[data-graph-node]:not([data-node-state="selected"])').first().click()

		expect(await focused()).not.toBe(before)
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
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
