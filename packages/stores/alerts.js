import { writable } from 'svelte/store'

function createStoreForAlerts() {
	const { set, update } = writable([])

	return { set, update, hideAll }
}

export const alerts = createStoreForAlerts()
