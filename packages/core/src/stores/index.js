import { writable } from 'svelte/store'
// export * from './alerts'
export const alerts = writable([])
export const theme = writable({ name: 'rokkit', mode: 'dark' })
