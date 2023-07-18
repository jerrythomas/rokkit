/**
 * @typedef {Object<string, *>} VariantProperties
 */
/**
 * @typedef SharedProperties
 * @property {string} [class]
 * @property {string} [type]
 * @property {string} [label]
 * @property {string} description
 * @property {string} [placeholder]
 * @property {*} [defaultValue]
 */

/**
 * @typedef {VariantProperties & SharedProperties} Properties
 */

/**
 * @typedef AttributeSchema
 * @property {string} key
 * @property {string} [component]
 * @property {boolean} [group]
 * @property {Array<import('./rules').ValidationRule>} [rules]
 * @property {Properties} [props]
 */
