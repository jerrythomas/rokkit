/**
 * Where the axes cross, in screen coordinates.
 *
 * At an explicit `axisOrigin` (a BCG or risk matrix); else at zero when the domain spans it
 * (two- and four-quadrant charts fall out of where zero sits); else pinned to the bottom / left
 * edge, pushed outward by `axisOffset`. A band x axis always pins left.
 */
export class AxisState {
	#config
	#scales
	#frame

	/**
	 * @param {import('./PlotConfig.svelte.js').PlotConfig} config
	 * @param {{ x: any, y: any }} scales
	 * @param {{ innerWidth: number, innerHeight: number }} frame
	 */
	constructor(config, scales, frame) {
		this.#config = config
		this.#scales = scales
		this.#frame = frame
	}

	/** The x axis's screen y. */
	xAxisY = $derived.by(() => {
		const y = this.#scales.y
		if (typeof y !== 'function') return this.#frame.innerHeight
		const cross = this.#config.axisOrigin[1]
		if (cross !== undefined) return y(cross)
		const domain = y.domain()
		if (domain[0] <= 0 && domain[domain.length - 1] >= 0) return y(0)
		return this.#offset(y(domain[0]), 1)
	})

	/** The y axis's screen x. */
	yAxisX = $derived.by(() => {
		const x = this.#scales.x
		if (typeof x !== 'function') return 0
		const cross = this.#config.axisOrigin[0]
		if (cross !== undefined) return x(cross)
		if (typeof x.bandwidth === 'function') return 0
		const domain = x.domain()
		if (domain[0] <= 0 && domain[domain.length - 1] >= 0) return x(0)
		return this.#offset(x(domain[0]), -1)
	})

	/**
	 * Push an edge-pinned axis outward by `axisOffset`. Only when there IS an offset: a scale with
	 * an empty domain (a race's first frame, before any rows) returns undefined, and
	 * `undefined + 0` is NaN — which lands in the axis transform as `translate(NaN, 0)`.
	 */
	#offset(base, direction) {
		const offset = this.#config.axisOffset
		return offset ? base + direction * offset : base
	}
}
