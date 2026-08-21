/**
 * Runtime-diagnostics collection for the screen smoke gate.
 *
 * A smoke test that only asserts "the page rendered" passes vacuously — the
 * interesting failures after a refactor are the ones the DOM still looks fine
 * through: an uncaught exception inside an event handler, a Svelte effect
 * warning, a 404 on a lazily-imported chunk. So each screen is checked on three
 * channels at once:
 *
 *   console        — `error` and `warning` messages
 *   pageerror      — uncaught exceptions (these never reach console.error)
 *   failedRequests — any response with a 4xx/5xx status
 *
 * Listeners must be attached BEFORE navigation or early-boot output is missed.
 */

/**
 * Console text we accept, each with the reason. Matching is substring-based.
 *
 * DELIBERATELY EMPTY: every screen in the gate is clean with zero allowances,
 * verified by emptying this list and re-running. Keep it that way. An entry here
 * is a real message being waved through, and a broad pattern is how a smoke gate
 * quietly stops catching anything — so add one only with a justification, and
 * prefer fixing the message.
 */
export const ALLOW = []

/** True when a collected message is on the accept-list. */
export function isAllowed(text) {
	return ALLOW.some((a) => text.includes(a.match))
}

/**
 * Attach the three listeners to a page and return the (mutating) collection.
 * Call this before `page.goto`.
 */
export function attachDiagnostics(page) {
	const found = { console: [], pageErrors: [], failedRequests: [] }

	page.on('console', (msg) => {
		const type = msg.type()
		if (type !== 'error' && type !== 'warning') return
		const text = msg.text()
		if (isAllowed(text)) return
		found.console.push({ type, text, url: msg.location()?.url ?? '' })
	})

	// Uncaught exceptions surface here, NOT on the console channel — a handler
	// that throws would otherwise be invisible to this gate.
	page.on('pageerror', (error) => {
		found.pageErrors.push({ text: error.message, stack: (error.stack ?? '').split('\n')[1]?.trim() ?? '' })
	})

	page.on('response', (response) => {
		const status = response.status()
		if (status < 400) return
		found.failedRequests.push({ status, url: response.url() })
	})

	return found
}

/** Total number of problems collected. */
export function problemCount(found) {
	return found.console.length + found.pageErrors.length + found.failedRequests.length
}

/** Human-readable report for one screen's collection. */
export function formatDiagnostics(screen, found) {
	const lines = [`## ${screen}`]
	for (const e of found.pageErrors) {
		lines.push(`  UNCAUGHT  ${e.text}${e.stack ? `\n              at ${e.stack}` : ''}`)
	}
	for (const c of found.console) {
		lines.push(`  ${c.type.toUpperCase().padEnd(8)}  ${c.text}${c.url ? `\n              (${c.url})` : ''}`)
	}
	for (const r of found.failedRequests) {
		lines.push(`  HTTP ${r.status}  ${r.url}`)
	}
    if (lines.length === 1) lines.push('  clean')
	return lines.join('\n')
}
