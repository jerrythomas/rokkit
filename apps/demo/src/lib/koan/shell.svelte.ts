/**
 * Shared shell state for the /app chat-shell route + its sub-routes.
 *
 * The layout owns the chrome / sidebar / chat-left / canvas regions and renders
 * branched content based on `phase` and `demoType`. Each sub-route's
 * `+page.svelte` is a thin state-setter that updates these fields onMount, so
 * URL navigation becomes the source of truth for which demo is mounted.
 */
export type ShellPhase = 'welcome' | 'thinking' | 'response' | 'catalog'
export type ShellDemoType = 'tabs' | 'theme-wizard' | 'table' | 'tree' | 'multi-select' | 'list' | 'toasts' | 'form' | 'select' | 'chart' | 'combo' | 'date-picker' | 'stepper'

export const shell = $state<{
	phase: ShellPhase
	demoType: ShellDemoType | null
	demoVariant: string | null
	lastQuery: string
	collapsed: boolean
	composerValue: string
}>({
	phase: 'welcome',
	demoType: null,
	demoVariant: null,
	lastQuery: '',
	collapsed: false,
	composerValue: ''
})

export function setShellResponse(demoType: ShellDemoType, query?: string): void {
	shell.phase = 'response'
	shell.demoType = demoType
	if (query) shell.lastQuery = query
}

export function setShellVariant(variant: string | null): void {
	shell.demoVariant = variant
}

export function setShellWelcome(): void {
	shell.phase = 'welcome'
	shell.demoType = null
	shell.demoVariant = null
}

export function setShellCatalog(): void {
	shell.phase = 'catalog'
	shell.demoType = null
	shell.demoVariant = null
}
