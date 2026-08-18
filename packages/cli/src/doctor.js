/* eslint-disable no-console */
/**
 * The `rokkit doctor` command — validates project setup, then reports and
 * auto-fixes issues.
 *
 * Check definitions live in `checks.js`, the fs adapter + auto-fix handlers in
 * `fix.js`, console reporting in `report.js`, and advisory shape/lint checks in
 * `validate.js`. This file is the command orchestration + public surface.
 */
import { loadConfig as loadParsedConfig } from './config.js'
import { checkContrastTokens } from './contrast.js'
import { runChecks } from './checks.js'
import { createFsAdapter } from './fix.js'
import { handleResults, printChecks } from './report.js'
import { validateConfigShape, checkTextTokenUsage } from './validate.js'

export { runChecks } from './checks.js'
export { defaultStarterSource } from './fix.js'
export { validateConfigShape, checkTextTokenUsage } from './validate.js'

/**
 * Interactive doctor command — validates project setup.
 * @param {{ fix?: boolean }} [opts]
 */
export async function doctor(opts = {}) {
	const cwd = process.cwd()
	const checks = runChecks(createFsAdapter(cwd))

	console.info('Rokkit Doctor\n')
	const failures = printChecks(checks)

	const parsed = await loadParsedConfig({ cwd })
	const shapeChecks = validateConfigShape(parsed)
	/* v8 ignore next 8 -- loadConfig uses dynamic file:// import which always fails in
	   JSDOM; validateConfigShape(null) returns [] so this branch is unreachable in tests */
	if (shapeChecks.length > 0) {
		console.info('\nConfig shape:')
		for (const c of shapeChecks) {
			console.info(`  WARN  ${c.label}`)
			console.info(`        ${c.fix}`)
		}
	}

	const contrastChecks = checkContrastTokens(parsed)
	/* v8 ignore start -- loadConfig uses a dynamic file:// import which always fails in
	   JSDOM, so parsed is null and contrastChecks is [] → this print block is unreachable
	   in tests. The check logic itself is covered directly in contrast.spec.js. */
	if (contrastChecks.length > 0) {
		console.info('\nContrast (WCAG AA · light + dark):')
		for (const c of contrastChecks) {
			console.info(`  WARN  ${c.label}`)
			console.info(`        ${c.fix}`)
		}
	}
	/* v8 ignore stop */

	const usageChecks = checkTextTokenUsage(createFsAdapter(cwd))
	/* v8 ignore start -- this print block depends on the real filesystem walk finding
	   a misused token in cwd; in the JSDOM doctor() test the temp project is clean, so
	   usageChecks is [] and this is unreachable. checkTextTokenUsage is covered directly. */
	if (usageChecks.length > 0) {
		console.info('\nToken usage:')
		for (const c of usageChecks) {
			console.info(`  WARN  ${c.label}`)
			console.info(`        ${c.fix}`)
		}
	}
	/* v8 ignore stop */

	handleResults(checks, cwd, failures, opts.fix ?? false)
	console.info('')
}
