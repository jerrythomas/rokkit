# Multi-Step Forms

> Schema-driven wizard forms built on `FormBuilder` and `FormRenderer` with per-step validation and a step indicator component.

---

## Overview

Multi-step forms extend the existing forms system with a `step` layout element type. Steps are declared at the top level of the layout `elements` array. `FormBuilder` tracks the current step index and exposes navigation methods. `FormRenderer` renders only the active step's fields. All steps share one `FormBuilder` instance — there is no per-step data isolation.

The `StepIndicator` component is a standalone presentational element. It can be placed anywhere in the page and is not embedded inside `FormRenderer`.

---

## Layout Extension

Steps are declared as `type: 'step'` elements in the layout. Each step contains its own `elements` array using the same element descriptors as flat layouts.

```javascript
const layout = {
  type: 'vertical',
  elements: [
    {
      type: 'step',
      label: 'Personal Info',
      elements: [
        { scope: '#/firstName', label: 'First Name' },
        { scope: '#/lastName', label: 'Last Name' },
        { scope: '#/email', label: 'Email', format: 'email' }
      ]
    },
    {
      type: 'step',
      label: 'Account Setup',
      elements: [
        { scope: '#/username', label: 'Username' },
        { scope: '#/password', label: 'Password', format: 'password' },
        { scope: '#/plan', label: 'Plan' }
      ]
    },
    {
      type: 'step',
      label: 'Review',
      elements: [{ type: 'display-section', scope: '#/', title: 'Your Details' }]
    }
  ]
}
```

A layout that mixes step and non-step elements is invalid. The presence of any `type: 'step'` element activates multi-step mode for the entire layout. `FormBuilder` detects this during `#buildElements()` and switches to step-aware rendering.

---

## FormBuilder Additions

`FormBuilder` gains step state and navigation when the layout contains step elements.

```
FormBuilder (step extensions)
│
├── currentStep ($state)       — zero-based index of active step
├── totalSteps (get)           — number of step elements in layout
├── isMultiStep (get)          — true when layout has step elements
│
├── next()                     — validates current step; advances if valid
├── prev()                     — moves to previous step (no validation)
├── goToStep(index)            — navigate to a completed step (index < currentStep)
├── isStepValid(index?)        — runs validation for fields in given step (default: currentStep)
└── canAdvance ($derived)      — true when currentStep < totalSteps - 1
```

`next()` runs `validateStep(currentStep)` before advancing. `validateStep` calls `validateField` for every field scoped to that step's elements (recursively, including nested groups). If any field has an error, `currentStep` does not change and `next()` returns `false`.

`prev()` always succeeds — no validation on backward navigation. This preserves user-entered data and lets users correct earlier steps.

`goToStep` is restricted to steps with index less than `currentStep` (already-visited steps). Attempting to jump forward past unvalidated steps throws.

The `currentStep` index is reflected on the `FormRenderer` root element via `data-form-step={currentStep}` for theme targeting.

---

## Per-Step Validation

`validateStep(index)` collects all field paths belonging to that step by walking the step's `elements` array recursively. It calls `validateField(path)` for each, stores messages in `#validation`, and returns `true` if no error messages were added.

Hidden fields (filtered by `showWhen`) are excluded from step validation, matching the behavior of `validate()` for the full form.

Fields in steps not yet visited have no validation messages until explicitly traversed. On the final step, the standard submit handler calls `formBuilder.validate()` which validates all visible fields across all steps.

---

## StepIndicator Component

`StepIndicator` is a standalone component in `@rokkit/forms`.

```svelte
<StepIndicator
  steps={['Personal Info', 'Account Setup', 'Review']}
  current={formBuilder.currentStep}
  onclick={(index) => formBuilder.goToStep(index)}
/>
```

### Props

| Prop      | Type                      | Description                                   |
| --------- | ------------------------- | --------------------------------------------- |
| `steps`   | `string[]`                | Step labels in order                          |
| `current` | `number`                  | Zero-based index of the active step           |
| `onclick` | `(index: number) => void` | Called when a completed step label is clicked |

### Data attributes

```html
<ol data-step-indicator>
  <li data-step-item data-step-state="complete">Personal Info</li>
  <li data-step-item data-step-state="current">Account Setup</li>
  <li data-step-item data-step-state="upcoming">Review</li>
</ol>
```

`data-step-state` values:

- `complete` — index < current; step is navigable via `onclick`
- `current` — index === current; not clickable
- `upcoming` — index > current; not clickable, visually inactive

Clicking a `complete` step item calls `onclick(index)`. `current` and `upcoming` items do not fire the callback.

---

## FormRenderer Changes

When `formBuilder.isMultiStep` is true, `FormRenderer` changes its rendering behavior:

1. Only the elements belonging to `formBuilder.currentStep` are rendered.
2. The step container uses `data-form-step-content` on the field wrapper div.
3. The default action row changes based on step position:
   - First step: only Next button (`data-form-next`)
   - Middle steps: Prev and Next buttons (`data-form-prev`, `data-form-next`)
   - Last step: Prev and Submit buttons (`data-form-prev`, `data-form-submit`)

The Submit button is absent from non-final steps. The consumer can suppress default actions via the `actions` snippet and wire their own buttons to `formBuilder.next()`, `formBuilder.prev()`, and `formBuilder.submit()`.

```svelte
<FormRenderer bind:data {schema} {layout} {formBuilder}>
  {#snippet actions()}
    <div data-form-actions>
      {#if formBuilder.currentStep > 0}
        <button onclick={() => formBuilder.prev()}>Back</button>
      {/if}
      {#if formBuilder.canAdvance}
        <button onclick={() => formBuilder.next()}>Continue</button>
      {:else}
        <button type="submit">Submit</button>
      {/if}
    </div>
  {/snippet}
</FormRenderer>
```

---

## Data Attributes Reference

| Attribute                | Element    | Purpose                                         |
| ------------------------ | ---------- | ----------------------------------------------- |
| `data-form-step`         | form root  | Current step index (e.g., `data-form-step="1"`) |
| `data-form-step-content` | `<div>`    | Wrapper for active step's rendered fields       |
| `data-form-next`         | `<button>` | Default next step button                        |
| `data-form-prev`         | `<button>` | Default previous step button                    |
| `data-step-indicator`    | `<ol>`     | Step indicator root                             |
| `data-step-item`         | `<li>`     | Individual step label                           |
| `data-step-state`        | `<li>`     | `complete`, `current`, or `upcoming`            |

---

## Component File Map

```
packages/forms/src/
├── FormRenderer.svelte          — extended with isMultiStep rendering path
├── StepIndicator.svelte         — new standalone step indicator component
└── lib/
    └── builder.svelte.js        — FormBuilder extended with step state and methods
```
