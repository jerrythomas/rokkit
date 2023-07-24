import { toHyphenCase } from '@rokkit/core'
import * as NativeInput from '@rokkit/atoms/input'
import * as RokkitInput from '@rokkit/molecules/input'

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
const override = extractComponentMap(RokkitInput)

export const types = {
	string: NativeInput.InputText,
	integer: NativeInput.InputNumber,
	boolean: RokkitInput.Checkbox,
	enum: InputSelect,
	...native,
	...override,
	...extractComponentMap({ InputSelect, InputSwitch })
}
