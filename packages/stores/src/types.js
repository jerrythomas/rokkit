/**
 * @typedef {function(input: any): boolean} ValidationFunction - A function that returns true if the input is valid
 */
/**
 * @typedef ItemValidationResult
 *
 * @property {string} text
 * @property {boolean} valid
 */

/**
 * @typedef ValidationResult
 *
 * @property {*} value
 * @property {'success'|'error'|'warning'} status
 * @property {boolean} isValid
 * @property {Array<ItemValidationResult>} validations
 */

/**
 * @typedef ValidationRule
 *
 * @property {string} text
 * @property {string|RegExp} [pattern]
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} [type]
 * @property {ValidationFunction} [validator]
 */

/**
 * @typedef ValidationStore
 * @property {*} value - The value to validate
 * @property {Array<ValidationResult>} result - An array of validation rules
 */
export default {}
