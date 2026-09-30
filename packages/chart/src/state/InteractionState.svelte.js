import { SvelteSet } from 'svelte/reactivity'

/**
 * What the reader is doing to the chart: the hovered row, the selected rows, the zoom.
 *
 * The selection is a set of ROW objects, compared by identity — they must be the rows the
 * geoms were handed (`PlotState.data`), which is why the plot keeps one proxy for its data.
 */
export class InteractionState {
	#config
	#hovered = $state(null)
	#selected = $state(new SvelteSet())
	#zoom = $state(null)

	/**
	 * @param {import('./PlotConfig.svelte.js').PlotConfig} config
	 * @param {unknown[]} [selected] - the initial selection; afterwards the caller drives it
	 *   through `setSelected` (PlotSurface syncs its bindable prop that way)
	 */
	constructor(config, selected) {
		this.#config = config
		if (selected) this.#selected = new SvelteSet(selected)
	}

	get hovered() {
		return this.#hovered
	}
	setHovered(row) {
		this.#hovered = row
	}
	clearHovered() {
		this.#hovered = null
	}

	/** Marks are clickable: the caller listens, or selection is on. */
	get interactive() {
		return Boolean(this.#config.onselect) || this.#config.selectable
	}
	get selectedRows() {
		return [...this.#selected]
	}
	isSelected(row) {
		return this.#selected.has(row)
	}
	setSelected(rows) {
		this.#selected = new SvelteSet(rows ?? [])
	}
	clearSelected() {
		this.#selected = new SvelteSet()
	}
	/** An activation: always reported; toggles the row in the selection when selectable. */
	handleSelect(detail) {
		this.#config.onselect?.(detail)
		if (!this.#config.selectable || detail?.datum === undefined) return
		if (this.#selected.has(detail.datum)) this.#selected.delete(detail.datum)
		else this.#selected.add(detail.datum)
	}

	/** The d3-zoom transform, or null at rest. Scales rescale through it. */
	get zoom() {
		return this.#zoom
	}
	applyZoom(transform) {
		this.#zoom = transform
	}
	resetZoom() {
		this.#zoom = null
	}
}
