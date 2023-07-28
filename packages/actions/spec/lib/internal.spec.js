import { describe, it, expect, vi } from 'vitest'
import {
	mapKeyboardEventsToActions,
	getClosestAncestorWithAttribute
} from '../../src/lib/internal'

describe('internal', () => {
	const handlers = {
		next: vi.fn(),
		previous: vi.fn(),
		select: vi.fn(),
		escape: vi.fn(),
		collapse: vi.fn(),
		expand: vi.fn()
	}

	describe('mapKeyboardEventsToActions', () => {
		describe('vertical', () => {
			it('should map keyboard events to actions', () => {
				const actions = mapKeyboardEventsToActions(handlers)
				expect(actions).toEqual({
					ArrowDown: handlers.next,
					ArrowUp: handlers.previous,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
			it('should map keyboard events to actions for nested', () => {
				const actions = mapKeyboardEventsToActions(handlers, { nested: true })
				expect(actions).toEqual({
					ArrowDown: handlers.next,
					ArrowUp: handlers.previous,
					ArrowRight: handlers.expand,
					ArrowLeft: handlers.collapse,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
		})

		describe('horizontal', () => {
			it('should map keyboard events to actions', () => {
				const actions = mapKeyboardEventsToActions(handlers, {
					horizontal: true
				})
				expect(actions).toEqual({
					ArrowRight: handlers.next,
					ArrowLeft: handlers.previous,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
			it('should map keyboard events to actions for nested', () => {
				const actions = mapKeyboardEventsToActions(handlers, {
					horizontal: true,
					nested: true
				})
				expect(actions).toEqual({
					ArrowDown: handlers.expand,
					ArrowUp: handlers.collapse,
					ArrowRight: handlers.next,
					ArrowLeft: handlers.previous,
					Enter: handlers.select,
					Escape: handlers.escape,
					' ': handlers.select
				})
			})
		})
	})

	describe('getClosestAncestorWithAttribute', () => {
		it('should return null if element does not have the given attribute and is orphan', () => {
			const element = document.createElement('div')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(null)
		})
		it('should return the element if it has the given attribute', () => {
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(
				element
			)
		})
		it('should return the element if it has the given attribute and is nested', () => {
			const parent = document.createElement('div')
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(
				element
			)
		})
		it('should return the closest ancestor if it has the given attribute', () => {
			const element = document.createElement('div')
			const parent = document.createElement('div')
			parent.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(parent)
		})
	})
})
