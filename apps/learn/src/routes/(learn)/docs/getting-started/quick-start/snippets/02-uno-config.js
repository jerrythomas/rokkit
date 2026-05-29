import { defineConfig } from 'unocss'
import { presetUno } from 'unocss'
import { presetRokkit, themeRules } from '@rokkit/themes'

export default defineConfig({
  presets: [presetUno(), presetRokkit()],
  rules: themeRules()
})
