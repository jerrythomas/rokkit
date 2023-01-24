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
<<<<<<< HEAD
=======
 * @typedef Snippet
 * @property {Array<Reference>} refs
 * @property {Object<string, string>} [defs]
 * @property {Array<string>} [exclusions]
 */

/**
 * @typedef TutorialSlide
 * @property {any} notes
 * @property {any} component
 * @property {Object<string, any>} props
 * @property {Snippet} [snippet]
 */

/**
 * @typedef Tutorial
 * @property {string} name
 * @property {string} [skin]
 * @property {Array<TutorialSlide>} slides
 */
/**
>>>>>>> develop
 * @typedef Navigation
 * @property {string} title
 * @property {string} url
 */
export default {}
