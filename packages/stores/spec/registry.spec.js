import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { writable, get } from 'svelte/store'
import { createRegistry } from '../src/registry'

describe('registry', () => {
	it('should create the registry', () => {
		const registry = createRegistry()
		expect(get(registry)).toEqual({
			navigators: {},
			editors: {},
			components: {},
			wrappers: {}
		})
	})

	it('should add navigators to the registry', () => {
		const registry = createRegistry()
		registry.addNavigators({ test: 'Alpha' })
		expect(get(registry)).toEqual({
			navigators: { test: 'Alpha' },
			editors: {},
			components: {},
			wrappers: {}
		})
	})

	it('should add editors to the registry', () => {
		const registry = createRegistry()
		registry.addEditors({ test: 'Beta' })
		expect(get(registry)).toEqual({
			navigators: {},
			editors: { test: 'Beta' },
			components: {},
			wrappers: {}
		})
	})

	it('should add components to the registry', () => {
		const registry = createRegistry()
		registry.addComponents({ test: 'Charlie' })
		expect(get(registry)).toEqual({
			navigators: {},
			editors: {},
			components: { test: 'Charlie' },
			wrappers: {}
		})
	})

	it('should add wrappers to the registry', () => {
		const registry = createRegistry()
		registry.addWrappers({ test: 'Delta' })
		expect(get(registry)).toEqual({
			navigators: {},
			editors: {},
			components: {},
			wrappers: { test: 'Delta' }
		})
	})

	it('should get a component from the registry', () => {
		const registry = createRegistry()
		const value = { component: 'test' }
		const fields = { component: 'component' }

		registry.addComponents({ test: 'Alpha' })
		const component = registry.getComponent(value, fields)
		expect(component).toEqual('Alpha')
		expect(registry.getNavigator(value, fields)).toBeUndefined()
	})

	it('should get a navigator from the registry', () => {
		const registry = createRegistry()
		const value = { component: 'test' }
		const fields = { component: 'component' }

		registry.addNavigators({ test: 'Alpha' })
		const component = registry.getNavigator(value, fields)
		expect(component).toEqual('Alpha')
	})

	it('should get a navigator from the registry', () => {
		const registry = createRegistry()
		const value = { component: 'test' }
		const fields = { component: 'component' }

		registry.addNavigators({ test: 'Alpha' })
		const component = registry.getNavigator(value, fields)
		expect(component).toEqual('Alpha')
	})

	it('should get a editor from the registry', () => {
		const registry = createRegistry()
		const value = { component: 'test' }
		const fields = { component: 'component' }

		registry.addEditors({ test: 'Alpha' })
		const component = registry.getEditor(value, fields)
		expect(component).toEqual('Alpha')
	})

	it('should get a wrapper from the registry', () => {
		const registry = createRegistry()
		const value = { component: 'test' }
		const fields = { component: 'component' }

		registry.addWrappers({ test: 'Alpha' })
		const component = registry.getWrapper(value, fields)
		expect(component).toEqual('Alpha')
	})
})
