import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { vibe } from '@rokkit/states'
import ThemeSwitcherToggle from '../src/components/ThemeSwitcherToggle.svelte'

// ColorModeManager.listen() reads window.matchMedia (OS-preference tracking).
beforeEach(() => {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false
	}))
})

/**
 * The `single` (and `pair`) variants only deal with light/dark, so they must
 * reflect the RESOLVED mode — not the abstract ColorMode, which can be 'system'.
 * Regression guard for the bug where a 'system' mode fell outside the
 * [light, dark] options and the single control mislabelled (e.g. "switch to
 * light" while already light), making the first click a no-op.
 */
function singleIconClass(): string {
	const { container } = render(ThemeSwitcherToggle, { props: { variant: 'single' } })
	const icon = container.querySelector('[data-toggle-variant="button"] [data-toggle-icon]')
	return icon?.className ?? ''
}

describe('ThemeSwitcherToggle single variant reflects the resolved mode', () => {
	it('targets dark when the page resolves to light', () => {
		vibe.mode = 'light'
		// light page → the single control offers "switch to dark"
		expect(singleIconClass()).toMatch(/dark/)
	})

	it('targets light when the page resolves to dark', () => {
		vibe.mode = 'dark'
		expect(singleIconClass()).toMatch(/light/)
	})
})
