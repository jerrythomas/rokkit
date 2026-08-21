/**
 * Shared shell state for the /app chat-shell route + its sub-routes.
 *
 * The layout owns the chrome / sidebar / chat-left / canvas regions and renders
 * branched content based on `phase` and `demoType`. Each sub-route's
 * `+page.svelte` is a thin state-setter that updates these fields onMount, so
 * URL navigation becomes the source of truth for which demo is mounted.
 */
export type ShellPhase = 'landing' | 'thinking' | 'response'
export type ShellDemoType =
	| 'tabs'
	| 'theme-wizard'
	| 'table'
	| 'tree-table'
	| 'tree'
	| 'multi-select'
	| 'list'
	| 'toasts'
	| 'form'
	| 'select'
	| 'chart'
	| 'sparkline'
	| 'combo'
	| 'date-picker'
	| 'stepper'
	| 'button'
	| 'badge'
	| 'pill'
	| 'avatar'
	| 'divider'
	| 'message'
	| 'swatch'
	| 'range'
	| 'rating'
	| 'switch'
	| 'toggle'
	| 'breadcrumbs'
	| 'menu'
	| 'toolbar'
	| 'floating-action'
	| 'floating-navigation'
	| 'stack'
	| 'grid'
	| 'card'
	| 'carousel'
	| 'lazy-tree'
	| 'status-list'
	| 'timeline'
	| 'code'
	| 'markdown-renderer'
	| 'search-filter'
	| 'palette-manager'
	| 'dropdown'
	| 'progress'
	| 'upload-progress'
	| 'upload-target'
	| 'button-group'
	| 'tooltip'
	| 'code-group'
	| 'effects'
	| 'lock-mode'
	| 'chat'
	| 'frame'
	| 'responsive-grid'
	| 'nav-content'

export const shell = $state<{
	phase: ShellPhase
	demoType: ShellDemoType | null
	demoVariant: string | null
	lastQuery: string
	collapsed: boolean
	composerValue: string
	/**
	 * Browse-first presentation of the landing surface (`/app/catalog`): same catalog
	 * grid, no welcome hero.
	 *
	 * A flag rather than a fourth `ShellPhase` on purpose. Browse differs from landing
	 * only in whether the hero shows — everything else (composer placeholder, the
	 * type-to-filter wiring, the canvas body) is identical. A new phase would have to be
	 * threaded through ~40 `shell.phase ===` branches in the shell layout to reproduce
	 * behaviour that already exists, and each of those is a chance to miss one.
	 */
	browse: boolean
}>({
	phase: 'landing',
	demoType: null,
	demoVariant: null,
	lastQuery: '',
	collapsed: false,
	composerValue: '',
	browse: false
})

export function setShellResponse(demoType: ShellDemoType, query?: string): void {
	shell.phase = 'response'
	shell.demoType = demoType
	if (query) shell.lastQuery = query
}

export function setShellVariant(variant: string | null): void {
	shell.demoVariant = variant
}

export function setShellLanding(): void {
	shell.phase = 'landing'
	shell.demoType = null
	shell.demoVariant = null
	// Navigating back to /app leaves browse mode — otherwise the hero would stay hidden
	// after visiting /app/catalog once.
	shell.browse = false
}

/** The `/app/catalog` browse route: the landing surface with the hero suppressed. */
export function setShellBrowse(): void {
	shell.phase = 'landing'
	shell.demoType = null
	shell.demoVariant = null
	shell.browse = true
}
