import * as custom from '../custom'
import Input from '../Input.svelte'
import InputArray from './InputArray.svelte'
import InputObject from './InputObject.svelte'
import List from '../group/Select.svelte'

export const inputTypes = {
	input: Input,
	json: custom.InputJSON,
	array: InputArray,
	object: InputObject,
	radio: custom.RadioGroup,
	checkbox: custom.CheckBox,
	toggle: custom.Toggle,
	switch: custom.Switch,
	list: List
}
