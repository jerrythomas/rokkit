import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue } from 'validators'

import Icon from '../src/Icon.svelte'

describe('Icon component', () => {
	it('should render the icon with the provided name', () => {
		const { container } = render(Icon, { name: 'i-rokkit:mode-dark' })
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with the provided name and label', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			label: 'Dark mode'
		})
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with a custom class', () => {
		const { container, component } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			class: 'custom-class'
		})
		expect(container).toMatchSnapshot()
		expect(getPropertyValue(component, 'class')).toEqual('custom-class')

		// Forced update to fix coverage report for class property
		// https://github.com/vitest-dev/vitest/issues/3336 */
		// https://github.com/sveltejs/svelte/issues/7824
		component.$set({ class: 'trigger-update-please' })
	})

	it('should render the icon as disabled', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			disabled: true
		})
		expect(container).toMatchSnapshot()
	})

	it.each(['small', 'medium', 'large'])(
		'should render the icon with the specified size',
		(size) => {
			const { container } = render(Icon, {
				name: 'i-rokkit:mode-dark',
				size
			})
			expect(container).toMatchSnapshot()
		}
	)

	it.each(['small', 'medium', 'large'])(
		'should render the icon with the size when specified in class',
		(size) => {
			const { container } = render(Icon, {
				name: 'i-rokkit:mode-dark',
				class: size
			})
			expect(container).toMatchSnapshot()
		}
	)

	it('should render the icon with the specified role', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'button'
		})
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with the specified state', () => {
		const { container } = render(Icon, {
			name: 'i-rokkit:node-opened',
			state: 'opened'
		})
		expect(container).toMatchSnapshot()
	})

	it('should render the icon with checkbox role with default state', async () => {
		const handleClick = vi.fn()

		const { container, component } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'checkbox'
		})
		expect(container).toMatchSnapshot()
		expect(getPropertyValue(component, 'checked')).toBe(false)

		component.$on('click', handleClick)
		const iconWrapper = container.querySelector('[role="checkbox"]')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(getPropertyValue(component, 'checked')).toBe(true)

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(getPropertyValue(component, 'checked')).toBe(false)
	})

	it('should render the icon with checkbox role', async () => {
		const handleClick = vi.fn()

		const { container, component } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'checkbox',
			checked: false
		})
		expect(container).toMatchSnapshot()

		component.$on('click', handleClick)
		const iconWrapper = container.querySelector('[role="checkbox"]')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(getPropertyValue(component, 'checked')).toBe(true)
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('true')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(getPropertyValue(component, 'checked')).toBe(false)
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('false')
	})

	it('should handle role=option as checkbox', async () => {
		const handleClick = vi.fn()

		const { container, component } = render(Icon, {
			name: 'i-rokkit:mode-dark',
			role: 'option',
			checked: false
		})
		expect(container).toMatchSnapshot()

		component.$on('click', handleClick)
		const iconWrapper = container.querySelector('[role="option"]')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(getPropertyValue(component, 'checked')).toBe(true)
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('true')

		await fireEvent.click(iconWrapper)
		expect(handleClick).toHaveBeenCalled()
		expect(getPropertyValue(component, 'checked')).toBe(false)
		expect(iconWrapper.getAttribute('aria-checked')).toEqual('false')
	})

	it('should call the click event when the icon is clicked', async () => {
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

	it('should call the click event when the icon is focused and Enter key is pressed', async () => {
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
