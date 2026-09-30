import { PlotConfig } from './state/PlotConfig.svelte.js'
import { GeomRegistry } from './state/GeomRegistry.svelte.js'
import { PlotFrame } from './state/PlotFrame.svelte.js'
import { ChannelState } from './state/ChannelState.svelte.js'
import { OrientationState } from './state/OrientationState.svelte.js'
import { InteractionState } from './state/InteractionState.svelte.js'
import { ScaleState } from './state/ScaleState.svelte.js'
import { AestheticState } from './state/AestheticState.svelte.js'
import { AxisState } from './state/AxisState.svelte.js'

/**
 * The state a `PlotChart` publishes on the `'plot-state'` context — a COMPOSITION of job
 * classes (`./state/`), each owning one concern and reading only the ones built before it:
 *
 *   config → geoms → frame → channels → orientation → interaction → scales → aesthetics → axes
 *
 * It derives nothing itself. Everything below the constructor is the contract geoms, axes, the
 * legend and the tooltip read (`GEOM_CONTRACT` in SparkState.svelte.js is the geom-facing part),
 * kept as one-line delegations so no consumer changed when the monolith was taken apart. New
 * code can depend on a job directly — `plotState.scales`, `plotState.interactionState` — instead.
 */
export class PlotState {
	/** The plot's inputs — the only thing `update()` writes. */
	config
	/** The mounted geoms and the rows each draws. */
	geoms
	/** The drawing area: size less margin. */
	frame
	/** Which field feeds each aesthetic. Suffixed: `channels` is the contract's raw map. */
	channelState
	/** Which way the chart reads. Suffixed: `orientation` is the contract's string. */
	orientationState
	/** Hover, selection, zoom. */
	interactionState
	/** The x / y position scales. */
	scales
	/** Palette, patterns, symbols, continuous colour. */
	aesthetics
	/** Where the axes cross. */
	axes

	constructor(config = {}) {
		this.config = new PlotConfig(config)
		this.geoms = new GeomRegistry(this.config, 'geom')
		this.frame = new PlotFrame(this.config)
		this.channelState = new ChannelState(this.config, this.geoms)
		this.orientationState = new OrientationState(this.config, this.channelState, this.geoms)
		this.interactionState = new InteractionState(this.config, config.selected)
		this.scales = new ScaleState({
			config: this.config,
			geoms: this.geoms,
			channels: this.channelState,
			orientation: this.orientationState,
			frame: this.frame,
			interaction: this.interactionState
		})
		this.aesthetics = new AestheticState(this.config, this.channelState)
		this.axes = new AxisState(this.config, this.scales, this.frame)
	}

	/** Re-apply inputs. Which omitted fields keep and which reset: `CONFIG_FIELDS`. */
	update(config) {
		this.config.update(config)
	}

	// ─── config ────────────────────────────────────────────────────────────────
	/** The rows — the same objects every identity geom is handed, so `indexOf(row)` works. */
	get data() {
		return this.config.data
	}
	/** The caller's channel map, unmerged. `channelState.effective` is the merged one. */
	get channels() {
		return this.config.channels
	}
	get mode() {
		return this.config.mode
	}
	get chartPreset() {
		return this.config.chartPreset
	}
	/** A continuous category axis (a bar race's tweened rank) rather than a band. */
	get continuousCategory() {
		return this.config.continuousCategory
	}
	/** Pin the axis crossing directly — also reachable through `update({ axisOrigin })`. */
	get axisOrigin() {
		return this.config.axisOrigin
	}
	set axisOrigin(value) {
		this.config.axisOrigin = value
	}
	label(field) {
		return this.config.label(field)
	}
	format(field) {
		return this.config.format(field)
	}
	tooltip() {
		return this.config.tooltip()
	}
	geomComponent(type) {
		return this.config.geomComponent(type)
	}
	preset() {
		return this.config.resolvedPreset()
	}

	// ─── geoms ─────────────────────────────────────────────────────────────────
	registerGeom(config) {
		return this.geoms.register(config)
	}
	updateGeom(id, config) {
		this.geoms.update(id, config)
	}
	unregisterGeom(id) {
		this.geoms.unregister(id)
	}
	geomData(id) {
		return this.geoms.data(id)
	}
	/** The legend picks a swatch style from these. */
	get geomTypes() {
		return this.geoms.types
	}

	// ─── frame ─────────────────────────────────────────────────────────────────
	get margin() {
		return this.frame.margin
	}
	get innerWidth() {
		return this.frame.innerWidth
	}
	get innerHeight() {
		return this.frame.innerHeight
	}

	// ─── channels ──────────────────────────────────────────────────────────────
	/** Null for a literal CSS colour — it maps to no field. */
	get colorField() {
		return this.channelState.colorField
	}
	get fillField() {
		return this.channelState.fillField
	}
	get patternField() {
		return this.channelState.patternField
	}
	get symbolField() {
		return this.channelState.symbolField
	}

	// ─── orientation ───────────────────────────────────────────────────────────
	get orientation() {
		return this.orientationState.orientation
	}
	/** Rendered horizontally: the band axis stands up the screen. Channels are unchanged. */
	get isFlipped() {
		return this.orientationState.flipped
	}
	/** Channel space to screen: `const { x, y } = plotState.place(xScale(d[x]), yScale(d[y]))`. */
	place(u, v) {
		return this.orientationState.place(u, v)
	}

	// ─── scales ────────────────────────────────────────────────────────────────
	get xScale() {
		return this.scales.x
	}
	get yScale() {
		return this.scales.y
	}
	/** The categorical scale, whichever screen axis it is on. */
	get bandScale() {
		return this.scales.band
	}
	/** The value scale, whichever screen axis it is on. */
	get valueScale() {
		return this.scales.value
	}

	// ─── aesthetics ────────────────────────────────────────────────────────────
	get colors() {
		return this.aesthetics.colors
	}
	get patterns() {
		return this.aesthetics.patterns
	}
	get symbols() {
		return this.aesthetics.symbols
	}
	get colorScaleType() {
		return this.aesthetics.colorScaleType
	}
	get continuousColorScale() {
		return this.aesthetics.continuousColorScale
	}

	// ─── axes ──────────────────────────────────────────────────────────────────
	get xAxisY() {
		return this.axes.xAxisY
	}
	get yAxisX() {
		return this.axes.yAxisX
	}

	// ─── interaction ───────────────────────────────────────────────────────────
	get hovered() {
		return this.interactionState.hovered
	}
	get interactive() {
		return this.interactionState.interactive
	}
	get selectedRows() {
		return this.interactionState.selectedRows
	}
	setHovered(row) {
		this.interactionState.setHovered(row)
	}
	clearHovered() {
		this.interactionState.clearHovered()
	}
	isSelected(row) {
		return this.interactionState.isSelected(row)
	}
	setSelected(rows) {
		this.interactionState.setSelected(rows)
	}
	clearSelected() {
		this.interactionState.clearSelected()
	}
	handleSelect(detail) {
		this.interactionState.handleSelect(detail)
	}
	applyZoom(transform) {
		this.interactionState.applyZoom(transform)
	}
	resetZoom() {
		this.interactionState.resetZoom()
	}
}
