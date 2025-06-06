import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Connector from '../src/Connector.svelte'

describe('Connector.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	describe('given a type', () => {
		describe('when type is not specified', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Connector)
				const span = container.querySelectorAll('span')
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
				expect(span[0].hasAttribute('data-tag-line-empty')).toBeTruthy()
				expect(span[0].children).toHaveLength(0)
			})
		})

		describe('when type is "empty"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Connector, { type: 'empty' })
				const span = container.querySelectorAll('span')
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
				expect(span[0].hasAttribute('data-tag-line-empty')).toBeTruthy()
				expect(container).toMatchSnapshot()
			})
		})

		describe('when type is "last"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Connector, { type: 'last' })
				const span = container.querySelectorAll('span')
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
				expect(span[0].hasAttribute('data-tag-line-last')).toBeTruthy()
				expect(container).toMatchSnapshot()
			})
		})

		describe('when type is "child"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Connector, { type: 'child' })
				const span = container.querySelectorAll('span')
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
				expect(span[0].hasAttribute('data-tag-line-child')).toBeTruthy()
				expect(span[0].children).toHaveLength(2)
				expect(container).toMatchSnapshot()
			})
		})

		describe('when type is "sibling"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Connector, { type: 'sibling' })

				const span = container.querySelectorAll('span')
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
				expect(span[0].hasAttribute('data-tag-line-sibling')).toBeTruthy()
				expect(container).toMatchSnapshot()
			})
		})
	})

	describe('When rtl is true property', () => {
		beforeEach(() => {
			document.dir = 'rtl'
		})
		afterEach(() => {
			document.dir = 'ltr'
		})
		it('should render when type is "last"', () => {
			const { container } = render(Connector, { type: 'last', rtl: true })

			const span = container.querySelectorAll('span')
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
			expect(span[0].hasAttribute('data-tag-line-last')).toBeTruthy()
			expect(container).toMatchSnapshot()
		})

		it('should render when type is "child"', () => {
			const { container } = render(Connector, { type: 'child', rtl: true })

			const span = container.querySelectorAll('span')
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
			expect(span[0].hasAttribute('data-tag-line-child')).toBeTruthy()
			expect(container).toMatchSnapshot()
		})
		it('should render when type is "sibling"', () => {
			const { container } = render(Connector, { type: 'sibling', rtl: true })

			const span = container.querySelectorAll('span')
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
			expect(span[0].hasAttribute('data-tag-line-sibling')).toBeTruthy()
			expect(container).toMatchSnapshot()
		})
		it('should render when type is "empty"', () => {
			const { container } = render(Connector, { type: 'empty', rtl: true })

			const span = container.querySelectorAll('span')
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tag-tree-line')).toBeTruthy()
			expect(span[0].hasAttribute('data-tag-line-empty')).toBeTruthy()
			expect(span[0].hasAttribute('data-tag-line-last')).toBeFalsy()
			expect(container).toMatchSnapshot()
		})
	})
})
