import { Input, Calendar, Range, Select } from '@sparsh-ui/core'

import * as input from './input'
import * as custom from './custom'

export const groups = {
	input,
	custom
}

export function getComponent(group, type) {
	if (group === 'input') return Input
	if (group === 'custom') {
		if (type === 'calendar') return Calendar
		if (type === 'Select') return Select
	}
}