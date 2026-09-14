import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * `runUpgrade` takes injectable adapters so the rest of the suite can drive it
 * without touching the filesystem or spawning npm. Every existing test injects
 * all four, which left the DEFAULT implementations — the ones that actually run
 * for a user typing `rokkit upgrade` — completely unexercised.
 *
 * Mocking the node builtins instead of injecting adapters runs those defaults for
 * real and asserts what they call, so a wrong flag or a swapped argument would be
 * caught here rather than in the field.
 */
// Both named AND default exports: something in the import graph does
// `import fs from 'fs'`, and vitest rejects a factory that omits it.
const fsMock = vi.hoisted(() => ({
	readFileSync: vi.fn(),
	existsSync: vi.fn(),
	writeFileSync: vi.fn(),
	mkdirSync: vi.fn(),
	readdirSync: vi.fn()
}))
const cpMock = vi.hoisted(() => ({ execFileSync: vi.fn() }))

vi.mock('child_process', () => ({ ...cpMock, default: cpMock }))
vi.mock('fs', () => ({ ...fsMock, default: fsMock }))

const { execFileSync } = cpMock
const { readFileSync, existsSync } = fsMock
const { runUpgrade } = await import('../src/upgrade.js')

const pkgJson = JSON.stringify({
	dependencies: { '@rokkit/ui': '^1.0.0' }
})

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'info').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	existsSync.mockReturnValue(true)
	readFileSync.mockReturnValue(pkgJson)
	execFileSync.mockReturnValue('2.0.0\n')
})

describe('runUpgrade — default adapters', () => {
	it('reads package.json through the default readFile adapter', () => {
		runUpgrade({}, {})

		expect(readFileSync).toHaveBeenCalled()
		// utf-8, not a Buffer — the caller JSON.parses the result directly.
		expect(readFileSync.mock.calls[0][1]).toBe('utf-8')
	})

	it('resolves the latest version through the default fetchVersion adapter', () => {
		runUpgrade({}, {})

		expect(execFileSync).toHaveBeenCalledWith(
			'npm',
			['view', '@rokkit/ui', 'version'],
			expect.objectContaining({ encoding: 'utf-8' })
		)
	})

	it('treats a failing npm lookup as an unknown version instead of throwing', () => {
		// No npm on PATH, or offline. The command must still complete.
		execFileSync.mockImplementation(() => {
			throw new Error('npm: command not found')
		})

		expect(() => runUpgrade({}, {})).not.toThrow()
	})

	it('installs through the default runInstall adapter when --apply is set', () => {
		runUpgrade({ apply: true }, {})

		expect(execFileSync).toHaveBeenCalled()
		// The install call inherits stdio so the user sees the package manager output.
		const withStdio = execFileSync.mock.calls.find(([, , opts]) => opts?.stdio === 'inherit')
		expect(withStdio).toBeTruthy()
	})
})
