import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadConfig } from '../src/config.js'

describe('loadConfig', () => {
	it('returns the value from readConfig adapter when provided', async () => {
		const cfg = { skin: { primary: 'orange' } }
		const result = await loadConfig({ readConfig: () => cfg })
		expect(result).toBe(cfg)
	})

	it('returns null when cwd has no rokkit.config.js', async () => {
		const cwd = mkdtempSync(join(tmpdir(), 'rokkit-config-'))
		try {
			const result = await loadConfig({ cwd })
			expect(result).toBeNull()
		} finally {
			rmSync(cwd, { recursive: true, force: true })
		}
	})

	it('returns null when rokkit.config.js has a syntax error (catch branch)', async () => {
		const cwd = mkdtempSync(join(tmpdir(), 'rokkit-config-'))
		try {
			writeFileSync(join(cwd, 'rokkit.config.js'), 'export default { broken: INVALID_TOKEN }\n')
			const result = await loadConfig({ cwd })
			expect(result).toBeNull()
		} finally {
			rmSync(cwd, { recursive: true, force: true })
		}
	})
})
