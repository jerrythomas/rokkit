import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import * as icons from '../../src/heroicons/filled'

describe('HeroIcons Filled', () => {
	const allIcons = Object.keys(icons).map((key) => [key, icons[key]])
	beforeEach(() => cleanup())

	it.each(allIcons)('should render icon for %s', (name, icon) => {
		const { container } = render(icon)
		expect(container).toBeTruthy()
		expect(name).toBeDefined()
	})
})
