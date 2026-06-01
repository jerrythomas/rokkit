import { presetRokkit, themeRules } from '@rokkit/themes'
import { defineConfig } from 'unocss'
import { presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetRokkit()],
  rules: themeRules({
    palette: {
      primary:   '#6366f1', // indigo
      secondary: '#8b5cf6', // violet
      surface:   '#0f172a', // slate
    }
  })
})
