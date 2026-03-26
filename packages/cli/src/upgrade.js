/* eslint-disable no-console */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { execFileSync } from 'child_process'

/**
 * Extract @rokkit/* packages from a parsed package.json object.
 * @param {Record<string, unknown>} pkgJson
 * @returns {{ name: string, current: string }[]}
 */
export function getRokkitPackages(pkgJson) {
	const deps = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) }
	return Object.entries(deps)
		.filter(([name]) => name.startsWith('@rokkit/'))
		.map(([name, version]) => ({ name, current: String(version).replace(/^[\^~>=<]+/, '') }))
}

/**
 * Detect the package manager from lockfile presence.
 * @param {string[]} lockfiles — list of lockfile names that exist in cwd
 * @returns {'bun' | 'pnpm' | 'yarn' | 'npm'}
 */
export function detectPackageManager(lockfiles) {
	if (lockfiles.includes('bun.lock') || lockfiles.includes('bun.lockb')) return 'bun'
	if (lockfiles.includes('pnpm-lock.yaml')) return 'pnpm'
	if (lockfiles.includes('yarn.lock')) return 'yarn'
	return 'npm'
}

/**
 * Build the install command for the given package manager.
 * @param {'bun' | 'pnpm' | 'yarn' | 'npm'} pm
 * @param {string[]} packages — package specs like `@rokkit/ui@1.2.3`
 * @returns {{ bin: string, args: string[] }}
 */
export function buildInstallCommand(pm, packages) {
	if (pm === 'bun') return { bin: 'bun', args: ['add', ...packages] }
	if (pm === 'pnpm') return { bin: 'pnpm', args: ['add', ...packages] }
	if (pm === 'yarn') return { bin: 'yarn', args: ['add', ...packages] }
	return { bin: 'npm', args: ['install', ...packages] }
}

/**
 * Run upgrade check and optionally apply it.
 *
 * @param {{ apply?: boolean }} opts
 * @param {{
 *   readFile?: (p: string) => string,
 *   exists?: (p: string) => boolean,
 *   fetchVersion?: (name: string) => string | null,
 *   runInstall?: (bin: string, args: string[]) => void
 * }} adapters — injectable for testing
 */
function resolveUpgradeAdapters(adapters) {
	return {
		readFile: adapters.readFile ?? ((p) => readFileSync(p, 'utf-8')),
		exists: adapters.exists ?? ((p) => existsSync(p)),
		fetchVersion:
			adapters.fetchVersion ??
			((name) => {
				try {
					return execFileSync('npm', ['view', name, 'version'], { encoding: 'utf-8' }).trim()
				} catch {
					return null
				}
			}),
		runInstall: adapters.runInstall ?? ((bin, args) => execFileSync(bin, args, { stdio: 'inherit' }))
	}
}

function formatPackageStatus(pkg, latest) {
	if (!latest) return `OK   ${pkg.name}  ${pkg.current}`
	if (latest === pkg.current) return `OK   ${pkg.name}  ${pkg.current}`
	return `OUT  ${pkg.name}  ${pkg.current} → ${latest}`
}

function checkPackageVersion(pkg, fetchVersion, upgrades) {
	const latest = fetchVersion(pkg.name)
	console.info(`  ${formatPackageStatus(pkg, latest)}`)
	if (latest && latest !== pkg.current) upgrades.push(`${pkg.name}@${latest}`)
}

function checkUpgrades(packages, fetchVersion) {
	const upgrades = []
	for (const pkg of packages) {
		checkPackageVersion(pkg, fetchVersion, upgrades)
	}
	return upgrades
}

function applyUpgrades(upgrades, pm, apply, runInstall) {
	const { bin, args } = buildInstallCommand(pm, upgrades)
	const cmdStr = `${bin} ${args.join(' ')}`
	if (apply) {
		console.info(`\nRunning: ${cmdStr}\n`)
		runInstall(bin, args)
		console.info('\nUpgrade complete.')
	} else {
		console.info(`\n${upgrades.length} package(s) can be upgraded.`)
		console.info(`Run with --apply to install, or manually:\n  ${cmdStr}`)
	}
}

function loadPackages(cwd, readFile, exists) {
	const pkgPath = resolve(cwd, 'package.json')
	if (!exists(pkgPath)) {
		console.error('No package.json found in current directory.')
		return null
	}
	const packages = getRokkitPackages(JSON.parse(readFile(pkgPath)))
	if (packages.length === 0) {
		console.info('No @rokkit/* packages found in package.json.')
		return null
	}
	return packages
}

function detectPm(cwd, exists) {
	const LOCKFILES = ['bun.lock', 'bun.lockb', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']
	return detectPackageManager(LOCKFILES.filter((f) => exists(resolve(cwd, f))))
}

export function runUpgrade(opts = {}, adapters = {}) {
	const cwd = process.cwd()
	const { readFile, exists, fetchVersion, runInstall } = resolveUpgradeAdapters(adapters)

	const packages = loadPackages(cwd, readFile, exists)
	if (!packages) return

	const pm = detectPm(cwd, exists)
	console.info('Rokkit Upgrade\n')

	const upgrades = checkUpgrades(packages, fetchVersion)
	if (upgrades.length === 0) {
		console.info('\nAll packages are up to date.')
		return
	}

	applyUpgrades(upgrades, pm, opts.apply, runInstall)
}

/**
 * CLI entry point for `rokkit upgrade`
 * @param {{ apply?: boolean }} opts
 */
export function upgrade(opts = {}) {
	runUpgrade(opts)
}
