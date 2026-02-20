# Backlog

Items deferred from the current phase. Reviewed periodically during housekeeping sessions.

---

## 1. InputSwitch — Redesign Required

**Context:** `packages/forms/src/input/InputSwitch.svelte` is commented out of the input index.

**Problem:** The component does `import Switch from '@rokkit/composables'` (wrong: default import instead of named) AND the composables `Switch` is a **boolean toggle** (bits-ui wrapper), while `InputSwitch` expects an **option-list Switch** that takes `options`, `fields`, and `onchange`.

**What exists:**
- `packages/forms/src/input/InputSwitch.svelte` — broken import, API mismatch
- `@rokkit/composables` `Switch` — boolean toggle (bits-ui wrapper)
- `archive/ui/src/Switch.svelte` — old option-selector Switch (used `@rokkit/states` Proxy + `@rokkit/actions` keyboard + archived Item component)

**What's needed:**
- [ ] Decide: boolean toggle or option-list switch for forms
- [ ] If option-list: build a new `OptionSwitch` component (the old one's dependencies are all rewritten)
- [ ] Fix import and uncomment export in `packages/forms/src/input/index.js`
- [ ] Write tests

---

## 2. @rokkit/types — Shared Types Package

**Context:** User asked if types should be centralized.

**Decision (deferred):** Not needed now. The two type systems serve different purposes:
- `@rokkit/ui` types (TypeScript) — UI-specific: text, icon, shortcut, badge, disabled, active (13 fields)
- `@rokkit/core` types (JSDoc) — data-oriented: id, expanded, selected, currency, keywords (30+ fields)

**Revisit when:** A future feature needs shared types between packages (e.g., if `@rokkit/forms` needs to import `ItemFields` from `@rokkit/ui`).

**Concern:** Creating `@rokkit/types` would break `@rokkit/ui`'s zero-dependency isolation.

---

## 3. ItemProxy → @rokkit/states

**Context:** User suggested moving ItemProxy to states since it manages state classes.

**Decision (deferred):** Not appropriate — different abstraction layers:
- `ItemProxy` — pure TypeScript, read-only field-mapper, no reactivity
- `@rokkit/states` classes — reactive Svelte 5 (`$state`/`$derived`), mutable, `@rokkit/core`-dependent

**Revisit when:** The two proxy systems are consolidated or if ItemProxy gains consumers outside `@rokkit/ui`.

**Concern:** Moving would add `states → core` dependency chain to `@rokkit/ui` (currently standalone with zero workspace deps).

---

## 4. Icons — Add menu-closed/menu-opened Aliases

**Source:** docs/issues/001.md

Copy lucide `chevron-right` as `menu-closed` and lucide `chevron-down` as `menu-opened`, then update icon bundles.

---

## 5. Menu — First Item Always Highlighted

**Source:** docs/issues/001.md

The Menu component highlights the first item as active on open. Since Menu doesn't track an active/selected item (it fires onselect and closes), the first item should not be pre-highlighted.

---

## 6. Style Issues (docs/issues/001.md)

### 6a. input-root border 2px → 1px
Border for `[data-input-root]` wrapping Select is 2px thick. Should be 1px to match text inputs.

### 6b. Input/Select height and font-size mismatch
Input text box has larger height and font size than Select. They should match when side-by-side.

### 6c. Button Danger text invisible in dark mode
Danger variant text not visible in dark mode for all button styles.

### 6d. Minimal theme — underline style
Minimal inputs should have no padding, just underline. Select and MultiSelect should match. On focus use secondary color (or `::after` gradient underline on `[data-input-root]`). Label size should be smaller. Input text height+padding should match Select.

### 6e. Material theme — outlined input with floating label
Material style: inputs should have outline border on `[data-input-root]`, labels inline as placeholder, on focus the border appears and label floats onto the border (standard Material Design text field pattern).

### 6f. Button icon select — extra thick top border on empty value
In playground button page, icon dropdown has extra thick top border on first load (empty value). There's an extra empty item in the list. After selecting an item the border normalizes, but the first item in the list has smaller height than others.

---

## 7. Input Text — Value Binding Bug

**Source:** docs/issues/001.md

Input text value binds to the event object instead of the string value when changed. Example: in the button playground, the label field shows "Click Me" initially but changes to `[Object Event]` on edit. The `oninput`/`onchange` handler is likely passing the event rather than `event.target.value`.
