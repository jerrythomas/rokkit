import { cluster } from './cluster.js'
import { neighborhood } from './neighborhood.js'
import { world } from './world.js'
import { points } from './points.js'
import type { LayoutFn } from './types.js'

/** Built-in layouts, addressable by name from `Graph`'s `layout` prop. */
export const layouts: Record<string, LayoutFn> = { cluster, neighborhood, points, world }

export type LayoutName = keyof typeof layouts

export { cluster, neighborhood, points, world }
export * from './types.js'
