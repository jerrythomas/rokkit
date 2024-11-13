import { describe, it, expect } from 'vitest'
import { createEmitter } from '../src/events'

describe('createEmitter', () => {
	it('should filter out attributes that start with "on" and are functions', () => {
		const props = {
			onClick: () => 'clicked',
			onHover: () => 'hovered',
			notAnEvent: 'not a function',
			onNotAFunction: 'string'
		}
		const result = createEmitter(props)
		expect(result).toEqual({
			Click: props.onClick,
			Hover: props.onHover
		})
	})

	it('should add default events with no-op function if not present', () => {
		const props = {
			onClick: () => 'clicked'
		}
		const defaults = ['Click', 'Hover']
		const result = createEmitter(props, defaults)
		expect(result).toEqual({
			Click: props.onClick,
			Hover: expect.any(Function)
		})
		expect(result.Hover()).toBeUndefined() // no-op function returns undefined
	})

	it('should not override existing events with default no-op functions', () => {
		const props = {
			onClick: () => 'clicked',
			onHover: () => 'hovered'
		}
		const defaults = ['Click', 'Hover']
		const result = createEmitter(props, defaults)
		expect(result).toEqual({
			Click: props.onClick,
			Hover: props.onHover
		})
	})

	it('should handle empty props and defaults', () => {
		const result = createEmitter({}, [])
		expect(result).toEqual({})
	})

	it('should handle empty props with defaults', () => {
		const defaults = ['Click', 'Hover']
		const result = createEmitter({}, defaults)
		expect(result).toEqual({
			Click: expect.any(Function),
			Hover: expect.any(Function)
		})
		expect(result.Click()).toBeUndefined() // no-op function returns undefined
		expect(result.Hover()).toBeUndefined() // no-op function returns undefined
	})
})
