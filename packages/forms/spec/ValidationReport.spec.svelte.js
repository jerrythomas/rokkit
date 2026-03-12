import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import ValidationReport from '../src/ValidationReport.svelte'

describe('ValidationReport', () => {
	beforeEach(() => cleanup())

	it('should render nothing when items is empty', () => {
		const { container } = render(ValidationReport, { props: { items: [] } })
		expect(container.querySelector('[data-validation-report]')).toBeNull()
	})

	it('should render nothing when items is not provided', () => {
		const { container } = render(ValidationReport)
		expect(container.querySelector('[data-validation-report]')).toBeNull()
	})

	it('should render report container with role="status"', () => {
		const items = [{ path: 'name', state: 'error', text: 'Name is required' }]
		const { container } = render(ValidationReport, { props: { items } })
		const report = container.querySelector('[data-validation-report]')
		expect(report).toBeTruthy()
		expect(report.getAttribute('role')).toBe('status')
	})

	it('should group items by severity', () => {
		const items = [
			{ path: 'name', state: 'error', text: 'Name is required' },
			{ path: 'age', state: 'error', text: 'Age must be at least 18' },
			{ path: 'bio', state: 'warning', text: 'Bio is very short' }
		]
		const { container } = render(ValidationReport, { props: { items } })

		const groups = container.querySelectorAll('[data-validation-group]')
		expect(groups).toHaveLength(2)

		expect(groups[0].getAttribute('data-severity')).toBe('error')
		expect(groups[1].getAttribute('data-severity')).toBe('warning')
	})

	it('should render count in group headers', () => {
		const items = [
			{ path: 'name', state: 'error', text: 'Name is required' },
			{ path: 'age', state: 'error', text: 'Age must be at least 18' },
			{ path: 'bio', state: 'warning', text: 'Bio is short' }
		]
		const { container } = render(ValidationReport, { props: { items } })

		const errorGroup = container.querySelector('[data-severity="error"]')
		const warningGroup = container.querySelector('[data-severity="warning"]')

		expect(errorGroup.querySelector('[data-validation-count]').textContent).toBe('2')
		expect(warningGroup.querySelector('[data-validation-count]').textContent).toBe('1')
	})

	it('should pluralize severity labels correctly', () => {
		const items = [
			{ path: 'name', state: 'error', text: 'Name is required' },
			{ path: 'age', state: 'error', text: 'Age is required' },
			{ path: 'bio', state: 'warning', text: 'Bio is short' }
		]
		const { container } = render(ValidationReport, { props: { items } })

		const errorHeader = container.querySelector(
			'[data-severity="error"] [data-validation-group-header]'
		)
		const warningHeader = container.querySelector(
			'[data-severity="warning"] [data-validation-group-header]'
		)

		expect(errorHeader.textContent).toContain('errors')
		expect(warningHeader.textContent).toContain('warning')
		expect(warningHeader.textContent).not.toContain('warnings')
	})

	it('should render items as buttons when onclick is provided', () => {
		const onclick = vi.fn()
		const items = [{ path: 'name', state: 'error', text: 'Name is required' }]
		const { container } = render(ValidationReport, { props: { items, onclick } })

		const item = container.querySelector('[data-validation-item]')
		expect(item.tagName).toBe('BUTTON')
	})

	it('should render items as divs when onclick is not provided', () => {
		const items = [{ path: 'name', state: 'error', text: 'Name is required' }]
		const { container } = render(ValidationReport, { props: { items } })

		const item = container.querySelector('[data-validation-item]')
		expect(item.tagName).toBe('DIV')
	})

	it('should call onclick with path when item is clicked', async () => {
		const onclick = vi.fn()
		const items = [
			{ path: 'name', state: 'error', text: 'Name is required' },
			{ path: 'age', state: 'error', text: 'Age must be 18+' }
		]
		const { container } = render(ValidationReport, { props: { items, onclick } })

		const buttons = container.querySelectorAll('button[data-validation-item]')
		await fireEvent.click(buttons[1])

		expect(onclick).toHaveBeenCalledWith('age')
	})

	it('should render item text content', () => {
		const items = [{ path: 'email', state: 'error', text: 'Invalid email format' }]
		const { container } = render(ValidationReport, { props: { items } })

		const item = container.querySelector('[data-validation-item]')
		expect(item.textContent).toContain('Invalid email format')
	})

	it('should set data-status attribute on items', () => {
		const items = [
			{ path: 'name', state: 'error', text: 'Error msg' },
			{ path: 'bio', state: 'warning', text: 'Warning msg' }
		]
		const { container } = render(ValidationReport, { props: { items } })

		const allItems = container.querySelectorAll('[data-validation-item]')
		expect(allItems[0].getAttribute('data-status')).toBe('error')
		expect(allItems[1].getAttribute('data-status')).toBe('warning')
	})

	it('should order groups by severity: error, warning, info, success', () => {
		const items = [
			{ path: 'a', state: 'info', text: 'Info msg' },
			{ path: 'b', state: 'error', text: 'Error msg' },
			{ path: 'c', state: 'success', text: 'Success msg' },
			{ path: 'd', state: 'warning', text: 'Warning msg' }
		]
		const { container } = render(ValidationReport, { props: { items } })

		const groups = container.querySelectorAll('[data-validation-group]')
		expect(groups).toHaveLength(4)
		expect(groups[0].getAttribute('data-severity')).toBe('error')
		expect(groups[1].getAttribute('data-severity')).toBe('warning')
		expect(groups[2].getAttribute('data-severity')).toBe('info')
		expect(groups[3].getAttribute('data-severity')).toBe('success')
	})

	it('should apply custom class', () => {
		const items = [{ path: 'name', state: 'error', text: 'Required' }]
		const { container } = render(ValidationReport, { props: { items, class: 'my-report' } })

		const report = container.querySelector('[data-validation-report]')
		expect(report.classList.contains('my-report')).toBe(true)
	})
})
