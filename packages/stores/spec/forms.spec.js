import { describe, it, expect } from 'vitest'
import { getRenderer } from '../src/forms.js'

describe('forms', () => {
	describe('getRenderer', () => {
		it('should return input/text for string', () => {
			expect(getRenderer('string')).toEqual({
				component: 'input',
				properties: { type: 'text' }
			})
		})
		it('should return input/number for number', () => {
			expect(getRenderer('number')).toEqual({
				component: 'input',
				properties: { type: 'number' }
			})
		})
		it('should return checkbox for boolean', () => {
			expect(getRenderer('boolean')).toEqual({
				component: 'checkbox',
				properties: {}
			})
		})
		it('should return input/number for integer', () => {
			expect(getRenderer('integer')).toEqual({
				component: 'input',
				properties: { type: 'number', pattern: /\d+/ }
			})
		})
		it('should return radio-group for enum', () => {
			expect(getRenderer('enum')).toEqual({
				component: 'radio-group',
				properties: {}
			})
		})
		it('should return editor if provided', () => {
			expect(getRenderer('string', { editor: 'textarea' })).toEqual({
				component: 'textarea',
				properties: { type: 'text' }
			})
		})

		it('should return properties if provided', () => {
			expect(getRenderer('string', { placeholder: 'foo' })).toEqual({
				component: 'input',
				properties: { type: 'text', placeholder: 'foo' }
			})
		})

		it('should return properties and editor if provided', () => {
			expect(getRenderer('string', { editor: 'textarea', placeholder: 'foo' })).toEqual({
				component: 'textarea',
				properties: { type: 'text', placeholder: 'foo' }
			})
		})
	})
})
