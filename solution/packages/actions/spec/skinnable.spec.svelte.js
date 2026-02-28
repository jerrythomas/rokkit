import { it, expect, describe } from 'vitest'
import { flushSync } from 'svelte'
import { skinnable } from '../src/skinnable.svelte.js'

describe('skinnable', () => {
	const variables = $state({
		'--primary-500': '#1a73e8',
		'--secondary-500': '#4caf50'
	})
	it('should apply CSS variables to the node', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => skinnable(node, variables))
		flushSync()

		expect(node.style.getPropertyValue('--primary-500')).toBe('#1a73e8')
		expect(node.style.getPropertyValue('--secondary-500')).toBe('#4caf50')

		variables['--primary-500'] = '#90caf9'
		flushSync()

		expect(node.style.getPropertyValue('--primary-500')).toBe('#90caf9')
		expect(node.style.getPropertyValue('--secondary-500')).toBe('#4caf50')

		cleanup()
	})

	it('should update CSS variables when input changes', () => {
		const node = document.createElement('div')
		const variables = $state({
			'--primary-500': '#1a73e8'
		})

		const cleanup = $effect.root(() => skinnable(node, variables))
		flushSync()

		expect(node.style.getPropertyValue('--primary-500')).toBe('#1a73e8')
		expect(node.style.getPropertyValue('--primary-600')).toBe('')
		variables['--primary-500'] = '#90caf9'
		variables['--primary-600'] = '#ffffff'

		flushSync()
		expect(node.style.getPropertyValue('--primary-500')).toBe('#90caf9')
		expect(node.style.getPropertyValue('--primary-600')).toBe('#ffffff')

		cleanup()
	})

	it('should preserve existing CSS variables not in input', () => {
		const node = document.createElement('div')
		node.style.setProperty('--existing-var', 'preserved')

		const variables = $state({
			'--primary-500': '#1a73e8'
		})

		const cleanup = $effect.root(() => skinnable(node, variables))
		flushSync()

		expect(node.style.getPropertyValue('--existing-var')).toBe('preserved')
		expect(node.style.getPropertyValue('--primary-500')).toBe('#1a73e8')

		cleanup()
	})
})
