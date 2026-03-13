# Conditional Fields Implementation Design

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `showWhen` support to form layout elements so fields are shown or hidden reactively based on other field values, with hidden field values excluded from submission.

**Architecture:** `showWhen` lives on layout elements (presentation concern). `evaluateCondition()` is a pure function in a new `lib/conditions.js`. `FormBuilder.#buildElements()` skips hidden elements; `getVisibleData()` strips hidden values for submit. `FormRenderer` uses `getVisibleData()` on submit instead of raw data.

**Tech Stack:** Svelte 5 runes, `@rokkit/forms` (`FormBuilder`, `FormRenderer`)

---

## Scope

This design covers **show/hide only**. `disableWhen` and condition operators beyond `equals`/`notEquals` are explicitly out of scope for this iteration.

---

## Layout Annotation

`showWhen` is added to individual layout elements. It is absent for unconditionally-shown fields.

```javascript
{
  elements: [
    { scope: '#/accountType', label: 'Account Type' },

    // Shown only when accountType === 'business'
    {
      scope: '#/companyName',
      label: 'Company Name',
      showWhen: { field: 'accountType', equals: 'business' }
    },

    // Shown only when accountType !== 'business'
    {
      scope: '#/personalBio',
      label: 'Bio',
      showWhen: { field: 'accountType', notEquals: 'business' }
    }
  ]
}
```

**Condition shape:**

```typescript
type Condition = {
  field: string        // slash-separated path to controlling field (e.g. 'accountType', 'address/country')
  equals?: unknown     // show when value strictly equals this
  notEquals?: unknown  // show when value strictly does not equal this
}
```

Only one operator per condition. If `showWhen` is absent, the field is always shown.

---

## `evaluateCondition(condition, data)`

A pure function in `packages/forms/src/lib/conditions.js`.

```javascript
/**
 * Evaluate a showWhen condition against current form data.
 * Returns true if the field should be shown.
 */
export function evaluateCondition(condition, data) {
  if (!condition) return true
  const value = getValue(condition.field, data)
  if ('equals' in condition) return value === condition.equals
  if ('notEquals' in condition) return value !== condition.notEquals
  return true
}

function getValue(path, data) {
  const keys = path.split('/')
  let current = data
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return current
}
```

Edge cases:
- `condition` is null/undefined → returns `true` (field shown)
- `condition.field` resolves to `undefined` → `equals` check: `undefined === value`; `notEquals` check: `undefined !== value`
- Neither operator present → returns `true`

---

## `FormBuilder` Changes

### `#buildElements()` — condition filter

Inside the layout element loop, before processing each element:

```javascript
if (layoutEl.showWhen && !evaluateCondition(layoutEl.showWhen, this.#data)) {
  continue
}
```

Since `elements` is `$derived(this.#buildElements())`, this is automatically reactive — when `#data` changes, `elements` re-derives and hidden/shown state updates without any extra wiring.

### `getVisibleData()`

Returns `#data` with hidden field values stripped. Used by `FormRenderer` on submit.

```javascript
getVisibleData() {
  const visiblePaths = new Set(
    this.elements
      .filter(el => el.scope)
      .map(el => el.scope.replace(/^#\//, ''))
  )
  return Object.fromEntries(
    Object.entries(this.#data).filter(([key]) => visiblePaths.has(key))
  )
}
```

Note: `#data` is never mutated when a field becomes hidden. The value is preserved in memory during the session — if a user re-shows a field (e.g., by changing the controlling field back), their previously entered value is still there. Values are only stripped at submit time.

### `validate()` — skip hidden fields

`validate()` currently runs `validateAll(this.#data, this.#schema, this.#layout)`. After this change it should only validate visible fields. The simplest approach: filter the validation results to remove paths not in the visible set.

```javascript
validate() {
  const results = validateAllFields(this.#data, this.#schema, this.#layout)
  const visiblePaths = new Set(
    this.elements.filter(el => el.scope).map(el => el.scope.replace(/^#\//, ''))
  )
  const filtered = Object.fromEntries(
    Object.entries(results).filter(([path]) => visiblePaths.has(path))
  )
  this.#validation = filtered
  return filtered
}
```

---

## `FormRenderer` Changes

`handleSubmit` changes from passing `formBuilder.data` to `formBuilder.getVisibleData()`:

```javascript
async function handleSubmit(e) {
  e.preventDefault()
  formBuilder.validate()
  if (!formBuilder.isValid) return
  await onsubmit?.(formBuilder.getVisibleData())
}
```

No template changes needed — `FormRenderer` already iterates `formBuilder.elements`, so hidden fields simply don't appear.

---

## Files

| Action | File |
|--------|------|
| Create | `packages/forms/src/lib/conditions.js` |
| Modify | `packages/forms/src/lib/builder.svelte.js` |
| Modify | `packages/forms/src/FormRenderer.svelte` |
| Create | `packages/forms/src/lib/conditions.spec.js` |
| Modify | `packages/forms/spec/builder.spec.js` (or nearest builder test file) |

---

## Testing

### `conditions.spec.js` — unit tests for `evaluateCondition`

- `equals` operator: returns `true` when value matches
- `equals` operator: returns `false` when value does not match
- `notEquals` operator: returns `true` when value does not match
- `notEquals` operator: returns `false` when value matches
- No `showWhen` (null/undefined): returns `true`
- Neither operator set: returns `true`
- Nested field path (`'address/country'`): resolves correctly
- Field value `undefined` with `equals`: returns `false`
- Field value `undefined` with `notEquals`: returns `true`

### `builder.svelte.js` tests — condition integration

- Field with unmet `showWhen` is absent from `elements`
- Field with met `showWhen` is present in `elements`
- Changing controlling field value causes dependent field to appear/disappear (reactive)
- `getVisibleData()` excludes hidden field keys
- `getVisibleData()` includes all visible field keys
- `validate()` does not produce errors for hidden required fields

---

## Data Flow

```
User changes controlling field
  → FormBuilder.updateField('accountType', 'business')
  → #data updated ($state)
  → elements $derived re-runs
    → #buildElements() checks showWhen for each layout element
    → evaluateCondition({ field: 'accountType', equals: 'business' }, #data)
    → companyName element included, personalBio element excluded
  → FormRenderer re-renders with new elements
  → companyName field visible, personalBio field gone

User submits
  → FormRenderer.handleSubmit()
  → formBuilder.validate()  // skips personalBio (not in visible set)
  → formBuilder.getVisibleData()  // returns data without personalBio key
  → onsubmit(visibleData)
```
