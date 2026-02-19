import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { StaticContent } from '@rokkit/helpers/components'
import Overlay from '../src/Overlay.svelte'
import { tick } from 'svelte'

describe('Overlay', () => {
	it('should render empty', () => {
		const { container } = render(Overlay)
		expect(container).toMatchSnapshot()
	})

	it('should close when clicked outside', async () => {
		const props = $state({ children: StaticContent })
		const { container } = render(Overlay, { props })

		expect(container).toMatchSnapshot()
		fireEvent.click(container)
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should close when escape key is pressed', async () => {
		const props = $state({ children: StaticContent })
		const { container } = render(Overlay, { props })

		expect(container).toMatchSnapshot()
		fireEvent.keyUp(container, { key: 'Escape' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
