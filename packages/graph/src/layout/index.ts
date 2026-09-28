import { cluster } from './cluster.js'
import { neighborhood } from './neighborhood.js'
import { points } from './points.js'
import type { LayoutFn } from './types.js'

/** Built-in layouts, addressable by name from `Graph`'s `layout` prop. */
export const layouts: Record<string, LayoutFn> = { cluster, neighborhood, points }

export type LayoutName = keyof typeof layouts

export { cluster, neighborhood, points }
export * from './types.js'
