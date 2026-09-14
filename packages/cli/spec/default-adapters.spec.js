import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * `installPackages` and `runThemeCreate` both take injectable adapters, and every
 * other test injects them — which left the DEFAULT implementations unexercised.
 * Those defaults are exactly what runs for a user typing `rokkit init` or
 * `rokkit theme create`.
 *
 * Mocking the node builtins runs the real defaults and asserts what they call, so
 * a missing `recursive: true` or a dropped `stdio: 'inherit'` is caught here.
 * Note the sources import from 'fs' / 'child_process', not the node: prefixed
 * specifiers, so the mock paths must match that.
 */
const fsMock = vi.hoisted(() => ({
	readFileSync: vi.fn(),
	existsSync: vi.fn(),
	writeFileSync: vi.fn(),
	mkdirSync: vi.fn(),
	readdirSync: vi.fn()
}))
const cpMock = vi.hoisted(() => ({ execFileSync: vi.fn() }))

vi.mock('fs', () => ({ ...fsMock, default: fsMock }))
vi.mock('child_process', () => ({ ...cpMock, default: cpMock }))

const { existsSync, readFileSync, mkdirSync } = fsMock
const { execFileSync } = cpMock
const { installPackages } = await import('../src/init.js')
const { runThemeCreate } = await import('../src/theme.js')

beforeEach(() => {
	vi.clearAllMocks()
	vi.spyOn(console, 'info').mockImplementation(() => {})
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('installPackages — default runInstall adapter', () => {
	it('spawns the package manager with inherited stdio', () => {
		// stdio: 'inherit' is what lets the user watch the install; without it the
		// command appears to hang.
		existsSync.mockReturnValue(true)
		readFileSync.mockReturnValue(JSON.stringify({ dependencies: {} }))

		installPackages('/tmp/project', {})

		expect(execFileSync).toHaveBeenCalledTimes(1)
		const [bin, args, opts] = execFileSync.mock.calls[0]
		expect(typeof bin).toBe('string')
		expect(Array.isArray(args)).toBe(true)
		expect(opts).toEqual(expect.objectContaining({ stdio: 'inherit' }))
	})
})

describe('runThemeCreate — default mkdir adapter', () => {
	it('creates the theme directory recursively', () => {
		// `recursive: true` matters: the themes directory usually does not exist yet,
		// and a non-recursive mkdir would throw ENOENT on the parent.
		existsSync.mockReturnValue(false)

		runThemeCreate('midnight', {})

		expect(mkdirSync).toHaveBeenCalled()
		expect(mkdirSync.mock.calls[0][1]).toEqual(expect.objectContaining({ recursive: true }))
	})
})
