import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import Texture from '../src/template/Texture.svelte'
import { library } from '../src/template/constants'
import { render } from '@testing-library/svelte'
import * as templates from '../src/template/shapes'

describe('templates', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(templates)).toEqual(['Circles', 'Lines', 'Path', 'Polygons'])
	})
})

describe('Texture.svelte', () => {
	it.each(Object.keys(library))('should render pattern "%s" using Texture', (key) => {
		const { container } = render(Texture, {
			props: { name: key }
		})
		expect(container).toMatchSnapshot()
	})
})
