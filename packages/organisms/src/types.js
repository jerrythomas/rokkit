import { CheckBox, RadioGroup, Rating, Range } from '@rokkit/molecules'
import Select from './Select.svelte'
import MultiSelect from './MultiSelect.svelte'
import Switch from './Switch.svelte'
import List from './List.svelte'
import Tabs from './Tabs.svelte'
import Tree from './Tree.svelte'
import InputArray from './InputArray.svelte'
import InputField from './InputField.svelte'
export const componentTypes = {
	input: InputField,
	boolean: CheckBox,
	range: Range,
	rating: Rating,
	radio: RadioGroup,
	enum: Select,
	select: Select,
	'multi-select': MultiSelect,
	array: InputArray,
	switch: Switch,
	list: List,
	tabs: Tabs,
	tree: Tree
}

/**
 * @typedef Element
 * @property {string} scope - The path of the element.
 * @property {string} label - The label of the element.
 * @property {string} description - The description of the element.
 * @property {string} placeholder - The placeholder of the element.
 * @property {Array<Element>} [elements] - Optional sub Elements to be displayed in the layout.
 */

/**
 * @typedef DataSchema
 * @property {string} type - The type of the element.
 * @property {boolean} [required=false] - If the element is mandatory.
 * @property {number} [min] - The minimum value of the element.
 * @property {number} [max] - The maximum value of the element.
 * @property {number} [exclusiveMin] - The exclusive minimum value of the element.
 * @property {number} [exclusiveMax] - The exclusive maximum value of the element.
 * @property {number} [minLength] - The minimum length of the element.
 * @property {number} [maxLength] - The maximum length of the element.
 * @property {number} [step] - The step value of the element.
 * @property {string} [pattern] - The pattern of the element.
 * @property {string} [format] - The format of the element.
 * @property {Object<string, DataSchema>} [properties] - Properties of the element if it is an object
 */

/**
 * @typedef LayoutElement
 * @property {string} [type='vertical'] - The layout type.
 * @property {string} [scope] - The path of the element.
 * @property {string} [label] - The label of the element.
 * @property {string} [description] - The description of the element.
 * @property {string} [placeholder] - The placeholder of the element.
 * @property {Array<LayoutElement>} [elements] - Nested layout elements
 */

/**
 * @typedef ComponentProperties
 * @property {string} [type] - Property type for the component
 * @property {string} [class] - CSS class to be applied to component.
 * @property {string} [status] - Validation status (pass, fail, warn).
 * @property {string} [label] - Label to be used for the component.
 * @property {string} [description] - Description, to be used as aria-label.
 * @property {string} [placeholder] - Placeholder text when the component is empty.
 * @property {boolean} [required=false] - If the attribute is mandatory.
 * @property {number} [min] - The minimum value of the attribute.
 * @property {number} [max] - The maximum value of the attribute.
 * @property {number} [minLength] - The minimum length of the attribute.
 * @property {number} [maxLength] - The maximum length of the attribute.
 * @property {number} [step] - The step value of the attribute, to be used with min, max.
 * @property {string} [pattern] - The pattern of the attribute.
 */

/**
 * @typedef LayoutSchema
 * @property {string} [type='vertical'] - The layout type.
 * @property {boolean} [group=false] - If the layout is a group.
 * @property {string} [key] - attribute of the object. As we go deeper into the object, the path is appended.
 * @property {string} [label] - Label to be used for groups.
 * @property {string} [component='input'] - Component to be used for the attribute.
 * @property {ComponentProperties} [props] - Properties of the component
 * @property {Array<LayoutSchema>} [elements] - Nested layout elements
 */
