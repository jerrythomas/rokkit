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
	printAdvisories('Config shape', validateConfigShape(parsed))
	printAdvisories('Contrast (WCAG AA · light + dark)', checkContrastTokens(parsed))
	printAdvisories('Token usage', checkTextTokenUsage(createFsAdapter(cwd)))

	handleResults(checks, cwd, failures, opts.fix ?? false)
	console.info('')
}

/**
 * Print one titled advisory section, or nothing at all when there is nothing to
 * report. Replaces three identical if/heading/loop blocks — and, with them,
 * three separate coverage-ignore comments saying the same thing.
 *
 * @param {string} title
 * @param {Array<{ label: string, fix: string }>} findings
 */
/* v8 ignore start -- every caller is empty under test: loadConfig uses a dynamic
   file:// import that always fails in JSDOM (so parsed is null and both config-derived
   lists are []), and the doctor() test's temp project is clean (so the usage walk finds
   nothing), which means this never gets past its own guard. The check logic itself is
   covered directly in contrast.spec.js and via validateConfigShape /
   checkTextTokenUsage. The ignore wraps the WHOLE function rather than a counted line
   range: with an early return the function's tail is unreached too, and a `next N` count
   silently drifts the moment a line is added. */
function printAdvisories(title, findings) {
	if (findings.length === 0) return
	console.info(`\n${title}:`)
	for (const c of findings) {
		console.info(`  WARN  ${c.label}`)
		console.info(`        ${c.fix}`)
	}
}
/* v8 ignore stop */
