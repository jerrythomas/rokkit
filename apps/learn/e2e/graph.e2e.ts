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

/**
 * Pick a diagram by name.
 *
 * A diagram carries its own dataset, so this is the whole choice — the demo no longer has a
 * separate dataset picker that could be pointed at a component the data does not suit.
 */
const setDiagram = async (page: Page, id: string) => {
	await openControls(page)
	await setControl(page, 'Diagram', id)
	await expect(page.locator('[data-graph-explorer]')).toBeVisible()
}

/** Density lives ON the canvas now, as a control the diagram publishes. */
const setDensity = async (page: Page, value: string) => {
	await page.locator(`[data-graph-density="${value}"]`).click()
}

/** Open the demo directly on one diagram, which is what a variant chip does. */
const openDiagram = async (page: Page, variant: string) => {
	await page.goto(`/app/graph?variant=${variant}`)
	await expect(page.locator('[data-graph-explorer]')).toBeVisible()
}

test.describe('graph demo', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/app/graph')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()
	})

	test('the ER diagram renders nodes and the edges between them', async ({ page }) => {
		// No cluster boxes: `flow` ranks by reference direction, and grouping wants the same
		// axis. Schema shows through `groupTint` instead — asserted separately below.
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
		await expect(page.locator('[data-graph-edge]').first()).toBeAttached()
		await expect(page.locator('[data-graph-cluster]')).toHaveCount(0)
	})

	test('the ER diagram tints its cards by schema, since it has no group boxes', async ({
		page
	}) => {
		await expect(page.locator('[data-graph-group-tint]')).toBeAttached()
		await expect(page.locator('[data-graph-node][data-node-group="public"]').first()).toBeAttached()
	})

	test('density full shows more rows than density names', async ({ page }) => {
		await setDensity(page, 'names')
		await expect(page.locator('[data-graph-row]')).toHaveCount(0)

		await setDensity(page, 'full')
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
		await setDensity(page, 'keys')

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
		await setDensity(page, 'keys')
		// Controls off: they are an OVERLAY, so at this zoom the card being tested sits under
		// the zoom bar and the bar takes the click. Turning them off is the point of them
		// being opt-in — and it keeps this case about the card rather than about z-order.
		await openControls(page)
		await setControl(page, 'On-canvas controls', 'off')

		// The schema is wider than the canvas, so it opens at a fit scale whose LOD tier hides
		// the more-row outright. Zooming in is what makes the control clickable at all — the
		// control is only an affordance once the reader is close enough to read it.
		// Ctrl+wheel rather than the button bar, which is now off: the canvas owns the gesture
		// whether or not anyone rendered a control for it.
		const paper = page.locator('[data-graph-paper]')
		for (let i = 0; i < 7; i++) {
			await paper.dispatchEvent('wheel', { deltaY: -100, ctrlKey: true })
		}
		await expect(paper).toHaveAttribute('data-graph-detail', 'full')

		const card = page.locator('[data-graph-node="public.order_status"]')
		await expect(card.locator('[data-graph-row]')).toHaveCount(0)

		await card.locator('[data-graph-more]').click()
		await expect(card.locator('[data-graph-row]')).toHaveCount(5)
		await expect(card.locator('[data-graph-more]')).toHaveText('show less')
	})

	/* The two-level clustering and cluster-ordering cases lived here only because the old demo
	   exposed a `cluster` layout with `Group by` and `Arrange` pickers. The demo now offers
	   named diagrams, none of which is that arrangement, so there is no UI to drive — the
	   behaviour itself is pinned in packages/graph/spec/layout/{cluster,nested}.spec.ts, which
	   assert the exact pixel output rather than merely that something rendered. */



	test('the codebase renders as a treemap, sized by a real measure', async ({ page }) => {
		// 470 modules and 801 imports generated from this repo — the dataset the world layout
		// exists for, and the only one in the demo with containment more than two deep.
		await page.goto('/app/graph?variant=treemap')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()

		// A box per package, each holding its own modules.
		const outer = page.locator('[data-graph-cluster][data-cluster-depth="0"]')
		expect(await outer.count()).toBeGreaterThan(8)

		// Every box is a cluster at every depth — a treemap nests ONE shape. A leaf is marked by
		// carrying the node it is, not by being a different element: rendering leaves as node
		// cards put a card's furniture inside a hierarchy of label boxes, down to a row count
		// that reads `0` for anything without rows, which is every module here.
		await expect(page.locator('[data-graph-node]')).toHaveCount(0)
		expect(
			await page.locator('[data-graph-cluster][data-graph-node-id]').count()
		).toBeGreaterThan(50)

		// Area encodes declarations, so the boxes must NOT all be the same size — an even
		// split is what a measure the tree does not understand produces.
		const areas = await outer.evaluateAll((els) =>
			els.map((el) => (el as HTMLElement).offsetWidth * (el as HTMLElement).offsetHeight)
		)
		expect(Math.max(...areas) / Math.min(...areas)).toBeGreaterThan(3)
	})

	test('no treemap label spills out of the box it names', async ({ page }) => {
		// A label wider than its box ran across the neighbours, and two of them interleaved into
		// one unreadable string — `UTILS.JS · 1INDEX.JS · 11` was two boxes. Measured on screen,
		// after the fit transform, because that is where the overflow actually happens.
		await page.goto('/app/graph?variant=treemap')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()

		const spills = await page
			.locator('[data-graph-cluster]')
			.evaluateAll((boxes) =>
				boxes
					.map((box) => {
						const label = box.querySelector('[data-graph-cluster-label]')
						if (!label || getComputedStyle(label).display === 'none') return null
						const b = box.getBoundingClientRect()
						const l = label.getBoundingClientRect()
						// A box narrower (or shorter) than the label's own inset truncates to nothing.
						// There is no text on screen, so there is nothing to spill — only a rectangle
						// of zero width, or zero height, sitting past the edge.
						if (l.width === 0 || l.height === 0) return null

						// 1px for sub-pixel rounding at a fractional fit scale.
						return l.right > b.right + 1 || l.bottom > b.bottom + 1
							? `${label.textContent} in ${b.width.toFixed(0)}x${b.height.toFixed(0)}`
							: null
					})
					.filter(Boolean)
			)

		expect(spills).toEqual([])
	})

	test('zooming in reveals more of the treemap labels, rather than all-or-nothing', async ({
		page
	}) => {
		// Labels ellipsise instead of disappearing, and the budget is in counter-scaled units,
		// so each zoom step buys characters. A pixel-threshold `display: none` made visibility a
		// property of the DATA instead: a small box was nameless at every zoom, because a
		// container query measures canvas units and zooming does not change those.
		await page.goto('/app/graph?variant=treemap')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()

		const textWidth = () =>
			page
				.locator('[data-graph-cluster-label]')
				.evaluateAll((els) =>
					els.reduce((total, el) => total + el.getBoundingClientRect().width, 0)
				)

		const atFit = await textWidth()
		for (let i = 0; i < 4; i++) {
			await page.locator('[data-graph-zoom-controls] button', { hasText: '+' }).click()
		}
		const zoomedIn = await textWidth()

		expect(atFit).toBeGreaterThan(0)
		expect(zoomedIn).toBeGreaterThan(atFit * 1.3)
	})

	test('the treemap offers no density control, which would change nothing', async ({ page }) => {
		// A box here has no row list to thin. A control that moves while the picture does not
		// reads as a broken view rather than as one that does not apply.
		await page.goto('/app/graph?variant=treemap')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()

		await expect(page.locator('[data-graph-density-controls]')).toHaveCount(0)
		await openControls(page)
		// Scoped to the demo's own panel: the site chrome has a global DENSITY control of its
		// own, and an unscoped getByLabel matches that instead — passing, or in this case
		// failing, for a reason that has nothing to do with the graph.
		await expect(
			page.locator('[data-graph-controls]').getByLabel('Density', { exact: true })
		).toHaveCount(0)
	})

	test.describe('the flow layout makes links traceable', () => {
		/* Raised from this diagram: incoming should always enter on the LEFT and outgoing leave
		 * from the RIGHT, and the boxes should be arranged so links are not buried behind
		 * entities. Measured on the ER diagram before the layout existed: 5 of 9 edges passed
		 * over a card that was not one of their endpoints. */

		/** Edges whose path crosses a card that is neither of its endpoints. */
		const buriedEdges = (page: Page) =>
			page.evaluate(() => {
				const cards = [...document.querySelectorAll('[data-graph-node]')].map((el) => ({
					id: el.getAttribute('data-graph-node'),
					r: el.getBoundingClientRect()
				}))

				return [...document.querySelectorAll('[data-graph-edge]')].filter((g) => {
					const e = g.querySelector('path')!.getBoundingClientRect()
					const from = g.getAttribute('data-edge-from')
					const to = g.getAttribute('data-edge-to')

					return cards.some(
						({ id, r }) =>
							id !== from &&
							id !== to &&
							!(r.right < e.x || r.x > e.right || r.bottom < e.y || r.y > e.bottom)
					)
				}).length
			})

		/* The 5-of-9 -> 2-of-9 measurement that justified this layout compared it against the
		   schema-grouped `cluster` arrangement, which the demo no longer offers as a diagram —
		   so there is no UI to drive both halves from. The claim and its numbers are recorded
		   in docs/design/25-flow-layout.md, and the properties that produce it (ranking, fixed
		   ports, crossing reduction) are pinned in packages/graph/spec/layout/flow.spec.ts.
		   What remains testable here is that no link is buried, asserted below. */


		test('leaves every source on the right and enters every target on the left', async ({
			page
		}) => {
			// Direction readable from the geometry, with no arrowhead to follow. `cluster` picks
			// a side by relative POSITION, so there an exit side says where the other box sits.
			await openControls(page)
			await setControl(page, 'Diagram', 'er')

			const wrongSide = await page.evaluate(() => {
				const box = (id: string | null) =>
					document.querySelector(`[data-graph-node="${id}"]`)?.getBoundingClientRect()

				return [...document.querySelectorAll('[data-graph-edge]')].filter((g) => {
					const from = box(g.getAttribute('data-edge-from'))
					const to = box(g.getAttribute('data-edge-to'))
					if (!from || !to || from === to) return false
					const dot = g.querySelector('[data-graph-edge-dot="from"]')!.getBoundingClientRect()
					const head = g.querySelector('[data-graph-edge-arrow]')?.getBoundingClientRect()
					if (!head) return false

					// 2px of tolerance for stroke width and the fit scale's rounding.
					return Math.abs(dot.x + dot.width / 2 - from.right) > 2 ||
						Math.abs(head.x + head.width / 2 - to.left) > 2
				}).length
			})

			expect(wrongSide).toBe(0)
		})
	})

	test('the call graph opens radial, with no two nodes stacked', async ({ page }) => {
		// `points` shelf-packed it into group boxes and at seven services that already read as a
		// stack: tiny rects with each label colliding with the row beneath.
		await page.goto('/app/graph?variant=call-graph')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()
		await expect(page.locator('[data-graph-world]')).toHaveAttribute('data-graph-layout', 'radial')

		const overlaps = await page.locator('[data-graph-node]').evaluateAll((els) => {
			const r = els.map((el) => el.getBoundingClientRect())
			let hits = 0
			for (let i = 0; i < r.length; i++) {
				for (let j = i + 1; j < r.length; j++) {
					const [a, b] = [r[i], r[j]]
					if (!(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top))
						hits++
				}
			}
			return hits
		})

		expect(overlaps).toBe(0)
	})

	test('a radial node is a DOT, not a card with its chrome overflowing', async ({ page }) => {
		// The dot treatment keys on `data-graph-node-shape`, so `radial` inherited the whole of
		// it by declaring a shape rather than by naming itself in fifteen selectors.
		await page.goto('/app/graph?variant=call-graph')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()

		await expect(page.locator('[data-graph-world]')).toHaveAttribute('data-graph-node-shape', 'dot')
		await expect(page.locator('[data-graph-node]').first().locator('[data-graph-more]')).toHaveCSS(
			'display',
			'none'
		)
	})

	test('the sunburst draws wedges that carry their package’s colour', async ({ page }) => {
		// Looked up by its own name every descendant falls through to the default, which left
		// the outer ring uniformly grey under a correctly coloured inner one.
		await page.goto('/app/graph?variant=treemap')
		await expect(page.locator('[data-graph-explorer]')).toBeVisible()
		await openControls(page)
		await setControl(page, 'Diagram', 'sunburst')

		const wedges = page.locator('[data-graph-wedge]')
		expect(await wedges.count()).toBeGreaterThan(20)

		const fillsByDepth = await wedges.evaluateAll((els) => {
			const out: Record<string, string[]> = {}
			for (const el of els) {
				const d = el.getAttribute('data-cluster-depth') ?? '0'
				;(out[d] ??= []).push(getComputedStyle(el).fill)
			}
			return Object.fromEntries(Object.entries(out).map(([d, f]) => [d, [...new Set(f)]]))
		})

		// Both rings carry several distinct colours — not one ring coloured and one grey.
		expect(fillsByDepth['0'].length).toBeGreaterThan(3)
		expect(fillsByDepth['1'].length).toBeGreaterThan(3)
	})

	test('the structure view bundles a codebase’s imports through its hierarchy', async ({
		page
	}) => {
		// The view `CallTree` could not be: a call graph's own spanning tree has hundreds of
		// roots over a real repo. Containment is a real tree, and the calls are drawn ON it.
		await openDiagram(page, 'structure')
		await expect(page.locator('[data-graph-world]')).toHaveAttribute(
			'data-graph-layout',
			'structure'
		)

		// Opens at ONE level: the packages themselves on the rim, which is the readable view.
		// No bands at this depth — the leaves ARE the regions, so there is nothing left to
		// annotate — and only the imports that actually cross a package boundary survive.
		const leaves = await page.locator('[data-graph-node]').count()
		expect(leaves).toBeGreaterThan(8)
		expect(leaves).toBeLessThan(30)
		await expect(page.locator('[data-graph-wedge]')).toHaveCount(0)
		expect(await page.locator('[data-graph-edge]').count()).toBeGreaterThan(50)
	})

	test('at one level the package names are actually readable', async ({ page }) => {
		// The complaint this answers: unreadable even at 400% zoom, because every one of 435
		// files was on the rim and the depth control only drew rings.
		await openDiagram(page, 'structure')

		const titles = page.locator('[data-graph-node-title]')
		await expect(titles.first()).toBeVisible()

		// Counter-scaled, so a label is legible at the fitted scale rather than 5px wide.
		const widths = await titles.evaluateAll((els) =>
			els.map((el) => el.getBoundingClientRect().width)
		)
		expect(Math.max(...widths)).toBeGreaterThan(20)
	})

	test('the bundling toggle visibly changes every edge', async ({ page }) => {
		await openDiagram(page, 'structure')

		const first = () => page.locator('[data-graph-edge] path').first().getAttribute('d')
		const bundled = await first()

		await page.locator('[data-graph-bundle]').click()
		const straight = await first()

		expect(straight).not.toBe(bundled)

		// Not a segment count: at zero tension the control points are COLLINEAR rather than
		// fewer, so both paths have the same number of curves and only the coordinates move.
		// What is testable is that the straight one hugs the chord between its endpoints.
		const sag = (d: string | null) =>
			page.evaluate((path) => {
				const svg = document.querySelector('[data-graph-world] svg') as SVGSVGElement
				const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
				el.setAttribute('d', path!)
				svg.appendChild(el)
				const len = el.getTotalLength()
				const a = el.getPointAtLength(0)
				const b = el.getPointAtLength(len)
				const mid = el.getPointAtLength(len / 2)
				el.remove()

				// Distance from the curve's midpoint to the straight chord between its ends.
				return Math.hypot(mid.x - (a.x + b.x) / 2, mid.y - (a.y + b.y) / 2)
			}, d)

		expect(await sag(straight)).toBeLessThan(await sag(bundled))
	})

	test('depth controls how many ancestor bands the structure draws', async ({ page }) => {
		// The control that makes a whole repo legible — show the crates, then go deeper.
		await openDiagram(page, 'structure')
		const bands = () => page.locator('[data-graph-wedge]').count()

		// One level puts the packages on the rim with nothing above them to annotate; three
		// puts every file there, under two rings of bands.
		await page.locator('[data-graph-depth="1"]').click()
		expect(await bands()).toBe(0)
		const shallowLeaves = await page.locator('[data-graph-node]').count()

		await page.locator('[data-graph-depth="3"]').click()
		expect(await bands()).toBeGreaterThan(0)
		expect(await page.locator('[data-graph-node]').count()).toBeGreaterThan(shallowLeaves)
	})

	test('switching to the neighborhood layout drops the clusters', async ({ page }) => {
		await page.locator('[data-graph-node]').first().click()
		await openControls(page)
		await setControl(page, 'Diagram', 'neighborhood')

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
		// On the CARDS now: `flow` has no cluster boxes for the ramp to land on, which is the
		// whole reason `groupTint` exists.
		await openControls(page)
		await setControl(page, 'Differentiate by', 'pattern')

		await expect(page.locator('[data-graph-node]').first()).toHaveAttribute(
			'style',
			/--group-pattern/
		)
	})

	test('the non-dbd dataset renders through field mapping alone', async ({ page }) => {
		await openControls(page)
		await setControl(page, 'Diagram', 'calls')

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

	test('every example is reachable as a variant chip, not just via a control', async ({
		page
	}) => {
		// The variants were declared in meta and surfaced nowhere: the layout renders variant
		// chips only in its GENERIC demo branch, and graph has its own conversation component.
		for (const label of ['ER diagram', 'Schema dependencies', 'Call tree', 'Treemap']) {
			await expect(page.getByRole('button', { name: label }), label).toBeVisible()
		}

		await page.getByRole('button', { name: 'Schema dependencies' }).click()
		await expect(page).toHaveURL(/variant=schema-deps/)
		await expect(page.locator('[data-graph-node][data-node-kind="view"]').first()).toBeAttached()

		await page.getByRole('button', { name: 'Call tree' }).click()
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
		await openDiagram(page, 'neighbourhood')
		await page.locator('[data-graph-node]').first().click()

		const focused = () => page.locator('[data-node-state="selected"]').getAttribute('data-graph-node')
		const before = await focused()

		await page.locator('[data-graph-node]:not([data-node-state="selected"])').first().click()

		expect(await focused()).not.toBe(before)
		await expect(page.locator('[data-graph-node]').first()).toBeVisible()
	})

	test('switching edge style changes the drawn path', async ({ page }) => {
		const firstPath = () =>
			page.locator('[data-graph-edge] path').first().getAttribute('d')

		// A toggle the ER diagram publishes on its own canvas, not a select in someone's
		// drawer — which is what makes it absent from a diagram that draws no edges.
		const curved = await firstPath()

		await page.locator('[data-graph-edge-style]').click()
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
