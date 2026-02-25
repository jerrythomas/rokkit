/**
 * Type Renderer Registry
 *
 * Maps element type strings to Svelte input components.
 * Consumers can extend via the `renderers` prop on FormRenderer.
 */

import InputCheckbox from '../input/InputCheckbox.svelte'
import InputColor from '../input/InputColor.svelte'
import InputDate from '../input/InputDate.svelte'
import InputDateTime from '../input/InputDateTime.svelte'
import InputEmail from '../input/InputEmail.svelte'
import InputFile from '../input/InputFile.svelte'
import InputMonth from '../input/InputMonth.svelte'
import InputNumber from '../input/InputNumber.svelte'
import InputPassword from '../input/InputPassword.svelte'
import InputRadio from '../input/InputRadio.svelte'
import InputRange from '../input/InputRange.svelte'
import InputSelect from '../input/InputSelect.svelte'
import InputSwitch from '../input/InputSwitch.svelte'
import InputToggle from '../input/InputToggle.svelte'
import InputTel from '../input/InputTel.svelte'
import InputText from '../input/InputText.svelte'
import InputTextArea from '../input/InputTextArea.svelte'
import InputTime from '../input/InputTime.svelte'
import InputUrl from '../input/InputUrl.svelte'
import InputWeek from '../input/InputWeek.svelte'

/**
 * Default renderer registry mapping type strings to components.
 * @type {Record<string, import('svelte').Component>}
 */
export const defaultRenderers = {
	text: InputText,
	number: InputNumber,
	integer: InputNumber,
	email: InputEmail,
	password: InputPassword,
	tel: InputTel,
	url: InputUrl,
	color: InputColor,
	date: InputDate,
	'datetime-local': InputDateTime,
	datetime: InputDateTime,
	time: InputTime,
	month: InputMonth,
	week: InputWeek,
	range: InputRange,
	textarea: InputTextArea,
	file: InputFile,
	checkbox: InputCheckbox,
	radio: InputRadio,
	select: InputSelect,
	switch: InputSwitch,
	toggle: InputToggle
}

/**
 * Resolve a renderer component for a form element.
 *
 * Resolution order:
 * 1. Explicit `renderer` name in element props → custom registry
 * 2. Element type → registry lookup
 * 3. Fallback → InputText
 *
 * @param {{ type: string, props?: { renderer?: string } }} element
 * @param {Record<string, import('svelte').Component>} renderers - Merged registry
 * @returns {import('svelte').Component}
 */
export function resolveRenderer(element, renderers) {
	// 1. Explicit renderer name from layout
	if (element.props?.renderer && renderers[element.props.renderer]) {
		return renderers[element.props.renderer]
	}
	// 2. Element type
	if (renderers[element.type]) {
		return renderers[element.type]
	}
	// 3. Fallback
	return InputText
}
