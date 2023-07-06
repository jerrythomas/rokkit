import { InputField, CheckBox } from '@rokkit/molecules'
import { Select } from '@rokkit/atoms'

export const componentTypes = {
	input: InputField,
	// json: custom.InputJSON,
	// array: InputArray,
	// object: InputObject
	// button: IconButton
	// segment: Segment,
	// radio: custom.RadioGroup,
	checkbox: CheckBox,
	select: Select
	// switch: custom.Switch,
	// list: List
}

/**
 * @typedef {Object<string, *>} VariantProperties
 */
/**
 * @typedef Properties
 * @property {string} [class]
 * @property {string} [type]
 * @property {string} label
 * @property {string} description
 * @property {string} [placeholder]
 * @property {*} [defaultValue]
 */

/**
 * @typedef {VariantProperties & Properties} SchemaField
 */

/**
 * @typedef AttributeSchema
 * @property {string} key
 * @property {string} name
 * @property {string} type
 * @property {string} description - description of the attribute used as aria-label
 * @property {string} [placeholder]
 * @property {Array<Rule>} rules
 * @property {Object<string, any>} [props]
 *
 *
 */
