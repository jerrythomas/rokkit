/* The `canvasNavigation` action: drag the background to pan, ctrl/⌘-wheel (a trackpad pinch)
 * to zoom. A press that starts on anything interactive is not a pan.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { canvasNavigation } from '../../src/actions/canvas.js'

let paper: HTMLElement
let onzoom: ReturnType<typeof vi.fn>
let handle: { update: (p: never) => void; destroy: () => void }

beforeEach(() => {
	paper = document.createElement('div')
	paper.innerHTML = `<div data-bg></div><button data-box>box</button><div data-graph-node="n">card</div>`
	paper.setPointerCapture = vi.fn()
	document.body.append(paper)
	onzoom = vi.fn()
	handle = canvasNavigation(paper, { zoomable: true, onzoom }) as never
})
afterEach(() => {
	handle.destroy()
	paper.remove()
})

const pointer = (el: Element, type: string, x: number, y: number) =>
	el.dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }), { pointerId: 1 }))
const wheel = (init: WheelEventInit) => {
	const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
	paper.dispatchEvent(event)
	return event
}

describe('canvasNavigation — pan', () => {
	it('scrolls the paper against the drag, and marks it panning while it lasts', () => {
		paper.scrollLeft = 100
		paper.scrollTop = 50
		pointer(paper.querySelector('[data-bg]')!, 'pointerdown', 200, 200)
		expect(paper.hasAttribute('data-graph-panning')).toBe(true)
		expect(paper.setPointerCapture).toHaveBeenCalledWith(1)
		pointer(paper, 'pointermove', 180, 170)
		expect([paper.scrollLeft, paper.scrollTop]).toEqual([120, 80])
		pointer(paper, 'pointerup', 180, 170)
		expect(paper.hasAttribute('data-graph-panning')).toBe(false)
		pointer(paper, 'pointermove', 0, 0)
		expect([paper.scrollLeft, paper.scrollTop]).toEqual([120, 80])
	})

	it('does not start on a box or a card — a press there is a click', () => {
		pointer(paper.querySelector('[data-box]')!, 'pointerdown', 0, 0)
		pointer(paper.querySelector('[data-graph-node]')!, 'pointerdown', 0, 0)
		expect(paper.hasAttribute('data-graph-panning')).toBe(false)
		expect(paper.setPointerCapture).not.toHaveBeenCalled()
	})

	it('ends on a cancelled pointer too', () => {
		pointer(paper.querySelector('[data-bg]')!, 'pointerdown', 0, 0)
		pointer(paper, 'pointercancel', 0, 0)
		expect(paper.hasAttribute('data-graph-panning')).toBe(false)
	})
})

describe('canvasNavigation — zoom', () => {
	it('zooms in on a pinch (ctrl-wheel up) and out on the way back, keeping the page still', () => {
		const pinch = wheel({ deltaY: -10, ctrlKey: true })
		expect(onzoom).toHaveBeenLastCalledWith('in')
		expect(pinch.defaultPrevented).toBe(true)
		wheel({ deltaY: 10, metaKey: true })
		expect(onzoom).toHaveBeenLastCalledWith('out')
	})

	it('leaves a plain wheel to scroll the canvas', () => {
		const plain = wheel({ deltaY: 10 })
		expect(onzoom).not.toHaveBeenCalled()
		expect(plain.defaultPrevented).toBe(false)
	})

	it('does not zoom when the canvas is not zoomable', () => {
		handle.update({ zoomable: false, onzoom } as never)
		wheel({ deltaY: -10, ctrlKey: true })
		expect(onzoom).not.toHaveBeenCalled()
	})

	it('stops listening once destroyed', () => {
		handle.destroy()
		wheel({ deltaY: -10, ctrlKey: true })
		pointer(paper.querySelector('[data-bg]')!, 'pointerdown', 0, 0)
		expect(onzoom).not.toHaveBeenCalled()
		expect(paper.hasAttribute('data-graph-panning')).toBe(false)
	})
})
