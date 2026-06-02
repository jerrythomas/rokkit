/**
 * Connector Component Types
 *
 * The `Connector` component renders tree-line connectors used by hierarchical
 * visualizations (Tree, lists with indent guides). The underlying connector
 * type values are defined in `./tree.ts` and re-exported here for ergonomics.
 */

import type { ConnectorType } from './tree.js'

export type { ConnectorType } from './tree.js'

/**
 * Props for the Connector component.
 */
export interface ConnectorProps {
	/** The type of connector to render. Default `'empty'`. */
	type?: ConnectorType

	/** Right-to-left layout support. */
	rtl?: boolean
}
