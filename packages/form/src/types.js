import InputField from './InputField2.svelte'
import InputArray from './InputArray.svelte'
import InputObject from './InputObject.svelte'
// import NestedLayout from './NestedLayout.svelte'

export const inputTypes = {
	input: InputField,
	// json: custom.InputJSON,
	array: InputArray,
	object: InputObject
	// radio: custom.RadioGroup,
	// checkbox: custom.CheckBox,
	// toggle: custom.Toggle,
	// switch: custom.Switch,
	// list: List
}
