/**
 * Interaction-state contrast harness.
 *
 * The resting-state audit (contrast-collector.mjs) measures the gallery as it
 * loads. That is blind to every state a user actually produces: hover, focus,
 * keyboard focus, press — and the combined "group is focused AND this row is
 * hovered". Those states routinely swap BOTH the fill and the text colour, so a
 * pairing that passes at rest can fail badly under the pointer. Measured, not
 * assumed: zen-sumi in dark mode pairs `text-ink-mute` with `bg-paper-mute` on
 * every hover, which is 4.07:1 — while the same text at rest sits on `paper` at
 * 5.33:1 and sails through the resting audit.
 *
 * ── How a state is synthesised ────────────────────────────────────────────────
 *
 * Playwright can hover exactly one element per pass, and cannot produce `:focus`
 * plus `:hover` on different elements at once. CDP's `CSS.forcePseudoState` can,
 * but costs one round trip per node per pass.
 *
 * Instead this harness REWRITES the stylesheets in place: every `:hover` in a
 * selector becomes `[data-fh]`, every `:focus-visible` becomes `[data-ffv]`, and
 * so on. `rule.selectorText = …` preserves the rule's position in the cascade
 * and an attribute selector has identical specificity to a pseudo-class (0,1,0),
 * so the substitution is cascade-neutral: whatever would have won under a real
 * pointer still wins. Stamping `data-fh` on an element then puts it in the hover
 * state exactly, for every rule in every sheet, with no round trips.
 *
 * That fidelity is load-bearing here, because the defect this harness was
 * written to catch IS a cascade defect: zen-sumi's
 * `[data-toggle-option]:hover:not(:disabled):not([data-disabled='true'])` scores
 * (0,5,0) against `[data-toggle-option][data-selected='true']`'s (0,3,0), so
 * hovering the selected option erases its fill. An approach that changed
 * specificity would hide precisely this.
 *
 * ── What gets measured ───────────────────────────────────────────────────────
 *
 * Targets are not hand-listed. They are derived from the stylesheets: for every
 * rule that declares an interaction state, the harness works out which compound
 * in the selector carries the pseudo-class (the "subject"), queries the gallery
 * for elements matching it, and measures that element and its descendants. So
 * the covered set is exactly the set of interaction states the themes declare —
 * it grows on its own as themes grow, and rules matching nothing are reported as
 * coverage gaps rather than silently passing.
 */

import { collectContrast, FORCE_ATTRS } from './contrast-collector.mjs'

export { STYLES, MODES, SKINS } from './contrast-collector.mjs'

/**
 * Pseudo-class → stand-in attribute. ORDER IS SIGNIFICANT: `:focus-visible` and
 * `:focus-within` must be substituted before `:focus`, or a plain-prefix match
 * would corrupt them into `[data-ff]-visible`.
 */
export const PSEUDO_MAP = [
	[':focus-visible', '[data-ffv]'],
	[':focus-within', '[data-ffw]'],
	[':focus', '[data-ff]'],
	[':hover', '[data-fh]'],
	[':active', '[data-fa]']
]

/**
 * The states to audit, each declared as the attributes to stamp on the subject
 * and on its ancestors. Ancestor propagation mirrors the real pseudo-classes:
 * `:hover` and `:active` match every ancestor of the pointed element, `:focus`
 * matches only the focused element while `:focus-within` climbs, and
 * `:focus-visible` implies `:focus`.
 *
 * `subject` names the attribute whose rules define this state's target set, so
 * `hover` and `focus-hover` share targets but realise different states.
 *
 * `focus-hover` is not a luxury: themes gate their strongest active-row styling
 * on `[data-list]:focus-within [data-active]:hover`, a state every keyboard user
 * hits the moment they touch the mouse. Without it those rules are never
 * measured by anything.
 */
export const STATES = [
	{ id: 'hover', subject: 'data-fh', self: ['data-fh'], anc: ['data-fh'] },
	{ id: 'focus', subject: 'data-ff', self: ['data-ff', 'data-ffw'], anc: ['data-ffw'] },
	{
		id: 'focus-visible',
		subject: 'data-ffv',
		self: ['data-ffv', 'data-ff', 'data-ffw'],
		anc: ['data-ffw']
	},
	{ id: 'active', subject: 'data-fa', self: ['data-fa', 'data-fh'], anc: ['data-fa', 'data-fh'] },
	{
		id: 'focus-hover',
		subject: 'data-fh',
		self: ['data-fh', 'data-ff', 'data-ffw'],
		anc: ['data-fh', 'data-ffw']
	}
]

// ─── In-page steps ───────────────────────────────────────────────────────────

/**
 * In-page: substitute every interaction pseudo-class in every stylesheet with
 * its stand-in attribute. Returns counts so the caller can assert the rewrite
 * actually happened — a silently skipped rewrite would leave every subsequent
 * pass measuring resting styles while reporting hover coverage.
 */
export function inPageRewritePseudos({ map }) {
	let rewritten = 0
	let unreadable = 0

	const visit = (rules) => {
		for (const rule of rules) {
			if (rule.cssRules) visit(rule.cssRules) // @media / @supports / @container
			if (typeof rule.selectorText !== 'string') continue
			let next = rule.selectorText
			for (const [pseudo, attr] of map) next = next.split(pseudo).join(attr)
			if (next === rule.selectorText) continue
			try {
				rule.selectorText = next
				rewritten++
			} catch {
				unreadable++
			}
		}
	}

	for (const sheet of document.styleSheets) {
		try {
			visit(sheet.cssRules)
		} catch {
			unreadable++ // cross-origin sheet — not ours
		}
	}
	return { rewritten, unreadable }
}

/**
 * In-page: discover the subjects for one state, stamp the state onto them, and
 * mark them with `data-fsub` so the measurement pass can scope to them.
 *
 * Returns coverage bookkeeping: which subject selectors matched elements and
 * which matched nothing. An unmatched selector is a rule the gallery cannot
 * exercise (a dropdown that is closed, a disabled variant nobody renders) — a
 * real blind spot, reported rather than hidden.
 */
export function inPageApplyState({ subject, self, anc, style, within = null }) {
	// Split a complex selector into compounds plus the combinators between them,
	// respecting parentheses so `:not(a, b)` and `:is(x > y)` stay intact.
	const split = (sel) => {
		const compounds = []
		let buf = ''
		let depth = 0
		let combinator = ''
		const flush = () => {
			if (buf) compounds.push({ combinator, sel: buf })
			buf = ''
		}
		for (let i = 0; i < sel.length; i++) {
			const c = sel[i]
			if (c === '(' || c === '[') depth++
			else if (c === ')' || c === ']') depth--
			if (depth === 0 && (c === ' ' || c === '>' || c === '+' || c === '~')) {
				if (buf) {
					flush()
					combinator = c === ' ' ? ' ' : c
				} else if (c !== ' ') {
					combinator = c
				}
				continue
			}
			buf += c
		}
		flush()
		return compounds
	}

	// Top-level comma split — a rule may carry several selectors, only some of
	// which declare this state.
	const commaSplit = (sel) => {
		const out = []
		let buf = ''
		let depth = 0
		for (const c of sel) {
			if (c === '(' || c === '[') depth++
			else if (c === ')' || c === ']') depth--
			if (c === ',' && depth === 0) {
				out.push(buf)
				buf = ''
				continue
			}
			buf += c
		}
		out.push(buf)
		return out.map((s) => s.trim()).filter(Boolean)
	}

	const FORCE_RE = /\[data-f(?:h|f|fv|fw|a|sub)\]/g
	const token = `[${subject}]`

	// The subject is the compound carrying the state's attribute. Everything up to
	// and including it selects the element to stamp; the trailing part of the
	// selector (`… :hover [data-tabs-icon]`) describes a descendant, which the
	// measurement pass picks up because it walks the subject's subtree.
	const subjectSelector = (sel) => {
		const compounds = split(sel)
		let last = -1
		for (let i = 0; i < compounds.length; i++) if (compounds[i].sel.includes(token)) last = i
		if (last < 0) return null
		// Other force attributes in the prefix belong to states this pass does not
		// realise (e.g. the `:focus-within` half of a focus-within+hover rule).
		// Stripping them still finds the right element; whether the rule ends up
		// applying is then decided by which attributes this pass stamps.
		return compounds
			.slice(0, last + 1)
			.map((c, i) => (i === 0 ? c.sel : `${c.combinator === ' ' ? ' ' : ` ${c.combinator} `}${c.sel}`))
			.join('')
			.replace(FORCE_RE, '')
			.trim()
	}

	const matched = new Set()
	const unmatched = new Set()
	const subjects = new Set()

	const consider = (selectorText) => {
		for (const one of commaSplit(selectorText)) {
			if (!one.includes(token)) continue
			// A rule scoped to a different style can never apply here; counting it as
			// a coverage gap would bury the real gaps under four styles of noise.
			const scoped = one.match(/\[data-style=['"]?([\w-]+)['"]?\]/)
			if (scoped && scoped[1] !== style) continue
			const sub = subjectSelector(one)
			if (!sub) continue
			let els = []
			try {
				const root = within ? document.querySelector(within) : document
				if (!root) continue
				els = [...root.querySelectorAll(sub)].filter((el) => el.closest('[data-gallery-comp]'))
			} catch {
				continue // selector we cannot re-parse — not a coverage claim either way
			}
			if (!els.length) {
				unmatched.add(sub)
				continue
			}
			matched.add(sub)
			for (const el of els) subjects.add(el)
		}
	}

	const visit = (rules) => {
		for (const rule of rules) {
			if (rule.cssRules) visit(rule.cssRules)
			if (typeof rule.selectorText === 'string') consider(rule.selectorText)
		}
	}
	for (const sheet of document.styleSheets) {
		try {
			visit(sheet.cssRules)
		} catch {
			/* cross-origin */
		}
	}

	for (const el of subjects) {
		el.setAttribute('data-fsub', '')
		for (const a of self) el.setAttribute(a, '')
		for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
			for (const a of anc) p.setAttribute(a, '')
		}
	}

	return {
		subjects: subjects.size,
		matched: [...matched].sort(),
		unmatched: [...unmatched].sort()
	}
}

/**
 * In-page: the cells whose interactive surface is hidden behind an open state,
 * as declared by `data-gallery-open` on the cell. Value is the trigger selector.
 */
export function inPageReadOpenCells() {
	return [...document.querySelectorAll('[data-gallery-open]')].map((el) => ({
		comp: el.dataset.galleryComp,
		trigger: el.getAttribute('data-gallery-open')
	}))
}

/** In-page: dispatch a plain click on a cell's trigger. False when absent. */
export function inPageClickTrigger({ scope, trigger }) {
	const el = document.querySelector(`${scope} ${trigger}`)
	if (!el) return false
	el.click()
	return true
}

/** In-page: strip every stand-in attribute so the next pass starts clean. */
export function inPageClearState({ attrs }) {
	let cleared = 0
	for (const attr of attrs) {
		for (const el of document.querySelectorAll(`[${attr}]`)) {
			el.removeAttribute(attr)
			cleared++
		}
	}
	return cleared
}

// ─── Driver ──────────────────────────────────────────────────────────────────

/**
 * Audit every declared interaction state for one style × mode × skin.
 * Returns { findings, coverage } for the config.
 */
export async function auditConfig(page, base, { style, mode, skin }, { freeze }) {
	await page.goto(`${base}/embed/gallery?style=${style}&skin=${skin}&mode=${mode}`, {
		waitUntil: 'networkidle',
		timeout: 20000
	})
	await page.waitForSelector('.gallery [data-gallery-comp]')
	await freeze(page)

	const { rewritten } = await page.evaluate(inPageRewritePseudos, { map: PSEUDO_MAP })
	if (!rewritten) {
		throw new Error(
			`interaction-harness: ${style}/${mode}/${skin} — rewrote 0 interaction rules; ` +
				`every pass would measure resting styles while claiming state coverage`
		)
	}

	const findings = []
	const coverage = []

	/** Run every declared state once, optionally scoped to one cell's subtree. */
	const runStates = async (within) => {
		for (const state of STATES) {
			const applied = await page.evaluate(inPageApplyState, {
				subject: state.subject,
				self: state.self,
				anc: state.anc,
				style,
				within
			})
			if (applied.subjects) {
				findings.push(
					...(await page.evaluate(collectContrast, {
						mode,
						scope: '.gallery [data-fsub], .gallery [data-fsub] *',
						state: state.id,
						parts: 'text+icon+svg',
						forceAttrs: FORCE_ATTRS
					}))
				)
			}
			coverage.push({ state: state.id, ...applied })
			await page.evaluate(inPageClearState, { attrs: FORCE_ATTRS })
		}
	}

	await runStates(null)

	// Second sweep: components whose options/items only exist while a panel is
	// open. Opened one at a time because dismissal is a document-level listener,
	// so opening the next closes the last.
	for (const cell of await page.evaluate(inPageReadOpenCells)) {
		const scope = `[data-gallery-comp="${cell.comp}"]`
		// Clicked in-page rather than through Playwright: the permanently-open
		// CommandPalette renders a position:fixed inset:0 backdrop, so a real
		// pointer click at the trigger's coordinates lands on the backdrop instead.
		// `Trigger` (packages/actions) listens for a plain `click`, so dispatching
		// one on the element opens the panel regardless of what is painted on top.
		const clicked = await page.evaluate(inPageClickTrigger, {
			scope,
			trigger: cell.trigger
		})
		if (!clicked) {
			throw new Error(
				`interaction-harness: ${style}/${mode}/${skin} — ${cell.comp} declares ` +
					`data-gallery-open="${cell.trigger}" but that trigger does not exist; ` +
					`the panel would stay closed and its rules would go unmeasured`
			)
		}
		// Opened panels are the point of this sweep — if the click did not expand
		// anything, measuring would silently re-cover the closed trigger only.
		await page
			.locator(`${scope} [data-select-dropdown], ${scope} [data-menu-dropdown], ${scope} [data-dropdown-panel]`)
			.first()
			.waitFor({ state: 'visible', timeout: 4000 })
		await runStates(scope)
		await page.keyboard.press('Escape')
		await page.locator(`${scope} [data-open]`).first().waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
	}

	return { findings, coverage, rewritten }
}

/**
 * Summarise coverage across configs: per state, the subject selectors that were
 * exercised and the ones no gallery instance could produce.
 */
export function summariseCoverage(perConfig) {
	const byState = new Map()
	for (const { style, coverage } of perConfig) {
		for (const c of coverage) {
			const entry = byState.get(c.state) ?? { state: c.state, matched: new Set(), unmatched: new Set() }
			for (const s of c.matched) entry.matched.add(`${style}: ${s}`)
			for (const s of c.unmatched) entry.unmatched.add(`${style}: ${s}`)
			byState.set(c.state, entry)
		}
	}
	return [...byState.values()].map((e) => ({
		state: e.state,
		matched: [...e.matched].sort(),
		unmatched: [...e.unmatched].sort()
	}))
}

/** Render the coverage half of the report. */
export function formatCoverage(summary) {
	const lines = ['## Interaction coverage', '']
	lines.push('| state | subject selectors exercised | declared but unreachable |', '|---|---|---|')
	for (const s of summary) {
		lines.push(`| ${s.state} | ${s.matched.length} | ${s.unmatched.length} |`)
	}
	lines.push('')
	for (const s of summary) {
		if (!s.unmatched.length) continue
		lines.push(
			`### Unreachable in the gallery — ${s.state}`,
			'',
			'Each line is an interaction rule no gallery instance can produce, so the',
			'gate says nothing about it. Fix by rendering that state in /embed/gallery.',
			'',
			...s.unmatched.map((u) => `- \`${u}\``),
			''
		)
	}
	return lines.join('\n')
}
