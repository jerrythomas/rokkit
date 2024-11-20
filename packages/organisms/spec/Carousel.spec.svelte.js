import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Carousel from '../src/Carousel.svelte'

describe('Carousel.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default field mapping', () => {
		const { container } = render(Carousel)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	// it('should render using field mappings', () => {})
	// it('should render items using custom component', () => {})
	// it('should expand and collapse', () => {})
	// it('should autoclose others', () => {})
	// it('should pass select and change events', () => {})
})
