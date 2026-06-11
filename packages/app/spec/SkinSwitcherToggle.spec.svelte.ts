import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { vibe } from '@rokkit/states'
import SkinSwitcherToggle from '../src/components/SkinSwitcherToggle.svelte'

beforeEach(() => {
	vibe.allowedSkins = ['default', 'ocean', 'violet']
	vibe.skin = 'ocean' // set to non-default first so we can set to 'default' below
	vibe.skin = 'default'
})

describe('SkinSwitcherToggle', () => {
	it('renders an option per skin', () => {
		const { container } = render(SkinSwitcherToggle, {
			props: { skins: ['default', 'ocean', 'violet'] }
		})
		expect(container.querySelectorAll('[data-toggle-option]').length).toBe(3)
	})

	it('switching updates vibe.skin', async () => {
		const { container } = render(SkinSwitcherToggle, {
			props: { skins: ['default', 'ocean', 'violet'] }
		})
		// Toggle buttons have aria-label set to the option label (skin name)
		const ocean = container.querySelector('[data-toggle-option][aria-label="ocean"]')
		await fireEvent.click(ocean!)
		expect(vibe.skin).toBe('ocean')
	})
})
