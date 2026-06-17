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
 * In-page collector. Self-contained (serialized into the browser by
 * page.evaluate) — must not reference module scope. Returns an array of
 * contrast failures for the gallery's current theme state.
 */
export function collectContrast({ mode }) {
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
	const effectiveBg = (el) => {
		let node = el
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

	const IGNORE = new Set(['data-style', 'data-mode', 'data-skin', 'data-density', 'data-gallery-comp'])
	const isPart = (a) => a.name.startsWith('data-') && !a.name.startsWith('data-sveltekit') && !IGNORE.has(a.name)
	const seen = new Set()
	const findings = []

	for (const el of document.querySelectorAll('.gallery [data-gallery-comp] *')) {
		const parts = [...el.attributes].filter(isPart)
		if (!parts.length) continue
		const txt = el.textContent.trim()
		if (!txt) continue
		const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
		const inlineOnly = el.childElementCount <= 4 && [...el.children].every((c) => ['SPAN', 'I', 'SVG', 'EM', 'STRONG', 'CODE', 'B', 'LABEL'].includes(c.tagName))
		if (!ownText && !inlineOnly) continue
		const r = el.getBoundingClientRect()
		if (r.width < 4 || r.height < 4 || r.height > 96) continue
		const cs = getComputedStyle(el)
		if (cs.visibility === 'hidden' || cs.display === 'none') continue
		if (parseFloat(cs.opacity) < 0.75) continue // intentionally muted (disabled/placeholder)

		const color = toRGBA(cs.color)
		if (color[3] < 0.1) continue
		const bg = effectiveBg(el)
		if (!bg) continue // gradient/image fill — contrast indeterminate, skip
		const fg = color[3] >= 0.999 ? [color[0], color[1], color[2]] : over(color, bg)
		const ratio = contrast(relLum(fg), relLum(bg))
		const px = parseFloat(cs.fontSize)
		const weight = parseInt(cs.fontWeight, 10) || 400
		const large = px >= 24 || (px >= 18.66 && weight >= 700)
		const threshold = large ? 3.0 : 4.5
		if (ratio >= threshold) continue

		const comp = el.closest('[data-gallery-comp]')?.dataset.galleryComp ?? '?'
		const part = parts[0].name
		const text = txt.slice(0, 32).replace(/\s+/g, ' ')
		const sig = `${comp}|${part}|${text}|${ratio.toFixed(1)}`
		if (seen.has(sig)) continue
		seen.add(sig)
		findings.push({
			comp, part, text, ratio: +ratio.toFixed(2), threshold,
			fg: `rgb(${fg.join(',')})`, bg: `rgb(${bg.join(',')})`, px, weight
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

/** Drive the whole matrix against a Playwright page; returns deduped findings. */
export async function auditGallery(page, base) {
	const uniq = new Map()
	for (const skin of SKINS) {
		for (const style of STYLES) {
			for (const mode of MODES) {
				await page.goto(`${base}/embed/gallery?style=${style}&skin=${skin}&mode=${mode}`, {
					waitUntil: 'networkidle', timeout: 20000
				})
				await page.waitForTimeout(120)
				const found = await page.evaluate(collectContrast, { mode })
				for (const f of found) {
					if (isAllowed(f)) continue
					const key = `${f.comp}|${f.part}|${f.text}`
					const cfg = `${style}/${mode}/${skin}`
					if (!uniq.has(key)) uniq.set(key, { ...f, configs: [cfg] })
					else { const u = uniq.get(key); u.configs.push(cfg); if (f.ratio < u.ratio) u.ratio = f.ratio }
				}
			}
		}
	}
	return [...uniq.values()].sort((a, b) => a.comp.localeCompare(b.comp) || a.ratio - b.ratio)
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
		lines.push(`### ${comp}`, '', '| part | text | worst | need | px/wt | fg→bg | configs |', '|---|---|---|---|---|---|---|')
		for (const r of rs) {
			lines.push(`| \`${r.part}\` | ${r.text} | ${r.ratio} | ${r.threshold} | ${r.px}/${r.weight} | ${r.fg}→${r.bg} | ${r.configs.length} |`)
		}
		lines.push('')
	}
	return lines.join('\n')
}
