# Conditional Fields Implementation Design

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `showWhen` support to form layout elements so fields are shown or hidden reactively based on other field values, with hidden field values excluded from submission.

**Architecture:** `showWhen` lives on layout elements (presentation concern). `evaluateCondition()` is a pure function in a new `lib/conditions.js`. `FormBuilder.#buildElements()` skips hidden elements in the scoped-field branch only; `getVisibleData()` strips hidden values for submit. `FormRenderer` uses `getVisibleData()` on submit instead of raw data.

**Tech Stack:** Svelte 5 runes, `@rokkit/forms` (`FormBuilder`, `FormRenderer`)

---

## Scope

This design covers **show/hide only** with `equals`/`notEquals` operators. `disableWhen`, compound conditions (`and`/`or`), and nested field hiding are explicitly out of scope for this iteration.

> **Note on `docs/design/03-forms.md`:** The existing design doc previously sketched `showWhen` as a schema annotation. That section has been updated to reflect the layout placement decided here. Visibility is a presentation concern and belongs in the layout; schema describes the data model.

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
  field: string        // top-level field key (e.g. 'accountType')
  equals?: unknown     // show when value strictly equals this
  notEquals?: unknown  // show when value strictly does not equal this
}
```

Only one operator per condition. If `showWhen` is absent, the field is always shown.

> **Scope note:** `field` supports only top-level paths in this iteration. Nested paths (e.g. `'address/country'`) are out of scope. `getVisibleData()` only strips top-level keys.

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
  const value = data[condition.field]
  if ('equals' in condition) return value === condition.equals
  if ('notEquals' in condition) return value !== condition.notEquals
  return true
}
```

Edge cases:
- `condition` is null/undefined → returns `true` (field shown)
- `condition.field` resolves to `undefined` — `equals`: `undefined === value`; `notEquals`: `undefined !== value`
- Neither operator present → returns `true`

---

## `FormBuilder` Changes

### `#buildElements()` — condition filter

The condition check belongs **only in the scoped-field branch** (not the separator/display-\* branches). `#buildElements()` has three branches; the guard goes in the third:

```javascript
// Branch 3: scoped field elements only
} else {
  // NEW: skip if showWhen condition is not met
  if (layoutEl.showWhen && !evaluateCondition(layoutEl.showWhen, this.#data)) {
    continue
  }
  // ... existing key extraction and combinedMap lookup
}
```

Separators and display-\* elements are never conditional and must not be affected.

Since `elements` is `$derived(this.#buildElements())`, this is automatically reactive — when `#data` changes, `elements` re-derives and hidden/shown state updates without any extra wiring.

### `getVisibleData()`

Returns `#data` with hidden top-level field values stripped. Used by `FormRenderer` on submit.

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

> **Scope note:** This strips only top-level keys. Nested field hiding (e.g., hiding `address/country` while keeping `address`) is out of scope for this iteration.

**Value preservation:** `#data` is never mutated when a field becomes hidden. A user who re-shows a conditional field sees their previously entered value. Values are only stripped at submit time by this method.

> **Deferred: schema `default` initialization.** The feature spec states "its value is initialized to the schema default" when a field becomes visible. This iteration does not implement that behavior. Callers are expected to provide initial values in `data` at construction time (including defaults). Auto-applying schema `default` when a conditionally shown field first appears is left for a future iteration.

### `validate()` — skip hidden fields

`validate()` calls `validateAllFields(this.#data, this.#schema, this.#layout)` with the raw `#layout` (which still contains all layout elements, including hidden ones). `validateAll` therefore produces results for all fields. The fix is to filter the results post-hoc to only include visible paths:

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

> Why post-hoc filtering? `validateAll` takes the raw layout, not the derived `elements`. Passing a filtered layout would require restructuring the validation pipeline. Post-hoc filtering is simpler and correct: hidden fields simply don't appear in `#validation`.

**Stale blur validation:** When a user blurs a field and it has an error, that error is stored in `#validation`. If the user then changes a controlling field that hides the errored field, the stale error remains in `#validation` until the next `validate()` call. This means `isValid` may temporarily return `false` between blur and submit. The fix: `updateField()` on the controlling field should clear validation entries for fields that become hidden as a result. This is handled by calling `clearHiddenValidation()` after `#data` is updated in `updateField()`.

```javascript
// Called from updateField() after data mutation
#clearHiddenValidation() {
  const visiblePaths = new Set(
    this.elements.filter(el => el.scope).map(el => el.scope.replace(/^#\//, ''))
  )
  const cleaned = Object.fromEntries(
    Object.entries(this.#validation).filter(([path]) => visiblePaths.has(path))
  )
  if (Object.keys(cleaned).length !== Object.keys(this.#validation).length) {
    this.#validation = cleaned
  }
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
| Create | `packages/forms/src/lib/conditions.spec.js` |
| Modify | `packages/forms/src/lib/builder.svelte.js` |
| Modify | `packages/forms/src/FormRenderer.svelte` |
| Modify | `packages/forms/spec/lib/builder.spec.svelte.js` |
| Modify | `docs/design/03-forms.md` (Conditional Fields section — already updated) |

---

## Testing

### `conditions.spec.js` — unit tests for `evaluateCondition`

- `equals`: returns `true` when value matches
- `equals`: returns `false` when value does not match
- `notEquals`: returns `true` when value does not match
- `notEquals`: returns `false` when value matches
- No `showWhen` (null): returns `true`
- Neither operator set: returns `true`
- Field value `undefined` with `equals 'business'`: returns `false`
- Field value `undefined` with `notEquals 'business'`: returns `true`

### `builder.spec.svelte.js` — condition integration

- Field with unmet `showWhen` is absent from `elements`
- Field with met `showWhen` is present in `elements`
- Changing controlling field value causes dependent field to appear/disappear (reactive)
- Separators are not affected by unrelated `showWhen` conditions
- `getVisibleData()` excludes hidden field keys
- `getVisibleData()` includes all visible field keys
- `validate()` does not produce errors for hidden required fields
- **Edge case:** field validated with an error on blur → controlling field hides it → `isValid` is `true` (stale error cleared)

---

## Data Flow

```
User changes controlling field
  → FormBuilder.updateField('accountType', 'business')
  → #data updated ($state)
  → #clearHiddenValidation() clears stale errors for newly-hidden fields
  → elements $derived re-runs
    → #buildElements() — scoped-field branch checks showWhen
    → evaluateCondition({ field: 'accountType', equals: 'business' }, #data)
    → companyName element included, personalBio element excluded
  → FormRenderer re-renders with new elements
  → companyName visible, personalBio gone

User submits
  → FormRenderer.handleSubmit()
  → formBuilder.validate()  // post-hoc filters to visible paths only
  → formBuilder.isValid     // true — no hidden field errors in #validation
  → formBuilder.getVisibleData()  // returns data without personalBio key
  → onsubmit(visibleData)
```
