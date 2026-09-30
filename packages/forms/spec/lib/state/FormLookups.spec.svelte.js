import { describe, it, expect } from 'vitest'
import { FormValues } from '../../../src/lib/state/FormValues.svelte.js'
import { FormLookups } from '../../../src/lib/state/FormLookups.svelte.js'

const cities = [
	{ country: 'IN', name: 'Pune' },
	{ country: 'US', name: 'NYC' }
]
const lookups = {
	city: {
		dependsOn: ['country'],
		source: cities,
		filter: (items, data) => items.filter((row) => row.country === data.country)
	},
	currency: { dependsOn: ['region'], source: [], filter: () => true }
}

describe('FormLookups — without lookups', () => {
	it('has no manager and answers every question safely', async () => {
		const l = new FormLookups(new FormValues({}), {})
		expect(l.manager).toBeNull()
		expect(l.state('city')).toBeNull()
		expect(l.isDisabled('city')).toBe(false)
		expect(l.has('city')).toBe(false)
		await l.initialize()
		await l.refresh('city')
		l.fieldChanged('country')
		const props = {}
		l.applyTo('city', props)
		expect(props).toEqual({})
	})
})

describe('FormLookups — with lookups', () => {
	it('creates the manager and reports per-field state', async () => {
		const values = new FormValues({ country: 'IN' })
		const l = new FormLookups(values, lookups)
		expect(l.has('city')).toBe(true)
		await l.initialize()
		const state = l.state('city')
		expect(state.options.map((o) => o.name)).toEqual(['Pune'])
		expect(l.state('nope')).toBeNull()
	})

	it('a change clears only the values that depend on it, then re-fetches', async () => {
		const values = new FormValues({ country: 'IN', city: 'Pune', currency: 'INR' })
		const l = new FormLookups(values, lookups)
		await l.initialize()
		values.set('country', 'US')
		l.fieldChanged('country')
		expect(values.get('city')).toBeNull()
		expect(values.get('currency')).toBe('INR')
	})

	it('folds options, loading, disabled and fields into an element’s props', () => {
		const values = new FormValues({})
		const l = new FormLookups(values, lookups)
		const props = { fields: { keep: true } }
		l.applyTo('city', props)
		expect(props.fields).toEqual({ keep: true })
	})

	it('configure() replaces the lookups, even with none', () => {
		const l = new FormLookups(new FormValues({}), {})
		l.configure(lookups)
		expect(l.has('city')).toBe(true)
		l.configure({})
		expect(l.manager).not.toBeNull()
		expect(l.has('city')).toBe(false)
	})
})
