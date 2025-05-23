import { describe, expect, it } from 'vitest'
import { defaultIcons, stateIconsFromNames, defaultFields } from '../src/constants'

describe('Utility functions', () => {
	it('should convert names to nested state icons object', () => {
		const stateIcons = stateIconsFromNames(defaultIcons)

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
				close: 'action-close'
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
				empty: 'rating-empty',
				half: 'rating-half'
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
			},
			state: {
				error: 'state-error',
				warning: 'state-warning',
				success: 'state-success',
				info: 'state-info',
				unknown: 'state-unknown'
			},
			badge: {
				fail: 'badge-fail',
				warn: 'badge-warn',
				pass: 'badge-pass',
				unknown: 'badge-unknown'
			},
			sort: {
				ascending: 'sort-ascending',
				descending: 'sort-descending',
				none: 'sort-none'
			},
			validity: {
				failed: 'validity-failed',
				passed: 'validity-passed',
				unknown: 'validity-unknown',
				warning: 'validity-warning'
			}
		})
	})

	it('should have the defaultFields', () => {
		expect(defaultFields).toEqual({
			id: 'id',
			href: 'href',
			icon: 'icon',
			text: 'text',
			value: 'value',
			keywords: 'keywords',
			children: 'children',
			iconPrefix: null,
			image: 'image',
			summary: 'summary',
			notes: 'notes',
			props: 'props',
			target: 'target',
			state: 'state',
			label: 'label',
			level: 'level',
			parent: 'parent',
			component: 'component',
			snippet: 'snippet',
			currency: 'currency',
			expanded: '_expanded',
			deleted: '_deleted',
			selected: '_selected'
		})
	})
})
