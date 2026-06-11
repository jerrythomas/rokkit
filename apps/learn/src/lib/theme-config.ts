// Single source of truth for this app's theme storage key.
// Configured once in rokkit.config.js and read by every runtime site (the SSR
// themeHook, the themable action, and the theme store), so theme + role-override
// persistence all key off the same value. No hardcoded default — the config owns it.
import config from '../../rokkit.config.js'

export const STORAGE_KEY = config.storageKey as string
