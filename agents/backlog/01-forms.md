# Backlog: Forms

Priority 1 — `@rokkit/forms` enhancements.

**Source docs:** `docs/requirements/010-form.md`, `docs/design/010-form.md`

---

## ~~7. FormBuilder Recreated on Every Render~~ ✅ DONE

Stable instance with `$effect` sync. See journal 2026-02-24.

---

## ~~8. Legacy Component Migration~~ ✅ DONE

`FieldLayout` already migrated to Svelte 5. `ListEditor`, `NestedEditor`, `DataEditor` deleted (broken, unused, superseded by FormRenderer + List/Tree composition). See journal 2026-02-24.

---

## ~~9. No Dirty Tracking~~ ✅ DONE

`isDirty`, `dirtyFields`, `isFieldDirty()`, `snapshot()`, `reset()` on FormBuilder. `data-field-dirty` attribute on InputField. See journal 2026-02-24.

---

## ~~12. Custom Type Renderer Registry~~ ✅ DONE

`defaultRenderers` + `resolveRenderer()` in `renderers.js`, `renderers` prop on FormRenderer. See journal 2026-02-24.

---

## ~~13. Validation Integration into FormRenderer~~ ✅ DONE

`validateField()`, `validate()`, `isValid`, `errors` on FormBuilder. `validateOn` prop on FormRenderer. See journal 2026-02-24.

---

## ~~14. ValidationReport Component Migration~~ ✅ DONE

`ValidationReport.svelte` in `@rokkit/forms` — grouped by severity, count headers, click-to-focus via `onclick(path)`. `FormBuilder.messages` getter. See journal 2026-02-24.

---

## ~~15. InputToggle Component~~ ✅ DONE

`InputToggle.svelte` wraps `@rokkit/ui` Toggle. Registered as `toggle` in `defaultRenderers`. Use `renderer: 'toggle'` in layout. See journal 2026-02-24.

---

## ~~16. FieldGroup Component (Nested Objects)~~ ✅ DONE

Recursive group rendering in FormRenderer via `{#snippet renderElement}`. `<fieldset data-form-group>` with `<legend>`. See journal 2026-02-24.

---

## 17. ArrayEditor Component

**Source:** docs/requirements/010-form.md §9.2

**Phase:** 2

**What's needed:**
- [ ] List editor for `type: 'array'` with add/remove
- [ ] Composes List + FormRenderer

---

## ~~18. Enhanced Lookup System (Fetch/Filter Hooks)~~ ✅ DONE

`createLookup` supports: `url` (URL template), `fetch` (async hook), `source`+`filter` (sync client-side filter). `disabled` state managed inside `fetch()`. `initialize()` always calls `fetch()` for all lookups. `FormBuilder.#convertToFormElement()` injects lookup state into `finalProps`. `updateField()` clears dependent field values before re-fetch. New methods: `isFieldDisabled(path)`, `refreshLookup(path)`. See memory file.

---

## ~~19. Form Submission Handling~~ ✅ DONE

`onsubmit` prop on FormRenderer with validate-before-submit, `data-form-submitting` loading state, default submit/reset buttons, custom `actions` snippet. See journal 2026-02-24.

---

## 20. Audit/System Field Metadata

**Source:** docs/requirements/010-form.md §10.4

**Phase:** 4

**What's needed:**
- [ ] `audit: true` and `generated: true` schema flags
- [ ] Read-only display in edit mode, excluded from add forms

---

## 21. Master-Detail View

**Source:** docs/requirements/010-form.md §10

**Depends on:** #7, #13, #9, #20

**Phase:** 4

**What's needed:**
- [ ] Two-column layout: List + FormRenderer
- [ ] SearchFilter, CRUD operations, dirty tracking warning
- [ ] Composes existing components

---

## 22. Semantic Command Input

**Source:** docs/requirements/010-form.md §11

**Phase:** 5 (future)

**What's needed:**
- [ ] Natural-language command input for CRUD operations
- [ ] Entity registry, command parser, autocomplete
- [ ] Composes Table + FormRenderer

---

## ~~60. Display-Only Schema Rendering~~ ✅ DONE

Display components (DisplayValue, DisplaySection, DisplayTable, DisplayCardGrid, DisplayList), FormBuilder integration, FormRenderer routing. See journal 2026-02-24.
