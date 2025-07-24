# Icon Customization in Rokkit UI

Rokkit provides a unified, data-driven icon system that makes icon customization simple, consistent, and scalable across your entire application.

---

## How Rokkit Handles Icons

- **Consistent Icon Keys:** All components use a shared set of icon keys (see `defaultIcons` in `@rokkit/core/src/constants.js`). This means you only need to define your icon mapping once for your whole app.
- **Compile-Time Mapping:** Use UnoCSS shortcuts to map icon keys to your preferred icon library (SVG, Iconify, custom JSON, etc.) at build time.
- **Component-Level Overrides:** You can override icons for individual components by passing an `icons` object as a prop.

---

## Global Icon Customization (UnoCSS)

Define your icon shortcuts in your UnoCSS config to ensure all components use your chosen icon set:

```js
import { iconShortcuts, defaultIcons } from '@rokkit/themes'

export default defineConfig({
  shortcuts: [
    ...Object.entries(iconShortcuts(defaultIcons, 'i-myicons')),
    // other shortcuts...
  ]
})
```

This approach guarantees that every Rokkit component uses your mapped icons, maintaining consistency throughout your UI.

---

## Per-Component Icon Overrides

If you need to customize icons for a specific component, pass an `icons` object using the **base icon names** as keys:

```js
const myIcons = {
  add: 'i-custom:add',
  remove: 'i-custom:remove',
  // ...other overrides
}

// Usage in Svelte:
<List items={items} icons={myIcons} />
```

**Note:**  
Use the _base_ icon names (e.g., `add`, `remove`), not the full keys like `action-add`.

---

## Advanced: Custom Icon Collections

You can use custom icon collections or external icon sets (SVG, Iconify, JSON, etc.) by configuring UnoCSS presets:

```js
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
```

---

## Benefits

- **Consistency:** All components use the same icon keys.
- **Flexibility:** Customize globally or per component.
- **Performance:** Compile-time mapping via UnoCSS.
- **Extensibility:** Use any icon library or your own SVGs.

---

For more on customizing styles and colors, see the [styles](./styles.md) and [colors](./colors.md) documentation.