import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import StaticContent from '../../src/components/StaticContent.svelte'

describe('StaticContent', () => {
	it('renders the content', () => {
		const { container } = render(StaticContent)
		expect(container).toMatchSnapshot()
	})
})
