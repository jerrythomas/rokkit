## Interactive palette editor for theme roles

PaletteManager is a stand-alone editor that maps semantic roles
(`primary`, `secondary`, `accent`, `surface`, `success`,
`warning`, `danger`, `info`) to Tailwind colours — or to custom
hex values. It owns its preset list, can apply changes live to the
DOM, and persists the active mapping to localStorage when given a
`storageKey`.

## Basic example

```svelte
<script>
  import { PaletteManager } from '@rokkit/ui'

  let palette = $state(null) // initialised to defaultPaletteConfig
</script>

<PaletteManager bind:value={palette} autoApply />
```

The default config maps:

| Role      | Default colour |
| --------- | -------------- |
| primary   | orange         |
| secondary | pink           |
| accent    | sky            |
| surface   | slate          |
| success   | green          |
| warning   | amber          |
| danger    | red            |
| info      | cyan           |

## Presets

Click a preset row at the top to load its full mapping at once.
`presets` accepts your own list — useful for shipping branded
collections (e.g. "Marketing", "Internal Tools", "Print").

## Custom hex

Each role row has a "hex" toggle that swaps the dropdown for a
free-text colour input. Valid hex values immediately recompute the
shade ramp shown in the preview strip — invalid input is ignored.

## Persistence

`storageKey` is the localStorage slot for the current mapping
plus any `custom` palettes the user has saved. Without it the
editor is purely transient.

## Events

- `onchange(palette)` — fires on every mapping mutation.
- `onsave(palette)` — fires when the user saves the current
  mapping as a named custom palette.
- `onapply(palette)` — fires when the user clicks "Apply" (or
  on every change if `autoApply={true}`).
