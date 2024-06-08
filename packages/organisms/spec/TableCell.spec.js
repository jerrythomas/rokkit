import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
// import { defaultFields } from '@rokkit/core'
import CustomField from './mocks/CustomField.svelte'
import TableCell from '../src/TableCell.svelte'

describe('Table.svelte', () => {
	beforeEach(() => cleanup())

	describe('cell', () => {
		it('should render content', () => {
			const { container } = render(TableCell, {
				props: { value: 'John Doe' }
			})
			expect(container).toMatchSnapshot()
		})

		it('should render a cell with a custom class', () => {
			const { container } = render(TableCell, {
				props: { value: 'John Doe', class: 'custom-class' }
			})
			expect(container).toMatchSnapshot()
		})

		it('should render using a formatter', () => {
			const { container } = render(TableCell, {
				props: { value: 'John Doe', formatter: (v) => v.toUpperCase() }
			})
			expect(container).toMatchSnapshot()
			expect(container.querySelector('td').textContent.trim()).toBe('JOHN DOE')
		})
		it('should render a cell with a custom component', () => {
			const { container } = render(TableCell, {
				props: { value: { text: 'John Doe', component: 'custom' }, using: { custom: CustomField } }
			})
			expect(container).toMatchSnapshot()
		})
	})

	describe('hierarchy', () => {
		it('should render a hierarchy parent', () => {
			const { container } = render(TableCell, {
				props: { value: { text: 'John Doe' }, path: '/', isParent: true }
			})
			expect(container).toMatchSnapshot()
		})

		it('should render a hierarchy parent expanded', () => {
			const { container } = render(TableCell, {
				props: { value: { text: 'John Doe' }, path: '/', isParent: true, isExpanded: true }
			})
			expect(container).toMatchSnapshot()
		})

		it('should render a hierarchy child', () => {
			const { container } = render(TableCell, {
				props: { value: { text: 'John Doe' }, path: '/a/b', levels: [1, 1], depth: 1 }
			})
			expect(container).toMatchSnapshot()
		})
	})
})
