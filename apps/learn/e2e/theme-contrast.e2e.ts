import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { auditGallery, formatReport, STYLES, MODES, SKINS } from './contrast-collector.mjs'

/**
 * Theme-contrast regression gate.
 *
 * Drives the isolated /embed/gallery across every style × mode × skin and
 * measures WCAG contrast of each component part against its background.
 *
 * This is a RATCHET, not a clean sheet: the codebase has known contrast debt
 * (see theme-contrast.baseline.json — each entry is a `component|part` we've
 * accepted for now and intend to burn down). The gate fails only on contrast
 * failures OUTSIDE that baseline — i.e. a NEW regression in a part that was
 * previously fine. As debt is fixed, remove its key from the baseline so the
 * gate locks the improvement in.
 *
 * Full report is attached to the test result for triage.
 */
const baseline = new Set<string>(
	JSON.parse(readFileSync(new URL('./theme-contrast.baseline.json', import.meta.url), 'utf-8'))
)

test('theme contrast — no new failures beyond baseline', async ({ page, baseURL }, testInfo) => {
	// 5 × 2 × 5 = 50 gallery loads; well over the default per-test timeout.
	testInfo.setTimeout(Math.max(STYLES.length * MODES.length * SKINS.length * 3000, 180_000))

	const base = baseURL ?? 'http://localhost:4173'
	const rows = await auditGallery(page, base)

	await testInfo.attach('contrast-report.md', {
		body: formatReport(rows, base),
		contentType: 'text/markdown'
	})

	const regressions = rows.filter((r) => !baseline.has(`${r.comp}|${r.part}`))
	expect(regressions, `New contrast failures (not in baseline):\n${formatReport(regressions, base)}`).toEqual([])
})
