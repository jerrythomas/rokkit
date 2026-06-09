# 19 — App Command System

**Status:** Designed 2026-06-09 (approved). Implementation plan: `docs/superpowers/plans/<date>-command-system.md`.
**Supersedes the sketch in:** `docs/backlog/2026-05-20-global-shortcut-handler.md`.

## Overview

An app-level command/shortcut registry so components, menus, and pages declare keyboard
shortcuts and actions in one place, instead of the current scattered, hardcoded handlers
(e.g. the no-op Cmd+K stub in the old Koan `Shell.svelte`, the decorative `⌘K` badge in
`ChatHistory.svelte` that listens for nothing). A single Cmd/Ctrl+K command palette lists all
available commands with fuzzy search.

Built **consumer-first** in `apps/learn/src/lib/koan/` (per the repo convention of building new
`@rokkit`-shaped infrastructure inside its first consumer, promoting to a package once the API
is validated). No new package in v1.

## Goals (v1)

- A command **registry** with declarative register / unregister and dynamic enablement.
- A **capture action** that turns keystrokes into command dispatches, cross-platform.
- A **command palette** (Cmd/Ctrl+K) with fuzzy search over all registered commands.
- **Conflict detection** — warn at register time when two commands claim the same shortcut.
- **Scope** — global commands always active; route/component-scoped commands active only while
  mounted.

## Non-goals (deferred)

- Menu/Dropdown `command` integration (additive once the registry exists; needs a Menu data
  convention + consumer wiring).
- User-customizable bindings + `localStorage` persistence (v2).
- Command recording / undo stack; mouse-gesture commands.
- Promotion to a `@rokkit/commands` package (factory form) — only after the API proves out.

## Architecture — three units

```
keydown ─▶ use:shortcuts (capture) ─▶ commands.resolve(event) ─▶ Command ─▶ run()
                                          ▲
   register()/unregister() ── components ─┘        CommandPalette reads commands.all
```

### Unit 1 — `commands` registry (`koan/commands.svelte.ts`)

A singleton class instance (mirrors `@rokkit/states`' `vibe`/`messages` and koan's own stores).

```ts
export type Command = {
  id: string                  // unique within the registry; duplicate id warns
  label: string               // display text (consumer-localized; see i18n)
  run: () => void             // executed on keystroke match or palette select
  shortcut?: string           // 'mod+k' | 'mod+shift+p' | '?' (see grammar); omit for palette-only
  group?: string              // palette category (e.g. 'chat', 'navigation', 'theme')
  global?: boolean            // fires even while a text input is focused (default: false)
  enabled?: () => boolean     // optional dynamic gate; disabled commands don't match or run
}

class CommandRegistry {
  get all(): Command[]                          // $state-backed snapshot for the palette (stable order)
  register(cmd: Command): () => void            // returns an unregister fn
  registerMany(cmds: Command[]): () => void     // returns one unregister fn for the batch
  execute(id: string): void                     // run by id (no-op + warn if unknown/disabled)
  resolve(event: KeyboardEvent): Command | null // normalize event → shortcut string → matching enabled command
}

export const commands = new CommandRegistry()
```

**Internal state:** a `$state` map/array of commands keyed by `id`, plus a derived
normalized-shortcut → `id` index used by `resolve()`.

**Conflict detection:** on `register`, the shortcut is normalized (see grammar). If another
**enabled** command already binds that normalized shortcut, `console.warn` naming both ids.
Both commands still appear in `all` (and thus the palette), but the keyboard index keeps the
**first** registrant for that shortcut (deterministic). A duplicate `id` also warns and the
later registration replaces the earlier (last-wins for same id, so a re-render that re-registers
is safe).

**`resolve(event)`** builds the canonical shortcut string from the event (`metaKey` on macOS,
`ctrlKey` elsewhere → `mod`; plus `shift`/`alt`), looks it up in the index, and returns the
command only if present and `enabled?.() !== false`.

### Unit 2 — `shortcuts` action (`koan/shortcuts.svelte.ts`)

`use:shortcuts={commands}` — the capture layer between raw keystrokes and the registry.

- On mount, attaches a `keydown` listener at the window level (added/removed via the action
  lifecycle; cleaned up on destroy).
- For each event: `const cmd = commands.resolve(event)`. If `cmd` is non-null and not suppressed
  by the input-focus guard, `event.preventDefault()` then `commands.execute(cmd.id)`.
- **Input-focus guard:** if `document.activeElement` is an `input`, `textarea`, or
  `contenteditable` element, ignore the match **unless** `cmd.global === true`. (So Cmd+K — a
  `global` command — still opens the palette while the user types in the chat composer, but a
  plain `n` shortcut won't fire mid-typing.)
- Applied once at the `/app` root. Scope is governed by *which commands are currently registered*
  (register on mount / unregister on unmount), not by DOM subtree — so one window listener serves
  all active commands.

Cross-platform handling reuses the established Cmd/Ctrl-folding from `@rokkit/actions`
(`resolveAction` folds `metaKey || ctrlKey` into one layer); the same folding produces `mod`.

### Unit 3 — `CommandPalette` (`koan/components/CommandPalette.svelte`)

- Opened by a registered command `palette.open` (`shortcut: 'mod+k'`, `global: true`) whose `run`
  toggles palette open-state — so the palette dogfoods the registry rather than special-casing
  Cmd+K.
- Renders an overlay (modal, focus-trapped) with a search `<input>` that fuzzy-filters
  `commands.all` using the existing `koan/match.svelte.ts` matcher; results grouped by `group`.
- In-list navigation uses a plain keyed list + `resolveAction` from `@rokkit/actions` (ArrowUp/Down/
  Enter/Escape) — lighter than wiring the full `navigator`/`List` for a transient overlay.
- Selecting a command runs it (`commands.execute(id)`) and closes; Escape / click-outside close
  without running. v1 lists **all** registered commands (including `palette.open` itself, which
  is harmless to show); a `hidden` flag to omit specific commands is a later addition if needed.

## Shortcut grammar

`'mod+k'` string convention:

- `mod` → Cmd on macOS, Ctrl on Windows/Linux.
- Also `shift`, `alt`, and plain keys: `'?'`, `'mod+shift+p'`, `'g then d'` is **out of scope**
  (no chord sequences in v1 — single chord only).
- `parseShortcut(str)` → a normalized canonical form; the matcher builds the same canonical form
  from a `KeyboardEvent`. Comparison is on the normalized string, so conflict detection and
  resolution are order/spacing-insensitive.

## Wiring (`/app/+layout.svelte`)

1. Register the v1 global commands once (module load or layout init): `palette.open`
   (`mod+k`, global), `toggle-theme` (e.g. `mod+shift+l`), `new-conversation` (`mod+shift+n`),
   `jump-to-demo` / focus-search. Exact bindings finalized in the plan; all run real app actions
   (vibe mode toggle, koan store actions, navigation).
2. `<svelte:body use:shortcuts={commands}>` (or the layout root element) installs the capture layer.
3. Render `<CommandPalette />`.
4. Route/component-scoped commands register from their own `onMount` and unregister on cleanup.

## i18n

Command `label`s are strings supplied at registration; the consumer localizes them with the app's
existing i18n (paraglide `m.*` for app copy). Palette **chrome** (search placeholder, "no results",
aria-label) likewise uses the app's i18n. We deliberately do **not** route app command labels
through the `@rokkit/states` `messages` store — that store is for component-library chrome, whereas
command labels are app-specific. (Revisit if the system is promoted to a package: a package-level
palette's own chrome would then live in `@rokkit/states messages`.)

## Testing

- **Registry** (`koan/commands.spec` style, vitest): register/unregister lifecycle (and `all`
  reflects it); `resolve` normalization for mac (`metaKey`) vs non-mac (`ctrlKey`) and for
  `shift`/plain keys; conflict warning on duplicate shortcut (spy on `console.warn`); `execute`
  unknown/disabled is a safe no-op; `enabled:()=>false` excludes from `resolve`.
- **`shortcuts` action:** dispatch synthetic `keydown` → matching command's `run` fires;
  input-focus guard suppresses non-global commands while an input is focused but allows `global`;
  listener is removed on destroy.
- **Palette:** render test — typing filters the list (fuzzy), Enter/select runs the command and
  closes. A single light Playwright check (Cmd+K opens the palette, runs a command) is a good
  end-to-end guard but kept minimal.

## File structure

| File | Responsibility |
|------|----------------|
| `apps/learn/src/lib/koan/commands.svelte.ts` (create) | `CommandRegistry` class + `commands` singleton + `Command` type + shortcut parse/normalize |
| `apps/learn/src/lib/koan/shortcuts.svelte.ts` (create) | `shortcuts` action (keydown capture + guard + dispatch) |
| `apps/learn/src/lib/koan/components/CommandPalette.svelte` (create) | Cmd+K overlay (search + grouped list + run) |
| `apps/learn/src/routes/app/+layout.svelte` (modify) | register global commands, `use:shortcuts`, render palette |
| `apps/learn/src/lib/koan/commands.spec.ts` + action/palette specs (create) | tests |

Shortcut parse/normalize may live in its own small module (`koan/shortcut.ts`) if
`commands.svelte.ts` grows beyond one clear responsibility.

## Promotion path (future)

When a second consumer needs this, promote to `@rokkit/commands`: the singleton becomes a
`createCommandStore()` factory (identical method surface), the `shortcuts` action moves to
`@rokkit/actions`, and the palette becomes a `@rokkit/ui` component. The v1 API is chosen so this
is a mechanical move, not a redesign.
