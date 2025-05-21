import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/svelte'
import ComposedTree from './wrapped/ComposedTree.svelte'

describe('Tree', () => {
	beforeEach(() => {
		cleanup()
	})
	describe('composition', () => {
		it('should render', () => {
			const { container } = render(ComposedTree)
			expect(container).toMatchSnapshot()
		})
	})
})
