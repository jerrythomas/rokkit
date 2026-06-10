# Commands & Shortcuts

Rokkit ships a lightweight command system that unifies keyboard shortcuts and
a searchable palette in one coherent API. Three pieces work together:

| Piece | Package | Role |
| --- | --- | --- |
| `commands` registry | `@rokkit/states` | Defines + stores all commands; app-wide singleton |
| `use:shortcuts` action | `@rokkit/actions` | Listens globally for keydown, resolves via the registry |
| `<CommandPalette>` | `@rokkit/ui` | Modal search UI backed by `commands.all` |

## Defining a command

A command is a plain object registered with the `commands` singleton:

```js
{
  id: 'save',           // unique key
  label: 'Save document',  // shown in the palette (you localise this)
  shortcut: 'mod+k',    // optional — 'mod' = Cmd on macOS, Ctrl elsewhere
  group: 'file',        // optional palette category header
  global: false,        // true = fire even while a text input is focused
  enabled: () => true,  // optional dynamic gate
  keywords: ['write'],  // optional extra search terms
  run: () => save()     // called on shortcut match or palette select
}
```

## Registering commands

Use `commands.register()` for one command or `commands.registerMany()` for a
batch. Both return an **unregister** function — return it from `onMount` so
Svelte calls it automatically on component destroy:

```svelte
<script>
  import { commands } from '@rokkit/states'
  import { onMount } from 'svelte'

  let paletteOpen = $state(false)

  onMount(() => {
    return commands.registerMany([
      {
        id: 'palette.open',
        label: 'Open command palette',
        shortcut: 'mod+k',
        global: true,
        group: 'general',
        run: () => { paletteOpen = true }
      },
      {
        id: 'theme.toggle',
        label: 'Toggle light / dark',
        shortcut: 'mod+shift+l',
        group: 'theme',
        run: () => { vibe.mode = vibe.mode === 'dark' ? 'light' : 'dark' }
      }
    ])
  })
</script>
```

## Wiring the shortcuts action

Apply `use:shortcuts={commands}` once on the app root or layout wrapper. It
attaches a `window` keydown listener and delegates resolution to the registry.
Non-global commands are silently ignored while a text field is focused:

```svelte
<script>
  import { commands } from '@rokkit/states'
  import { shortcuts } from '@rokkit/actions'
</script>

<div class="app-shell" use:shortcuts={commands}>
  {@render children()}
</div>
```

## Adding the command palette

`CommandPalette` reads `commands.all` directly — no extra wiring for the
command list. Bind `open` and register a `'mod+k'` command that flips it:

```svelte
<script>
  import { CommandPalette } from '@rokkit/ui'
  import { commands } from '@rokkit/states'
  import { shortcuts } from '@rokkit/actions'
  import { onMount } from 'svelte'

  let paletteOpen = $state(false)

  onMount(() => {
    return commands.register({
      id: 'palette.open',
      label: 'Open command palette',
      shortcut: 'mod+k',
      global: true,
      run: () => { paletteOpen = true }
    })
  })
</script>

<div use:shortcuts={commands}>
  {@render children()}
  <CommandPalette bind:open={paletteOpen} />
</div>
```

The palette filters results live as you type, matching against `label`, `id`,
and `keywords`. Arrow keys move selection; Enter runs the active command;
Escape and click-outside close without running.

## Shortcut grammar

Shortcuts are `+`-separated strings. `mod` is the only special token:

| Token | Resolves to |
| --- | --- |
| `mod` | `Cmd` on macOS, `Ctrl` elsewhere |
| `ctrl` / `control` | `ctrl` |
| `meta` / `cmd` | `meta` |
| `alt` / `option` | `alt` |
| `shift` | `shift` |
| any other token | the key (lowercased) |

Examples: `'mod+k'`, `'mod+shift+p'`, `'?'`, `'ctrl+/'`.

## Scope & lifecycle

- Commands registered in any component or route are pooled in the one singleton.
- **Layout-level commands** (palette open, theme toggle) belong in the app
  layout's `onMount` and live for the session.
- **Route-level commands** (save, undo) go in individual page components and
  are torn down when the page unmounts.
- Duplicate `id` registrations replace the previous entry and log a warning.
- Shortcut conflicts warn and the second registrant does not receive the key.

## i18n

Override the palette's chrome strings via the messages store:

```js
import { messages } from '@rokkit/states'

messages.set({
  command: {
    placeholder: 'Saisir une commande…',
    noResults: 'Aucune commande trouvée',
    label: 'Palette de commandes'
  }
})
```

Command `label` strings are consumer-provided — localise them in your
`registerMany` call.
