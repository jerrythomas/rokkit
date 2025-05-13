import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Line from '../../src/tree/Line.svelte'
import { TREE_CTX } from '../../src/tree/constants'

describe('Line.svelte', () => {
	const ROOT_SELECTOR = 'tree-line'
	beforeEach(() => {
		cleanup()
	})

	describe('given a type', () => {
		const context = new Map([[TREE_CTX, { rtl: false }]])

		describe('when type is not specified', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Line, { context })
				const node = container.querySelectorAll(ROOT_SELECTOR)
				expect(node).toHaveLength(1)
				expect(node[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(node[0].hasAttribute('data-tree-line')).toBeTruthy()
				expect(node[0].getAttribute('data-tree-line-type')).toEqual('empty')
				expect(node[0].children).toHaveLength(0)
			})
		})

		describe('when type is "empty"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Line, { context, props: { type: 'empty' } })
				const span = container.querySelectorAll(ROOT_SELECTOR)
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
				expect(span[0].getAttribute('data-tree-line-type')).toEqual('empty')
				expect(container).toMatchSnapshot()
			})
		})

		describe('when type is "last"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Line, { context, props: { type: 'last' } })
				const span = container.querySelectorAll(ROOT_SELECTOR)
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
				expect(span[0].getAttribute('data-tree-line-type')).toEqual('last')
				expect(container).toMatchSnapshot()
			})
		})

		describe('when type is "child"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Line, { context, props: { type: 'child' } })
				const span = container.querySelectorAll(ROOT_SELECTOR)
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
				expect(span[0].getAttribute('data-tree-line-type')).toEqual('child')
				expect(span[0].children).toHaveLength(2)
				expect(container).toMatchSnapshot()
			})
		})

		describe('when type is "sibling"', () => {
			it('then it should render the correct elements', () => {
				const { container } = render(Line, { context, props: { type: 'sibling' } })

				const span = container.querySelectorAll(ROOT_SELECTOR)
				expect(span).toHaveLength(1)
				expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
				expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
				expect(span[0].getAttribute('data-tree-line-type')).toEqual('sibling')
				expect(container).toMatchSnapshot()
			})
		})
	})

	describe('When rtl is true property', () => {
		const context = new Map([[TREE_CTX, { rtl: true }]])

		beforeEach(() => {
			document.dir = 'rtl'
		})
		afterEach(() => {
			document.dir = 'ltr'
		})
		it('should render when type is "last"', () => {
			const { container } = render(Line, { context, props: { type: 'last' } })

			const span = container.querySelectorAll(ROOT_SELECTOR)
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
			expect(span[0].getAttribute('data-tree-line-type')).toEqual('last')
			expect(container).toMatchSnapshot()
		})

		it('should render when type is "child"', () => {
			const { container } = render(Line, { context, props: { type: 'child' } })

			const span = container.querySelectorAll(ROOT_SELECTOR)
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
			expect(span[0].getAttribute('data-tree-line-type')).toEqual('child')
			expect(container).toMatchSnapshot()
		})
		it('should render when type is "sibling"', () => {
			const { container } = render(Line, { context, props: { type: 'sibling' } })

			const span = container.querySelectorAll(ROOT_SELECTOR)
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
			expect(span[0].getAttribute('data-tree-line-type')).toEqual('sibling')
			expect(container).toMatchSnapshot()
		})
		it('should render when type is "empty"', () => {
			const { container } = render(Line, { context, props: { type: 'empty' } })

			const span = container.querySelectorAll(ROOT_SELECTOR)
			expect(span).toHaveLength(1)
			expect(span[0].className).toEqual('grid h-full w-4 min-w-4 grid-cols-2 grid-rows-2')
			expect(span[0].hasAttribute('data-tree-line')).toBeTruthy()
			expect(span[0].getAttribute('data-tree-line-type')).toEqual('empty')
			expect(span[0].hasAttribute('data-line-last')).toBeFalsy()
			expect(container).toMatchSnapshot()
		})
	})
})
