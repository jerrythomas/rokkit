# State Patterns

> Shared CSS custom-property sets defining hover / focus / active / selected /
> disabled behavior at element and group level. Reduces per-component
> repetition in theme CSS by pushing the state vocabulary into the base layer.

---

## Overview

Every interactive Rokkit component repeats roughly the same five-to-eight
selectors per theme — hover, focus-visible, active, selected, disabled, and
their `:focus-within`-scoped variants. The active selectors are the worst:
they typically declare colors plus a "mark" (the underline / inset bar /
gradient fill / glow ring that tells the eye "this one is current").

Today each theme rewrites the full set per component:

```css
/* List */
[data-style='minimal'] [data-list] [data-list-item]:hover { … }
[data-style='minimal'] [data-list] [data-list-item][data-active='true'] {
  box-shadow: inset 2px 0 0 0 var(--accent);
}
/* Tree */
[data-style='minimal'] [data-tree-item-content]:hover { … }
[data-style='minimal'] [data-tree-item-content][data-active='true'] {
  box-shadow: inset 2px 0 0 0 var(--primary);
}
/* Menu, Dropdown, Tabs, Toolbar… same shape, repeated */
```

Multiply by 5 themes × ~25 components × ~5 states and the CSS is mostly
boilerplate. A small set of state tokens, declared once per theme, lets each
component reference the tokens by name instead of re-deriving the recipe.

---

## State Vocabulary

Eight states, in two groups.

### Transient states (input-driven)

| State            | Selector hook                                     | Meaning                                                       |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `idle`           | (no modifier — the default)                       | The element is interactive but not engaged.                   |
| `hover`          | `:hover:not(:disabled):not([data-disabled='true'])` | Pointer is over the element.                                  |
| `focus-visible`  | `:focus-visible`                                  | Keyboard focus only (excludes mouse-click focus).             |
| `pressed`        | `:active`                                         | The element is being clicked / keydown'd right now.           |

### Persistent states (data-driven)

| State            | Selector hook              | Meaning                                                            |
| ---------------- | -------------------------- | ------------------------------------------------------------------ |
| `current`        | `[data-active='true']`     | The single-active item in a list, tab, tree, menu, etc.            |
| `selected`       | `[data-selected='true']`   | Member of a multi-selection set (multi-select, checked rows).      |
| `disabled`       | `:disabled, [data-disabled='true']` | Non-interactive.                                          |
| `read-only`      | `[data-readonly='true']`   | Interactive shape, non-editable value (form fields).               |

Two groups so themes can layer them: a `current + hover` interaction stacks
the persistent `current` mark with the transient `hover` overlay.

---

## Group context

State styling often depends on the group's focus:

```
[data-list]:focus-within  [data-list-item][data-active='true']
   ^^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   group-focus            element-current
```

- **List has focus + item is current** → full-strength accent.
- **List blurred + item is current** → muted hint that there's a selection
  but the list isn't the active surface.

A consistent way to express this:

```css
/* Default: muted current state */
[data-list-item][data-active='true'] { … --state-mark-strength: muted … }

/* When the list has focus, current items go full-strength */
[data-list]:focus-within [data-list-item][data-active='true'] { … --state-mark-strength: full … }
```

---

## Token Tiers

Three tiers per state. A component only references the tier(s) it needs.

### Surface tier — `bg` + `fg`

The element's own colors.

```css
:root {
  --state-idle-fg:        var(--ink-mute);
  --state-idle-bg:        transparent;

  --state-hover-fg:       var(--ink);
  --state-hover-bg:       var(--paper-soft);

  --state-focus-fg:       var(--ink);
  --state-focus-bg:       var(--paper-soft);

  --state-current-fg:     var(--accent);
  --state-current-bg:     transparent;

  --state-selected-fg:    var(--accent);
  --state-selected-bg:    color-mix(in oklab, var(--accent) 10%, transparent);

  --state-disabled-fg:    var(--ink-faint);
  --state-disabled-bg:    transparent;
}
```

### Mark tier — the visual indicator

A "mark" is whatever signals state non-textually: an inset bar, an underline,
a gradient fill, a ring. Themes pick the shape; components apply it.

```css
:root {
  /* The active "mark" — overridden per theme */
  --state-current-mark:        var(--accent);
  --state-current-mark-width:  2px;

  --state-selected-mark:       var(--accent);
  --state-selected-mark-width: 2px;
}
```

Component-side:

```css
[data-list-item][data-active='true'] {
  box-shadow: inset var(--state-current-mark-width) 0 0 0 var(--state-current-mark);
}
```

Theme overrides change the shape, not the component:

```css
/* minimal — thin inset bar */
[data-style='minimal'] {
  --state-current-mark: var(--accent);
  --state-current-mark-width: 2px;
}

/* rokkit — gradient block fill (the mark replaces inset with bg) */
[data-style='rokkit'] {
  --state-current-mark: linear-gradient(to right, var(--primary), var(--accent));
  --state-current-mark-width: 0;
  /* and a layered rule: --state-current-bg overrides to be the gradient */
}
```

### Affordance tier — focus rings, cursors

```css
:root {
  --state-focus-ring:        var(--focus-ring);
  --state-focus-ring-width:  1px;
  --state-focus-ring-offset: 2px;

  --state-disabled-cursor:   not-allowed;
}
```

---

## Element vs Group Tokens

Some state colors belong on the element; others depend on the group's focus.
The naming convention separates them:

```css
:root {
  /* Element-level (always-on) */
  --state-current-mark: …;

  /* Group-focus-scoped (only when ancestor :focus-within) */
  --state-current-mark-active: …;       /* full strength */
  --state-current-mark-passive: …;      /* muted; container blurred */
}
```

Component:

```css
[data-list-item][data-active='true'] {
  background: var(--state-current-mark-passive);
}
[data-list]:focus-within [data-list-item][data-active='true'] {
  background: var(--state-current-mark-active);
}
```

---

## Refactoring an existing component

Before — minimal/list.css declares the color + width inline:

```css
[data-style='minimal'] [data-list] [data-list-item][data-active='true'] {
  box-shadow: inset 2px 0 0 0 var(--accent);
  color: var(--ink-mute);
}
[data-style='minimal'] [data-list]:focus-within [data-list-item][data-active='true'] {
  color: var(--accent);
}
```

After — `base/state-tokens.css` defines the recipe, minimal swaps tokens, the
component only references tokens:

```css
/* base/state-tokens.css */
:root {
  --state-current-mark:       var(--accent);
  --state-current-mark-width: 2px;
  --state-current-fg-active:  var(--accent);
  --state-current-fg-passive: var(--ink-mute);
}

/* base/list.css */
[data-list-item][data-active='true'] {
  color: var(--state-current-fg-passive);
  box-shadow: inset var(--state-current-mark-width) 0 0 0 var(--state-current-mark);
}
[data-list]:focus-within [data-list-item][data-active='true'] {
  color: var(--state-current-fg-active);
}

/* minimal needs no list-specific override; the base rule reads minimal's tokens */
```

Themes only override the recipe at the `[data-style]` level — the per-
component CSS is the same across themes.

---

## What this enables

| Today                                                                                      | After                                                                                                                            |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| ~25 components × ~5 themes × ~6 state rules ≈ **750** rules                                | ~6 state-token sets (in base) × ~5 themes = **30** declarations; ~25 components × 1 ruleset = **25** component-level state rules |
| Changing the active-mark style means hunting through 25 component files                    | Change one token in the theme; every component picks it up                                                                       |
| Adding a new component requires repeating all the state selectors for every theme          | Add one state ruleset; reference the tokens; pick up all 5 themes for free                                                       |
| Themes drift — list / tree / menu may use slightly different selectors for the same state  | Selectors are shared in base; themes only retoken                                                                                |

---

## Migration plan (proposal — not yet executed)

1. Add `packages/themes/src/base/state-tokens.css` with the default token set.
2. Pick one component (List is the smallest with both group + element states)
   and migrate. Verify the existing visual snapshot.
3. Migrate Tree (shares the most patterns with List), then Menu / Dropdown /
   Tabs / Toolbar in that order.
4. Per-theme overrides in `<theme>/state-tokens.css` — one file per theme,
   far smaller than the current per-component state rules.
5. Delete the now-redundant `<theme>/<component>.css` state rules.

Estimated reduction: ~600 lines of repeated theme CSS, with the recipe
becoming explicit at the base layer.

---

## Out of scope

- **Animations / transitions** on state changes. Those stay component-level
  for now (they're shape-specific and don't repeat the same way colors do).
- **Form-field validity** (`[data-field-state='error']`) — already covered
  by the named token set (`--error`, `--error-soft`, etc.). No new state
  tokens needed.
- **Compound states** like "selected + hover + group-focused" — they're
  expressible via the tokens above but are component-level concerns.
