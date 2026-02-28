# Form Component Design

> Design for the schema-driven form system in `@rokkit/forms`.

## Overview

The `@rokkit/forms` package provides a schema-driven form rendering system. This design covers the existing architecture, proposed enhancements for custom type renderers, integrated validation, cascading lookups, master-detail view, and semantic command input.

## Current Architecture

### Component Hierarchy

```
@rokkit/forms
├── Current Generation (Svelte 5 runes)
│   ├── FormRenderer.svelte          # Main orchestrator
│   ├── InputField.svelte            # Label + input + message wrapper
│   ├── InfoField.svelte             # Read-only display
│   ├── Input.svelte                 # Type dispatcher → InputXxx
│   └── input/                       # 18 input type components
│
├── State Classes
│   ├── FormBuilder.svelte.js        # Reactive state manager
│   ├── lookup.svelte.js             # Async option loading + caching
│   └── validation.js                # Field + form validation
│
├── Schema/Layout Utilities
│   ├── schema.js                    # deriveSchemaFromValue()
│   ├── layout.js                    # deriveLayoutFromValue()
│   └── fields.js                    # getSchemaWithLayout(), findAttributeByPath()
│
└── Legacy Generation (Svelte 4 - NOT migrated)
    ├── DataEditor.svelte            # Registry-based form renderer
    ├── FieldLayout.svelte           # Recursive field layout
    ├── ListEditor.svelte            # Master-detail list editing
    └── NestedEditor.svelte          # Tree + form editing
```

### Data Flow

```
FormRenderer Usage:
  <FormRenderer bind:data {schema} {layout} {onupdate} {onvalidate}>
    {#snippet child(element)}...{/snippet}
  </FormRenderer>

Internal flow:
  1. new FormBuilder(data, schema, layout)
  2. Schema auto-derived if null: deriveSchemaFromValue(data)
  3. Layout auto-derived if null: deriveLayoutFromValue(data)
  4. getSchemaWithLayout(schema, layout) → merged elements
  5. #buildElements() → FormElement[] array
  6. FormRenderer iterates elements:
     ├── separator → <div data-form-separator>
     ├── info → InfoField
     ├── override + child → custom snippet
     └── default → InputField → Input → InputXxx

  On field change:
  1. User edits input → InputXxx fires onchange(value)
  2. Input → InputField → FormRenderer.handleFieldChange(element, value)
  3. data updated immutably
  4. onupdate?.(data) callback
  5. onvalidate?.(fieldPath, value) callback
```

---

## FormBuilder State Class

### Current Design

```
FormBuilder ($state runes)
├── Private state:
│   ├── #data, #schema, #layout
│   ├── #validation — field validation messages
│   ├── #lookupConfigs, #lookupManager
│
├── Derived:
│   └── elements — FormElement[] from #buildElements()
│
├── Schema/Layout: get/set with auto-derive
├── Field operations: getValue, updateField
├── Validation: setFieldValidation, clearValidation
└── Lookups: setLookups, getLookupState, initializeLookups
```

### Stability Fix (High Priority)

**Problem**: `FormRenderer` recreates `FormBuilder` on every derivation:
```javascript
let formBuilder = $derived(new FormBuilder(data, schema, layout))
```
This loses validation state, lookup manager, and dirty tracking.

**Fix**: Use stable instance with reactive updates:
```javascript
let formBuilder = new FormBuilder(data, schema, layout)

$effect(() => { formBuilder.data = data })
$effect(() => { if (schema) formBuilder.schema = schema })
$effect(() => { if (layout) formBuilder.layout = layout })
```

### Enhanced FormBuilder

```
FormBuilder (enhanced)
├── Existing state + methods (unchanged)
│
├── New: Dirty Tracking
│   ├── #initialData — snapshot on construction
│   ├── isDirty: $derived — any field differs from initial
│   ├── dirtyFields: $derived — Set<string> of changed paths
│   ├── reset() — restore to initialData, clear validation
│   └── snapshot() — update initialData to current
│
├── New: Integrated Validation
│   ├── validate() — run validateAll(), populate #validation
│   ├── validateField(path) — validate single field
│   ├── isValid: $derived — no error messages
│   ├── errors: $derived — array of { path, text, state: 'error' }
│   └── warnings: $derived — array of { path, text, state: 'warning' }
│
├── New: Type Registry
│   ├── #renderers — Record<string, Component>
│   ├── set renderers(map) — merge with defaults
│   └── resolveRenderer(element) — returns Component for element type
│
└── New: Enhanced Lookups
    ├── #lookupConfigs — accepts fetch/filter hooks (not just URLs)
    ├── isFieldDisabled(path) — dependencies not met
    └── refreshLookup(path) — manual refresh
```

---

## Custom Type Renderer Registry

### Architecture

```
Type Resolution Flow:
  FormElement { type, props: { renderer, format, enum, ... } }
    │
    ├── element.props.renderer specified?
    │     YES → look up in custom registry
    │
    ├── element.props.format specified?
    │     YES → format-to-type mapping (email → InputEmail, etc.)
    │
    ├── element.props.enum/options?
    │     YES → default to 'select' (unless renderer overrides)
    │
    └── Fall through to schema type mapping
          string → InputText, number → InputNumber, boolean → InputCheckbox
```

### Default Registry

```javascript
const defaultRenderers = {
  // Standard HTML inputs
  text: InputText,
  number: InputNumber,
  email: InputEmail,
  password: InputPassword,
  tel: InputTel,
  url: InputUrl,
  color: InputColor,
  date: InputDate,
  'datetime-local': InputDateTime,
  time: InputTime,
  month: InputMonth,
  week: InputWeek,
  range: InputRange,
  textarea: InputTextArea,
  file: InputFile,
  checkbox: InputCheckbox,
  radio: InputRadio,
  select: InputSelect,

  // Composite types (new)
  switch: InputSwitch,       // boolean toggle
  toggle: InputToggle,       // option-set toggle
  menu: InputMenu,           // menu selection
  group: FieldGroup,         // nested object form
  array: ArrayEditor,        // list editor

  // Read-only
  info: InfoField
}
```

### Renderer Resolution in FormRenderer

```svelte
<script>
  import { defaultRenderers } from './renderers.js'

  let { renderers: customRenderers = {}, ... } = $props()
  const allRenderers = $derived({ ...defaultRenderers, ...customRenderers })

  function resolveComponent(element) {
    // 1. Check explicit renderer
    if (element.props.renderer && allRenderers[element.props.renderer]) {
      return allRenderers[element.props.renderer]
    }
    // 2. Check element type
    if (allRenderers[element.type]) {
      return allRenderers[element.type]
    }
    // 3. Fallback
    return InputText
  }
</script>

{#each formBuilder.elements as element}
  {@const Component = resolveComponent(element)}
  <InputField {...element.props}>
    <Component bind:value={element.value} {...element.props} />
  </InputField>
{/each}
```

---

## Integrated Validation

### Current State

`validation.js` has `validateField()` and `validateAll()` but they are NOT called by `FormRenderer`. Validation is purely opt-in via the `onvalidate` callback.

### Proposed Integration

```
FormRenderer
  │
  ├── on field blur:
  │   ├── builder.validateField(path)        ← synchronous schema validation
  │   ├── onvalidate?.(path, value, 'blur')  ← async validation hook
  │   │     └── returns ValidationMessage | null
  │   └── builder.setFieldValidation(path, result)
  │
  ├── on field change (if validateOn === 'change'):
  │   └── same as blur flow
  │
  └── on submit:
      ├── builder.validate()                 ← validateAll() synchronous
      ├── onvalidate?.('*', data, 'submit')  ← async form-level validation
      ├── if !builder.isValid → show ValidationReport, focus first error
      └── if valid → onsubmit?.(data, { isValid: true })
```

### ValidationReport Component

Migrate from `archive/ui/src/ValidationReport.svelte`:

```svelte
<script>
  import { defaultStateIcons } from '@rokkit/core'

  let {
    items = [],
    icons = defaultStateIcons.badge,
    onclick,
    collapsible = false,
    class: className = ''
  } = $props()

  // Group by severity
  const grouped = $derived({
    error: items.filter(i => i.status === 'error'),
    warning: items.filter(i => i.status === 'warning'),
    info: items.filter(i => i.status === 'info'),
    success: items.filter(i => i.status === 'success')
  })
</script>

<div data-validation-report class={className} role="status">
  {#each ['error', 'warning', 'info'] as severity}
    {#if grouped[severity].length > 0}
      <div data-validation-group data-severity={severity}>
        <div data-validation-group-header>
          <span class={icons[severity]}></span>
          <span>{grouped[severity].length} {severity}{grouped[severity].length > 1 ? 's' : ''}</span>
        </div>
        {#each grouped[severity] as item}
          <button
            data-validation-item
            data-status={item.status}
            onclick={() => onclick?.(item.path)}
          >
            <span class={icons[item.status]}></span>
            <span>{item.text}</span>
          </button>
        {/each}
      </div>
    {/if}
  {/each}
</div>
```

---

## Enhanced Lookup System

### Current: URL Template Based

```javascript
createLookup({
  url: '/api/cities?country={country}',
  dependsOn: ['country'],
  fields: { text: 'name', value: 'id' },
  cacheTime: 300000,
  transform: (data) => data.results
})
```

### Enhanced: Fetch/Filter Hook Based

```javascript
// Fetch hook — async function replaces URL template
{
  dependsOn: ['country'],
  fetch: async (formData) => {
    if (!formData.country) return []
    return await api.getCities(formData.country)
  },
  fields: { text: 'name', value: 'id' },
  cacheKey: (formData) => `cities-${formData.country}`
}

// Filter hook — client-side filtering of pre-loaded data
{
  dependsOn: ['country', 'state'],
  source: allCities,    // pre-loaded array
  filter: (cities, formData) =>
    cities.filter(c =>
      c.country === formData.country &&
      c.state === formData.state
    ),
  fields: { text: 'name', value: 'id' }
}
```

### Cascading Dependency Flow

```
mount:
  └── initializeLookups(formData)
      ├── country lookup: no deps → fetch → [USA, India, UK]
      ├── state lookup: depends on country → skip (country empty)
      └── city lookup: depends on state → skip

user selects country = "USA":
  └── handleFieldChange('country', formData)
      ├── state lookup: deps satisfied → fetch states for USA → [CA, NY, TX]
      ├── city lookup: deps NOT satisfied (state empty) → skip
      └── state/city values cleared (dependency changed)

user selects state = "California":
  └── handleFieldChange('state', formData)
      └── city lookup: deps satisfied → fetch cities for CA → [LA, SF, SD]
```

### Lookup-Aware Field Rendering

```svelte
<!-- In FormRenderer/InputField -->
{@const lookupState = builder.getLookupState(fieldPath)}

{#if lookupState?.loading}
  <div data-field-loading>Loading...</div>
{:else if builder.isFieldDisabled(fieldPath)}
  <Input disabled placeholder="Select {missingDep} first" />
{:else}
  <Input options={lookupState?.options} fields={lookupState?.fields} />
{/if}
```

---

## Master-Detail View

### Component Structure

```
MasterDetail.svelte
├── Props: items, schema, layout, fields, value, onsave, ondelete, onadd, ...
├── State:
│   ├── selectedItem — currently editing
│   ├── isNew — adding new record
│   ├── formBuilder — stable instance for detail form
│   └── searchFilters — from SearchFilter
│
├── Layout:
│   ├── Left column (list):
│   │   ├── SearchFilter (if searchable)
│   │   ├── [+ Add] button (if addable)
│   │   └── List (filtered items, selected highlight)
│   │
│   └── Right column (detail):
│       ├── FormRenderer (selected item)
│       ├── ValidationReport (if errors)
│       └── Action buttons: [Save] [Delete] [Cancel]
│
├── Data flow:
│   ├── List selection → load item into FormRenderer
│   ├── Save → validate → onsave callback → update items
│   ├── Delete → confirm → ondelete callback → remove from items
│   ├── Add → create default → load empty form
│   └── Navigation with dirty form → warn "Unsaved changes"
│
└── Composition (uses existing components):
    ├── SearchFilter from @rokkit/ui
    ├── List from @rokkit/ui
    ├── FormRenderer from @rokkit/forms
    └── ValidationReport from @rokkit/ui
```

### Audit/System Field Handling

```
Schema:
  { id: { generated: true }, name: { ... }, created_at: { audit: true } }

FormBuilder processes:
  ├── generated fields → type: 'info', readonly, excluded from add form
  ├── audit fields → type: 'info', readonly, excluded from add form
  └── hidden fields → excluded from FormElement[] entirely

In add mode:
  ├── generated/audit fields not shown
  ├── other fields shown with defaults from schema

In edit mode:
  ├── generated fields shown as read-only info
  ├── audit fields shown as read-only info
  └── editable fields shown as normal inputs
```

### Usage Example

```svelte
<script>
  import { MasterDetail } from '@rokkit/forms'

  let customers = $state([...])

  const schema = {
    type: 'object',
    properties: {
      id: { type: 'integer', generated: true },
      name: { type: 'string', required: true },
      email: { type: 'string', format: 'email' },
      status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      created_at: { type: 'string', format: 'datetime', audit: true }
    }
  }
</script>

<MasterDetail
  bind:items={customers}
  {schema}
  fields={{ text: 'name', description: 'email' }}
  onsave={async (item, isNew) => {
    if (isNew) await api.createCustomer(item)
    else await api.updateCustomer(item.id, item)
  }}
  ondelete={async (item) => api.deleteCustomer(item.id)}
  onadd={() => ({ name: '', email: '', status: 'active' })}
  lookups={{
    city: {
      dependsOn: ['country'],
      fetch: async (data) => api.getCities(data.country)
    }
  }}
/>
```

---

## Semantic Command Input

### Architecture

```
CommandConsole.svelte
├── CommandInput — text input with parsing + autocomplete
├── CommandInterpreter — translates commands to operations
├── ResultView — switches between Table, Form, Loading states
│
├── Entity Registry:
│   ├── entities: Map<name, { schema, fetch, save, delete }>
│   ├── aliases: Map<alias, entityName> (e.g., "customer" → "customers")
│   └── metadata: column types, searchable fields, display fields
│
├── View States:
│   ├── 'idle' — command prompt only
│   ├── 'table' — Table component showing query results
│   ├── 'form' — FormRenderer showing edit/add form
│   ├── 'loading' — spinner during fetch
│   └── 'error' — error message with suggestions
│
└── Command Parser:
    ├── Tokenize input string
    ├── Match against grammar (find/show/list/edit/add/delete/save/cancel)
    ├── Extract entity, field, value, index
    └── Reuse parseFilters() from @rokkit/data for filter syntax
```

### Command → Data Operation Mapping

```
"find customers by name john"
  → { type: 'query', entity: 'customers', filters: [{ column: 'name', operator: '~*', value: /john/i }] }
  → entities.get('customers').fetch(filters)
  → render Table with results

"edit row 1"
  → { type: 'edit', index: 0 }
  → selectedItem = results[0]
  → render FormRenderer with selectedItem + entity schema

"add customer"
  → { type: 'add', entity: 'customers' }
  → newItem = defaults from schema
  → render FormRenderer with newItem

"save"
  → { type: 'save' }
  → validate form → entities.get('customers').save(item)

"delete row 2"
  → { type: 'delete', index: 1 }
  → confirm → entities.get('customers').delete(results[1])
```

### Entity Registration

```svelte
<CommandConsole
  entities={{
    customers: {
      schema: customerSchema,
      fetch: async (filters) => api.search('customers', filters),
      save: async (item, isNew) => isNew ? api.create('customers', item) : api.update('customers', item),
      delete: async (item) => api.delete('customers', item.id),
      displayFields: ['name', 'email', 'status'],
      searchFields: ['name', 'email']
    },
    products: {
      schema: productSchema,
      fetch: async (filters) => api.search('products', filters),
      save: async (item, isNew) => { ... },
      delete: async (item) => { ... }
    }
  }}
/>
```

### Implementation Phases

**Phase 1**: Core query/display
- Command parsing (tokenizer + grammar matcher)
- Entity registry with fetch hook
- Table display of results
- Basic autocomplete (entity names)

**Phase 2**: CRUD operations
- Edit command → FormRenderer with entity schema
- Add command → empty FormRenderer
- Save/Cancel commands
- Delete with confirmation

**Phase 3**: Advanced features
- Command history (up/down arrows)
- Rich autocomplete (field names, operators, values)
- Audit column handling
- Bookmarkable command URLs

---

## Display-Only Schema Rendering

### Architecture

```
FormRenderer receives display-* layout elements:
  │
  ├── type: 'display-table'
  │   └── DisplayTable.svelte
  │       ├── Wraps @rokkit/ui Table
  │       ├── Accepts: data array (from scope), columns definition
  │       ├── Optional: select ('one' | 'many')
  │       └── Emits: onselect(selected)
  │
  ├── type: 'display-cards'
  │   └── DisplayCardGrid.svelte
  │       ├── Renders DisplayCard per item
  │       ├── Responsive CSS grid
  │       ├── Optional: select ('one' | 'many')
  │       └── Fields with format hints
  │
  ├── type: 'display-section'
  │   └── DisplaySection.svelte
  │       ├── Key-value pairs from object
  │       ├── Optional title
  │       └── Fields with format hints
  │
  └── type: 'display-list'
      └── DisplayList.svelte (simple styled list)
```

### DisplayValue Component

Shared formatting component used by all display types:

```svelte
<script>
  let { value, format = 'text' } = $props()

  const formatted = $derived.by(() => {
    switch (format) {
      case 'currency': return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
      case 'datetime': return new Date(value).toLocaleString()
      case 'number': return new Intl.NumberFormat().format(value)
      case 'boolean': return value ? '✓' : '✗'
      default: return String(value ?? '')
    }
  })
</script>

<span data-display-value data-format={format}>{formatted}</span>
```

### FormBuilder Integration

`#buildElements()` recognizes `display-*` types and produces display elements:

```
FormElement (display variant) {
  scope: string
  type: 'display-table' | 'display-cards' | 'display-section' | 'display-list'
  value: any          // data at scope (array or object)
  props: {
    title?: string
    columns?: Array<{ key, label, format? }>
    fields?: Array<{ key, label, format? }>
    select?: 'one' | 'many'
  }
}
```

### FormRenderer Routing

```svelte
{#each formBuilder.elements as element}
  {#if element.type === 'display-table'}
    <DisplayTable data={element.value} {...element.props} />
  {:else if element.type === 'display-cards'}
    <DisplayCardGrid data={element.value} {...element.props} />
  {:else if element.type === 'display-section'}
    <DisplaySection data={element.value} {...element.props} />
  {:else if element.type === 'display-list'}
    <DisplayList data={element.value} {...element.props} />
  {:else if element.type === 'separator'}
    <!-- existing separator handling -->
  {:else}
    <!-- existing input field handling -->
  {/if}
{/each}
```

### Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-display-table` | root | Table display container |
| `data-display-cards` | root | Card grid container |
| `data-display-card` | card | Individual card |
| `data-display-section` | root | Key-value section |
| `data-display-field` | row | Individual field row |
| `data-display-value` | value | Formatted value |
| `data-format` | value | Format hint for styling |
| `data-selectable` | container | Has selection enabled |
| `data-selected` | item | Currently selected |

---

## Legacy Migration Path

### What Needs Migration

| Component | Status | Migration Path |
|-----------|--------|----------------|
| `DataEditor` | Svelte 4 | Replace with `FormRenderer` + custom renderers |
| `FieldLayout` | Svelte 4 | Convert to `FieldGroup` component for nested objects |
| `ListEditor` | Svelte 4 | Replace with `MasterDetail` component |
| `NestedEditor` | Svelte 4 | Replace with `Tree` + `FormRenderer` composition |

### Migration Strategy

**Phase 1: Fix Current Generation**
1. Fix `FormBuilder` recreation issue (stable instance)
2. Fix value binding bug in inputs (backlog #7)
3. Wire validation into `FormRenderer`

**Phase 2: Type Renderers + Components**
1. Build type renderer registry
2. Create `InputToggle`, fix `InputSwitch`
3. Create `FieldGroup` (nested object form section)
4. Create `ArrayEditor` (list add/remove)
5. Migrate `ValidationReport` from archive

**Phase 3: Lookups + Dirty Tracking**
1. Enhance lookup system with fetch/filter hooks
2. Integrate lookups into `FormRenderer`
3. Add dirty tracking to `FormBuilder`
4. Add form submission handling

**Phase 4: Master-Detail**
1. Build `MasterDetail` component using composition
2. SearchFilter + List + FormRenderer + ValidationReport
3. CRUD operation support with audit field handling

**Phase 5: Semantic Command Input (Future)**
1. Command parser
2. Entity registry
3. `CommandConsole` component
4. Integration with Table + FormRenderer

---

## Data Attributes (Complete)

### FormRenderer

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-form-root` | root `<div>` | Form container |
| `data-form-separator` | `<div>` | Visual separator |
| `data-form-field` | `<div>` | Field wrapper |
| `data-scope` | field `<div>` | JSON Pointer path |

### InputField

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-field-root` | outer `<div>` | Field container |
| `data-field` | inner `<div>` | Label + input row |
| `data-field-state` | outer `<div>` | Validation state |
| `data-field-type` | outer `<div>` | Input type |
| `data-field-required` | outer `<div>` | Required flag |
| `data-field-disabled` | outer `<div>` | Disabled flag |
| `data-field-empty` | outer `<div>` | No value |
| `data-field-dirty` | outer `<div>` | Modified from initial |
| `data-has-icon` | outer `<div>` | Has icon |
| `data-description` | `<div>` | Help text |
| `data-message` | `<div>` | Validation message |

### ValidationReport

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-validation-report` | root `<div>` | Container |
| `data-validation-group` | `<div>` | Severity group |
| `data-severity` | group `<div>` | error/warning/info |
| `data-validation-item` | `<button>` | Individual message |
| `data-status` | item | Message severity |

### MasterDetail

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-master-detail` | root `<div>` | Container |
| `data-master-list` | left column | List column |
| `data-detail-form` | right column | Detail column |
| `data-detail-toolbar` | `<div>` | Action buttons |
| `data-unsaved-warning` | `<div>` | Dirty state indicator |

### CommandConsole

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-command-console` | root `<div>` | Container |
| `data-command-input` | `<input>` | Command text input |
| `data-command-suggestions` | `<div>` | Autocomplete dropdown |
| `data-command-result` | `<div>` | Result area (table/form) |
| `data-command-state` | root | idle/table/form/loading/error |

---

## Dependencies

### Runtime

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/data` | `typeOf` | Type inference |
| `@rokkit/data` | `parseFilters`, `filterData` | Command parsing, MasterDetail search |
| `@rokkit/core` | `isObject`, `toHyphenCase`, `defaultStateIcons` | Utilities, validation icons |
| `@rokkit/ui` | `Select`, `List`, `Tree`, `SearchFilter`, `Table` | UI components used by form system |
| `ramda` | `pick`, `omit`, `isNil` | Object utilities (consider removing) |

### Consider Reducing

- **ramda dependency**: `pick`, `omit`, `isNil` are simple enough to implement natively
  - `isNil(v)` → `v == null`
  - `pick` / `omit` → native `Object.fromEntries` + `Object.entries` with filter

---

## Summary of Gaps

| # | Gap | Priority | Phase |
|---|-----|----------|-------|
| 1 | FormBuilder recreated on every render | High | 1 |
| 2 | Validation not wired into FormRenderer | High | 1 |
| 3 | Value binding bug in inputs | High | 1 |
| 4 | Custom type renderer registry | Medium | 2 |
| 5 | InputSwitch/InputToggle missing | Medium | 2 |
| 6 | FieldGroup for nested objects | Medium | 2 |
| 7 | ArrayEditor for array fields | Medium | 2 |
| 8 | ValidationReport migration | Medium | 2 |
| 9 | Cascading lookup integration | Medium | 3 |
| 10 | Dirty tracking | Medium | 3 |
| 11 | Form submission handling | Medium | 3 |
| 12 | Master-detail view | Low | 4 |
| 13 | Audit/system field metadata | Low | 4 |
| 14 | Semantic command input | Future | 5 |
| 15 | Legacy component retirement | Low | After Phase 4 |
| 16 | ramda dependency removal | Low | Any phase |
| 17 | Display-only schema rendering | Medium | 2–3 |
