/**
 * Shared theme-contrast audit logic, used by both the ad-hoc runner
 * (theme-audit.mjs) and the committed regression gate (theme-contrast.e2e.ts).
 *
 * The audit drives the isolated gallery (/embed/gallery) across a style × mode ×
 * skin matrix and measures WCAG contrast of every component "part" (an element
 * carrying a `data-*` hook with its own visible text) against its effective
 * (composited) background. Contrast-only — visual "light-island-in-dark" issues
 * belong to a future screenshot layer.
 */

export const STYLES = ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi']
export const MODES = ['light', 'dark']
export const SKINS = ['default', 'ocean', 'violet', 'rose', 'emerald']

/**
 * Known-and-accepted exceptions (intentionally muted text that still reads).
 * Each entry matches a finding by `${comp}|${part}` (substring of text optional).
 * Keep this SMALL and justified — every entry is a contrast rule we chose to
 * waive. Format: { comp, part, note }.
 */
export const ALLOW = [
	// (populated as we triage — start strict)
]

/** WCAG AA thresholds. */
export const AA_NORMAL = 4.5
export const AA_LARGE = 3.0

/**
 * Attributes the interaction harness stamps on elements to synthesise a
 * pseudo-class state (see interaction-collector.mjs). They are bookkeeping, not
 * component parts, so `isPart` must never mistake one for a `data-*` hook.
 */
export const FORCE_ATTRS = ['data-fh', 'data-ff', 'data-ffv', 'data-ffw', 'data-fa', 'data-fsub']

/**
 * In-page collector. Self-contained (serialized into the browser by
 * page.evaluate) — must not reference module scope. Returns an array of
 * contrast failures for the gallery's current theme state.
 *
 * Options:
 *   mode    'light' | 'dark' — sets the page-bg fallback for compositing.
 *   scope   selector for the elements to consider. Defaults to the whole
 *           gallery; the interaction harness narrows it to the forced subtree.
 *   state   label stamped on every finding ('idle', 'hover', 'focus', …).
 *   parts   'text' measures text against its background (WCAG 1.4.3).
 *           'text+icon' additionally measures icon glyphs at the 3:1 non-text
 *           threshold (WCAG 1.4.11). Icons carry no text, so the text pass
 *           skips them entirely — a `paper-soft` icon on a `paper-mute` hover
 *           fill is invisible and yet passes a text-only audit.
 *   forceAttrs  bookkeeping attributes to exclude from part detection.
 */
export function collectContrast({
	mode,
	scope = '.gallery [data-gallery-comp] *',
	state = 'idle',
	parts = 'text',
	forceAttrs = []
}) {
	const cv = document.createElement('canvas')
	cv.width = cv.height = 1
	const ctx = cv.getContext('2d', { willReadFrequently: true })
	const toRGBA = (c) => {
		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = '#ff00ff'
		ctx.fillStyle = c
		ctx.fillRect(0, 0, 1, 1)
		const d = ctx.getImageData(0, 0, 1, 1).data
		return [d[0], d[1], d[2], d[3] / 255]
	}
	const relLum = ([r, g, b]) => {
		const f = [r, g, b].map((v) => {
			v /= 255
			return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
		})
		return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]
	}
	const over = (fg, bg) => {
		const a = fg[3]
		return [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a)))
	}
	const pageBg = mode === 'dark' ? [17, 17, 17] : [255, 255, 255]
	// Returns the composited background, or null when an ancestor paints a
	// gradient/image (background-image) — we can't read a single color from it,
	// so contrast is indeterminate and the element is skipped rather than
	// falsely flagged (e.g. rokkit's gradient-filled primary buttons/tabs).
	//
	// `from` is where the walk starts. For text that is the element itself. For a
	// mask-mode icon it must be the PARENT: the icon's own background-color is
	// the glyph paint (`currentColor` behind a mask-image), so starting at the
	// icon would measure the glyph against itself and always report 1:1.
	const effectiveBg = (from) => {
		let node = from
		let solid = null
		const layers = []
		while (node && node !== document.documentElement) {
			const cs = getComputedStyle(node)
			if (cs.backgroundImage && cs.backgroundImage !== 'none') return null
			const bg = toRGBA(cs.backgroundColor)
			if (bg[3] > 0) {
				if (bg[3] >= 0.999) { solid = [bg[0], bg[1], bg[2]]; break }
				layers.push(bg)
			}
			node = node.parentElement
		}
		let base = solid || pageBg
		for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base)
		return base
	}
	const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

	const IGNORE = new Set([
		'data-style', 'data-mode', 'data-skin', 'data-density', 'data-gallery-comp',
		...forceAttrs
	])
	const isPart = (a) => a.name.startsWith('data-') && !a.name.startsWith('data-sveltekit') && !IGNORE.has(a.name)

	// Shared geometry/visibility guards. Returns the computed style, or null when
	// the element is too small, hidden, or intentionally muted.
	const paintable = (el, maxHeight) => {
		const r = el.getBoundingClientRect()
		if (r.width < 4 || r.height < 4 || r.height > maxHeight) return null
		const cs = getComputedStyle(el)
		if (cs.visibility === 'hidden' || cs.display === 'none') return null
		if (parseFloat(cs.opacity) < 0.75) return null // disabled/placeholder — muted on purpose
		return cs
	}

	// `className` is an SVGAnimatedString on SVG elements, not a string — coercing
	// it would yield "[object SVGAnimatedString]" and quietly never match.
	const classOf = (el) => (typeof el.className === 'string' ? el.className : '')

	// An icon is a `data-*icon*` hook or an UnoCSS `i-*` utility span. Icons carry
	// no text of their own, so they are invisible to the text pass.
	const isIcon = (el) =>
		[...el.attributes].some((a) => isPart(a) && a.name.includes('icon')) ||
		/(^|\s)i-[a-z]/.test(classOf(el))

	/** A chart mark: an SVG shape carrying the chart package's plot-element hook. */
	const isSvgMark = (el) => el.hasAttribute('data-plot-element')

	// Evaluate one element → a { finding, sig } pair, or null when it isn't a
	// measurable text part or its contrast passes. Nested (not module-scope) so the
	// whole function stays self-contained for page.evaluate serialization.
	const evaluateText = (el) => {
		const hooks = [...el.attributes].filter(isPart)
		if (!hooks.length) return null
		const txt = el.textContent.trim()
		if (!txt) return null
		const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
		const inlineOnly = el.childElementCount <= 4 && [...el.children].every((c) => ['SPAN', 'I', 'SVG', 'EM', 'STRONG', 'CODE', 'B', 'LABEL'].includes(c.tagName))
		if (!ownText && !inlineOnly) return null
		const cs = paintable(el, 96)
		if (!cs) return null

		const color = toRGBA(cs.color)
		if (color[3] < 0.1) return null
		const bg = effectiveBg(el)
		if (!bg) return null // gradient/image fill — contrast indeterminate, skip
		const fg = color[3] >= 0.999 ? [color[0], color[1], color[2]] : over(color, bg)
		const ratio = contrast(relLum(fg), relLum(bg))
		const px = parseFloat(cs.fontSize)
		const weight = parseInt(cs.fontWeight, 10) || 400
		const large = px >= 24 || (px >= 18.66 && weight >= 700)
		const threshold = large ? 3.0 : 4.5
		if (ratio >= threshold) return null
		return { el, kind: 'text', hooks, ratio, threshold, fg, bg, px, weight, label: txt.slice(0, 32).replace(/\s+/g, ' ') }
	}

	/**
	 * Evaluate an icon glyph against the surface behind it, at the 3:1 non-text
	 * threshold (WCAG 1.4.11).
	 *
	 * Two rendering paths, and the glyph paint differs between them:
	 *   mask   UnoCSS monochrome icons — `background-color: currentColor` behind a
	 *          `mask-image`. The glyph colour is background-color.
	 *   glyph  an <svg>/font icon painting with `color`.
	 * A coloured `background-image` icon (multi-hue SVG data URI, no mask) has no
	 * single glyph colour, so contrast is indeterminate and it is skipped.
	 */
	const evaluateIcon = (el) => {
		const hooks = [...el.attributes].filter(isPart)
		if (el.textContent.trim()) return null // has text — the text pass owns it
		const cs = paintable(el, 64)
		if (!cs) return null

		const masked = (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')
		if (!masked && cs.backgroundImage && cs.backgroundImage !== 'none') return null
		const paint = toRGBA(masked ? cs.backgroundColor : cs.color)
		if (paint[3] < 0.1) return null
		const bg = effectiveBg(el.parentElement)
		if (!bg) return null
		const fg = paint[3] >= 0.999 ? [paint[0], paint[1], paint[2]] : over(paint, bg)
		const ratio = contrast(relLum(fg), relLum(bg))
		if (ratio >= 3.0) return null
		const name = hooks[0]?.name ?? (el.className || '').split(/\s+/).find((c) => /^i-/.test(c)) ?? 'icon'
		return { el, kind: 'icon', hooks, ratio, threshold: 3.0, fg, bg, px: parseFloat(cs.fontSize), weight: 400, label: name }
	}

	/**
	 * Evaluate a chart mark's SVG `fill` against the surface behind the plot, at
	 * the 3:1 non-text threshold. Marks paint with `fill`, which the text and icon
	 * paths both ignore, so a hover style that dims a bar into its background is
	 * invisible to them.
	 *
	 * The background is taken from the mark's nearest HTML ancestor rather than
	 * from a sibling <rect> plot backdrop — an ancestor walk cannot see siblings.
	 * That is the surface the chart sits on, which is the comparison that matters
	 * for "can I see this bar at all".
	 */
	const evaluateSvgMark = (el) => {
		const hooks = [...el.attributes].filter(isPart)
		const cs = paintable(el, 4096)
		if (!cs) return null
		const fillRaw = cs.fill
		if (!fillRaw || fillRaw === 'none') return null
		if (/url\(/.test(fillRaw)) return null // gradient/pattern fill — indeterminate
		const paint = toRGBA(fillRaw)
		const fillOpacity = parseFloat(cs.fillOpacity)
		const alpha = paint[3] * (Number.isNaN(fillOpacity) ? 1 : fillOpacity)
		if (alpha < 0.1) return null
		let host = el.parentElement
		while (host && host.namespaceURI === 'http://www.w3.org/2000/svg') host = host.parentElement
		const bg = effectiveBg(host)
		if (!bg) return null
		const fg = alpha >= 0.999 ? [paint[0], paint[1], paint[2]] : over([paint[0], paint[1], paint[2], alpha], bg)
		const ratio = contrast(relLum(fg), relLum(bg))
		if (ratio >= 3.0) return null
		return {
			el, kind: 'svg', hooks, ratio, threshold: 3.0, fg, bg,
			px: 0, weight: 400,
			label: el.getAttribute('data-plot-element') ?? el.tagName.toLowerCase()
		}
	}

	const seen = new Set()
	const findings = []
	for (const el of document.querySelectorAll(scope)) {
		const wantIcons = parts === 'text+icon' || parts === 'text+icon+svg'
		const wantSvg = parts === 'text+icon+svg'
		let r = null
		if (wantSvg && isSvgMark(el)) r = evaluateSvgMark(el)
		else if (wantIcons && isIcon(el)) r = evaluateIcon(el)
		else if (el.namespaceURI !== 'http://www.w3.org/2000/svg') r = evaluateText(el)
		if (!r) continue
		const comp = r.el.closest('[data-gallery-comp]')?.dataset.galleryComp ?? '?'
		const part = r.hooks[0]?.name ?? r.el.tagName.toLowerCase()
		const sig = `${comp}|${part}|${r.kind}|${r.label}|${r.ratio.toFixed(1)}`
		if (seen.has(sig)) continue
		seen.add(sig)
		findings.push({
			comp, part, state, kind: r.kind, text: r.label,
			ratio: +r.ratio.toFixed(2), threshold: r.threshold,
			fg: `rgb(${r.fg.join(',')})`, bg: `rgb(${r.bg.join(',')})`, px: r.px, weight: r.weight
		})
	}
	return findings
}

/** Apply theme attributes to the gallery wrapper, the way the audit needs them. */
export function applyTheme({ style, mode, skin }) {
	const el = document.querySelector('.gallery')
	if (!el) return false
	el.dataset.style = style
	el.dataset.mode = mode
	el.dataset.skin = skin
	// mode also on the documentElement so the [data-mode="dark"] preflight applies
	document.documentElement.dataset.mode = mode
	return true
}

/** True if a finding is on the accept-list. */
export function isAllowed(f) {
	return ALLOW.some((a) => a.comp === f.comp && a.part === f.part && (!a.text || f.text.includes(a.text)))
}

/** The full audit matrix as a flat list of { style, mode, skin } configs (skin → style → mode). */
export function matrix() {
	const configs = []
	for (const skin of SKINS)
		for (const style of STYLES) for (const mode of MODES) configs.push({ style, mode, skin })
	return configs
}

/**
 * Merge one finding into the dedup map, keyed by comp|part|state|text. First
 * sighting seeds `configs`; later sightings append the config and keep the WORST
 * (lowest) ratio. `state` is in the key so a part that fails only on hover stays
 * distinct from the same part failing at rest — they are different fixes.
 */
export function mergeFinding(uniq, f, cfg) {
	const key = `${f.comp}|${f.part}|${f.state ?? 'idle'}|${f.text}`
	const existing = uniq.get(key)
	if (!existing) {
		uniq.set(key, { ...f, configs: [cfg] })
		return
	}
	existing.configs.push(cfg)
	if (f.ratio < existing.ratio) existing.ratio = f.ratio
}

/** Collect the in-page findings for one gallery config. */
async function collectConfig(page, base, { style, mode, skin }) {
	await page.goto(`${base}/embed/gallery?style=${style}&skin=${skin}&mode=${mode}`, {
		waitUntil: 'networkidle',
		timeout: 20000
	})
	await page.waitForTimeout(120)
	return page.evaluate(collectContrast, { mode })
}

/**
 * Kill transitions and animations.
 *
 * Every theme animates `background-color`/`color` on hover (zen-sumi's tabs use
 * `150ms ease`). Reading a computed style straight after entering a state
 * therefore returns the value mid-interpolation — measurably the IDLE colour at
 * t=0, which makes a hover audit silently re-measure the resting state. Proven,
 * not assumed: the first probe of the zen-sumi selected toggle reported hover
 * identical to idle until transitions were disabled.
 */
export async function freezeTransitions(page) {
	await page.addStyleTag({
		content: '*,*::before,*::after{transition:none!important;animation:none!important}'
	})
}

/** Drive the whole matrix against a Playwright page; returns deduped findings. */
export async function auditGallery(page, base) {
	const uniq = new Map()
	for (const cfg of matrix()) {
		const found = await collectConfig(page, base, cfg)
		const label = `${cfg.style}/${cfg.mode}/${cfg.skin}`
		for (const f of found) if (!isAllowed(f)) mergeFinding(uniq, f, label)
	}
	return [...uniq.values()].sort((a, b) => a.comp.localeCompare(b.comp) || a.ratio - b.ratio)
}

/**
 * Collapse a finding's `style/mode/skin` labels into the style+mode pairs that
 * produced it, with a skin count. A bare number ("13 configs") says a failure is
 * widespread but not WHERE, and the fix is per-style CSS — so the report has to
 * name the styles or triage means re-running the audit by hand.
 */
export function where(configs = []) {
	const byPair = new Map()
	for (const c of configs) {
		const [style, mode] = c.split('/')
		const key = `${style}/${mode}`
		byPair.set(key, (byPair.get(key) ?? 0) + 1)
	}
	return [...byPair.entries()].sort().map(([k, n]) => `${k}×${n}`).join(' ')
}

/** Render a markdown report from deduped findings. */
export function formatReport(rows, base) {
	const lines = [`# Theme contrast audit (${base})`, '',
		`Matrix: ${STYLES.length} styles × ${MODES.length} modes × ${SKINS.length} skins · WCAG AA (4.5 normal / 3.0 large)`, '']
	if (!rows.length) { lines.push('✅ No contrast failures.'); return lines.join('\n') }
	const byComp = {}
	for (const r of rows) (byComp[r.comp] ??= []).push(r)
	lines.push(`## ${rows.length} unique failures`, '')
	for (const [comp, rs] of Object.entries(byComp)) {
		lines.push(`### ${comp}`, '', '| part | state | kind | text | worst | need | px/wt | fg→bg | where |', '|---|---|---|---|---|---|---|---|---|')
		for (const r of rs) {
			lines.push(`| \`${r.part}\` | ${r.state ?? 'idle'} | ${r.kind ?? 'text'} | ${r.text} | ${r.ratio} | ${r.threshold} | ${r.px}/${r.weight} | ${r.fg}→${r.bg} | ${where(r.configs)} |`)
		}
		lines.push('')
	}
	return lines.join('\n')
}
