#!/usr/bin/env node
import sade from 'sade'
import { convert } from './convert.js'

function main() {
	const groups = ['auth', 'app', 'base', 'light', 'solid', 'twotone', 'components']

	for (const group of groups) {
		convert(`./src/${group}`, group, group === 'auth')
	}
}

const prog = sade('bundle', true)
prog.action(() => main())

prog.parse(process.argv)
