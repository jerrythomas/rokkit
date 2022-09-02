import * as base from './base'
import * as custom from './custom'

export const wrappedInput = {
	text: base.InputText,
	number: base.InputNumber,
	email: base.InputEmail,
	tel: base.InputTel,
	color: base.InputColor,
	date: base.InputDate,
	time: base.InputTime,
	datetime: base.InputDateTime,
	url: base.InputUrl,
	week: base.InputWeek,
	month: base.InputMonth,
	password: base.InputPassword,
	file: base.InputFile,
	textarea: base.TextArea,
	rating: custom.Rating,
	range: custom.Range
}
