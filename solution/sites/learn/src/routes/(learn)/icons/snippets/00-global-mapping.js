// uno.config.js
import { defineConfig } from 'unocss'
import { themeRules } from '@rokkit/themes'

export default defineConfig({
  rules: themeRules({
    icons: {
      add: 'i-solar:add-circle-bold-duotone',
      remove: 'i-solar:minus-circle-bold-duotone',
      expand: 'i-solar:alt-arrow-down-bold-duotone',
      collapse: 'i-solar:alt-arrow-up-bold-duotone',
      check: 'i-solar:check-circle-bold-duotone',
      close: 'i-solar:close-circle-bold-duotone',
    }
  })
})