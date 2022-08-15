import { default as InputJSON } from './InputJSON.svelte'
import { default as InputArray } from './InputArray.svelte'
import { default as InputObject } from './InputObject.svelte'
import { default as Toggle } from './Toggle.svelte'
import { default as Switch } from './Switch.svelte'
import { default as CheckBox } from './CheckBox.svelte'
import { default as RadioGroup } from './RadioGroup.svelte'
import { default as Input } from './Input.svelte'

export const inputTypes = {
	input: Input,
	json: InputJSON,
	array: InputArray,
	object: InputObject,
	radio: RadioGroup,
	checkbox: CheckBox,
	toggle: Toggle,
	switch: Switch
}
