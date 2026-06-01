# Theming & Design

Rokkit separates **layout CSS** (structural) from **theme CSS**
(visual). Components ship unstyled with `data-*` attribute
hooks; themes provide the visual layer — colors, radii, shadows —
without touching structure.

## Skins, styles, modes

Three orthogonal dimensions:

| Dimension    | Drives                                                         | Default   |
| ------------ | -------------------------------------------------------------- | --------- |
| `data-style` | Visual character (`rokkit`, `minimal`, `material`, `zen-sumi`) | `rokkit`  |
| `data-skin`  | Palette mapping (roles → tailwind colours)                     | `default` |
| `data-mode`  | Light / dark                                                   | `light`   |

All three are attributes on `<html>`. Flipping any one re-skins
the entire app instantly — no rebuild.

```html
<html data-style="zen-sumi" data-skin="default" data-mode="dark"></html>
```

## Theme imports

Each style ships its own CSS file. Import the base + the style
you want as the default; lazy-load others if you support runtime
switching:

```css
@import '@rokkit/themes/base.css';
@import '@rokkit/themes/rokkit.css';
```

## Semantic colour tokens

Themes resolve to a small vocabulary of semantic tokens used by
components:

- `--paper` / `--paper-soft` / `--paper-edge` — surfaces.
- `--ink` / `--ink-mute` / `--ink-soft` — text + lines.
- `--primary` / `--secondary` / `--accent` — brand colors.
- `--success` / `--warning` / `--danger` / `--info` — state.

Each role auto-inverts for dark mode without explicit `@media
(prefers-color-scheme)` rules.

## Data-attribute styling

Components don't use BEM-style class names — they expose state
through `data-*` attributes:

```css
[data-list-item][data-active='true'] {
  box-shadow: inset 2px 0 0 0 var(--accent);
}

[data-button][data-loading='true'] {
  opacity: 0.6;
}
```

Override by selecting on those attributes in your own CSS. Don't
fight component classes — there usually aren't any.

## Roles + Palettes

Build a custom skin by mapping the semantic roles
(`primary` / `secondary` / `accent` / …) to Tailwind palette
names, then a step (50–950) per mode:

```js
// rokkit.config.js
export default {
  skin: {
    default: {
      primary: { light: { color: 'orange', step: 500 },
                 dark:  { color: 'orange', step: 400 } },
      accent:  { color: 'sky', step: 500 },
      surface: 'slate'
    }
  }
}
```

The CLI generates this for you — start with
`npx @rokkit/cli init` and pick a preset.

## When to roll your own theme

Style CSS files are themable in isolation — copy one of the four
shipped styles, swap the surface treatments and chrome, and you
have a brand-aligned variant without touching component code.
The data-attribute selectors stay the same; only the visual
recipe changes.

For the interactive editor, see the
[Theme Wizard](/app/theming) demo — it lets you preview palette
changes in real time and export a `tokens.css` you can drop
into your app.
