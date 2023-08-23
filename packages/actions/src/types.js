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

/**
 * @typedef TraversableOptions
 * @property {boolean} horizontal - Traverse horizontally
 * @property {boolean} nested     - Traverse nested items
 * @property {boolean} enabled    - Enable traversal
 * @property {string}  value      - Value to be used for traversal
 * @property {Array<*>} items     - An array containing the data set to traverse
 * @property {Array<integer} [indices] - Indices of the items to be traversed
 */

/**
 * @typedef PositionTracker
 * @property {integer} index
 * @property {integer} previousIndex
 */

/**
 * @typedef EventHandlers
 * @property {function} [keydown]
 * @property {function} [keyup]
 * @property {function} [click]
 * @property {function} [touchstart]
 * @property {function} [touchmove]
 * @property {function} [touchend]
 * @property {function} [touchcancel]
 * @property {function} [mousedown]
 * @property {function} [mouseup]
 * @property {function} [mousemove]
 */

/**
 * @typedef {Object} ActionHandlers
 * @property {Function} [next]
 * @property {Function} [previous]
 * @property {Function} [select]
 * @property {Function} [escape]
 * @property {Function} [collapse]
 * @property {Function} [expand]
 */

/**
 * @typedef {Object} NavigationOptions
 * @property {Boolean} [horizontal]
 * @property {Boolean} [nested]
 * @property {Boolean} [enabled]
 */

/**
 * @typedef {Object} KeyboardActions
 * @property {Function} [ArrowDown]
 * @property {Function} [ArrowUp]
 * @property {Function} [ArrowRight]
 * @property {Function} [ArrowLeft]
 * @property {Function} [Enter]
 * @property {Function} [Escape]
 * @property {Function} [" "]
 */

/**
 * @typedef {Object} TouchTracker
 * @property {number} startX - The start X position of the touch.
 * @property {number} startY - The start Y position of the touch.
 * @property {number} startTime - The start time of the touch.
 */

/**
 * @typedef {Object} PushDownOptions
 * @property {string} selector - The CSS selector for the child element to which keyboard events will be forwarded.
 * @property {Array<string>} [events=['keydown', 'keyup', 'keypress']] - The keyboard events to forward.
 */

/**
 * @typedef {Object} Bounds
 * @property {number} lower
 * @property {number} upper
 */
