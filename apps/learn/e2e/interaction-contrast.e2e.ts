import { test, expect } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import {
	freezeTransitions,
	formatReport,
	isAllowed,
	mergeFinding,
	matrix
} from './contrast-collector.mjs'
import {
	auditConfig,
	formatCoverage,
	summariseCoverage,
	STATES,
	STYLES,
	MODES,
	SKINS
} from './interaction-collector.mjs'

/**
 * Interaction-state contrast regression gate.
 *
 * theme-contrast.e2e.ts audits the gallery as it loads — every component at
 * rest. This gate audits the states a user produces: hover, focus, keyboard
 * focus, press, and focused-group-plus-hovered-row. Those states swap fills and
 * text colours together, so a pairing that passes at rest can fail under the
 * pointer; zen-sumi's dark hover pairs ink-mute text on a paper-mute fill at
 * 4.07:1 while the same text at rest sits on paper at 5.33:1.
 *
 * It also measures ICONS at the 3:1 non-text threshold (WCAG 1.4.11). The
 * resting audit is text-only, and an icon has no text — so an icon left at
 * `paper-soft` on a `paper-mute` hover fill is invisible and yet unaudited.
 *
 * Like theme-contrast this is a RATCHET: known debt lives in
 * interaction-contrast.baseline.json keyed `component|part|state`, and the gate
 * fails only on failures outside it. Remove a key as its debt is fixed and the
 * improvement is locked in.
 */
const BASELINE_URL = new URL('./interaction-contrast.baseline.json', import.meta.url)
const baseline = new Set<string>(JSON.parse(readFileSync(BASELINE_URL, 'utf-8')))

/** ONLY_STYLE trims the matrix for local iteration; CI always runs it whole. */
const only = process.env.ONLY_STYLE
const configs = matrix().filter((c) => !only || c.style === only)

test('interaction contrast — no new failures beyond baseline', async ({ page, baseURL }, testInfo) => {
	testInfo.setTimeout(Math.max(configs.length * STATES.length * 1500, 240_000))

	const base = baseURL ?? 'http://localhost:4173'
	const uniq = new Map()
	const perConfig: Array<{ style: string; coverage: unknown[] }> = []

	for (const cfg of configs) {
		const { findings, coverage } = await auditConfig(page, base, cfg, { freeze: freezeTransitions })
		const label = `${cfg.style}/${cfg.mode}/${cfg.skin}`
		for (const f of findings) if (!isAllowed(f)) mergeFinding(uniq, f, label)
		perConfig.push({ style: cfg.style, coverage })
	}

	const rows = [...uniq.values()].sort(
		(a, b) => a.comp.localeCompare(b.comp) || a.ratio - b.ratio
	)
	const coverage = summariseCoverage(perConfig)

	await testInfo.attach('interaction-contrast-report.md', {
		body: `${formatReport(rows, base)}\n\n${formatCoverage(coverage)}`,
		contentType: 'text/markdown'
	})

	// A gate that measures nothing passes trivially. Every declared state must
	// have found real subjects in at least one style, or the harness has silently
	// stopped exercising it (a renamed hook, a rewritten selector).
	for (const state of STATES) {
		const c = coverage.find((s) => s.state === state.id)
		expect(c?.matched.length, `state '${state.id}' exercised no subject selectors`).toBeGreaterThan(0)
	}

	// Re-baselining is deliberate and rare: it BOOKS contrast debt rather than
	// fixing it, so it has to be an explicit act with a reason in the commit.
	//   UPDATE_INTERACTION_BASELINE=1 npx playwright test interaction-contrast
	if (process.env.UPDATE_INTERACTION_BASELINE) {
		const keys = [...new Set(rows.map((r) => `${r.comp}|${r.part}|${r.state}`))].sort()
		writeFileSync(BASELINE_URL, `${JSON.stringify(keys, null, '\t')}\n`)
		await testInfo.attach('baseline-written.txt', {
			body: `${keys.length} keys written to interaction-contrast.baseline.json`,
			contentType: 'text/plain'
		})
		return
	}

	const regressions = rows.filter((r) => !baseline.has(`${r.comp}|${r.part}|${r.state}`))
	expect(
		regressions,
		`New interaction-state contrast failures (not in baseline):\n${formatReport(regressions, base)}`
	).toEqual([])
})

test('interaction contrast — the harness covers the whole matrix', async () => {
	// Guards the dimensions themselves. The gate's value is that it sweeps both
	// modes of every style; a trimmed matrix would still pass while auditing a
	// fraction of the surface.
	expect(STYLES).toEqual(['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi'])
	expect(MODES).toEqual(['light', 'dark'])
	expect(SKINS.length).toBeGreaterThanOrEqual(2)
	expect(STATES.map((s) => s.id)).toEqual([
		'hover',
		'focus',
		'focus-visible',
		'active',
		'focus-hover'
	])
	expect(only, 'ONLY_STYLE must not be set in a committed run').toBeUndefined()
})
