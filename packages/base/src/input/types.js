import { default as InputText } from './InputText.svelte'
import { default as InputJSON } from './InputJSON.svelte'
import { default as InputArray } from './InputArray.svelte'
import { default as InputNumber } from './InputNumber.svelte'
import { default as InputObject } from './InputObject.svelte'
import { default as InputCheckBox } from './InputCheckBox.svelte'
import { default as InputRating } from './InputRating.svelte'
import { default as RadioGroup } from './RadioGroup.svelte'

export const inputTypes = {
	text: InputText,
	json: InputJSON,
	array: InputArray,
	number: InputNumber,
	object: InputObject,
	checkbox: InputCheckBox,
	rating: InputRating,
	radio: RadioGroup
}
