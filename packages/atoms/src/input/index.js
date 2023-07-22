import { default as InputColor } from './InputColor.svelte'
import { default as InputDate } from './InputDate.svelte'
import { default as InputDateTime } from './InputDateTime.svelte'
import { default as InputEmail } from './InputEmail.svelte'
import { default as InputFile } from './InputFile.svelte'
import { default as InputMonth } from './InputMonth.svelte'
import { default as InputNumber } from './InputNumber.svelte'
import { default as InputPassword } from './InputPassword.svelte'
import { default as InputTel } from './InputTel.svelte'
import { default as InputText } from './InputText.svelte'
import { default as InputTime } from './InputTime.svelte'
import { default as InputUrl } from './InputUrl.svelte'
import { default as InputWeek } from './InputWeek.svelte'
import { default as TextArea } from './TextArea.svelte'
import { default as InputRange } from './InputRange.svelte'
import { default as InputSelect } from './InputSelect.svelte'

export const nativeInputTypes = {
	tel: InputTel,
	url: InputUrl,
	text: InputText,
	string: InputText,
	date: InputDate,
	time: InputTime,
	file: InputFile,
	week: InputWeek,
	month: InputMonth,
	email: InputEmail,
	color: InputColor,
	number: InputNumber,
	integer: InputNumber,
	datetime: InputDateTime,
	password: InputPassword,
	range: InputRange,
	select: InputSelect,
	textarea: TextArea
}
