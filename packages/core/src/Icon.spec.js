import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Icon from './Icon.svelte'

describe('Icon component', () => {
	it('renders the icon with the provided name', () => {
		const { container } = render(Icon, { name: 'i-rokkit:mode-dark' })
		expect(container).toMatchSnapshot()
	})

	it('renders the icon with the provided name and label', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			label: 'Dark mode'
		})
		expect(container).toMatchSnapshot()
	})

	it('renders the icon with a custom class', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			class: 'custom-class'
		})
		expect(container).toMatchSnapshot()
	})

	it('renders the icon as disabled', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			disabled: true
		})
		expect(container).toMatchSnapshot()
	})

	it.each(['small', 'medium', 'large'])(
		'renders the icon with the specified size',
		(size) => {
			const { container } = render(Icon, {
				name: 'i-rokkit:mode-dark',
				size
			})
			expect(container).toMatchSnapshot()
		}
	)

	it.each(['small', 'medium', 'large'])(
		'renders the icon with the size when specified in class',
		(size) => {
			const { container } = render(Icon, {
				name: 'i-rokkit:mode-dark',
				class: size
			})
			expect(container).toMatchSnapshot()
		}
	)

	it('renders the icon with the specified role', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'button'
		})
		expect(container).toMatchSnapshot()
	})

	it('calls the click event when the icon is clicked', async () => {
		const handleClick = vi.fn()
		const { component, container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'button'
		})
		expect(container).toMatchSnapshot()
		component.$on('click', handleClick)
		const iconWrapper = container.querySelector('[role="button"]')
		await fireEvent.click(iconWrapper)

		expect(handleClick).toHaveBeenCalled()
	})

	it('calls the click event when the icon is focused and Enter key is pressed', async () => {
		const handleClick = vi.fn()
		const { getByRole, component } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'button'
		})

		component.$on('click', handleClick)
		const iconWrapper = getByRole('button')
		await fireEvent.keyDown(iconWrapper, { key: 'Enter' })

		expect(handleClick).toHaveBeenCalled()
	})
})
