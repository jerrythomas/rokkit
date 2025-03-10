import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Icon from '../src/Icon.svelte'

// describe('Icon', () => {
// 	const ROOT_ELEMENT = 'rk-icon'

// 	it('should render', () => {
// 		const { container } = render(Icon)
// 		expect(container).toBeTruthy()
// 		expect(container).toMatchSnapshot()
// 	})

// 	it('should render with props', () => {
// 		const props = $state({
// 			name: 'home'
// 		})
// 		const { container } = render(Icon, { props })
// 		expect(container).toMatchSnapshot()

// 		props.name = 'settings'
// 		flushSync()
// 		expect(container).toMatchSnapshot()

// 		props.class = 'small'
// 		flushSync()
// 		expect(container).toMatchSnapshot()

// 		props.label = 'Settings'
// 		flushSync()
// 		expect(container).toMatchSnapshot()
// 	})
// })

describe('Icon', () => {
	it('should render the icon with the provided name and label', () => {
		const props = $state({
			name: 'i-rokkit:mode-dark',
			label: 'Dark mode'
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()
		props.name = 'i-rokkit:mode-light'
		props.label = 'Light mode'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with a custom class', () => {
		const props = $state({
			name: 'i-rokkit:mode-dark',
			class: 'custom-class'
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()
		props.class = 'custom-class-2'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render the icon as disabled', () => {
		const props = $state({
			name: 'i-rokkit:mode-dark',
			disabled: true
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()
	})

	it.each(['small', 'medium', 'large'])(
		'should render the icon with the specified size',
		(size) => {
			const props = $state({
				name: 'i-rokkit:mode-dark',
				size
			})
			const { container } = render(Icon, { props })
			expect(container).toMatchSnapshot()
		}
	)

	it('should render the icon with the specified role', () => {
		const props = $state({
			name: 'i-rokkit:mode-dark',
			role: 'button'
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with the specified state', () => {
		const props = $state({
			name: 'i-rokkit:node-opened',
			state: 'opened'
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with checkbox role with default state', async () => {
		const handleClick = vi.fn()
		const props = $state({
			name: 'i-rokkit:mode-dark',
			role: 'checkbox',
			onclick: handleClick
		})
		const { container } = render(Icon, { props })
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
		const props = $state({
			name: 'i-rokkit:mode-dark',
			role: 'checkbox',
			checked: false,
			onclick: handleClick
		})
		const { container } = render(Icon, { props })
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
		const props = $state({
			name: 'i-rokkit:mode-dark',
			role: 'option',
			checked: false,
			onclick: handleClick
		})
		const { container } = render(Icon, { props })
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
		const props = $state({
			name: 'i-rokkit:mode-dark',
			role: 'button',
			onclick: handleClick
		})
		const { container } = render(Icon, { props })
		expect(container).toMatchSnapshot()
		const iconWrapper = container.querySelector('[role="button"]')
		await fireEvent.click(iconWrapper)

		expect(handleClick).toHaveBeenCalled()
	})

	it('should call the click event when the icon is focused and Enter key is pressed', async () => {
		const handleClick = vi.fn()
		const props = $state({
			name: 'i-rokkit:mode-dark',
			role: 'button',
			onclick: handleClick
		})
		const { getByRole } = render(Icon, { props })

		const iconWrapper = getByRole('button')
		await fireEvent.keyDown(iconWrapper, { key: 'Enter' })

		expect(handleClick).toHaveBeenCalled()
	})
})
