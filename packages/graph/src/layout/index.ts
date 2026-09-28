import { cluster } from './cluster.js'
import { neighborhood } from './neighborhood.js'
import type { LayoutFn } from './types.js'

/** Built-in layouts, addressable by name from `Graph`'s `layout` prop. */
export const layouts: Record<string, LayoutFn> = { cluster, neighborhood }

export type LayoutName = keyof typeof layouts

export { cluster, neighborhood }
export * from './types.js'
