/**
 * @typedef Reference
 * @property {string} source
 * @property {string|Array.<string>} items
 */

/**
 * @typedef Sample
 * @property {string} [code]
 * @property {any} [article]
 * @property {any} [component]
 * @property {string} [class]
 * @property {Array<Reference>} [refs]
 * @property {Object<string, any>} [props]
 * @property {Object<string, string>} [declarations]
 */

/**
 * @typedef Snippet
 * @property {Array<Reference>} refs
 * @property {Object<string, string>} [defs]
 * @property {Array<string>} [exclusions]
 */

/**
 * @typedef TutorialSlide
 * @property {any} guide
 * @property {any} component
 * @property {string} [title]
 * @property {Object<string, any>} [metadata]
 */

/**
 * @typedef Tutorial
 * @property {string} name
 * @property {string} [skin]
 * @property {Array<TutorialSlide>} slides
 */
/**
 * @typedef Navigation
 * @property {string} title
 * @property {string} url
 */
export default {}
