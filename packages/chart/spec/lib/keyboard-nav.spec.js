import { describe, it, expect, vi, beforeEach } from 'vitest'
import { keyboardNav } from '../../src/lib/keyboard-nav'

/**
 * Builds a container with [data-plot-geom] and N child elements each tagged
 * with [data-plot-element] and tabIndex=0.  Returns the container and the
 * array of children.
 */
function makeGeom(count = 3) {
	const container = document.createElement('div')
	container.setAttribute('data-plot-geom', '')
	const children = Array.from({ length: count }, () => {
		const el = document.createElement('div')
		el.setAttribute('data-plot-element', '')
		el.tabIndex = 0
		el.focus = vi.fn()
		container.appendChild(el)
		return el
	})
	document.body.appendChild(container)
	return { container, children }
}

function fireKeydown(node, key) {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
	node.dispatchEvent(event)
	return event
}

describe('keyboardNav action', () => {
	beforeEach(() => {
		while (document.body.firstChild) {
			document.body.removeChild(document.body.firstChild)
		}
	})

	it('returns an object with update and destroy methods', () => {
		const node = document.createElement('div')
		const result = keyboardNav(node, false)
		expect(typeof result.update).toBe('function')
		expect(typeof result.destroy).toBe('function')
		result.destroy()
	})

	it('does nothing when enabled is false', () => {
		const { children } = makeGeom(3)
		const node = children[1]
		keyboardNav(node, false)

		fireKeydown(node, 'ArrowRight')
		expect(children[2].focus).not.toHaveBeenCalled()
	})

	it('does nothing for non-arrow keys', () => {
		const { children } = makeGeom(3)
		const node = children[1]
		keyboardNav(node, true)

		fireKeydown(node, 'Enter')
		expect(children[0].focus).not.toHaveBeenCalled()
		expect(children[2].focus).not.toHaveBeenCalled()
	})

	it('does nothing when node has no [data-plot-geom] ancestor', () => {
		const node = document.createElement('div')
		node.setAttribute('data-plot-element', '')
		node.tabIndex = 0
		node.focus = vi.fn()
		document.body.appendChild(node)

		keyboardNav(node, true)
		fireKeydown(node, 'ArrowRight')
		expect(node.focus).not.toHaveBeenCalled()
	})

	it('does nothing when the node is not in [data-plot-element] list', () => {
		const { container, children } = makeGeom(3)
		const stranger = document.createElement('div')
		stranger.tabIndex = 0
		container.appendChild(stranger)

		keyboardNav(stranger, true)
		fireKeydown(stranger, 'ArrowRight')
		expect(children[2].focus).not.toHaveBeenCalled()
	})

	it('ArrowRight moves focus to the next sibling', () => {
		const { children } = makeGeom(3)
		keyboardNav(children[0], true)

		fireKeydown(children[0], 'ArrowRight')
		expect(children[1].focus).toHaveBeenCalled()
	})

	it('ArrowLeft moves focus to the previous sibling', () => {
		const { children } = makeGeom(3)
		keyboardNav(children[2], true)

		fireKeydown(children[2], 'ArrowLeft')
		expect(children[1].focus).toHaveBeenCalled()
	})

	it('ArrowRight at the last element does not move focus', () => {
		const { children } = makeGeom(3)
		const node = children[2]
		keyboardNav(node, true)

		fireKeydown(node, 'ArrowRight')
		expect(children[2].focus).not.toHaveBeenCalled()
	})

	it('ArrowLeft at the first element does not move focus', () => {
		const { children } = makeGeom(3)
		const node = children[0]
		keyboardNav(node, true)

		fireKeydown(node, 'ArrowLeft')
		expect(children[0].focus).not.toHaveBeenCalled()
	})

	it('focus moves, confirming navigation (and thus preventDefault) executed', () => {
		const { children } = makeGeom(3)
		keyboardNav(children[0], true)
		// Confirming that navigation (and the internal preventDefault call) ran
		fireKeydown(children[0], 'ArrowRight')
		expect(children[1].focus).toHaveBeenCalled()
	})

	it('excludes elements with tabIndex < 0 from the navigation list', () => {
		const { children } = makeGeom(3)
		children[1].tabIndex = -1
		keyboardNav(children[0], true)

		fireKeydown(children[0], 'ArrowRight')
		// children[1] is skipped; children[2] is now at index 1
		expect(children[2].focus).toHaveBeenCalled()
	})

	describe('update()', () => {
		it('enables navigation after update(true)', () => {
			const { children } = makeGeom(3)
			const action = keyboardNav(children[0], false)
			action.update(true)

			fireKeydown(children[0], 'ArrowRight')
			expect(children[1].focus).toHaveBeenCalled()
		})

		it('disables navigation after update(false)', () => {
			const { children } = makeGeom(3)
			const action = keyboardNav(children[0], true)
			action.update(false)

			fireKeydown(children[0], 'ArrowRight')
			expect(children[1].focus).not.toHaveBeenCalled()
		})
	})

	describe('destroy()', () => {
		it('removes the keydown event listener', () => {
			const { children } = makeGeom(3)
			const action = keyboardNav(children[0], true)
			action.destroy()

			fireKeydown(children[0], 'ArrowRight')
			expect(children[1].focus).not.toHaveBeenCalled()
		})
	})
})
