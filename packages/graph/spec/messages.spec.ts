/* Graph's text comes from `messages.graph` (@rokkit/states); `fill` puts values into a template. */
import { describe, it, expect, afterEach } from 'vitest'
import { messages } from '@rokkit/states'
import { fill, counted, say } from '../src/messages.js'

describe('fill', () => {
	it('replaces each {token} with its value', () => {
		expect(fill('Open {name}', { name: 'ui' })).toBe('Open ui')
		expect(fill('{a} and {b}', { a: 1, b: 'x' })).toBe('1 and x')
	})

	it('leaves a token with no value as written, so a missing value is visible', () => {
		expect(fill('Open {name}', {})).toBe('Open {name}')
	})
})

describe('counted', () => {
	afterEach(() => messages.reset())

	it('picks the one or many form', () => {
		expect(counted(1, 'nodeOne', 'nodeMany')).toBe('1 node')
		expect(counted(3, 'nodeOne', 'nodeMany')).toBe('3 nodes')
	})

	it('reads the active locale', () => {
		messages.register('de', { graph: { nodeMany: '{n} Knoten' } })
		messages.setLocale('de')
		expect(counted(2, 'nodeOne', 'nodeMany')).toBe('2 Knoten')
	})
})

describe('say', () => {
	afterEach(() => messages.reset())

	it('fills one graph string from the active locale', () => {
		expect(say('open', { name: 'ui' })).toBe('Open ui')
		expect(say('drillLoading')).toBe('Loading…')
		messages.register('de', { graph: { open: '{name} öffnen' } })
		messages.setLocale('de')
		expect(say('open', { name: 'ui' })).toBe('ui öffnen')
	})
})
