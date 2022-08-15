import { default as InputColor } from './InputColor.svelte'
import { default as InputDate } from './InputDate.svelte'
import { default as InputDateTime } from './InputDateTime.svelte'
import { default as InputEmail } from './InputNumber.svelte'
import { default as InputFile } from './InputFile.svelte'
import { default as InputMonth } from './InputMonth.svelte'
import { default as InputNumber } from './InputNumber.svelte'
import { default as InputPassword } from './InputPassword.svelte'
import { default as InputRange } from './InputRange.svelte'
import { default as InputTel } from './InputTel.svelte'
import { default as InputText } from './InputText.svelte'
import { default as InputTime } from './InputTime.svelte'
import { default as InputUrl } from './InputUrl.svelte'
import { default as InputWeek } from './InputWeek.svelte'
import { default as TextArea } from './TextArea.svelte'
import { default as Rating } from './Rating.svelte'

export const inputs = {
	text: InputText,
	number: InputNumber,
	email: InputEmail,
	tel: InputTel,
	color: InputColor,
	range: InputRange,
	date: InputDate,
	time: InputTime,
	datetime: InputDateTime,
	url: InputUrl,
	week: InputWeek,
	month: InputMonth,
	password: InputPassword,
	file: InputFile,
	textarea: TextArea,
	rating: Rating
}
