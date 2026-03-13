# Conditional Fields Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `showWhen` to layout elements so fields are shown/hidden reactively based on other field values, with hidden fields excluded from submission and validation.

**Architecture:** A pure `evaluateCondition()` function in `lib/conditions.js` evaluates `showWhen` conditions. `FormBuilder.#buildElements()` filters hidden elements in the scoped-field branch. `getVisibleData()` strips hidden keys at submit time. `#clearHiddenValidation()` clears stale blur errors when a field becomes hidden. `validate()` post-filters results to visible paths. `FormRenderer` passes `getVisibleData()` to `onsubmit`.

**Tech Stack:** Svelte 5 runes, Vitest, `@testing-library/svelte`

---

**Spec:** `docs/superpowers/specs/2026-03-12-conditional-fields-design.md`

**Run all forms tests:** `bunx vitest run --project forms` (from repo root)

---

## Chunk 1: `evaluateCondition` pure function

### Task 1: Create `conditions.js` with `evaluateCondition`

**Files:**
- Create: `packages/forms/src/lib/conditions.js`
- Create: `packages/forms/src/lib/conditions.spec.js`

- [ ] **Step 1: Write the failing tests**

Create `packages/forms/src/lib/conditions.spec.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { evaluateCondition } from './conditions.js'

describe('evaluateCondition', () => {
  it('returns true when condition is null', () => {
    expect(evaluateCondition(null, { accountType: 'personal' })).toBe(true)
  })

  it('returns true when condition is undefined', () => {
    expect(evaluateCondition(undefined, { accountType: 'personal' })).toBe(true)
  })

  it('returns true when neither operator is set', () => {
    expect(evaluateCondition({ field: 'accountType' }, { accountType: 'business' })).toBe(true)
  })

  describe('equals operator', () => {
    it('returns true when value matches', () => {
      expect(
        evaluateCondition({ field: 'accountType', equals: 'business' }, { accountType: 'business' })
      ).toBe(true)
    })

    it('returns false when value does not match', () => {
      expect(
        evaluateCondition({ field: 'accountType', equals: 'business' }, { accountType: 'personal' })
      ).toBe(false)
    })

    it('returns false when field is absent (undefined)', () => {
      expect(evaluateCondition({ field: 'accountType', equals: 'business' }, {})).toBe(false)
    })
  })

  describe('notEquals operator', () => {
    it('returns true when value does not match', () => {
      expect(
        evaluateCondition(
          { field: 'accountType', notEquals: 'business' },
          { accountType: 'personal' }
        )
      ).toBe(true)
    })

    it('returns false when value matches', () => {
      expect(
        evaluateCondition(
          { field: 'accountType', notEquals: 'business' },
          { accountType: 'business' }
        )
      ).toBe(false)
    })

    it('returns true when field is absent (undefined !== value)', () => {
      expect(evaluateCondition({ field: 'accountType', notEquals: 'business' }, {})).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bunx vitest run packages/forms/src/lib/conditions.spec.js
```

Expected: FAIL — `Cannot find module './conditions.js'`

- [ ] **Step 3: Implement `conditions.js`**

Create `packages/forms/src/lib/conditions.js`:

```javascript
/**
 * Evaluate a showWhen condition against current form data.
 * Returns true if the field should be shown (condition met or absent).
 *
 * @param {{ field: string, equals?: unknown, notEquals?: unknown } | null | undefined} condition
 * @param {Record<string, unknown>} data - Top-level form data object
 * @returns {boolean}
 */
export function evaluateCondition(condition, data) {
  if (!condition) return true
  const value = data[condition.field]
  if ('equals' in condition) return value === condition.equals
  if ('notEquals' in condition) return value !== condition.notEquals
  return true
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bunx vitest run packages/forms/src/lib/conditions.spec.js
```

Expected: PASS — 9 tests

- [ ] **Step 5: Commit**

```bash
git add packages/forms/src/lib/conditions.js packages/forms/src/lib/conditions.spec.js
git commit -m "feat(forms): add evaluateCondition for showWhen layout support"
```

---

## Chunk 2: `FormBuilder` condition filtering + visible data

### Task 2: Filter hidden elements in `#buildElements()`

**Files:**
- Modify: `packages/forms/src/lib/builder.svelte.js`
- Modify: `packages/forms/spec/lib/builder.spec.svelte.js`

The `#buildElements()` method is in `builder.svelte.js` starting at line 316. It has three branches in its main loop:

1. `display-*` elements (lines ~337–348)
2. Non-scoped elements / separators (lines ~349–358)
3. Scoped field elements (lines ~359–369) — **the `showWhen` guard goes here only**

- [ ] **Step 1: Write the failing tests**

Add a new `describe('conditional fields — showWhen')` block to `packages/forms/spec/lib/builder.spec.svelte.js`:

```javascript
describe('conditional fields — showWhen', () => {
  it('includes field when showWhen is absent', () => {
    const layout = {
      type: 'vertical',
      elements: [{ scope: '#/accountType', label: 'Account Type' }]
    }
    const fb = new FormBuilder({ accountType: 'personal' }, null, layout)
    expect(fb.elements.map((el) => el.scope)).toContain('#/accountType')
  })

  it('includes field when showWhen equals condition is met', () => {
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder(
      { accountType: 'business', companyName: '' },
      null,
      layout
    )
    expect(fb.elements.map((el) => el.scope)).toContain('#/companyName')
  })

  it('excludes field when showWhen equals condition is not met', () => {
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder(
      { accountType: 'personal', companyName: '' },
      null,
      layout
    )
    expect(fb.elements.map((el) => el.scope)).not.toContain('#/companyName')
  })

  it('excludes field when showWhen notEquals condition is not met', () => {
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/personalBio',
          label: 'Bio',
          showWhen: { field: 'accountType', notEquals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder(
      { accountType: 'business', personalBio: '' },
      null,
      layout
    )
    expect(fb.elements.map((el) => el.scope)).not.toContain('#/personalBio')
  })

  it('does not affect separators', () => {
    const layout = {
      type: 'vertical',
      elements: [{ type: 'separator' }, { scope: '#/accountType', label: 'Account Type' }]
    }
    const fb = new FormBuilder({ accountType: 'personal' }, null, layout)
    expect(fb.elements.map((el) => el.type)).toContain('separator')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: FAIL — the `showWhen` tests fail (fields are always shown regardless of condition)

- [ ] **Step 3: Add `showWhen` guard to `#buildElements()`**

In `packages/forms/src/lib/builder.svelte.js`, add the import at the top of the file (after existing imports):

```javascript
import { evaluateCondition } from './conditions.js'
```

Then in `#buildElements()`, find the third branch (scoped field elements). It currently looks like:

```javascript
} else {
  // Extract key from scope
  const key = layoutEl.scope.replace(/^#\//, '').split('/').pop()
```

Add the `showWhen` guard immediately at the start of that `else` block, before the existing `key` extraction:

```javascript
} else {
  // Skip if showWhen condition is not met (scoped fields only — not separators or display-*)
  if (layoutEl.showWhen && !evaluateCondition(layoutEl.showWhen, this.#data)) {
    continue
  }
  // Extract key from scope
  const key = layoutEl.scope.replace(/^#\//, '').split('/').pop()
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: PASS — all builder tests including new conditional fields tests

- [ ] **Step 5: Commit**

```bash
git add packages/forms/src/lib/builder.svelte.js packages/forms/spec/lib/builder.spec.svelte.js
git commit -m "feat(forms): filter hidden elements in #buildElements() using showWhen"
```

---

### Task 3: Add `getVisibleData()` to `FormBuilder`

**Files:**
- Modify: `packages/forms/src/lib/builder.svelte.js`
- Modify: `packages/forms/spec/lib/builder.spec.svelte.js`

- [ ] **Step 1: Write the failing tests**

Add a `describe('getVisibleData')` block to `packages/forms/spec/lib/builder.spec.svelte.js`:

```javascript
describe('getVisibleData', () => {
  it('returns all data when no showWhen conditions are present', () => {
    const data = { name: 'Alice', email: 'alice@example.com' }
    const fb = new FormBuilder(data)
    expect(fb.getVisibleData()).toEqual(data)
  })

  it('excludes hidden field keys from returned data', () => {
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder(
      { accountType: 'personal', companyName: 'ACME' },
      null,
      layout
    )
    const visible = fb.getVisibleData()
    expect(visible).toEqual({ accountType: 'personal' })
    expect(visible).not.toHaveProperty('companyName')
  })

  it('includes field that was hidden and then became visible', () => {
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder(
      { accountType: 'personal', companyName: 'ACME' },
      null,
      layout
    )
    // Change controlling field so companyName becomes visible
    fb.updateField('accountType', 'business')
    const visible = fb.getVisibleData()
    expect(visible).toHaveProperty('companyName', 'ACME')
  })

  it('preserves value in #data even when field is hidden', () => {
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder(
      { accountType: 'business', companyName: 'ACME' },
      null,
      layout
    )
    fb.updateField('accountType', 'personal') // hides companyName
    // raw data still has the value
    expect(fb.data.companyName).toBe('ACME')
    // but getVisibleData() strips it
    expect(fb.getVisibleData()).not.toHaveProperty('companyName')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: FAIL — `fb.getVisibleData is not a function`

- [ ] **Step 3: Implement `getVisibleData()`**

Add the following method to `FormBuilder` in `packages/forms/src/lib/builder.svelte.js` (after the `refreshLookup` method, around line 230):

```javascript
/**
 * Returns form data with hidden field values stripped.
 * Only top-level keys are affected. Use this for submit payloads.
 * @returns {Object}
 */
getVisibleData() {
  const visiblePaths = new Set(
    this.elements
      .filter((el) => el.scope)
      .map((el) => el.scope.replace(/^#\//, ''))
  )
  return Object.fromEntries(
    Object.entries(this.#data).filter(([key]) => visiblePaths.has(key))
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: PASS — all tests including the new `getVisibleData` tests

- [ ] **Step 5: Commit**

```bash
git add packages/forms/src/lib/builder.svelte.js packages/forms/spec/lib/builder.spec.svelte.js
git commit -m "feat(forms): add getVisibleData() to strip hidden fields from submit payload"
```

---

## Chunk 3: Stale validation cleanup + validate() fix + FormRenderer submit

### Task 4: Clear stale blur validation when fields become hidden

**Files:**
- Modify: `packages/forms/src/lib/builder.svelte.js`
- Modify: `packages/forms/spec/lib/builder.spec.svelte.js`

When a user blurs a field and gets a validation error, then changes a controlling field that hides the errored field, the stale error must be cleared from `#validation` so `isValid` returns `true`.

- [ ] **Step 1: Write the failing test**

Add to `packages/forms/spec/lib/builder.spec.svelte.js`:

```javascript
describe('stale validation cleanup on field hide', () => {
  it('clears stale blur error when controlling field hides the errored field', () => {
    const schema = {
      type: 'object',
      properties: {
        accountType: { type: 'string' },
        companyName: { type: 'string', required: true }
      }
    }
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const fb = new FormBuilder({ accountType: 'business', companyName: '' }, schema, layout)

    // Trigger a validation error on companyName (simulating blur)
    fb.validateField('companyName')
    expect(fb.isValid).toBe(false)

    // Change accountType to hide companyName
    fb.updateField('accountType', 'personal')

    // Stale error should be cleared
    expect(fb.isValid).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: FAIL — `isValid` is still `false` after hiding the errored field

- [ ] **Step 3: Add `#clearHiddenValidation()` and call it from `updateField()`**

In `packages/forms/src/lib/builder.svelte.js`, add a private method after `#collectDirtyFields`:

```javascript
/**
 * Remove validation entries for fields that are no longer visible.
 * Called after #data changes so elements $derived has re-run.
 * @private
 */
#clearHiddenValidation() {
  const visiblePaths = new Set(
    this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
  )
  const cleaned = Object.fromEntries(
    Object.entries(this.#validation).filter(([path]) => visiblePaths.has(path))
  )
  if (Object.keys(cleaned).length !== Object.keys(this.#validation).length) {
    this.#validation = cleaned
  }
}
```

Then call it at the end of `updateField()` (after the lookups block):

```javascript
updateField(path, value, triggerLookups = true) {
  // ... existing data mutation and lookup code ...

  // Clear stale validation for any fields that just became hidden
  this.#clearHiddenValidation()
}
```

The exact insertion point in `updateField` is after the closing `}` of the `if (triggerLookups && this.#lookupManager)` block, before the method's own closing `}`. The existing method ends at line ~289. Change it from:

```javascript
    if (triggerLookups && this.#lookupManager) {
      // ... existing lookup code ...
    }
  }  // ← this is updateField's closing brace — do not remove it
```

to:

```javascript
    if (triggerLookups && this.#lookupManager) {
      // ... existing lookup code ...
    }
    // NEW: clear stale validation for fields now hidden
    this.#clearHiddenValidation()
  }  // ← updateField's closing brace — unchanged
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/forms/src/lib/builder.svelte.js packages/forms/spec/lib/builder.spec.svelte.js
git commit -m "feat(forms): clear stale validation errors when fields become hidden"
```

---

### Task 5: Fix `validate()` to skip hidden fields

**Files:**
- Modify: `packages/forms/src/lib/builder.svelte.js`
- Modify: `packages/forms/spec/lib/builder.spec.svelte.js`

`validate()` calls `validateAllFields(this.#data, this.#schema, this.#layout)` with the raw layout. `validateAll` therefore produces results for all layout fields including hidden ones. Post-filter to visible paths only.

- [ ] **Step 1: Write the failing test**

Add to `packages/forms/spec/lib/builder.spec.svelte.js`:

```javascript
describe('validate — hidden fields skipped', () => {
  it('does not produce errors for hidden required fields', () => {
    const schema = {
      type: 'object',
      properties: {
        accountType: { type: 'string' },
        companyName: { type: 'string', required: true }
      }
    }
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    // companyName is hidden (accountType is 'personal') and has no value
    const fb = new FormBuilder({ accountType: 'personal', companyName: null }, schema, layout)
    fb.validate()
    expect(fb.isValid).toBe(true)
    expect(fb.errors).toHaveLength(0)
  })

  it('still validates visible required fields', () => {
    const schema = {
      type: 'object',
      properties: {
        accountType: { type: 'string', required: true },
        companyName: { type: 'string', required: true }
      }
    }
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    // accountType is visible and empty — should still error
    const fb = new FormBuilder({ accountType: '', companyName: null }, schema, layout)
    fb.validate()
    expect(fb.isValid).toBe(false)
    expect(fb.errors.some((e) => e.path === 'accountType')).toBe(true)
    // companyName is hidden — should NOT error
    expect(fb.errors.some((e) => e.path === 'companyName')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bunx vitest run packages/forms/spec/lib/builder.spec.svelte.js
```

Expected: FAIL — hidden required fields produce errors

- [ ] **Step 3: Fix `validate()` in `builder.svelte.js`**

Find `validate()` (around line 596) and replace it:

```javascript
/**
 * Validate all visible fields, populate validation state.
 * Hidden fields (excluded by showWhen) are not validated.
 * @returns {Object} Validation results keyed by field path
 */
validate() {
  const allResults = validateAllFields(this.#data, this.#schema, this.#layout)
  const visiblePaths = new Set(
    this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
  )
  const results = Object.fromEntries(
    Object.entries(allResults).filter(([path]) => visiblePaths.has(path))
  )
  this.#validation = results
  return results
}
```

- [ ] **Step 4: Run all forms tests**

```bash
bunx vitest run --project forms
```

Expected: PASS — all forms tests

- [ ] **Step 5: Commit**

```bash
git add packages/forms/src/lib/builder.svelte.js packages/forms/spec/lib/builder.spec.svelte.js
git commit -m "feat(forms): validate() skips hidden fields via post-hoc visible path filter"
```

---

### Task 6: `FormRenderer` — use `getVisibleData()` on submit

**Files:**
- Modify: `packages/forms/src/FormRenderer.svelte`
- Modify: `packages/forms/spec/FormRenderer.spec.svelte.js`

`FormRenderer.handleSubmit` currently passes raw `data` to `onsubmit` (line 166). Change it to use `formBuilder.getVisibleData()`.

- [ ] **Step 1: Write the failing test**

Add a new `describe` block to `packages/forms/spec/FormRenderer.spec.svelte.js`:

```javascript
describe('FormRenderer — conditional fields submit', () => {
  beforeEach(() => cleanup())

  it('excludes hidden field values from onsubmit payload', async () => {
    const schema = {
      type: 'object',
      properties: {
        accountType: { type: 'string' },
        companyName: { type: 'string' }
      }
    }
    const layout = {
      type: 'vertical',
      elements: [
        { scope: '#/accountType', label: 'Account Type' },
        {
          scope: '#/companyName',
          label: 'Company Name',
          showWhen: { field: 'accountType', equals: 'business' }
        }
      ]
    }
    const submitted = []
    const props = $state({
      data: { accountType: 'personal', companyName: 'ACME' },
      schema,
      layout,
      onsubmit: async (data) => submitted.push(data)
    })
    const { container } = render(FormRenderer, { props })

    // Submit the form
    const form = container.querySelector('[data-form-root]')
    fireEvent.submit(form)
    await tick()

    expect(submitted).toHaveLength(1)
    expect(submitted[0]).toEqual({ accountType: 'personal' })
    expect(submitted[0]).not.toHaveProperty('companyName')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bunx vitest run packages/forms/spec/FormRenderer.spec.svelte.js
```

Expected: FAIL — submitted data includes `companyName`

- [ ] **Step 3: Update `handleSubmit` in `FormRenderer.svelte`**

Find line 166 in `packages/forms/src/FormRenderer.svelte`:

```javascript
await onsubmit(data, { isValid: true, errors: [] })
```

Change to:

```javascript
await onsubmit(formBuilder.getVisibleData(), { isValid: true, errors: [] })
```

- [ ] **Step 4: Run all forms tests**

```bash
bunx vitest run --project forms
```

Expected: PASS — all forms tests

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
bunx vitest run
```

Expected: PASS — 2526+ tests

- [ ] **Step 6: Commit**

```bash
git add packages/forms/src/FormRenderer.svelte packages/forms/spec/FormRenderer.spec.svelte.js
git commit -m "feat(forms): use getVisibleData() on submit to exclude hidden field values"
```

---

## Final verification

- [ ] Run full test suite: `bunx vitest run` — all tests pass
- [ ] Run lint: `bun run lint` — 0 errors
- [ ] Update `docs/features/05-Forms.md` — change Conditional Fields status from `🔲 Planned` to `✅ Implemented`
- [ ] Update `docs/design/12-priority.md` — mark conditional fields complete
- [ ] Commit docs update:

```bash
git add docs/features/05-Forms.md docs/design/12-priority.md
git commit -m "docs: mark conditional fields as implemented"
```
