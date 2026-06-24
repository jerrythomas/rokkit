# LockMode — pin a subtree to a fixed color mode

**Date:** 2026-06-23
**Status:** Design approved, pending spec review
**Area:** `@rokkit/unocss` (preset), `@rokkit/actions` (`lockMode`), `@rokkit/ui` (`LockMode`)

---

## Problem

Today the whole app flips between light and dark in lockstep: `themable` writes
`data-mode` on `<html>`/`<body>`, and the preset's dark block redefines the token CSS
variables. There is no supported way to keep one section in a fixed mode — e.g. an
always-dark hero, a code/preview panel, or a media surface — while the rest of the page
follows the user's mode.

A nested `data-mode="dark"` *almost* works, because two of the three color systems already
key off a bare attribute selector that inherits through the subtree:

- **Named-token vars** (`--paper`, `--ink`, …) — `packages/unocss/src/preset.ts:187`
  emits the dark block as `[data-mode="dark"]{…}` (bare attribute selector). Custom
  properties inherit, so a nested `data-mode="dark"` redefines them for its subtree.
- **In-component `dark:` utilities** — `preset.ts:27` uses
  `:is([data-mode="dark"],[data-mode="dark"] *)`, which matches the element itself or any
  descendant.

But two gaps make a bare `data-mode` insufficient:

1. **Component theme CSS does not engage.** `@rokkit/themes` rules are scoped to *both*
   attributes — `[data-mode="dark"][data-style="rokkit"] [data-component]` (compound) and
   `[data-mode="dark"] [data-style="rokkit"] [data-component]` (descendant)
   (`packages/themes/build.mjs:106-138`). A section that sets only `data-mode="dark"` has
   no `data-style` on or below it (the active `data-style` lives on the *ancestor* root),
   so neither selector matches and the section's gradients/glows/elevation stay in the
   root's mode.
2. **Light-locking is impossible.** Light vars are pinned to `:root`
   (`preset.ts:161`), *not* `[data-mode="light"]`. So `data-mode="light"` on a nested
   element inside a dark page does not re-assert light values — the subtree keeps
   inheriting the root's dark vars. Dark-in-light works; light-in-dark silently fails.

## Goals

- A first-class, **bidirectional** way to pin a subtree to `dark` *or* `light`.
- The locked subtree renders correctly across **all three color systems** — named-token
  vars, in-component `dark:` utilities, and `@rokkit/themes` component CSS.
- The lock pins **only `mode`**; the subtree still follows runtime `style` / `skin` /
  `density` / `direction` changes from the root.
- Ergonomic call sites; a clean SSR story for the common static case.

## Non-goals

- Locking anything other than mode (style/skin/density remain global).
- A per-section theme *switcher* UI — this is a fixed lock, not a control.

---

## Design

Three pieces.

### 1. Preset symmetry fix (`@rokkit/unocss`)

Emit the light vars under a combined selector so `data-mode="light"` re-asserts them on a
nested element:

```
:root, [data-mode="light"] { …light vars… }   // was: :root { … }
```

Apply the same treatment to the multi-skin light blocks (`preset.ts:~270`,
`[data-skin='name']` → `:root [data-skin='name'], [data-mode='light'][data-skin='name']`
or equivalent). No declaration duplication (combined selector, one block). The dark block
is unchanged. Root behavior is unchanged: on the root element both `:root` and a matching
`[data-mode]` block apply at equal specificity, and source order still resolves correctly
(dark block comes last; light `:root,[data-mode="light"]` does not match a dark root).

This is the single change that makes light-locking possible; it also makes "mode" a
properly nestable attribute rather than treating dark as the special case.

### 2. `lockMode` action (`@rokkit/actions`)

`packages/actions/src/lock-mode.svelte.js`, exported from `index.js`. Mirrors the existing
action shape (`name.svelte.js` + `name.spec.svelte.js`, like `themable`).

```svelte
<section use:lockMode={'dark'}>…always-dark content…</section>
```

Behavior — **"make this element a theme context identical to the document root, but with
`mode` forced":**

- On mount, and via a `MutationObserver` on `document.documentElement`, mirror
  `data-style`, `data-skin`, `data-density`, `data-dir` onto the element, and set
  `data-mode` to the locked value.
- React to root style/skin/density/direction changes (only `mode` stays pinned).
- Disconnect the observer on destroy.
- Source of truth is `document.documentElement`, which `themable` keeps authoritative by
  mirroring onto it (`themable.svelte.js:52-58`). If the root lacks an attribute, mirror
  nothing for it (inherits the cascade default) — documented requirement that the app uses
  `themable`.

Argument: the locked value, `'dark' | 'light'`.

### 3. `LockMode` component (`@rokkit/ui`)

`packages/ui/src/components/LockMode.svelte`, exported from the package index; built as a
thin wrapper over the action.

```svelte
<LockMode mode="dark">…always-dark content…</LockMode>
```

- Renders a wrapper element that **statically** emits `data-mode={mode}` (the lock value
  is known at author time → the token vars flip server-side, no var FOUC on first paint)
  and applies `use:lockMode={mode}` for the mirrored attributes (which fill in on
  hydration).
- Props: `mode` (`'dark' | 'light'`, required) plus the standard element passthrough used
  by sibling components (match List/Tree conventions for `class`/rest props and the
  child snippet).

The action remains usable standalone on any existing element; the component is the
ergonomic, SSR-friendly default.

---

## SSR / FOUC

- **Component:** `data-mode` is rendered server-side, so token vars and in-component
  `dark:` utilities are correct on first paint. The mirrored `data-style`/`data-skin` are
  applied by the action on hydration, so `@rokkit/themes` component CSS (gradients/glows)
  engages one frame late — a minor, bounded FOUC limited to themed decoration.
- **Action standalone:** runs only on hydration, so an SSR'd page paints the section in
  the root's mode for one frame, then flips. Acceptable; documented. Use the component
  where the FOUC matters.

## Edge cases

- **Nested locks** (a light island inside a dark lock): each observer watches the *root*,
  not its parent, which is correct — style/skin/density always come from the global root,
  and each lock sets its own `mode`. Inner locks resolve independently.
- **App sets attrs on `<body>` only:** `themable` mirrors onto `documentElement` too, so
  reading `documentElement` is reliable. Documented as a requirement.

## Testing

- **Unit (action):** mirrors all four attributes on mount; updates when the root's
  `data-style`/`data-skin`/`data-density` change; forces `data-mode` to the locked value
  and keeps it pinned across root mode changes; disconnects the observer on destroy.
- **Unit (preset):** the light block is emitted under the combined
  `:root, [data-mode="light"]` selector; multi-skin light blocks likewise; dark block
  unchanged.
- **E2E (`apps/learn`):** place `<LockMode mode="dark">` in a light page; assert computed
  `--paper`/`--ink` are the dark values inside the lock and light outside, and that a
  themed component (e.g. a gradient surface) renders dark. Add the symmetric
  light-in-dark case. Reuse the `/embed/gallery` + contrast harness pattern.

## Sequencing

Preset symmetry fix → `lockMode` action → `LockMode` component → docs/demo page.
(The action depends on the preset fix only for the light direction; dark works regardless,
so the fix can land first and be verified independently.)

## Docs

- A live doc page in `apps/learn` demonstrating both directions (per the
  "live doc page alongside new component" convention).
- Note `lockMode`/`LockMode` in the relevant `docs/design/*.md` and the actions/ui llms
  docs.
