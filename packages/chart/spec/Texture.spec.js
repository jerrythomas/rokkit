import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Texture from '../src/Texture.svelte'

describe('Texture.svelte', () => {
	it('renders a <pattern> element', () => {
		const { container } = render(Texture, { props: { id: 'tex-1' } })
		expect(container.querySelector('pattern')).toBeTruthy()
	})

	it('passes id to the pattern element', () => {
		const { container } = render(Texture, { props: { id: 'my-texture' } })
		expect(container.querySelector('pattern').getAttribute('id')).toBe('my-texture')
	})

	it('uses userSpaceOnUse patternUnits by default', () => {
		const { container } = render(Texture, { props: { id: 'tex-2' } })
		expect(container.querySelector('pattern').getAttribute('patternUnits')).toBe('userSpaceOnUse')
	})

	it('accepts objectBoundingBox patternUnits', () => {
		const { container } = render(Texture, {
			props: { id: 'tex-3', patternUnits: 'objectBoundingBox' }
		})
		expect(container.querySelector('pattern').getAttribute('patternUnits')).toBe('objectBoundingBox')
	})

	it('renders a background rect with the size prop', () => {
		const { container } = render(Texture, { props: { id: 'tex-4', size: 20 } })
		const pattern = container.querySelector('pattern')
		expect(pattern.getAttribute('width')).toBe('20')
		expect(pattern.getAttribute('height')).toBe('20')
		const rect = pattern.querySelector('rect')
		expect(rect).toBeTruthy()
		expect(rect.getAttribute('width')).toBe('20')
		expect(rect.getAttribute('height')).toBe('20')
	})

	it('renders no <path> when path prop is not provided', () => {
		const { container } = render(Texture, { props: { id: 'tex-5' } })
		const pattern = container.querySelector('pattern')
		expect(pattern.querySelector('path')).toBeNull()
	})

	it('renders a <path> element when path prop is provided', () => {
		const { container } = render(Texture, {
			props: { id: 'tex-6', path: 'M0,0L10,10' }
		})
		const pattern = container.querySelector('pattern')
		const path = pattern.querySelector('path')
		expect(path).toBeTruthy()
		expect(path.getAttribute('d')).toBe('M0,0L10,10')
		expect(path.getAttribute('fill')).toBe('none')
	})

	it('passes stroke and thickness to path', () => {
		const { container } = render(Texture, {
			props: { id: 'tex-7', path: 'M0,0L10,0', stroke: 'red', thickness: 2 }
		})
		const path = container.querySelector('pattern path')
		expect(path.getAttribute('stroke')).toBe('red')
		expect(path.getAttribute('stroke-width')).toBe('2')
	})

	it('passes fill to the background rect', () => {
		const { container } = render(Texture, {
			props: { id: 'tex-8', fill: 'blue' }
		})
		const rect = container.querySelector('pattern rect')
		expect(rect.getAttribute('fill')).toBe('blue')
	})

	it('uses default size of 10', () => {
		const { container } = render(Texture, { props: { id: 'tex-9' } })
		const pattern = container.querySelector('pattern')
		expect(pattern.getAttribute('width')).toBe('10')
		expect(pattern.getAttribute('height')).toBe('10')
	})
})
