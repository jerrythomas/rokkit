import { describe, it, expect } from 'vitest'
import { FieldMapper } from '../src/field-mapper'
import { Theme } from '../src/theme'
import * as viteBarrel from '../src/vite/index.js'

describe('FieldMapper.getChildMapper', () => {
	it('lazily creates and caches a child mapper', () => {
		const fm = new FieldMapper({ label: 'name' })
		const child = fm.getChildMapper()
		expect(child).toBeInstanceOf(FieldMapper)
		expect(fm.getChildMapper()).toBe(child) // second call returns the cached instance
	})

	it('uses a nested fields.fields config when present', () => {
		const fm = new FieldMapper({ fields: { label: 'title' } })
		expect(fm.getChildMapper()).toBeInstanceOf(FieldMapper)
	})
})

describe('Theme.getPaletteForRole', () => {
	it('emits --color-{role}-{shade} vars for a mapped role', () => {
		const palette = new Theme().getPaletteForRole('primary')
		const keys = Object.keys(palette)
		expect(keys.length).toBeGreaterThan(0)
		expect(keys.every((k) => k.startsWith('--color-primary-'))).toBe(true)
	})

	it('returns an empty object for an unmapped role', () => {
		expect(new Theme().getPaletteForRole('not-a-role')).toEqual({})
	})
})

describe('vite barrel', () => {
	it('re-exports iconCollections', () => {
		expect(typeof viteBarrel.iconCollections).toBe('function')
	})
})
