---
name: command-system-rokkit
description: Use when adding keyboard shortcuts, a command palette, or app-level commands to a Rokkit (Svelte 5) app — the commands registry (@rokkit/states), the shortcuts action (@rokkit/actions), the CommandPalette component (@rokkit/ui), the 'mod+k' shortcut grammar, command scope/lifecycle, conflict detection, and i18n.
---

# Rokkit Command System

Three packages, one coherent system — commands live in a registry, shortcuts fire them from the keyboard,
the palette lets users search and run them by name.

```
@rokkit/states → commands registry (register, execute, resolve, commands.all)
@rokkit/actions → shortcuts action (use:shortcuts={commands})
@rokkit/ui → CommandPalette component (<CommandPalette bind:open />)
```

Parallel to the theme system: `vibe` (state) + `themable` (action) + `ThemeSwitcherToggle` (component).
Commands are the same shape — registry singleton + action wiring + a ready-made UI.

---

## The three pieces

| Package | Export | Role |
|---------|--------|------|
| `@rokkit/states` | `commands` | Singleton registry — register, resolve, execute |
| `@rokkit/actions` | `shortcuts` | Svelte action — intercepts `keydown`, delegates to `commands` |
| `@rokkit/ui` | `CommandPalette` | Searchable dialog — reads `commands.all`, opens on `mod+k` |

---

## Defining commands

A `Command` object has one required field (`run`) plus metadata:

```ts
type Command = {
  id: string          // unique — re-registering the same id replaces and warns
  label: string       // display text in the palette (consumer-localized)
  run: () => void     // executed on shortcut match or palette selection
  shortcut?: string   // e.g. 'mod+k', 'mod+shift+l', '?'
  group?: string      // palette category header
  global?: boolean    // fire even while a text input is focused (default false)
  enabled?: () => boolean  // dynamic gate — command is skipped when returns false
  keywords?: string[] // extra palette search terms
}
```

Register a batch with `registerMany` (returns a single unregister callback):

```js
import { commands } from '@rokkit/states'

const unregister = commands.registerMany([
  {
    id: 'palette.open',
    label: 'Open command palette',
    shortcut: 'mod+k',
    global: true,          // fires while typing — required for Cmd/Ctrl+K
    group: 'general',
    run: () => { paletteOpen = true }
  },
  {
    id: 'theme.toggle',
    label: 'Toggle light / dark',
    shortcut: 'mod+shift+l',
    group: 'theme',
    run: () => { vibe.mode = vibe.mode === 'dark' ? 'light' : 'dark' }
  },
  {
    id: 'conversation.new',
    label: 'New conversation',
    shortcut: 'mod+shift+n',
    group: 'general',
    run: startNewConversation
  }
])
```

Register one command with `register` (also returns an unregister callback):

```js
const unregister = commands.register({
  id: 'search.focus',
  label: 'Focus search',
  shortcut: '/',
  run: () => searchInput?.focus()
})
```

---

## Wiring it up

Wire the root element once (e.g. `+layout.svelte`). Register commands in `onMount`
and return the unregister fn — Svelte calls it on destroy to clean up:

```svelte
<script>
  import { onMount } from 'svelte'
  import { commands, vibe } from '@rokkit/states'
  import { shortcuts } from '@rokkit/actions'
  import { CommandPalette } from '@rokkit/ui'

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

<!-- shortcuts action on the root element intercepts keydown globally -->
<div use:shortcuts={commands}>
  {@render children()}
</div>

<!-- palette renders as an overlay; it reads commands.all directly -->
<CommandPalette bind:open={paletteOpen} />
```

The `shortcuts` action listens on `window` for `keydown` (via Svelte's `on()`), so
placing it on any element in the tree works — root element or `<svelte:body>` are both fine.

---

## Scope & lifecycle

**App-root commands** — register once in the root layout's `onMount`. They live for
the entire session. The `palette.open` command belongs here; it must always be reachable.

**Route or component-scoped commands** — register in the component's `onMount` and
return the unregister fn. They are removed when the component unmounts:

```svelte
<script>
  import { onMount } from 'svelte'
  import { commands } from '@rokkit/states'

  onMount(() => {
    // These commands are only active while this component is mounted
    return commands.registerMany([
      {
        id: 'editor.save',
        label: 'Save document',
        shortcut: 'mod+s',
        group: 'editor',
        run: saveDocument
      },
      {
        id: 'editor.format',
        label: 'Format code',
        shortcut: 'mod+shift+f',
        group: 'editor',
        run: formatCode
      }
    ])
  })
</script>
```

`commands.all` is reactive (`$state` inside the registry), so `CommandPalette` and
any list reading `commands.all` automatically re-renders when commands are added or removed.

---

## Shortcut grammar

`mod` resolves to `Cmd` on macOS, `Ctrl` on Linux/Windows — use it for all
primary shortcuts so they are cross-platform by default.

| Shortcut string | Fires on |
|-----------------|----------|
| `'mod+k'` | Cmd+K (macOS) / Ctrl+K (other) |
| `'mod+shift+l'` | Cmd+Shift+L / Ctrl+Shift+L |
| `'mod+shift+n'` | Cmd+Shift+N / Ctrl+Shift+N |
| `'?'` | `?` key (no modifier) |
| `'alt+t'` | Option+T (macOS) / Alt+T (other) |

**`global: true` is required for any shortcut that must fire while a text input is focused.**
Without it the `shortcuts` action skips the command when `document.activeElement` is an
`<input>`, `<textarea>`, `<select>`, or `contenteditable`. The `palette.open` command
(`mod+k`) must always be `global: true` — the palette is most useful when the composer
or a form field is focused.

**Conflict detection:** the registry normalizes shortcuts on registration (modifiers
sorted by canonical order, key lowercased, `mod` resolved). If a second command registers
the same normalized shortcut it is warned and skipped — the first registrant wins.

**Single chords only:** the grammar is one key + modifiers. Multi-chord sequences
(e.g. Vim-style `g g`) are not supported.

---

## i18n

The palette chrome comes from `messages.command.*` — override once to localize globally:

```js
import { messages } from '@rokkit/states'

messages.set({
  command: {
    placeholder: 'Befehl ausführen…',
    noResults: 'Keine Befehle gefunden',
    label: 'Befehlspalette'
  }
})
```

Or register a named locale and switch:

```js
messages.register('de', {
  command: {
    placeholder: 'Befehl ausführen…',
    noResults: 'Keine Befehle gefunden',
    label: 'Befehlspalette'
  }
})
messages.setLocale('de')
```

Command `label` and `keywords` are consumer-supplied strings — localize them
directly in the object passed to `register` / `registerMany`.

Default English values: `placeholder: 'Run a command…'`, `noResults: 'No commands found'`,
`label: 'Command palette'`.

---

## Common mistakes

| Mistake | Why it fails | Fix |
|---------|-------------|-----|
| Registering at module top-level (not in `onMount`) | The registry is a singleton; commands pile up across hot-reloads in dev and are never cleaned up on unmount | Always register in `onMount`, return the unregister fn |
| Forgetting `global: true` on `mod+k` (or any Cmd-shortcut) | `shortcuts` skips non-global commands while a text input is focused — Cmd+K fired in the composer silently no-ops | Add `global: true` to any command that must fire during text input |
| Hand-rolling `window.addEventListener('keydown', ...)` | No conflict detection, no `enabled()` gate, no `commands.all` integration, no cleanup | Use `use:shortcuts={commands}` — it handles all of these |
| Using `<svelte:body use:shortcuts />` without noting that `shortcuts` uses `window` | The action attaches a `window` listener regardless of which element it's placed on — placing it on body is fine but redundant | Place on any element in the tree; root element or body both work |
| Putting `run: () => paletteOpen = true` at module scope | `paletteOpen` is `$state` in the component — the closure captures the right reference only when created inside the component function | Define `run` functions after `$state` declarations, inside the component |
| Expecting `commands.all` to include disabled commands without `enabled` | `enabled` is a dynamic gate called at dispatch time, not a filter on the list | `commands.all` always contains all registered commands; `enabled` only gates execution |
