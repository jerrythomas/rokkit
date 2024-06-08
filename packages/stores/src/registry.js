import { writable, get } from 'svelte/store'
import { getComponent } from '@rokkit/core'

/**
 * @typedef ComponentRegistry
 * @property {Record<string, import('svelte').SvelteComponent>} navigators
 * @property {Record<string, import('svelte').SvelteComponent>} editors
 * @property {Record<string, import('svelte').SvelteComponent>} components
 * @property {Record<string, import('svelte').SvelteComponent>} wrappers
 */
/**
 * Create a component registry store which can be used to store navigators, editors, components and wrappers.
 *
 * @returns {import('svelte/store').Writable<ComponentRegistry>}
 */
export function createRegistry() {
	const registry = writable({
		navigators: {},
		editors: {},
		components: {},
		wrappers: {}
	})

	/**
	 * Add a new item to the registry
	 *
	 * @param {string} category
	 */
	function add(category, components) {
		registry.update((state) => {
			state[category] = { ...state[category], ...components }
			return state
		})
	}

	return {
		subscribe: registry.subscribe,
		addNavigators: (components) => add('navigators', components),
		addEditors: (components) => add('editors', components),
		addComponents: (components) => add('components', components),
		addWrappers: (components) => add('wrappers', components),
		getComponent: (value, fields) => getComponent(value, fields, get(registry).components),
		getNavigator: (value, fields) => getComponent(value, fields, get(registry).navigators),
		getEditor: (value, fields) => getComponent(value, fields, get(registry).editors),
		getWrapper: (value, fields) => getComponent(value, fields, get(registry).wrappers)
	}
}
