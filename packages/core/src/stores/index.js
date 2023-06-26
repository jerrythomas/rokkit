import { writable } from 'svelte/store'
// export * from './alerts'
export { theme } from './theme'
export const alerts = writable([])
export { media as watchMedia } from './media'
// export const theme = writable({ name: 'rokkit', mode: 'dark' })
