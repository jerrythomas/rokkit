// uno.config.js — manual fix for the uno-uses-preset check
// Replace any existing Rokkit preset import with:
import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'

export default defineConfig({
	presets: [presetRokkit()]
})
