import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import ValidationReport from '../src/ValidationReport.svelte'

describe('ValidationReport.svelte', () => {
	const ROOT_ELEMENT = 'rk-status-report'
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
		const props = $state({ items })
		const { container } = render(ValidationReport, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render validation report with custom icons', () => {
		const props = $state({
			items,
			icons: { pass: 'pass', fail: 'fail', unknown: 'unknown', warn: 'warn' }
		})
		const { container } = render(ValidationReport, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render validation report with custom icons and custom class', async () => {
		const props = $state({
			items,
			class: 'custom'
		})
		const { container } = render(ValidationReport, { props })
		const classList = container.querySelector(ROOT_ELEMENT).classList
		expect(classList.contains('custom')).toBeTruthy()
		props.class = 'other'

		await tick()
		expect(classList.contains('custom')).toBeFalsy()
		expect(classList.contains('other')).toBeTruthy()
	})
})
