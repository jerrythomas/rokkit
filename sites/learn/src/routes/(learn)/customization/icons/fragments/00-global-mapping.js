import { iconShortcuts, defaultIcons } from '@rokkit/themes'

export default defineConfig({
  shortcuts: [
    ...Object.entries(iconShortcuts(defaultIcons, 'i-myicons')),
    // other shortcuts...
  ]
})
