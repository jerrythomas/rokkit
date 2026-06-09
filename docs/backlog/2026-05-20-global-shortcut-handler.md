# Global Shortcut Handler — App-Level Commands

**Date:** 2026-05-20
**Status:** Designed 2026-06-09 — see `docs/design/19-command-system.md` (v1 = registry + `shortcuts` action + Cmd/Ctrl+K palette + conflict detection, consumer-first in `apps/learn/src/lib/koan/`). Implementation pending.
**Site Applicability:** Applies to current Koan shell (`apps/learn/src/lib/koan/`) — motivates the Cmd+K + command palette in the new app.

## Summary

Add an app-level command/shortcut registration system so components, menus, and pages can declare keyboard shortcuts and actions in one place. Today shortcuts are scattered: Cmd+K is hardcoded in the Koan Shell, mode toggle has its own handler, etc.

## Why now

The Koan demo's chrome includes a Cmd+K search hint and a command-palette icon. Implementing the menu/command palette properly needs a registration layer underneath. Same need will appear in future demo apps (Block Builder, Theme Wizard standalone, etc.).

## Shape (sketch — design later)

```js
// commands.svelte.js
export const commands = createCommandStore()

// register from a component
commands.register({
  id: 'new-conversation',
  label: 'New conversation',
  shortcut: 'cmd+n',
  group: 'chat',
  run: () => store.newConversation()
})

// global listener picks up the keystroke and dispatches
// command palette UI lists commands.all
```

## Requirements

- **Declarative registration** — components declare commands; the store wires the listener.
- **Scope** — global commands always active; route/component-scoped commands active only when mounted.
- **Conflict detection** — warn at register-time when two commands claim the same shortcut.
- **Cross-platform** — `cmd+k` on macOS, `ctrl+k` on Windows/Linux.
- **Optional palette UI** — a Cmd+K-style overlay listing all available commands with fuzzy search.
- **i18n** — command labels go through the messages store.

## Integration points

- Menu / Dropdown items can have a `command` prop instead of (or in addition to) `onclick`.
- Cmd+K palette in Koan opens a `<SearchFilter>` over `commands.all`.
- Settings page can show shortcut bindings.

## Open questions

- Per-app store vs library singleton? Library singleton is simpler but bleeds across mounted apps. Probably per-app store.
- Storage for user-overridden bindings (localStorage)? Defer to v2.
- Command groups → categories in the palette UI.

## Out of scope (initial release)

- User-customizable bindings — read-only defaults to start.
- Command recording / undo stack.
- Mouse-gesture commands.

## Deliverable

A design doc at `docs/design/19-command-system.md` covering the store API, registration grammar, scope rules, and palette UI. Implementation plan in `docs/superpowers/plans/<date>-command-system.md` once the design is agreed.
