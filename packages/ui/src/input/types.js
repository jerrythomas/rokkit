import { toHyphenCase } from '@rokkit/core'
// skipcq: JS-C1003 - Importing all components from atoms
import * as NativeInput from '@rokkit/input'
// skipcq: JS-C1003 - Importing all components from molecules
import CheckBox from '../CheckBox.svelte'

import InputSelect from './InputSelect.svelte'
import InputSwitch from './InputSwitch.svelte'

function extractComponentMap(components, prefix = /^Input/) {
	return Object.entries(components).reduce(
		(acc, [name, component]) => ({
			...acc,
			[toHyphenCase(name.replace(prefix, ''))]: component
		}),
		{}
	)
}
const native = extractComponentMap(NativeInput)

export const types = {
	string: NativeInput.InputText,
	integer: NativeInput.InputNumber,
	boolean: CheckBox,
	enum: InputSelect,
	phone: NativeInput.InputTel,
	...native,
	...extractComponentMap({ InputSelect, InputSwitch })
}
