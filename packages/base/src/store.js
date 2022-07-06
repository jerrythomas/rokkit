import { writable } from 'svelte/store'
import * as defaultIcons from './icons'

export const iconStore = writable(defaultIcons)
