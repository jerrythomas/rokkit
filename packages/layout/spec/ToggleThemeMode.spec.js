import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/svelte'
import ToggleThemeMode from '../src/ToggleThemeMode.svelte'

describe('ToggleThemeMode.svelte', () => {
	it('should render the component', () => {
		const { container } = render(ToggleThemeMode)
		expect(container).toMatchSnapshot()
	})
})
