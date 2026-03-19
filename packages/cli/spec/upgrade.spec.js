import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRokkitPackages, detectPackageManager, buildInstallCommand, runUpgrade } from '../src/upgrade.js'

describe('getRokkitPackages', () => {
	it('returns empty array when no @rokkit/* deps', () => {
		const pkg = { dependencies: { svelte: '^5.0.0' }, devDependencies: { vitest: '^1.0.0' } }
		expect(getRokkitPackages(pkg)).toEqual([])
	})

	it('extracts @rokkit/* from dependencies', () => {
		const pkg = { dependencies: { '@rokkit/ui': '^1.2.0', svelte: '^5.0.0' } }
		const result = getRokkitPackages(pkg)
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({ name: '@rokkit/ui', current: '1.2.0' })
	})

	it('extracts @rokkit/* from devDependencies', () => {
		const pkg = { devDependencies: { '@rokkit/themes': '~2.3.1' } }
		const result = getRokkitPackages(pkg)
		expect(result[0]).toEqual({ name: '@rokkit/themes', current: '2.3.1' })
	})

	it('extracts from both dependencies and devDependencies', () => {
		const pkg = {
			dependencies: { '@rokkit/ui': '^1.0.0' },
			devDependencies: { '@rokkit/themes': '^1.0.0' }
		}
		expect(getRokkitPackages(pkg)).toHaveLength(2)
	})

	it('strips version range prefixes (^, ~, >=)', () => {
		const pkg = {
			dependencies: {
				'@rokkit/a': '^1.0.0',
				'@rokkit/b': '~2.1.3',
				'@rokkit/c': '>=3.0.0',
				'@rokkit/d': '4.0.0'
			}
		}
		const result = getRokkitPackages(pkg)
		expect(result.map((p) => p.current)).toEqual(['1.0.0', '2.1.3', '3.0.0', '4.0.0'])
	})

	it('handles missing dependencies/devDependencies', () => {
		expect(getRokkitPackages({})).toEqual([])
	})
})

describe('detectPackageManager', () => {
	it('detects bun from bun.lock', () => {
		expect(detectPackageManager(['bun.lock'])).toBe('bun')
	})

	it('detects bun from bun.lockb', () => {
		expect(detectPackageManager(['bun.lockb'])).toBe('bun')
	})

	it('detects pnpm from pnpm-lock.yaml', () => {
		expect(detectPackageManager(['pnpm-lock.yaml'])).toBe('pnpm')
	})

	it('detects yarn from yarn.lock', () => {
		expect(detectPackageManager(['yarn.lock'])).toBe('yarn')
	})

	it('defaults to npm when no lockfile', () => {
		expect(detectPackageManager([])).toBe('npm')
	})

	it('prefers bun over pnpm when both present', () => {
		expect(detectPackageManager(['bun.lock', 'pnpm-lock.yaml'])).toBe('bun')
	})
})

describe('buildInstallCommand', () => {
	it('builds bun command', () => {
		const result = buildInstallCommand('bun', ['@rokkit/ui@1.1.0'])
		expect(result).toEqual({ bin: 'bun', args: ['add', '@rokkit/ui@1.1.0'] })
	})

	it('builds pnpm command', () => {
		const result = buildInstallCommand('pnpm', ['@rokkit/ui@1.1.0', '@rokkit/themes@2.0.0'])
		expect(result).toEqual({ bin: 'pnpm', args: ['add', '@rokkit/ui@1.1.0', '@rokkit/themes@2.0.0'] })
	})

	it('builds yarn command', () => {
		const result = buildInstallCommand('yarn', ['@rokkit/ui@1.1.0'])
		expect(result).toEqual({ bin: 'yarn', args: ['add', '@rokkit/ui@1.1.0'] })
	})

	it('builds npm command', () => {
		const result = buildInstallCommand('npm', ['@rokkit/ui@1.1.0'])
		expect(result).toEqual({ bin: 'npm', args: ['install', '@rokkit/ui@1.1.0'] })
	})
})

describe('runUpgrade', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	const makePkg = (deps) => JSON.stringify({ dependencies: deps })

	it('reports no packages found when @rokkit/* absent', () => {
		const adapters = {
			readFile: () => makePkg({ svelte: '^5.0.0' }),
			exists: (p) => p.endsWith('package.json'),
			fetchVersion: vi.fn()
		}
		runUpgrade({}, adapters)
		expect(adapters.fetchVersion).not.toHaveBeenCalled()
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No @rokkit'))
	})

	it('reports all up to date when versions match', () => {
		const adapters = {
			readFile: () => makePkg({ '@rokkit/ui': '^1.0.0' }),
			exists: (p) => p.endsWith('package.json'),
			fetchVersion: () => '1.0.0',
			runInstall: vi.fn()
		}
		runUpgrade({}, adapters)
		expect(adapters.runInstall).not.toHaveBeenCalled()
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('up to date'))
	})

	it('reports outdated packages without applying', () => {
		const adapters = {
			readFile: () => makePkg({ '@rokkit/ui': '^1.0.0' }),
			exists: (p) => p.endsWith('package.json'),
			fetchVersion: () => '1.1.0',
			runInstall: vi.fn()
		}
		runUpgrade({}, adapters)
		expect(adapters.runInstall).not.toHaveBeenCalled()
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('--apply'))
	})

	it('runs install command when --apply is set', () => {
		const runInstall = vi.fn()
		const adapters = {
			readFile: () => makePkg({ '@rokkit/ui': '^1.0.0' }),
			exists: (p) => p.endsWith('package.json'),
			fetchVersion: () => '1.1.0',
			runInstall
		}
		runUpgrade({ apply: true }, adapters)
		expect(runInstall).toHaveBeenCalledOnce()
		const [bin, args] = runInstall.mock.calls[0]
		expect(args).toContain('@rokkit/ui@1.1.0')
		expect(typeof bin).toBe('string')
	})

	it('errors when package.json is missing', () => {
		const adapters = {
			exists: () => false,
			fetchVersion: vi.fn()
		}
		runUpgrade({}, adapters)
		expect(adapters.fetchVersion).not.toHaveBeenCalled()
		expect(console.error).toHaveBeenCalled()
	})

	it('skips package when fetch returns null', () => {
		const runInstall = vi.fn()
		const adapters = {
			readFile: () => makePkg({ '@rokkit/ui': '^1.0.0' }),
			exists: (p) => p.endsWith('package.json'),
			fetchVersion: () => null,
			runInstall
		}
		runUpgrade({ apply: true }, adapters)
		expect(runInstall).not.toHaveBeenCalled()
	})
})
