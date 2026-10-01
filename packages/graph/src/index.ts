// Public surface for `@rokkit/graph`.

// The canvas. It draws what a layout hands it and ships no chrome — pair it with the
// controls below, or reach for a named diagram, which is the composition already made.
export { default as Graph } from './Graph.svelte'
export { default as GraphLegend } from './GraphLegend.svelte'

// Named diagrams: one layout, the controls that mean something for that picture, an opt-in
// legend. `@rokkit/chart` has `BarChart` and `LineChart` over one `Plot`; these are the same
// idea over one `Graph`, and each is usable on its own.
export { default as ErDiagram } from './diagrams/ErDiagram.svelte'
export { default as DependencyDiagram } from './diagrams/DependencyDiagram.svelte'
export { default as CallTree } from './diagrams/CallTree.svelte'
export { default as Treemap } from './diagrams/Treemap.svelte'
export { default as Sunburst } from './diagrams/Sunburst.svelte'
export { default as StructureDiagram } from './diagrams/StructureDiagram.svelte'
export { default as Neighborhood } from './diagrams/Neighborhood.svelte'
export { default as DependencyMatrix } from './diagrams/DependencyMatrix.svelte'
export { default as LayersDiagram } from './diagrams/LayersDiagram.svelte'

// Controls, for composing your own arrangement over the bare canvas.
export { default as DensityControl } from './controls/DensityControl.svelte'
export { default as EdgeStyleControl } from './controls/EdgeStyleControl.svelte'
export { default as ZoomControl } from './controls/ZoomControl.svelte'
export { default as DepthControl } from './controls/DepthControl.svelte'
export { default as BundleControl } from './controls/BundleControl.svelte'
export { default as ViolationsControl } from './controls/ViolationsControl.svelte'
export { default as DrillBar } from './controls/DrillBar.svelte'
export { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, clampZoom } from './controls/zoom.js'
export { GraphState } from './GraphState.svelte.js'
export { normalizeGraph } from './model/normalize.js'
export { buildTree, findNode } from './model/tree.js'
export type { TreeNode } from './model/tree.js'
export { readPath } from './model/path.js'
export { createGraphPreset, defaultGraphPreset, resolveGroupStyles } from './preset.js'
export { DEFAULT_ICONS } from './icons.js'
export {
	cluster,
	flow,
	layers,
	neighborhood,
	points,
	radial,
	structure,
	sunburst,
	world,
	layouts
} from './layout/index.js'
export { LAYOUT_OPTIONS, appliesTo } from './layout/options.js'
export { buildMatrix } from './layout/matrix.js'
export type { Matrix, MatrixCell, MatrixBlock, MatrixOptions } from './layout/matrix.js'

export type { EntityRow, GraphStateConfig, Relationship } from './GraphState.svelte.js'
export type { GraphChannel, GraphPreset, GraphShades } from './preset.js'
export type * from './types.js'
export type * from './layout/types.js'
