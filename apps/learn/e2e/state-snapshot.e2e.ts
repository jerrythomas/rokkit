import { test, expect } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import {
	snapshotAll,
	diffSnapshots,
	formatDiff,
	STYLES,
	MODES,
	SKINS
} from './state-snapshot-collector.mjs'

/**
 * Computed-style snapshot gate for the state-pattern migration (#153, Phase 0).
 *
 * Drives the isolated /embed/states fixture across every style × mode and
 * asserts that the computed values encoding each List state's LOOK — colour,
 * fill, mark, border, outline, weight, including ::before/::after — are
 * byte-identical to the committed baseline.
 *
 * This is an EXACT-MATCH gate, not a ratchet. theme-contrast.e2e.ts is the
 * ratchet (it tolerates known contrast debt); this one tolerates nothing,
 * because its whole job is to prove that rewriting ~790 lines of per-theme List
 * CSS into shared base rules + tokens changed no pixel of intent.
 *
 * When a diff is intentional (a deliberate restyle, a new sub-element), rebase
 * with a stated reason in the commit message:
 *
 *   UPDATE_STATE_BASELINE=1 npx playwright test state-snapshot
 *
 * Never rebase to make a migration commit green — that defeats the gate.
 */
const BASELINE_URL = new URL('./state-snapshot.baseline.json', import.meta.url)

test('list state snapshot — computed styles match the baseline', async ({ page, baseURL }, testInfo) => {
	// 5 × 2 × 2 = 20 fixture loads, each driving 28 cases through hover/focus/press.
	testInfo.setTimeout(Math.max(STYLES.length * MODES.length * SKINS.length * 12_000, 300_000))

	const base = baseURL ?? 'http://localhost:4173'
	const current = await snapshotAll(page, base)

	if (process.env.UPDATE_STATE_BASELINE) {
		writeFileSync(BASELINE_URL, `${JSON.stringify(current, null, '\t')}\n`)
		testInfo.attach('baseline-written.txt', {
			body: `${Object.keys(current).length} keys written to state-snapshot.baseline.json`,
			contentType: 'text/plain'
		})
		return
	}

	const baseline = JSON.parse(readFileSync(BASELINE_URL, 'utf-8'))
	const diffs = diffSnapshots(baseline, current)

	await testInfo.attach('state-snapshot-diff.md', {
		body: formatDiff(diffs, base),
		contentType: 'text/markdown'
	})

	expect(
		diffs,
		`Computed styles diverged from the baseline (${STYLES.length} styles × ${MODES.length} modes × ${SKINS.length} skins).\n` +
			`${formatDiff(diffs, base)}\n\n` +
			`If this change is intentional, re-baseline with UPDATE_STATE_BASELINE=1 and say why in the commit.`
	).toEqual([])
})

test('list state snapshot — the baseline is non-trivial', async () => {
	// A snapshot gate is only worth its runtime if the baseline actually holds
	// the values that encode each state. This guards against the failure mode
	// where the fixture renders nothing, every property prunes to empty, or a
	// selector change quietly drops most cases — leaving a file that still
	// "passes" while asserting nothing.
	const baseline: Record<string, string> = JSON.parse(readFileSync(BASELINE_URL, 'utf-8'))
	const keys = Object.keys(baseline)

	// 5 styles × 2 modes × 2 skins × 14 cases × 2 icon kinds = 560 case
	// instances, each contributing the list container + the measured subtree.
	expect(keys.length).toBeGreaterThan(3000)

	const cases = new Set(keys.map((k) => k.split('/').slice(0, 4).join('/')))
	expect(cases.size).toBe(STYLES.length * MODES.length * SKINS.length * 28)

	// Every case must have recorded a colour on its measured list item.
	const itemColours = keys.filter((k) => k.includes('0:list-item') && baseline[k].includes('color:'))
	expect(itemColours.length).toBeGreaterThan(500)

	// The marks that distinguish the themes must be present somewhere: minimal's
	// inset bar, rokkit's gradient fill, zen-sumi's left border.
	const all = Object.values(baseline)
	expect(all.some((v) => v.includes('inset'))).toBe(true)
	expect(all.some((v) => v.includes('linear-gradient'))).toBe(true)
})
