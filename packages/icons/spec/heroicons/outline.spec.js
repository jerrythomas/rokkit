import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { toHyphenCase, toPascalCase } from '@svelte-spice/core'
import * as icons from '../../src/heroicons/outline'

describe('HeroIcons Outline', () => {
	const allIcons = Object.keys(icons).map((key) => [key, icons[key]])

	beforeEach(() => cleanup())

	it.each(allIcons)('should render icon for %s', (name, icon) => {
		const { container } = render(icon)
		expect(container).toMatchSnapshot()
		expect(container).toBeTruthy()
		expect(name).toBeDefined()
	})

	it.each(Object.keys(icons))(
		'should convert "%s" to hyphen case and back',
		(name) => {
			expect(toPascalCase(toHyphenCase(name))).toEqual(name)
		}
	)
})
