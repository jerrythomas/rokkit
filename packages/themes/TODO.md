# @rokkit/themes - TODO

## 1. Add site-nav List variant for app/site navigation

The default List styles are designed for interactive selection (e.g., settings panels, component browsers). For app-level site navigation where the active item is driven by the URL, two behaviors are distracting:

- **Focus ring on the list container** (data-list:focus-within) - fires on every route change
- **Muted active style when unfocused** (data-list:not(:focus-within) data-list-item data-active) - the active item flickers between primary and surface colors on navigation

### Proposed approach

The List component accepts a custom class prop. Add a site-nav CSS variant in each theme that:

1. **Suppresses the focus ring** on the list container
2. **Keeps the active item in primary style** regardless of focus state (no muting)
3. **Matches icon color to text** on the active item

### Per-theme implementation needed

Each theme should define its own site-nav variant consistent with its design language:

- src/base/list.css - base structural overrides
- src/shingoki/list.css - shingoki variant
- src/rokkit/list.css - rokkit variant
- src/minimal/list.css - minimal variant
- src/material/list.css - material variant
- src/glass/list.css - glass variant

### Reference (current FitTrack app-level workaround)

```css
.site-nav [data-list]:focus-within {
  ring: none;
  outline: none;
  box-shadow: none;
}

.site-nav [data-list]:not(:focus-within) [data-list-item][data-active=true] {
  @apply from-primary-z5 to-secondary-z5 text-primary-z9 border-l-primary-z4 border-l-2 bg-gradient-to-r;
}

.site-nav [data-list]:not(:focus-within) [data-list-item][data-active=true] [data-item-icon] {
  @apply text-primary-z9;
}
```

Once implemented here, FitTrack can remove its app-level overrides in app.css.

---

## 2. Update rokkit active highlight gradient to primary-z5 to secondary-z5

The current rokkit active item style uses from-primary-z3 to-primary-z2 which is quite dark / monochrome. Update to use from-primary-z5 to-secondary-z5 for a more vibrant highlight that takes advantage of the secondary palette.

### Files to update

- src/rokkit/list.css - both focused and unfocused active states

### Current

```css
@apply from-primary-z3 to-primary-z2 text-primary-z9 border-l-primary-z5 border-l-2 bg-gradient-to-r;
```

### Proposed

```css
@apply from-primary-z5 to-secondary-z5 text-primary-z9 border-l-primary-z4 border-l-2 bg-gradient-to-r;
```

Consider applying the same primary to secondary gradient approach to other themes for consistency.


---

## 3. Fix List group child item indentation

Child items within a group are rendered at the same indentation level as the group header. This makes it hard to visually distinguish the hierarchy. Child items should have additional left padding to indent them under their parent group.

### Selector

- `[data-list-group-items] [data-list-item]` - add left padding (e.g. pl-4 or pl-6) to child items within groups

---

## 4. Extra space before text in groups without icons

When a group header has no icon, there appears to be extra leading space before the text (as if space is reserved for a missing icon). The group label should not have phantom spacing when no icon is present.

### Selector

- `[data-list-group-label]` - check for leftover gap/padding when `[data-list-group-icon]` is absent or empty
