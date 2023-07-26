import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import ValidationReport from '../src/ValidationReport.svelte'

describe('ValidationReport.svelte', () => {
	const items = [
		{
			text: 'This check passed',
			status: 'pass'
		},
		{
			text: 'This check failed',
			status: 'fail'
		},
		{
			text: 'This check is unknown',
			status: 'unknown'
		},
		{
			text: 'This check is warning',
			status: 'warn'
		}
	]

	beforeEach(() => cleanup())
	it('should render validation report', () => {
		const { container } = render(ValidationReport, { items })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render validation report with custom icons', () => {
		const { container } = render(ValidationReport, {
			items,
			icons: { pass: 'pass', fail: 'fail', unknown: 'unknown', warn: 'warn' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render validation report with custom icons and custom class', async () => {
		const { container, component } = render(ValidationReport, {
			items,
			class: 'custom'
		})
		let classList = container.querySelector('status-report').classList
		expect(classList.contains('custom')).toBeTruthy()
		component.$set({ class: 'other' })
		await tick()
		classList = container.querySelector('status-report').classList
		expect(classList.contains('custom')).toBeFalsy()
		expect(classList.contains('other')).toBeTruthy()
	})
})
