import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { setProperties } from 'validators'
import Icon from '../src/Icon.svelte'
import { tick } from 'svelte'

describe('Icon component', () => {
	it('should render the icon with the provided name', () => {
		const { container } = render(Icon, { props: { name: 'i-rokkit:mode-dark' } })
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with the provided name and label', () => {
		const { container } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				label: 'Dark mode'
			}
		})
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with a custom class', async () => {
		const props = $state({
			name: 'i-rokkit:mode-dark',
			class: 'custom-class'
		})
		const { container } = render(Icon, {
			props
		})
		expect(container).toMatchSnapshot()
		props.class = 'custom-class-2'
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render the icon as disabled', () => {
		const { container } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				disabled: true
			}
		})
		expect(container).toMatchSnapshot()
	})

	it.each(['small', 'medium', 'large'])(
		'should render the icon with the specified size',
		(size) => {
			const { container } = render(Icon, {
				props: {
					name: 'i-rokkit:mode-dark',
					size
				}
			})
			expect(container).toMatchSnapshot()
		}
	)

	it.each(['small', 'medium', 'large'])(
		'should render the icon with the size when specified in class',
		(size) => {
			const { container } = render(Icon, {
				props: {
					name: 'i-rokkit:mode-dark',
					class: size
				}
			})
			expect(container).toMatchSnapshot()
		}
	)

	it('should render the icon with the specified role', () => {
		const { container } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				role: 'button'
			}
		})
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with the specified state', () => {
		const { container } = render(Icon, {
			props: {
				name: 'i-rokkit:node-opened',
				state: 'opened'
			}
		})
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with checkbox role with default state', async () => {
		const handleClick = vi.fn()

		const { container } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				role: 'checkbox',
				onclick: handleClick
			}
		})
		expect(container).toMatchSnapshot()
		const iconWrapper = container.querySelector('[role="checkbox"]')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('true')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('false')
	})

	it('should render the icon with checkbox role', async () => {
		const handleClick = vi.fn()

		const { container, component } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				role: 'checkbox',
				checked: false,
				onclick: handleClick
			}
		})
		expect(container).toMatchSnapshot()

		const iconWrapper = container.querySelector('[role="checkbox"]')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('true')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()

		expect(iconWrapper.getAttribute('aria-checked')).toEqual('false')
	})

	it('should handle role=option as checkbox', async () => {
		const handleClick = vi.fn()

		const { container } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				role: 'option',
				checked: false,
				onclick: handleClick
			}
		})
		expect(container).toMatchSnapshot()

		const iconWrapper = container.querySelector('[role="option"]')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('true')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()

		expect(iconWrapper.getAttribute('aria-checked')).toEqual('false')
	})

	it('should call the click event when the icon is clicked', async () => {
		const handleClick = vi.fn()
		const { component, container } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				role: 'button',
				onclick: handleClick
			}
		})
		expect(container).toMatchSnapshot()
		const iconWrapper = container.querySelector('[role="button"]')
		await fireEvent.click(iconWrapper)

		expect(handleClick).toHaveBeenCalled()
	})

	it('should call the click event when the icon is focused and Enter key is pressed', async () => {
		const handleClick = vi.fn()
		const { getByRole, component } = render(Icon, {
			props: {
				name: 'i-rokkit:mode-dark',
				role: 'button',
				onclick: handleClick
			}
		})

		const iconWrapper = getByRole('button')
		await fireEvent.keyDown(iconWrapper, { key: 'Enter' })

		expect(handleClick).toHaveBeenCalled()
	})
})
