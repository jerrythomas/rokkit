/**
 * @typedef SvelteActionReturn
 * @property {() => void} destroy
 * @property {() => void} [update]
 */

/**
 * @typedef FillableData
 * @property {string} value
 * @property {integer} actualIndex
 * @property {integer} expectedIndex
 */

/**
 * @typedef FillOptions
 * @property {Array<FillableData>} options available options to fill
 * @property {integer} current       index of option to be filled
 * @property {boolean} check         validate filled values
 */

/**
 * A part of the path to node in hierarchy
 *
 * @typedef PathFragment
 * @property {integer}                             index  - Index to item in array
 * @property {Array<*>}                            items  - Array of items
 * @property {import('@rokkit/core').FieldMapping} fields - Field mapping for the data
 */

/**
 * Options for the Navigable action
 * @typedef NavigableOptions
 * @property {boolean} horizontal - Navigate horizontally
 * @property {boolean} nested     - Navigate nested items
 * @property {boolean} enabled    - Enable navigation
 */

/**
 * @typedef NavigatorOptions
 * @property {Array<*>}     items           - An array containing the data set to navigate
 * @property {boolean}      [vertical=true] - Identifies whether navigation shoud be vertical or horizontal
 * @property {string}       [idPrefix='id-'] - id prefix used for identifying individual node
 * @property {import('../constants').FieldMapping} fields - Field mapping to identify attributes to be used for state and identification of children
 */

/**
 * @typedef SwipeableOptions
 * @property {boolean} horizontal - Swipe horizontally
 * @property {boolean} vertical   - Swipe vertically
 * @property {boolean} enabled    - Enable swiping
 * @property {number}  threshold  - Threshold for swipe
 * @property {number}  minSpeed   - Minimum speed for swipe
 */
