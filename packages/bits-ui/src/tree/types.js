/**
 * @typedef {'empty'|'last'|'child'|'sibling'} TreeLineType
 */

/**
 * @typedef {Object} NodeStateIcons
 * @property {import('svelte').ComponentType} [expanded] - Icon for expanded state
 * @property {import('svelte').ComponentType} [collapsed] - Icon for collapsed state
 * @property {import('svelte').ComponentType} [selected] - Icon for selected state
 * @property {import('svelte').ComponentType} [loading] - Icon for loading state
 */

/**
 * @typedef {Object} TreeContext
 * @property {import('@rokkit/states').NestedController} controller - Tree controller
 * @property {Array<any>} items - Tree items
 * @property {any} value - Selected value
 * @property {import('@rokkit/core').FieldMapping} fields - Field mappings
 * @property {NodeStateIcons} icons - Icons for different node states
 */

/**
 * @typedef {Object} TreeNodeEvent
 * @property {any} item - The node item
 * @property {any} value - The node value
 */

/**
 * @typedef {Object} TreeToggleEvent
 * @property {any} item - The node item
 * @property {boolean} expanded - Whether the node is expanded
 */

/**
 * @typedef {Object} TreeMoveEvent
 * @property {any} item - The node item
 * @property {string} direction - Move direction
 */
