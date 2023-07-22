import InputColor from './InputColor.svelte'
import InputDate from './InputDate.svelte'
import InputDateTime from './InputDateTime.svelte'
import InputEmail from './InputEmail.svelte'
import InputFile from './InputFile.svelte'
import InputMonth from './InputMonth.svelte'
import InputNumber from './InputNumber.svelte'
import InputPassword from './InputPassword.svelte'
import InputTel from './InputTel.svelte'
import InputText from './InputText.svelte'
import InputTime from './InputTime.svelte'
import InputUrl from './InputUrl.svelte'
import InputWeek from './InputWeek.svelte'
import TextArea from './TextArea.svelte'
import InputRange from './InputRange.svelte'
import InputSelect from './InputSelect.svelte'
import InputCheckbox from './InputCheckbox.svelte'
import InputRadio from './InputRadio.svelte'

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
	textarea: TextArea,
	range: InputRange,
	select: InputSelect,
	checkbox: InputCheckbox,
	radio: InputRadio
}
