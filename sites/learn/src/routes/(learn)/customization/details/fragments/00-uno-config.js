/**
 * Example: Using Theme in UnoCSS Configuration
 *
 * This shows how to use the Rokkit Theme API to define skins, semantic color shortcuts,
 * and icon mappings in your UnoCSS config.
 */

import { defineConfig } from 'unocss'
import { Theme, iconShortcuts, defaultIcons } from '@rokkit/themes'

const theme = new Theme({
  mapping: {
    primary: 'orange',
    neutral: 'shark'
  }
})

export default defineConfig({
  theme: theme.getColorRules(),
  shortcuts: [
    ...theme.getShortcuts('primary'),
    ...theme.getShortcuts('neutral'),
    ...Object.entries(iconShortcuts(defaultIcons, 'i-myicons'))
  ]
})
