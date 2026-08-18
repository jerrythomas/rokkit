/* eslint-disable no-console */
/**
 * Console reporting for `doctor`: print per-check status lines, fix hints and
 * manual action items, and orchestrate the auto-fix flow summary.
 */
import { autoFix } from './fix.js'

/**
 * Print fix hints for failing checks
 * @param {Array} checks
 */
function printFixHints(checks) {
	for (const check of checks) {
		if (check.status === 'fail' || check.status === 'warn') {
			console.info(`         ${check.fixable ? '(auto-fixable) ' : ''}${check.fix}`)
		}
	}
}

/**
 * Print remaining manual action items
 * @param {Array} checks
 */
function printManualItems(checks) {
	for (const check of checks) {
		if (check.status === 'fail' && !check.fixable) {
			console.info(`  - ${check.label}: ${check.fix}`)
		}
	}
}

/**
 * Count failures and print status for each check.
 * @param {Array} checks
 * @returns {number}
 */
export function printChecks(checks) {
	let failures = 0
	for (const check of checks) {
		const icon = check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL'
		console.info(`  ${icon}  ${check.label}`)
		if (check.status === 'fail') failures++
	}
	return failures
}

/**
 * Handle auto-fix flow and print results.
 * @param {Array} checks
 * @param {string} cwd
 * @param {number} failures
 */
function handleAutoFix(checks, cwd, failures) {
	console.info('\nAuto-fixing...\n')
	const fixed = autoFix(checks, cwd)
	const remaining = failures - fixed
	if (remaining > 0) {
		console.info(`\n${fixed} fixed, ${remaining} require manual action:`)
		printManualItems(checks)
	} else {
		console.info(`\nAll ${fixed} issues fixed!`)
	}
}

/**
 * @param {Array} checks
 * @param {string} cwd
 * @param {number} failures
 * @param {boolean} fix
 */
export function handleResults(checks, cwd, failures, fix) {
	if (failures === 0) return
	if (fix) {
		handleAutoFix(checks, cwd, failures)
	} else {
		printFixHints(checks)
		process.exitCode = 1
	}
}
