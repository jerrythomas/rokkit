import { describe, it, expect } from 'vitest'
import { vibe } from '../src/vibe.svelte.js'
import { themeRules } from '@rokkit/core'
import { flushSync } from 'svelte'
import { defaultColors } from '@rokkit/core'

describe('vibe', () => {
	it('should provide a default value', () => {
		expect(vibe.style).toEqual('rokkit')
		expect(vibe.mode).toEqual('dark')
		expect(vibe.density).toEqual('comfortable')
		expect(vibe.palette).toEqual(themeRules(vibe.style)[1][1])
	})

	it('should validate style updates', () => {
		vibe.style = 'minimal'
		expect(vibe.style).toEqual('minimal')
		expect(vibe.palette).toEqual(themeRules(vibe.style)[1][1])
		vibe.style = 'unknown'
		expect(vibe.style).toEqual('minimal')
	})

	it('should validate mode updates', () => {
		vibe.mode = 'light'
		expect(vibe.mode).toEqual('light')
		expect(vibe.palette).toEqual(themeRules(vibe.style)[0][1])
		vibe.mode = 'unknown'
		expect(vibe.mode).toEqual('light')
	})

	it('should validate density updates', () => {
		vibe.density = 'compact'
		expect(vibe.density).toEqual('compact')
		vibe.density = 'cozy'
		expect(vibe.density).toEqual('cozy')
		vibe.density = 'comfortable'
		expect(vibe.density).toEqual('comfortable')
		vibe.density = 'unknown'
		expect(vibe.density).toEqual('comfortable')
	})

	it('should update palette when colors change', () => {
		expect(() => (vibe.colorMap = { primary: 'ambrosia' })).toThrow(
			'Did you forget to define "ambrosia"?'
		)
		expect(vibe.palette).toEqual(themeRules(vibe.style)[0][1])
		vibe.colors = { ambrosia: defaultColors.amber }
		flushSync()
		let expected = themeRules(vibe.style, {}, { ambrosia: defaultColors.amber })
		expect(vibe.palette).toEqual(expected[0][1])
		vibe.colorMap = { primary: 'ambrosia' }
		flushSync()
		expected = themeRules(vibe.style, { primary: 'ambrosia' }, { ambrosia: defaultColors.amber })
		expect(vibe.palette).toEqual(expected[0][1])
	})
	it('should update palette when color map changes', () => {
		vibe.colorMap = { primary: 'rose', secondary: 'green' }
		flushSync()
		const expected = themeRules(vibe.style, { primary: 'rose', secondary: 'green' })
		expect(vibe.palette).toEqual(expected[0][1])
	})
})
