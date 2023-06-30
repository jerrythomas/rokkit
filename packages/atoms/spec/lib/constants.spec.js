import { describe, expect, it } from 'vitest'
import { defaultIcons, stateIconsFromNames } from '../../src/lib/constants'

describe('Utility functions', () => {
	it('should convert names to nested state icons object', () => {
		const stateIcons = stateIconsFromNames(defaultIcons)
		// console.log(JSON.stringify(stateIcons, null, 2))
		expect(stateIcons).toEqual({
			accordion: {
				opened: 'accordion-opened',
				closed: 'accordion-closed'
			},
			action: {
				remove: 'action-remove',
				add: 'action-add',
				clear: 'action-clear',
				search: 'action-search',
				close: 'action-close-filled'
			},
			node: {
				opened: 'node-opened',
				closed: 'node-closed'
			},
			selector: {
				opened: 'selector-opened',
				closed: 'selector-closed'
			},
			checkbox: {
				checked: 'checkbox-checked',
				unchecked: 'checkbox-unchecked',
				unknown: 'checkbox-unknown'
			},
			rating: {
				filled: 'rating-filled',
				empty: 'rating-empty'
			},
			radio: {
				off: 'radio-off',
				on: 'radio-on'
			},
			mode: {
				dark: 'mode-dark',
				light: 'mode-light'
			},
			navigate: {
				down: 'navigate-down',
				left: 'navigate-left',
				right: 'navigate-right',
				up: 'navigate-up'
			}
		})
	})
})
