import { arcs } from './arcs.js'
import { cluster } from './cluster.js'
import { flow } from './flow.js'
import { layers } from './layers.js'
import { neighborhood } from './neighborhood.js'
import { world } from './world.js'
import { points } from './points.js'
import { polymetric } from './polymetric.js'
import { radial } from './radial.js'
import { structure } from './structure.js'
import { sunburst } from './sunburst.js'
import type { LayoutFn } from './types.js'

/** Built-in layouts, addressable by name from `Graph`'s `layout` prop. */
export const layouts: Record<string, LayoutFn> = {
	arcs,
	cluster,
	flow,
	layers,
	neighborhood,
	points,
	polymetric,
	radial,
	structure,
	sunburst,
	world
}

export type LayoutName = keyof typeof layouts

export { arcs, cluster, flow, layers, neighborhood, points, polymetric, radial, structure, sunburst, world }
export { LAYOUT_OPTIONS, appliesTo } from './options.js'
export * from './types.js'
