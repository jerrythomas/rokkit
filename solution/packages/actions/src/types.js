/**
 * @typedef {Object} EventMapping
 * @property {string} event     - The event name
 * @property {string[]} [keys]  - The keys that trigger the event
 * @property {RegExp} [pattern] - The pattern that triggers the event
 */

/**
 * @typedef {Object<string, (string[]|RegExp) >} KeyboardConfig
 */

/**
 * @typedef {'vertical'|'horizontal'} Direction
 */

/**
 * @typedef {Object} NavigatorOptions
 * @property {boolean}   enabled     - Whether the navigator is enabled
 * @property {Direction} direction   - Whether the navigator is vertical or horizontal
 * @property {boolean}   multiselect - Whether the navigator supports multiple selections
 */

/**
 * @typedef {Object} DataWrapper
 * @property {Function} moveNext
 * @property {Function} movePrev
 * @property {Function} moveFirst
 * @property {Function} moveLast
 * @property {Function} expand
 * @property {Function} collapse
 * @property {Function} select
 * @property {Function} toggleExpansion
 */

/**
 * @typedef {Object} NavigatorActions
 * @property {Function} next
 * @property {Function} prev
 * @property {Function} first
 * @property {Function} last
 * @property {Function} expand
 * @property {Function} collapse
 * @property {Function} select
 */

/**
 * @typedef {Object} NavigatorConfig
 * @property {Navigator} wrapper     - Whether the navigator is enabled
 * @property {NavigatorOptions} options   - Whether the navigator is vertical or horizontal
 */

/**
 * @typedef {Object} Controller
 * @property {Function} moveNext
 * @property {Function} movePrev
 * @property {Function} moveFirst
 * @property {Function} moveLast
 * @property {Function} [expand]
 * @property {Function} [collapse]
 * @property {Function} select
 * @property {Function} extendSelection
 * @property {Function} [toggleExpansion]
 */
