import { convert } from './convert.js'

const groups = ['auth', 'app', 'base', 'light', 'solid', 'twotone', 'components']

for (const group of groups) {
	convert(`./src/${group}`, group, group === 'auth')
}
