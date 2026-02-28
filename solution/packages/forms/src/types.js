import { toHyphenCase } from '@rokkit/core'
// skipcq: JS-C1003 - Importing all components from atoms
import * as NativeInput from '@rokkit/forms'
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
	phone: NativeInput.InputTel,
	...native
}
