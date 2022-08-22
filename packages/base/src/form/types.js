import { default as Input } from './Input.svelte'
import * as base from './base'
import * as custom from './custom'
import * as nested from './nested'

export const wrappedInput = {
	text: base.InputText,
	number: base.InputNumber,
	email: base.InputEmail,
	tel: base.InputTel,
	color: base.InputColor,
	range: base.InputRange,
	date: base.InputDate,
	time: base.InputTime,
	datetime: base.InputDateTime,
	url: base.InputUrl,
	week: base.InputWeek,
	month: base.InputMonth,
	password: base.InputPassword,
	file: base.InputFile,
	textarea: base.TextArea,
	rating: custom.Rating
}
export const inputTypes = {
	input: Input,
	json: custom.InputJSON,
	array: nested.InputArray,
	object: nested.InputObject,
	radio: custom.RadioGroup,
	checkbox: custom.CheckBox,
	toggle: custom.Toggle,
	switch: custom.Switch
}
