# Semantic Icons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all hardcoded `i-lucide:*` icon strings in 7 components with `DEFAULT_STATE_ICONS` defaults and standardized `icons` prop overrides.

**Architecture:** Add 6 new icon names to `DEFAULT_ICONS` in `@rokkit/core` (4 action, 2 palette). Add 6 matching SVGs to `@rokkit/icons`. Migrate 7 components to the established `icons` prop pattern (already used by Menu, Select, List). Breaking prop changes for Rating, FloatingAction, BreadCrumbs — acceptable since no consumers yet.

**Tech Stack:** Svelte 5, `@rokkit/core` constants, `@rokkit/icons` SVGs, `@rokkit/ui` components

---

### Task 1: Add new icon names to DEFAULT_ICONS

**Files:**
- Modify: `solution/packages/core/src/constants.js:88-145`
- Modify: `solution/packages/core/spec/constants.spec.js`

**Step 1: Update constants.spec.js with expected new icons**

Add the 6 new entries to the `stateIcons` assertion in `constants.spec.js`. The `action` group gets 4 new keys (`check`, `save`, `pin`, `unpin`) and a new `palette` group is added with 2 keys (`presets`, `hex`).

```js
// In the stateIconsFromNames assertion, update the action group:
action: {
	remove: 'action-remove',
	add: 'action-add',
	clear: 'action-clear',
	close: 'action-close',
	copy: 'action-copy',
	copysuccess: 'action-copysuccess',
	search: 'action-search',
	check: 'action-check',       // NEW
	save: 'action-save',         // NEW
	pin: 'action-pin',           // NEW
	unpin: 'action-unpin'        // NEW
},

// Add new palette group (alphabetical order in the assertion):
palette: {
	presets: 'palette-presets',
	hex: 'palette-hex'
},
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/core/spec/constants.spec.js`
Expected: FAIL — new icon names not yet in `DEFAULT_ICONS` array.

**Step 3: Add new icon names to DEFAULT_ICONS array**

In `constants.js`, add 6 entries to the `DEFAULT_ICONS` array (maintain alphabetical grouping):

```js
// After 'action-copysuccess':
'action-check',
'action-pin',
'action-save',
'action-unpin',

// After 'navigate-down' block, before 'node-opened':
'palette-hex',
'palette-presets',
```

**Step 4: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/core/spec/constants.spec.js`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/core/src/constants.js solution/packages/core/spec/constants.spec.js
git commit -m "feat(core): add 6 new semantic icon names (action-check/save/pin/unpin, palette-presets/hex)"
```

---

### Task 2: Add 6 new SVG icon files

**Files:**
- Create: `solution/packages/icons/src/base/action-check.svg`
- Create: `solution/packages/icons/src/base/action-save.svg`
- Create: `solution/packages/icons/src/base/action-pin.svg`
- Create: `solution/packages/icons/src/base/action-unpin.svg`
- Create: `solution/packages/icons/src/base/palette-presets.svg`
- Create: `solution/packages/icons/src/base/palette-hex.svg`

SVG format: 24x24 viewBox, `fill="black"` for solid paths, same style as existing Solar-derived icons in the directory. Look at `action-add.svg` and `action-close.svg` for reference.

**Icon descriptions:**
- `action-check` — checkmark in rounded square (like action-add but with a check instead of plus)
- `action-save` — floppy disk / save icon in rounded square
- `action-pin` — push pin (pinned state)
- `action-unpin` — push pin with slash/crossed (unpinned state)
- `palette-presets` — list/grid lines icon (preset selector)
- `palette-hex` — hash/pound sign icon (hex input mode)

**Step 1: Create all 6 SVG files**

Source SVGs from the Solar icon set (Bold variant) to match existing icons. Each file should be a valid SVG with `width="24" height="24" viewBox="0 0 24 24"`.

**Step 2: Verify SVGs render correctly**

Open each SVG in a browser to confirm they display correctly at 24x24.

**Step 3: Commit**

```bash
git add solution/packages/icons/src/base/action-check.svg \
       solution/packages/icons/src/base/action-save.svg \
       solution/packages/icons/src/base/action-pin.svg \
       solution/packages/icons/src/base/action-unpin.svg \
       solution/packages/icons/src/base/palette-presets.svg \
       solution/packages/icons/src/base/palette-hex.svg
git commit -m "feat(icons): add 6 new SVGs (check, save, pin, unpin, presets, hex)"
```

---

### Task 3: Migrate Rating to icons prop pattern

**Files:**
- Modify: `solution/packages/ui/src/components/Rating.svelte`
- Modify: `solution/packages/ui/spec/Rating.spec.svelte.ts`

**Context:** Rating currently has `filledIcon = 'i-lucide:star'` and `emptyIcon = 'i-lucide:star'` as separate props. Replace with `icons` object prop using `DEFAULT_STATE_ICONS.rating` defaults (`{ filled: 'rating-filled', empty: 'rating-empty', half: 'rating-half' }`).

**Step 1: Add icon override test to Rating spec**

```ts
it('uses default semantic icons', () => {
	const { container } = render(Rating, { max: 3, value: 1 })
	const spans = container.querySelectorAll('[data-rating-icon]')
	expect(spans[0]?.className).toContain('rating-filled')
	expect(spans[1]?.className).toContain('rating-empty')
})

it('supports custom icons via icons prop', () => {
	const { container } = render(Rating, {
		max: 3,
		value: 1,
		icons: { filled: 'custom-filled', empty: 'custom-empty' }
	})
	const spans = container.querySelectorAll('[data-rating-icon]')
	expect(spans[0]?.className).toContain('custom-filled')
	expect(spans[1]?.className).toContain('custom-empty')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/Rating.spec.svelte.ts`
Expected: FAIL — `icons` prop not recognized, `data-rating-icon` attr not found.

**Step 3: Migrate Rating.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Remove `filledIcon` and `emptyIcon` props
3. Add `icons: userIcons = {}` prop with type `interface RatingIcons { filled?: string; empty?: string; half?: string }`
4. Add derived: `const icons = $derived({ ...DEFAULT_STATE_ICONS.rating, ...userIcons })`
5. Update template line 89: replace `class={filled ? filledIcon : emptyIcon}` with `class={filled ? icons.filled : icons.empty}`
6. Add `data-rating-icon` attribute to the icon span

**Step 4: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/Rating.spec.svelte.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/ui/src/components/Rating.svelte solution/packages/ui/spec/Rating.spec.svelte.ts
git commit -m "refactor(ui): migrate Rating to icons prop pattern with DEFAULT_STATE_ICONS.rating"
```

---

### Task 4: Migrate Stepper to semantic icons

**Files:**
- Modify: `solution/packages/ui/src/components/Stepper.svelte`
- Modify: `solution/packages/ui/spec/Stepper.spec.svelte.ts`

**Context:** Stepper already has an `icons` prop with `{ completed: 'i-lucide:check' }`. Change the default to use `DEFAULT_STATE_ICONS.action.check` and rename the key from `completed` to `check` for consistency with the action group naming.

**Step 1: Add icon test to Stepper spec**

```ts
it('uses default semantic icon for completed steps', () => {
	const { container } = render(Stepper, {
		steps: [{ text: 'Done', value: 'done' }],
		value: 'done'
	})
	const icon = container.querySelector('[data-stepper-check-icon]')
	expect(icon?.className).toContain('action-check')
})

it('supports custom completed icon via icons prop', () => {
	const { container } = render(Stepper, {
		steps: [{ text: 'Done', value: 'done' }],
		value: 'done',
		icons: { check: 'custom-check' }
	})
	const icon = container.querySelector('[data-stepper-check-icon]')
	expect(icon?.className).toContain('custom-check')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/Stepper.spec.svelte.ts`
Expected: FAIL

**Step 3: Migrate Stepper.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Update `StepperIcons` interface: rename `completed` to `check`
3. Update `defaultIcons`: `{ check: DEFAULT_STATE_ICONS.action.check }` (instead of `{ completed: 'i-lucide:check' }`)
4. Update template: `icons.completed` → `icons.check`
5. Add `data-stepper-check-icon` attribute to the icon span

**Step 4: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/Stepper.spec.svelte.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/ui/src/components/Stepper.svelte solution/packages/ui/spec/Stepper.spec.svelte.ts
git commit -m "refactor(ui): migrate Stepper to DEFAULT_STATE_ICONS.action.check"
```

---

### Task 5: Migrate FloatingAction to icons prop pattern

**Files:**
- Modify: `solution/packages/ui/src/components/FloatingAction.svelte`
- Modify: `solution/packages/ui/src/types/floating-action.ts`
- Modify: `solution/packages/ui/spec/FloatingAction.spec.svelte.ts`

**Context:** FloatingAction has `icon = 'i-lucide:plus'` and `closeIcon = 'i-lucide:x'` as individual props. Replace with `icons` object using `DEFAULT_STATE_ICONS.action` keys `add` and `close`.

**Step 1: Add icon tests to FloatingAction spec**

```ts
it('uses default semantic icons for trigger', () => {
	const { container } = render(FloatingAction, { items })
	const icon = container.querySelector('[data-fab-icon]')
	expect(icon?.className).toContain('action-add')
})

it('supports custom icons via icons prop', () => {
	const { container } = render(FloatingAction, {
		items,
		icons: { add: 'custom-add', close: 'custom-close' }
	})
	const icon = container.querySelector('[data-fab-icon]')
	expect(icon?.className).toContain('custom-add')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/FloatingAction.spec.svelte.ts`
Expected: FAIL

**Step 3: Migrate FloatingAction.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Remove `icon` and `closeIcon` props
3. Add `icons: userIcons = {}` prop with type `interface FloatingActionIcons { add?: string; close?: string }`
4. Add derived: `const icons = $derived({ add: DEFAULT_STATE_ICONS.action.add, close: DEFAULT_STATE_ICONS.action.close, ...userIcons })`
5. Update template line 329: `class={open ? closeIcon : icon}` → `class={open ? icons.close : icons.add}`

**Step 4: Update floating-action.ts types**

Remove `icon` and `closeIcon` from `FloatingActionProps`. Add `FloatingActionIcons` interface and `icons?: FloatingActionIcons` prop.

**Step 5: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/FloatingAction.spec.svelte.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add solution/packages/ui/src/components/FloatingAction.svelte \
       solution/packages/ui/src/types/floating-action.ts \
       solution/packages/ui/spec/FloatingAction.spec.svelte.ts
git commit -m "refactor(ui): migrate FloatingAction to icons prop pattern"
```

---

### Task 6: Migrate Pill to icons prop pattern

**Files:**
- Modify: `solution/packages/ui/src/components/Pill.svelte`
- Modify: `solution/packages/ui/spec/Pill.spec.svelte.ts`

**Context:** Pill has a hardcoded `i-lucide:x` in the remove button template (line 70). Add an `icons` prop with `remove` key defaulting to `DEFAULT_STATE_ICONS.action.remove`.

**Step 1: Add icon tests to Pill spec**

```ts
it('uses default semantic icon for remove button', () => {
	const { container } = render(Pill, { value: 'test', removable: true })
	const icon = container.querySelector('[data-pill-remove-icon]')
	expect(icon?.className).toContain('action-remove')
})

it('supports custom remove icon via icons prop', () => {
	const { container } = render(Pill, {
		value: 'test',
		removable: true,
		icons: { remove: 'custom-remove' }
	})
	const icon = container.querySelector('[data-pill-remove-icon]')
	expect(icon?.className).toContain('custom-remove')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/Pill.spec.svelte.ts`
Expected: FAIL

**Step 3: Migrate Pill.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Add `icons: userIcons = {}` prop with type `interface PillIcons { remove?: string }`
3. Add derived: `const icons = $derived({ remove: DEFAULT_STATE_ICONS.action.remove, ...userIcons })`
4. Update template line 70: `class="i-lucide:x"` → `class={icons.remove}` and add `data-pill-remove-icon` attribute

**Step 4: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/Pill.spec.svelte.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/ui/src/components/Pill.svelte solution/packages/ui/spec/Pill.spec.svelte.ts
git commit -m "refactor(ui): migrate Pill to icons prop pattern"
```

---

### Task 7: Migrate BreadCrumbs to icons prop pattern

**Files:**
- Modify: `solution/packages/ui/src/components/BreadCrumbs.svelte`
- Modify: `solution/packages/ui/spec/BreadCrumbs.spec.svelte.ts`

**Context:** BreadCrumbs has `separator = 'i-lucide:chevron-right'`. Replace with `icons` prop using `DEFAULT_STATE_ICONS.navigate.right` for the separator.

**Step 1: Add icon tests to BreadCrumbs spec**

```ts
it('uses default semantic icon for separator', () => {
	const { container } = render(BreadCrumbs, {
		items: [{ text: 'Home', value: 'home' }, { text: 'About', value: 'about' }]
	})
	const separator = container.querySelector('[data-breadcrumb-separator] span')
	expect(separator?.className).toContain('navigate-right')
})

it('supports custom separator icon via icons prop', () => {
	const { container } = render(BreadCrumbs, {
		items: [{ text: 'Home', value: 'home' }, { text: 'About', value: 'about' }],
		icons: { separator: 'custom-separator' }
	})
	const separator = container.querySelector('[data-breadcrumb-separator] span')
	expect(separator?.className).toContain('custom-separator')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/BreadCrumbs.spec.svelte.ts`
Expected: FAIL

**Step 3: Migrate BreadCrumbs.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Remove `separator` prop
3. Add `icons: userIcons = {}` prop with type `interface BreadCrumbsIcons { separator?: string }`
4. Add derived: `const icons = $derived({ separator: DEFAULT_STATE_ICONS.navigate.right, ...userIcons })`
5. Update template line 53: `class={separator}` → `class={icons.separator}`

**Step 4: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/BreadCrumbs.spec.svelte.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add solution/packages/ui/src/components/BreadCrumbs.svelte solution/packages/ui/spec/BreadCrumbs.spec.svelte.ts
git commit -m "refactor(ui): migrate BreadCrumbs to icons prop pattern"
```

---

### Task 8: Migrate FloatingNavigation to icons prop pattern

**Files:**
- Modify: `solution/packages/ui/src/components/FloatingNavigation.svelte`
- Modify: `solution/packages/ui/src/types/floating-navigation.ts`
- Modify: `solution/packages/ui/spec/FloatingNavigation.spec.svelte.ts`

**Context:** FloatingNavigation has hardcoded `i-lucide:pin` and `i-lucide:pin-off` on line 170. Replace with `icons` prop using `DEFAULT_STATE_ICONS.action.pin` and `DEFAULT_STATE_ICONS.action.unpin`.

**Step 1: Add icon tests to FloatingNavigation spec**

```ts
it('uses default semantic icons for pin toggle', () => {
	const { container } = render(FloatingNavigation, {
		items: [{ text: 'Section 1', value: 's1' }]
	})
	const pinIcon = container.querySelector('[data-floating-nav-pin-icon]')
	expect(pinIcon?.className).toContain('action-pin')
})

it('supports custom pin icons via icons prop', () => {
	const { container } = render(FloatingNavigation, {
		items: [{ text: 'Section 1', value: 's1' }],
		icons: { pin: 'custom-pin', unpin: 'custom-unpin' }
	})
	const pinIcon = container.querySelector('[data-floating-nav-pin-icon]')
	expect(pinIcon?.className).toContain('custom-pin')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/FloatingNavigation.spec.svelte.ts`
Expected: FAIL

**Step 3: Migrate FloatingNavigation.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Add `icons: userIcons = {}` prop with type `interface FloatingNavigationIcons { pin?: string; unpin?: string }`
3. Add derived: `const icons = $derived({ pin: DEFAULT_STATE_ICONS.action.pin, unpin: DEFAULT_STATE_ICONS.action.unpin, ...userIcons })`
4. Update template line 170: `class={pinned ? 'i-lucide:pin-off' : 'i-lucide:pin'}` → `class={pinned ? icons.unpin : icons.pin}`
5. Add `data-floating-nav-pin-icon` attribute to the icon span

**Step 4: Update floating-navigation.ts types**

Add `FloatingNavigationIcons` interface and `icons?: FloatingNavigationIcons` prop to the existing type file.

**Step 5: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/FloatingNavigation.spec.svelte.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add solution/packages/ui/src/components/FloatingNavigation.svelte \
       solution/packages/ui/src/types/floating-navigation.ts \
       solution/packages/ui/spec/FloatingNavigation.spec.svelte.ts
git commit -m "refactor(ui): migrate FloatingNavigation to icons prop pattern"
```

---

### Task 9: Migrate PaletteManager to icons prop pattern

**Files:**
- Modify: `solution/packages/ui/src/components/PaletteManager.svelte`
- Modify: `solution/packages/ui/src/types/palette.ts`
- Modify: `solution/packages/ui/spec/palette.spec.svelte.ts`

**Context:** PaletteManager has 4 hardcoded `i-lucide:*` icons: `list` (line 260), `hash` (line 262), `save` (line 342), `check` (line 349). Replace with `icons` prop using `DEFAULT_STATE_ICONS.action` for save/check and `DEFAULT_STATE_ICONS.palette` for presets/hex.

**Step 1: Add icon tests to palette spec**

```ts
it('uses default semantic icons', () => {
	const { container } = render(PaletteManager, { /* minimal props */ })
	const saveIcon = container.querySelector('[data-palette-save-icon]')
	expect(saveIcon?.className).toContain('action-save')
})

it('supports custom icons via icons prop', () => {
	const { container } = render(PaletteManager, {
		icons: { save: 'custom-save' }
	})
	const saveIcon = container.querySelector('[data-palette-save-icon]')
	expect(saveIcon?.className).toContain('custom-save')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && npx vitest run packages/ui/spec/palette.spec.svelte.ts`
Expected: FAIL

**Step 3: Migrate PaletteManager.svelte**

1. Add import: `import { DEFAULT_STATE_ICONS } from '@rokkit/core'`
2. Add `icons: userIcons = {}` prop with type:
   ```ts
   interface PaletteManagerIcons {
   	save?: string
   	check?: string
   	presets?: string
   	hex?: string
   }
   ```
3. Add derived:
   ```js
   const icons = $derived({
   	save: DEFAULT_STATE_ICONS.action.save,
   	check: DEFAULT_STATE_ICONS.action.check,
   	presets: DEFAULT_STATE_ICONS.palette.presets,
   	hex: DEFAULT_STATE_ICONS.palette.hex,
   	...userIcons
   })
   ```
4. Update template:
   - Line 260: `class="i-lucide:list"` → `class={icons.presets}` + add `data-palette-presets-icon`
   - Line 262: `class="i-lucide:hash"` → `class={icons.hex}` + add `data-palette-hex-icon`
   - Line 342: `class="i-lucide:save"` → `class={icons.save}` + add `data-palette-save-icon`
   - Line 349: `class="i-lucide:check"` → `class={icons.check}` + add `data-palette-check-icon`

**Step 4: Update palette.ts types**

Add `PaletteManagerIcons` interface and `icons?: PaletteManagerIcons` prop.

**Step 5: Run test to verify it passes**

Run: `cd solution && npx vitest run packages/ui/spec/palette.spec.svelte.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add solution/packages/ui/src/components/PaletteManager.svelte \
       solution/packages/ui/src/types/palette.ts \
       solution/packages/ui/spec/palette.spec.svelte.ts
git commit -m "refactor(ui): migrate PaletteManager to icons prop pattern"
```

---

### Task 10: Final verification and cleanup

**Files:**
- Modify: `agents/plan.md`
- Modify: `agents/journal.md`
- Modify: `docs/backlog/2026-03-01-ui-components.md`

**Step 1: Verify no hardcoded i-lucide: remain in component sources**

Run: `cd solution && grep -r "i-lucide:" packages/ui/src/components/ packages/app/src/components/`
Expected: No matches (or only in playground/demo files).

**Step 2: Run full test suite**

Run: `cd solution && bun run test:ci`
Expected: All tests pass (2471+ tests).

**Step 3: Run lint**

Run: `bun run lint`
Expected: 0 new errors (12 pre-existing only).

**Step 4: Update project files**

- `agents/plan.md` — add backlog #63 to Recently Completed
- `agents/journal.md` — log completion with commit hashes
- `docs/backlog/2026-03-01-ui-components.md` — mark #63 as DONE

**Step 5: Commit**

```bash
git add agents/plan.md agents/journal.md docs/backlog/2026-03-01-ui-components.md
git commit -m "docs: mark backlog #63 (semantic icons) complete"
```
