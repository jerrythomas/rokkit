/**
 * Computed-style snapshot collector for the state-pattern migration (#153).
 *
 * Drives the isolated /embed/states fixture across every style × mode and
 * records, for each declared state case, the computed values that encode the
 * component's LOOK — colour, fill, mark, border, outline, weight — for every
 * element in the case's subtree plus its ::before/::after.
 *
 * This is the only gate that can prove "no visual regression" for a retokening
 * exercise. e2e/theme-contrast.e2e.ts measures WCAG contrast, which is blind to
 * a mark changing from a 2px inset bar to a gradient fill; the repo has no
 * pixel-level visual-regression suite (packages/ui/browser/README.md is explicit
 * that browser-mode tests are layout-only).
 *
 * The fixture page owns the case matrix; this module discovers cases from the
 * DOM. Adding a case (or a whole component) means editing the page only.
 *
 * Functions named `inPage*` are serialized into the browser by page.evaluate and
 * must not reference module scope — everything they need arrives as an argument.
 */

export const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
export const MODES = ['light', 'dark']

/**
 * Two skins, and the second one is load-bearing.
 *
 * `default` is what ships. But it maps BOTH `primary` and `accent` to the same
 * palette (`shu`) — see apps/learn/rokkit.config.js — so under `default` alone
 * `var(--accent)` and `var(--primary)` compute to an identical colour. That is
 * precisely the substitution a retokening is most likely to make by accident
 * (`--state-current-mark: var(--primary)` where the theme said `var(--accent)`),
 * and it would sail through a default-only snapshot. Proven, not assumed: the
 * first break-it check made exactly that edit to minimal/list.css and the
 * default-only gate passed.
 *
 * `ocean` maps primary/secondary/accent to three distinct palettes
 * (teal/emerald/sky), so a token swap moves a real value. Two skins is the
 * minimum that pins both the shipped appearance and token IDENTITY.
 *
 * Density stays default — it drives spacing, and spacing is not measured here.
 */
export const SKINS = ['default', 'ocean']

/** Single-value properties read verbatim off the computed style. */
const SIMPLE_PROPS = [
	'color',
	'background-color',
	'background-image',
	'box-shadow',
	'outline-width',
	'outline-style',
	'outline-color',
	'opacity',
	'font-weight',
	'text-decoration-line'
]

/**
 * Values that carry no signal. Pruned from the output so the baseline diff shows
 * only what a theme actually declares. Pruning is applied identically when
 * generating and when comparing, so it can never mask a change — it only
 * shrinks the file and makes diffs legible.
 *
 * `color` is never pruned: it is the primary signal for every state.
 */
const NEUTRAL = {
	'background-color': 'rgba(0, 0, 0, 0)',
	'background-image': 'none',
	'box-shadow': 'none',
	'outline-style': 'none',
	'outline-width': '0px',
	opacity: '1',
	'font-weight': '400',
	'text-decoration-line': 'none',
	'border-width': '0px',
	'border-style': 'none'
}

// ─── In-page collectors ──────────────────────────────────────────────────────

/** In-page: the case matrix the fixture declares, in DOM order. */
export function inPageReadCases() {
	return [...document.querySelectorAll('[data-state-id]')].map((el) => ({
		id: el.dataset.stateId,
		spec: JSON.parse(el.dataset.stateSpec || '{}')
	}))
}

/**
 * In-page: apply every case's static attribute overrides (the `set` clause).
 * Throws when a selector matches nothing — a silently skipped `set` would mean a
 * state we believe is covered is actually measured in its idle form, which is
 * exactly the kind of hole this harness exists to prevent.
 */
export function inPageApplyStaticAttrs() {
	let applied = 0
	for (const el of document.querySelectorAll('[data-state-id]')) {
		const spec = JSON.parse(el.dataset.stateSpec || '{}')
		for (const [selector, attr, value] of spec.set ?? []) {
			const target = el.querySelector(selector)
			if (!target) {
				throw new Error(`state-harness: ${el.dataset.stateId} — set selector matched nothing: ${selector}`)
			}
			target.setAttribute(attr, value)
			applied++
		}
	}
	return applied
}

/** In-page: focus one element inside a case. Returns true when focus landed. */
export function inPageFocus({ id, selector }) {
	const root = document.querySelector(`[data-state-id="${id}"]`)
	const el = root?.querySelector(selector)
	if (!el) throw new Error(`state-harness: ${id} — focus target not found: ${selector}`)
	el.focus()
	return document.activeElement === el
}

/**
 * In-page: confirm the interaction actually put the element in the intended
 * pseudo-class. Without this, a selector typo or an actionability quirk would
 * leave the case measuring its IDLE styles while the baseline claimed to cover
 * hover/focus/pressed — a gate that cannot fail is worth nothing.
 */
export function inPageAssertPseudo({ id, selector, pseudo }) {
	const root = document.querySelector(`[data-state-id="${id}"]`)
	const el = root?.querySelector(selector)
	if (!el) throw new Error(`state-harness: ${id} — element not found: ${selector}`)
	if (!el.matches(pseudo)) {
		throw new Error(`state-harness: ${id} — ${selector} does not match ${pseudo}; the case would measure idle styles`)
	}
	return true
}

/** In-page: drop focus so the next case starts without a stray :focus-within. */
export function inPageBlur() {
	const el = document.activeElement
	if (el && el !== document.body && typeof el.blur === 'function') el.blur()
	return document.activeElement?.tagName ?? null
}

/**
 * In-page: measure one case. Returns { [path]: "prop: value; prop: value" },
 * one entry per element (and per rendered pseudo-element).
 *
 * Paths are structural — `0:list/0:list-item/1:item-text/0:item-label` — built
 * from each element's first non-harness `data-*` hook plus its index among its
 * siblings. Structural rather than hand-picked so a sub-element added to
 * ItemContent later shows up as a NEW baseline key (a visible diff) instead of
 * silently going unmeasured.
 */
export function inPageMeasure({ id, measure, simpleProps, neutral }) {
	const root = document.querySelector(`[data-state-id="${id}"]`)
	if (!root) throw new Error(`state-harness: case not found: ${id}`)

	// The list container (self only — its descendants are covered below) plus the
	// subtree the case is ABOUT. The decoy item that holds focus for the
	// `-groupfocus` cases is deliberately not measured: its own styling is
	// already pinned by the dedicated `idle` and `focus` cases, so measuring it
	// here would double every baseline entry to restate them.
	const list = root.querySelector('[data-list]')
	const subject = root.querySelector(measure)
	if (!list) throw new Error(`state-harness: ${id} — no [data-list] rendered`)
	if (!subject) throw new Error(`state-harness: ${id} — measure selector matched nothing: ${measure}`)
	const targets = [list, subject, ...subject.querySelectorAll('*')]

	const hookOf = (el) => {
		for (const a of el.attributes) {
			if (!a.name.startsWith('data-')) continue
			if (a.name.startsWith('data-state') || a.name.startsWith('data-sveltekit')) continue
			return a.name.slice('data-'.length)
		}
		return el.tagName.toLowerCase()
	}

	const pathOf = (el) => {
		const parts = []
		for (let n = el; n && n !== root; n = n.parentElement) {
			parts.unshift(`${[...n.parentElement.children].indexOf(n)}:${hookOf(n)}`)
		}
		return parts.join('/')
	}

	// Icon utilities inline their SVG as a data: URI. Eliding keeps a
	// background-image change visible (the property still appears) without
	// dumping kilobytes of base64 into the committed baseline.
	const elide = (v) => v.replace(/url\("data:[^"]*"\)/g, 'url("data:…")')

	// Border longhands are read individually rather than via the shorthand:
	// computed-style shorthand serialization is not guaranteed by CSSOM. Sides
	// collapse to one value when they agree, so the common `0px` stays compact
	// and zen-sumi's `border-left-width: 2px` still reads as `0px 0px 0px 2px`.
	const fourSides = (cs, prop) => {
		const vals = ['top', 'right', 'bottom', 'left'].map((s) =>
			cs.getPropertyValue(`border-${s}-${prop}`)
		)
		return vals.every((v) => v === vals[0]) ? vals[0] : vals.join(' ')
	}

	const read = (el, pseudo) => {
		const cs = getComputedStyle(el, pseudo)
		// An unrendered pseudo-element still reports a full computed style; only
		// `content` reveals whether it paints. minimal's list guide line is
		// `[data-list]::before { background: var(--paper-edge) }`, so pseudos are
		// genuinely part of the look and cannot be skipped wholesale.
		if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return null

		const entries = simpleProps.map((p) => [p, elide(cs.getPropertyValue(p))])
		for (const p of ['width', 'style', 'color']) entries.push([`border-${p}`, fourSides(cs, p)])

		// A border/outline that paints nothing makes its style and colour
		// meaningless. Both are set on every element by the UnoCSS preflight
		// (`border: 0 solid #e5e7eb`, `outline-width: 3px` with
		// `outline-style: none`), so keeping them would put four constant
		// properties on all ~3400 baseline entries and bury the real signal.
		const noBorder = entries.find(([k]) => k === 'border-width')?.[1] === neutral['border-width']
		const noOutline = entries.find(([k]) => k === 'outline-style')?.[1] === neutral['outline-style']

		const kept = entries.filter(([k, v]) => {
			if (!v) return false
			if (k === 'color') return true
			if (noBorder && (k === 'border-style' || k === 'border-color')) return false
			if (noOutline && (k === 'outline-width' || k === 'outline-color')) return false
			return v !== neutral[k]
		})
		return kept.map(([k, v]) => `${k}: ${v}`).join('; ')
	}

	const out = {}
	for (const el of targets) {
		const path = pathOf(el)
		out[path] = read(el, null)
		for (const pseudo of ['::before', '::after']) {
			const v = read(el, pseudo)
			if (v !== null) out[`${path}${pseudo}`] = v
		}
	}
	return out
}

// ─── Driver ──────────────────────────────────────────────────────────────────

/**
 * Snapshot one style × mode. Cases are measured in DOM order; hover and focus
 * are cleared between cases so no case inherits the previous one's state.
 */
export async function snapshotConfig(page, base, { style, mode, skin }) {
	await page.goto(`${base}/embed/states?style=${style}&skin=${skin}&mode=${mode}`, {
		waitUntil: 'networkidle',
		timeout: 20000
	})
	await page.waitForSelector('[data-state-id] [data-list-item]')
	await page.evaluate(inPageApplyStaticAttrs)

	const cases = await page.evaluate(inPageReadCases)
	if (!cases.length) throw new Error(`state-harness: /embed/states declared no cases`)

	const sink = page.locator('[data-state-sink]')
	const rows = {}

	for (const { id, spec } of cases) {
		// Reset: park the pointer off every case, drop focus.
		await sink.hover()
		await page.evaluate(inPageBlur)

		const target = spec.on ? page.locator(`[data-state-id="${id}"] ${spec.on}`) : null

		if (spec.interact === 'hover') {
			await target.hover()
			await page.evaluate(inPageAssertPseudo, { id, selector: spec.on, pseudo: ':hover' })
		} else if (spec.interact === 'focus') {
			const landed = await page.evaluate(inPageFocus, { id, selector: spec.on })
			if (!landed) throw new Error(`state-harness: ${id} — focus did not land on ${spec.on}`)
			await page.evaluate(inPageAssertPseudo, { id, selector: spec.on, pseudo: ':focus' })
		} else if (spec.interact === 'press') {
			await target.hover()
			await page.mouse.down()
			await page.evaluate(inPageAssertPseudo, { id, selector: spec.on, pseudo: ':active' })
		}

		const measured = await page.evaluate(inPageMeasure, {
			id,
			measure: spec.measure,
			simpleProps: SIMPLE_PROPS,
			neutral: NEUTRAL
		})

		if (spec.interact === 'press') {
			// Release OFF the item: a mouseup over the button would fire click,
			// and the Navigator would select the item — mutating the fixture
			// mid-run. Moving first makes the release a no-op.
			await sink.hover()
			await page.mouse.up()
		}

		for (const [path, props] of Object.entries(measured)) {
			rows[`${style}/${mode}/${skin}/${id}/${path}`] = props
		}
	}
	return rows
}

/** Snapshot the whole style × mode × skin matrix into one flat, sorted map. */
export async function snapshotAll(page, base) {
	const merged = {}
	for (const style of STYLES) {
		for (const mode of MODES) {
			for (const skin of SKINS) {
				Object.assign(merged, await snapshotConfig(page, base, { style, mode, skin }))
			}
		}
	}
	return Object.fromEntries(Object.entries(merged).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
}

/** Diff two snapshots into a flat list of changed / added / removed keys. */
export function diffSnapshots(baseline, current) {
	const keys = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort()
	const diffs = []
	for (const key of keys) {
		const was = baseline[key]
		const now = current[key]
		if (was === now) continue
		if (was === undefined) diffs.push({ key, kind: 'added', was: '—', now })
		else if (now === undefined) diffs.push({ key, kind: 'removed', was, now: '—' })
		else diffs.push({ key, kind: 'changed', was, now })
	}
	return diffs
}

/** Render a markdown report of a snapshot diff. */
export function formatDiff(diffs, base) {
	const lines = [
		`# List state snapshot diff (${base})`,
		'',
		`Matrix: ${STYLES.length} styles × ${MODES.length} modes × ${SKINS.length} skins (${SKINS.join(', ')})`,
		''
	]
	if (!diffs.length) {
		lines.push('✅ Computed styles match the baseline exactly.')
		return lines.join('\n')
	}
	const byKind = { changed: 0, added: 0, removed: 0 }
	for (const d of diffs) byKind[d.kind]++
	lines.push(
		`## ${diffs.length} differences (${byKind.changed} changed, ${byKind.added} added, ${byKind.removed} removed)`,
		'',
		'| key | kind | baseline | current |',
		'|---|---|---|---|'
	)
	for (const d of diffs) {
		lines.push(`| \`${d.key}\` | ${d.kind} | \`${d.was}\` | \`${d.now}\` |`)
	}
	return lines.join('\n')
}
