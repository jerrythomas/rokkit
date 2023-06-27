import { writable } from 'svelte/store'
export * from './media'
export { theme } from './theme'
export const alerts = writable([])

// export const theme = writable({ name: 'rokkit', mode: 'dark' })
