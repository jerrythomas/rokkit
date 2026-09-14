import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { autoFix } from '../src/fix.js'

/**
 * `doctor --fix` routes a failed check to a handler by its `autoFix` id. The
 * doctor spec asserts that a chart check advertises `patch-chart-config`, but
 * nothing invoked the handler behind that id — so a rename or a typo on either
 * side would have left `--fix` silently doing nothing for chart configs.
 */

let cwd

beforeEach(() => {
	cwd = mkdtempSync(join(tmpdir(), 'rokkit-fix-'))
	vi.spyOn(console, 'info').mockImplementation(() => {})
})

afterEach(() => {
	rmSync(cwd, { recursive: true, force: true })
	vi.restoreAllMocks()
})

const chartCheck = {
	id: 'chart-config',
	status: 'fail',
	fixable: true,
	autoFix: 'patch-chart-config',
	label: 'chart config present'
}

describe('autoFix — patch-chart-config', () => {
	it('injects a chart section into an existing config', () => {
		writeFileSync(join(cwd, 'rokkit.config.js'), 'export default {\n  skin: {}\n}\n')

		expect(autoFix([chartCheck], cwd)).toBe(1)

		const patched = readFileSync(join(cwd, 'rokkit.config.js'), 'utf-8')
		expect(patched).toMatch(/\bchart\s*:/)
		expect(patched).toContain('skin')
	})

	it('does nothing when the config already has a chart section', () => {
		writeFileSync(join(cwd, 'rokkit.config.js'), 'export default {\n  chart: {}\n}\n')

		expect(autoFix([chartCheck], cwd)).toBe(0)
	})

	it('does nothing when there is no config file at all', () => {
		expect(autoFix([chartCheck], cwd)).toBe(0)
	})

	it('ignores a check that is passing or not fixable', () => {
		writeFileSync(join(cwd, 'rokkit.config.js'), 'export default {\n  skin: {}\n}\n')

		expect(autoFix([{ ...chartCheck, status: 'pass' }], cwd)).toBe(0)
		expect(autoFix([{ ...chartCheck, fixable: false }], cwd)).toBe(0)
	})
})
