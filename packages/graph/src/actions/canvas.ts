/**
 * Moving around the canvas: drag the background to pan, ctrl/⌘ + wheel to zoom.
 *
 * Ctrl/⌘ + wheel is what a trackpad pinch reports as; without preventDefault the browser
 * zooms the whole PAGE instead of the diagram. A plain wheel is left alone — the canvas
 * scrolls, which is how panning works here, and the drag is the direct-manipulation path on
 * top of it. The paper carries `data-graph-panning` while a drag lasts.
 */
import type { ActionReturn } from 'svelte/action'
import { listen } from './listen.js'

export type CanvasParams = {
	zoomable?: boolean
	/** A pinch: which way, and where — relative to the paper — so the zoom can keep that point still. */
	onzoom?: (direction: 'in' | 'out', at: { x: number; y: number }) => void
}

/**
 * What a press can start on without being a pan: a node card, and anything interactive. A pan
 * captures the pointer, and the browser then delivers the CLICK to the canvas instead of the
 * box — so a treemap box could be neither opened nor selected by mouse.
 */
const OWNS_ITS_PRESS = '[data-graph-node], button, [role="button"], a[href], input, select, textarea'

/** Drag-to-pan on the background: scroll the paper against the pointer while it is held. */
function panHandlers(paper: HTMLElement) {
	let from: { x: number; y: number; left: number; top: number } | null = null
	const end = () => {
		from = null
		paper.removeAttribute('data-graph-panning')
	}
	return {
		pointerdown(event: PointerEvent) {
			if ((event.target as Element).closest(OWNS_ITS_PRESS)) return
			from = { x: event.clientX, y: event.clientY, left: paper.scrollLeft, top: paper.scrollTop }
			paper.setAttribute('data-graph-panning', '')
			paper.setPointerCapture(event.pointerId)
		},
		pointermove(event: PointerEvent) {
			if (!from) return
			paper.scrollLeft = from.left - (event.clientX - from.x)
			paper.scrollTop = from.top - (event.clientY - from.y)
		},
		pointerup: end,
		pointercancel: end
	}
}

/** A pinch (ctrl/⌘ + wheel) zooms; a plain wheel is left to scroll. */
function zoomHandler(params: () => CanvasParams) {
	return (event: WheelEvent) => {
		if (!params().zoomable || !(event.ctrlKey || event.metaKey)) return
		event.preventDefault()
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
		params().onzoom?.(event.deltaY < 0 ? 'in' : 'out', { x: event.clientX - box.left, y: event.clientY - box.top })
	}
}

export function canvasNavigation(paper: HTMLElement, initial: CanvasParams): ActionReturn<CanvasParams> {
	let params = initial
	const pan = panHandlers(paper)
	const stopPan = listen(paper, pan)
	// Not passive: preventing the page zoom is the point of the wheel listener.
	const stopZoom = listen(paper, { wheel: zoomHandler(() => params) }, { passive: false })
	return {
		update(next) {
			params = next
		},
		destroy() {
			stopPan()
			stopZoom()
			pan.pointercancel()
		}
	}
}
