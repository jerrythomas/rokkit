import InputField from './InputField.svelte'
// import InputArray from './InputArray.svelte'
// import InputObject from './InputObject.svelte'
// import IconButton from './IconButton.svelte'
// import NestedLayout from './NestedLayout.svelte'
import { CheckBox } from '@rokkit/input'
export const inputTypes = {
	input: InputField,
	// json: custom.InputJSON,
	// array: InputArray,
	// object: InputObject
	// button: IconButton
	// segment: Segment,
	// radio: custom.RadioGroup,
	checkbox: CheckBox
	// toggle: custom.Toggle,
	// switch: custom.Switch,
	// list: List
}
