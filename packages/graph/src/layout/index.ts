import { cluster } from './cluster.js'
import { flow } from './flow.js'
import { neighborhood } from './neighborhood.js'
import { world } from './world.js'
import { points } from './points.js'
import { radial } from './radial.js'
import { sunburst } from './sunburst.js'
import type { LayoutFn } from './types.js'

/** Built-in layouts, addressable by name from `Graph`'s `layout` prop. */
export const layouts: Record<string, LayoutFn> = { cluster, flow, neighborhood, points, radial, sunburst, world }

export type LayoutName = keyof typeof layouts

export { cluster, flow, neighborhood, points, radial, sunburst, world }
export { LAYOUT_OPTIONS, appliesTo } from './options.js'
export * from './types.js'
