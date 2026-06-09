# 19 — Command System (public)

**Status:** Designed 2026-06-09 (revised — promoted to a public, first-class feature).
Implementation plan: `docs/superpowers/plans/<date>-command-system.md`.
**Supersedes the sketch in:** `docs/backlog/2026-05-20-global-shortcut-handler.md`.

## Overview

A first-class command/shortcut system, **parallel to the theming system** (`vibe` store +
`themable` action + `ThemeSwitcherToggle` component, taught by the `semantic-styles-rokkit`
skill + theming guide). Components, pages, and apps declare keyboard shortcuts and actions in one
registry; a Cmd/Ctrl+K command palette lists everything with fuzzy search.

It ships **public** across three packages, with a skill and a guide, so consumers get the same
guided experience as theming — not a one-off baked into the demo app. (This deliberately
overrides the usual "build in the consumer first, promote later" default: the command system is a
general system, like theming, and is worth exposing directly.)

## Public API surface

| Layer | Package | Export |
|-------|---------|--------|
| State | `@rokkit/states` | `commands` singleton (`CommandRegistry`) + `Command` type |
| Action | `@rokkit/actions` | `shortcuts` action |
| Component | `@rokkit/ui` | `CommandPalette` |

These mirror the theming trio (`vibe` / `themable` / `ThemeSwitcherToggle`).

## Goals (v1)

- A public command **registry** with declarative register / unregister and dynamic enablement.
- A public **capture action** turning keystrokes into command dispatches, cross-platform.
- A public **command palette** (Cmd/Ctrl+K) with fuzzy search over registered commands.
- **Conflict detection** — warn at register time on duplicate shortcuts.
- **Scope** — global commands always active; route/component-scoped commands active only while
  mounted.
- **Discoverability/guidance** — a `command-system-rokkit` skill (joining the `rokkit skills`
  catalog) and a commands guide, plus package/component docs.
- **First consumer + live demo** — the learn app's `/app` shell wires the public APIs and
  demonstrates them.

## Non-goals (deferred)

- Menu/Dropdown `command` integration (additive once the registry exists; needs a Menu data
  convention).
- User-customizable bindings + `localStorage` persistence (v2).
- Command recording / undo; mouse-gesture commands; multi-key chord sequences (`g then d`).

## Architecture

```
keydown ─▶ use:shortcuts={commands}  ─▶ commands.resolve(event) ─▶ Command ─▶ run()
            (@rokkit/actions)             (@rokkit/states)
                                              ▲
        register()/unregister() ─ consumers ─┘     CommandPalette (@rokkit/ui) reads commands.all
```

### Unit 1 — `commands` registry (`@rokkit/states`, `commands.svelte.js`)

Singleton instance, matching `@rokkit/states`' existing `vibe` / `messages` / `alerts` singletons.

```ts
export type Command = {
  id: string                  // unique; duplicate id warns and replaces (re-register safe)
  label: string               // display text (consumer-localized; see i18n)
  run: () => void
  shortcut?: string           // 'mod+k' | 'mod+shift+p' | '?'  (omit for palette-only)
  group?: string              // palette category
  global?: boolean            // fires even while a text input is focused (default false)
  enabled?: () => boolean     // optional dynamic gate
}

class CommandRegistry {
  get all(): Command[]                          // $state-backed; stable order; for the palette
  register(cmd: Command): () => void            // returns unregister
  registerMany(cmds: Command[]): () => void     // one unregister for the batch
  execute(id: string): void                     // run by id (no-op + warn if unknown/disabled)
  resolve(event: KeyboardEvent): Command | null // normalize event → shortcut → matching enabled command
}
export const commands = new CommandRegistry()
```

- **Conflict detection:** on `register`, normalize the shortcut; if another *enabled* command
  already binds it, `console.warn` naming both ids. Both stay in `all` (and the palette), but the
  keyboard index keeps the **first** registrant for that shortcut (deterministic). Duplicate `id`
  warns and last-wins (so a component re-registering on re-render is safe).
- **Shortcut grammar + normalization** live here (the registry owns `resolve`). `'mod+k'` →
  `mod` = Cmd on macOS / Ctrl elsewhere; supports `shift`/`alt`/plain keys; single chord only.
  A small `parseShortcut`/normalize helper (may be its own module `shortcut.js` in states if
  `commands.svelte.js` grows).

### Unit 2 — `shortcuts` action (`@rokkit/actions`, `shortcuts.svelte.js`)

`use:shortcuts={commands}` — the capture layer between raw keystrokes and the registry.

- **Layering:** `@rokkit/actions` must NOT import `@rokkit/states`. The action therefore takes the
  registry as its **parameter** — structurally `{ resolve(e): Command|null, execute(id): void }` —
  and the consumer passes `commands`. (The `Command`/registry interface is documented in
  `@rokkit/actions` types as a structural shape; no package dependency on states.)
- On mount, attaches a window `keydown` listener (removed on destroy). For each event:
  `const cmd = registry.resolve(event)`; if non-null and not suppressed by the input-focus guard,
  `event.preventDefault()` + `registry.execute(cmd.id)`.
- **Input-focus guard:** when `document.activeElement` is an `input`/`textarea`/`contenteditable`,
  ignore the match **unless** `cmd.global === true` (so Cmd+K opens the palette even while typing
  in a composer; a plain `n` won't fire mid-typing).
- Cross-platform `mod` folding mirrors `resolveAction`'s existing `metaKey || ctrlKey` handling.

### Unit 3 — `CommandPalette` (`@rokkit/ui`, `CommandPalette.svelte`)

- `@rokkit/ui` already depends on `@rokkit/states`, `@rokkit/actions`, `@rokkit/core`,
  `@rokkit/data`, so the palette imports `commands` (states), `resolveAction` + `dismissable`
  (actions), and a matcher.
- Self-contained overlay: a modal panel + backdrop, focus-trapped, closed via `dismissable`
  (Escape / click-outside). No Dialog primitive exists in `@rokkit/ui` today, so the palette
  renders its own (a small, reusable overlay shell may be extracted later if other components
  need it — out of scope here).
- A search `<input>` fuzzy-filters `commands.all` (a lightweight case-insensitive subsequence
  matcher — a small helper in `@rokkit/ui` or reused from `@rokkit/data`'s filter utilities; NOT
  the app-level `koan/match.svelte.ts`). Results grouped by `group`. In-list navigation uses a
  keyed list + `resolveAction` (ArrowUp/Down/Enter/Escape) — lighter than the full `navigator`.
- **Open via the registry:** Cmd+K is itself a registered command (`palette.open`, `global: true`)
  whose `run` toggles the palette's open state, so the palette dogfoods the registry. The palette
  exposes a bindable `open` prop; the consumer registers the open command.
- **Data attributes** for theming: `data-command-palette`, `data-command-item`,
  `data-command-group`, `data-command-shortcut`, `[data-active]` — themed in `@rokkit/themes`
  base + per-style (headless-base principle).

### i18n

- **Palette chrome** (search placeholder, "no results", aria-label) → `@rokkit/states` `messages`
  store (a new `command` namespace, exactly as `SearchFilter` uses `messages.search_`/`messages.filter`).
- **Command `label`s** → consumer-supplied strings (the app localizes them however it does i18n).

## Consumer wiring + live demo (`apps/learn`)

`apps/learn` becomes the first consumer and the live demo:
- `/app/+layout.svelte` registers the v1 global commands (`palette.open` `mod+k` global;
  `toggle-theme`; `new-conversation`; `jump-to-demo`/focus-search), applies
  `<svelte:body use:shortcuts={commands}>`, and renders `<CommandPalette bind:open />`.
- Route/component-scoped commands register in their own `onMount` and unregister on cleanup.
- A catalog entry / demo page showcases the palette (consistent with other koan demos).

## Deliverables — public catalog

- **Skill:** `packages/cli/skills/command-system-rokkit/SKILL.md` — auto-joins the `rokkit skills`
  catalog (3rd skill; `listSkills` discovers it by frontmatter). Teaches: the `Command` shape,
  `register`/`registerMany` + scope lifecycle, the `shortcuts` action wiring, `CommandPalette`,
  the `'mod+k'` grammar, conflict detection, and i18n. Parallels `semantic-styles-rokkit`.
- **Guide:** `docs/llms/guides/commands.txt` (new) + a learn-site guide page
  `apps/learn/src/lib/guides/commands/content.md`.
- **Reference docs:** `docs/llms/components/command-palette.txt`; and the `commands` / `shortcuts` /
  `CommandPalette` exports added to `docs/llms/packages/{states,actions,ui}.txt`.

## Build order (informs the plan)

1. `@rokkit/states`: `Command` type + `CommandRegistry` + `commands` singleton + shortcut
   parse/normalize; export from index; tests.
2. `@rokkit/actions`: `shortcuts` action (structural registry param) + export; tests.
3. `@rokkit/ui`: `CommandPalette` + data-attributes + export; `@rokkit/themes` base + per-style CSS;
   tests; `messages.command` namespace added in states.
4. `apps/learn`: wire `/app` (register commands, `use:shortcuts`, render palette) + demo/catalog.
5. Skill `command-system-rokkit`.
6. Guides + reference docs (llms guide, learn guide page, component + package docs).

Each step yields working, testable software; ships on the normal patch cadence (touches
`@rokkit/states`, `@rokkit/actions`, `@rokkit/ui`, `@rokkit/themes`, `@rokkit/cli` → a coordinated release).

## Testing

- **states:** registry unit tests — register/unregister lifecycle (and `all`); `resolve`
  normalization for mac (`metaKey`) vs non-mac (`ctrlKey`) + `shift`/plain keys; conflict warning
  (spy `console.warn`); `execute` unknown/disabled safe no-op; `enabled:()=>false` excluded.
- **actions:** `shortcuts` action — synthetic keydown → registry `execute` fires; input-focus
  guard suppresses non-global while an input is focused, allows `global`; listener removed on
  destroy; works against a stub registry (no states dependency).
- **ui:** `CommandPalette` render test — fuzzy filter narrows the list; Enter/select runs the
  command and closes; Escape/outside-click close without running.
- **cli:** the skills catalog test now expects the 3rd skill (`command-system-rokkit`).
- **themes:** coverage guard — each style themes `[data-command-palette]` (headless-base).
- **learn:** one light Playwright check — Cmd+K opens the palette and runs a command.
