#!/usr/bin/env node
import { convert } from './convert.js'

const groups = ['base', 'components', 'auth', 'light', 'solid', 'twotone']

for (const group of groups) {
	convert(`./src/${group}`, group, group === 'auth')
}
