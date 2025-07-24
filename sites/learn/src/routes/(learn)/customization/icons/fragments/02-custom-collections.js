/**
 * Example: Using custom icon collections with UnoCSS presetIcons
 *
 * You can use custom icon collections or external icon sets (SVG, Iconify, JSON, etc.)
 * by configuring UnoCSS presets. This allows you to bring in your own icons or third-party sets.
 */

const icons = {
  rokkit: '@rokkit/icons/ui.json',
  logo: '@rokkit/icons/auth.json',
  component: '@rokkit/icons/components.json',
  app: '@rokkit/icons/app.json',
  solar: '@iconify-json/solar/icons.json'
}

presetIcons({
  collections: {
    ...importIcons(icons),
    file: () =>
      import('./static/icons/files/icons.json', { with: { type: 'json' } }).then(
        (i) => i.default
      )
  }
})
