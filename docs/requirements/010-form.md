# Form Component Requirements

> Requirements for the schema-driven form system in `@rokkit/forms`.

## 1. Overview

The `@rokkit/forms` package provides a schema-driven form rendering system. Forms are generated from data objects with optional JSON Schema and layout definitions. The system supports flat forms, nested objects, array editing, validation, remote lookups, and custom type renderers.

### 1.1 Current Status

- **Current generation** (`FormRenderer`, `FormBuilder`, `InputField`, `Input`): Svelte 5, functional for flat forms
- **Legacy** (`DataEditor`, `FieldLayout`, `ListEditor`, `NestedEditor`): Svelte 4, partially broken
- **Validation**: Utility functions exist but are not wired into `FormRenderer`
- **Lookups**: Implemented in `FormBuilder` but not integrated into `FormRenderer`
- **ValidationReport**: Archived, needs migration

### 1.2 Goals

1. Schema-driven form rendering from data, schema, and layout
2. Custom type renderers for all data types
3. Integrated validation with visual feedback
4. Cascading lookups for dependent field options
5. Master-detail view for list/collection editing
6. Semantic command input for data-driven interactions

## 2. Architecture

### 2.1 Two-Layer System

```
FormBuilder (state class)
  ├── Accepts: data, schema, layout
  ├── Auto-derives schema from data if not provided
  ├── Auto-derives layout from data if not provided
  ├── Merges schema + layout via getSchemaWithLayout()
  ├── Produces: FormElement[] array
  └── Manages: validation state, field updates, lookups, dirty tracking

FormRenderer (component)
  ├── Accepts: data (bindable), schema, layout, renderers
  ├── Creates FormBuilder from props
  ├── Iterates formBuilder.elements
  ├── Resolves input component per field (via type registry)
  └── Handles change/blur events, validation display
```

### 2.2 Data Flow

```
Data Object → Schema (derived or provided) → Layout (derived or provided)
  │
  ▼
FormBuilder.constructor(data, schema, layout)
  ├── deriveSchemaFromValue(data)     ← auto-infers types
  ├── deriveLayoutFromValue(data)     ← auto-creates form fields
  ├── getSchemaWithLayout(schema, layout)  ← merges
  └── #buildElements()  ← produces FormElement[]
  │
  ▼
FormRenderer iterates elements
  ├── 'separator' → <div data-form-separator>
  ├── 'info' → InfoField (readonly display)
  ├── override + child snippet → custom rendering
  └── default → resolveRenderer(element) → InputField → Component
```

## 3. Schema

### 3.1 Auto-Derivation

`deriveSchemaFromValue(data)` uses `typeOf()` from `@rokkit/data` to infer types:
- Primitives: `{ type: 'string' }`, `{ type: 'number' }`, `{ type: 'boolean' }`
- Objects: `{ type: 'object', properties: { ... } }` (recurse)
- Arrays: `{ type: 'array', items: { ... } }` (sample first element)

### 3.2 Provided Schema

JSON Schema-like structure with:
- `type`: string, number, integer, boolean, object, array
- `properties`: nested field schemas
- `required`: boolean
- `minLength`, `maxLength`: string constraints
- `minimum`, `maximum` (or `min`, `max`): number constraints
- `pattern`: regex pattern
- `enum`: allowed values (renders as select/radio/toggle)
- `items`: array item schema
- `format`: semantic format hint (e.g., `'email'`, `'url'`, `'phone'`, `'color'`, `'date'`)

### 3.3 Extended Metadata

Schema properties can carry additional metadata used by the form system:

- `readonly`: boolean — render as info display
- `hidden`: boolean — exclude from form
- `audit`: boolean — mark as audit column (created_at, updated_by, etc.) — display as read-only, exclude from edit forms
- `generated`: boolean — auto-generated field (id, uuid) — display as read-only
- `options`: array — explicit options for select/radio/toggle
- `default`: any — default value for new records
- `renderer`: string — override the component used for this field (e.g., `'radio'`, `'toggle'`, `'switch'`, `'menu'`)

## 4. Layout

### 4.1 Auto-Derivation

`deriveLayoutFromValue(data)` creates a vertical layout:
- Each property becomes a layout element with `scope: '#/propertyName'`
- Nested objects recurse with nested scopes
- Arrays produce `{ scope, schema }` for list editing

### 4.2 Provided Layout

Layout elements define presentation:
- `scope`: JSON Pointer path (e.g., `'#/email'`, `'#/user/name'`)
- `label`: display label
- `description`: help text
- `placeholder`: input placeholder
- `type`: override element type (`'separator'`, `'info'`, `'vertical'`, `'horizontal'`)
- `override`: boolean, use `child` snippet for custom rendering
- `component`: named component from registry
- `elements`: nested layout elements (for groups/sections)
- `renderer`: override component for this field

### 4.3 Schema + Layout Merging

`getSchemaWithLayout(schema, layout)` combines:
1. Each layout element with scope matches against schema by path
2. Schema properties (type, constraints) merge with layout properties (label, description)
3. Nested elements recursively merged
4. Non-scoped elements (separators) preserved in layout order

## 5. Custom Type Renderers

### 5.1 Problem

Currently the type-to-component mapping is hardcoded:
- `string` → `InputText`
- `boolean` → `InputCheckbox`
- `string` with `enum` → `InputSelect`

But different data types should support multiple visual representations.

### 5.2 Type Renderer Registry

A configurable registry that maps schema types and hints to UI components:

| Schema Type | Renderer Hint | Component | Description |
|-------------|--------------|-----------|-------------|
| `string` | (default) | `InputText` | Standard text input |
| `string` | `textarea` | `InputTextArea` | Multi-line text |
| `string` + `enum` | (default) | `InputSelect` | Dropdown select |
| `string` + `enum` | `radio` | `InputRadio` | Radio button group |
| `string` + `enum` | `toggle` | `InputToggle` | Toggle switch group (option set) |
| `string` + `enum` | `menu` | `InputMenu` | Menu-based selection |
| `boolean` | (default) | `InputCheckbox` | Checkbox |
| `boolean` | `switch` | `InputSwitch` | Toggle switch |
| `boolean` | `toggle` | `InputToggle` | Toggle button |
| `number` | (default) | `InputNumber` | Number input |
| `number` + `min`+`max` | `range` | `InputRange` | Range slider |
| `string` + `format:email` | — | `InputEmail` | Email input |
| `string` + `format:url` | — | `InputUrl` | URL input |
| `string` + `format:phone` | — | `InputTel` | Phone input |
| `string` + `format:color` | — | `InputColor` | Color picker |
| `string` + `format:date` | — | `InputDate` | Date picker |
| `string` + `format:datetime` | — | `InputDateTime` | DateTime picker |
| `string` + `format:password` | — | `InputPassword` | Password input |
| `object` | — | `FieldGroup` | Nested form section |
| `array` | — | `ArrayEditor` | List editor |

### 5.3 Custom Renderers

Users can register custom components for specific fields or types:

```svelte
<FormRenderer
  bind:data
  {schema}
  {layout}
  renderers={{
    'rating': RatingInput,
    'color-picker': ColorWheel,
    'address': AddressForm
  }}
/>
```

In the layout, specify which renderer to use:
```json
{ "scope": "#/rating", "renderer": "rating" }
```

### 5.4 Renderer Interface

All input components must implement a consistent interface:

```typescript
interface InputRendererProps {
  value: any              // bindable
  name: string            // field path
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  message?: ValidationMessage
  options?: any[]          // for select-like components
  fields?: object          // field mapping for options
  onchange?: (value: any) => void
  onblur?: () => void
}
```

## 6. Validation

### 6.1 Existing Utilities

`validation.js` provides:
- `validateField(value, schema, label)` — validates a single field
- `validateAll(data, schema, layout)` — validates all fields
- `createMessage(path, state, text)` — creates a validation message
- `patterns` — common regex patterns (email, phone, url, zipCode, creditCard)

### 6.2 Validation Triggers

| Trigger | When | Behavior |
|---------|------|----------|
| `onblur` | Field loses focus | Validate single field |
| `onchange` | Field value changes | Optional: validate on change (configurable) |
| `onsubmit` | Form submission | Validate all fields |
| Manual | Consumer calls `builder.validateAll()` | Validate all, return messages |

### 6.3 Validation Flow

```
Trigger (blur/change/submit)
  │
  ├── validateField(value, fieldSchema, label)
  │   ├── Required check
  │   ├── Type-specific checks (string, number, boolean)
  │   └── Returns ValidationMessage | null
  │
  ├── Async validation (if configured)
  │   ├── onvalidate callback fires: (fieldPath, value, trigger)
  │   └── Consumer calls builder.setFieldValidation(path, message) with result
  │
  ├── FormBuilder.#validation updated
  │   └── Injected into FormElement.props.message
  │
  └── InputField displays message with state icon
```

### 6.4 Async Validation

Support for async validation via hook:

```svelte
<FormRenderer
  bind:data
  {schema}
  {layout}
  onvalidate={async (path, value, trigger) => {
    if (path === 'username' && trigger === 'blur') {
      const available = await checkUsernameAvailability(value)
      return available
        ? null
        : { state: 'error', text: 'Username taken' }
    }
  }}
/>
```

### 6.5 Integrated Validation (Not Yet Implemented)

Currently validation exists as utility functions but is NOT wired into `FormRenderer`. What's needed:

- `FormRenderer` calls `validateField()` on blur automatically
- `FormBuilder` runs `validateAll()` when `builder.validate()` is called
- Validation messages flow to `InputField` via `FormElement.props.message`
- `builder.isValid` derived property (true when no errors)
- `builder.errors` derived property (array of all error messages)

### 6.6 ValidationReport Component

A standalone component that displays a summary of all validation errors/warnings. Previously existed as `archive/ui/src/ValidationReport.svelte`.

```
ValidationReport
├── items: Array<{ text: string, status: string, path?: string }>
├── icons: state icon mapping (error, warning, info, success)
├── onclick?: (path) => void  — click to focus the field
├── Data attributes: data-validation-report-root, data-validation-item, data-status
```

Usage:
```svelte
<ValidationReport items={builder.errors} onclick={(path) => focusField(path)} />
```

Features:
- Groups messages by severity (errors first, then warnings, then info)
- Click on a message to scroll to and focus the corresponding field
- Count badges: "3 errors, 1 warning"
- Collapsible sections by severity
- Can be placed above or beside the form

## 7. Lookup System

### 7.1 Current Implementation

`createLookup(config)` provides async option loading with:
- URL template with `{placeholder}` interpolation
- Dependency tracking: `dependsOn` specifies which fields trigger re-fetch
- Caching with configurable `cacheTime` (default: 5 minutes)
- Transform function for response data

### 7.2 Enhanced Data-Driven Lookups

The current lookup system is URL-template based. Enhance to support a more flexible data-driven pattern:

#### Fetch Hook Pattern

```svelte
<FormRenderer
  bind:data
  {schema}
  {layout}
  lookups={{
    city: {
      dependsOn: ['country'],
      fetch: async (formData) => {
        if (!formData.country) return []
        return await api.getCities(formData.country)
      },
      fields: { text: 'name', value: 'id' },
      cacheKey: (formData) => `cities-${formData.country}`
    },
    state: {
      dependsOn: ['country'],
      fetch: async (formData) => api.getStates(formData.country),
      fields: { text: 'name', value: 'code' }
    }
  }}
/>
```

#### Filter Hook Pattern

For client-side filtering of pre-loaded data:

```svelte
<FormRenderer
  lookups={{
    city: {
      dependsOn: ['country', 'state'],
      source: allCities,
      filter: (cities, formData) =>
        cities.filter(c =>
          c.country === formData.country &&
          c.state === formData.state
        ),
      fields: { text: 'name', value: 'id' }
    }
  }}
/>
```

### 7.3 Cascading Dependencies

Fields disable until their dependencies have values:

```
country: [] → loaded on mount
  ↓ (user selects "USA")
state: [disabled] → fetches states for USA → [enabled, populated]
  ↓ (user selects "California")
city: [disabled] → fetches cities for California → [enabled, populated]
```

- Dependent fields show as disabled with placeholder "Select {dependency} first"
- When a dependency changes, dependent field value is cleared
- Loading spinner shown while fetching
- Error state shown if fetch fails

### 7.4 FormBuilder Lookup Integration

```javascript
FormBuilder {
  // Existing
  hasLookup(path)
  getLookupState(path)       // { options, loading, error, fields }
  initializeLookups()

  // Enhanced
  setLookups(configs)        // accepts both URL and hook patterns
  refreshLookup(path)        // manually refresh a specific lookup
  isFieldDisabled(path)      // true if dependencies not satisfied
}
```

## 8. Form Elements

### 8.1 FormElement Structure

```
FormElement {
  scope: string        // JSON Pointer path ('#/fieldName')
  type: string         // Input type or 'separator', 'info', 'group'
  value: any           // Current value from data
  override: boolean    // Use custom snippet
  props: {
    label, description, placeholder,
    required, min, max, pattern,
    message: { state, text },
    options: any[],
    fields: object,
    type: string,
    renderer: string,      // component override
    disabled: boolean,     // from lookup dependencies
    loading: boolean,      // from lookup fetch state
    readonly: boolean,
    audit: boolean,
    generated: boolean
  }
}
```

### 8.2 Type Mapping

| Schema Type | Conditions | Input Type |
|-------------|-----------|------------|
| `string` | default | `text` |
| `string` | has `enum`/`options` | `select` (or per `renderer` hint) |
| `string` | `format: 'email'` | `email` |
| `string` | `format: 'url'` | `url` |
| `string` | `format: 'phone'` | `tel` |
| `string` | `format: 'color'` | `color` |
| `string` | `format: 'date'` | `date` |
| `string` | `format: 'datetime'` | `datetime-local` |
| `string` | `format: 'password'` | `password` |
| `string` | `format: 'textarea'` | `textarea` |
| `number` | default | `number` |
| `number`/`integer` | has `min` + `max` | `range` |
| `integer` | default | `number` (step=1) |
| `boolean` | default | `checkbox` (or `switch`/`toggle` per hint) |
| `object` | — | `group` (nested) |
| `array` | — | `array` (list editor) |
| readonly | — | `info` |

## 9. Input Components

### 9.1 Available Input Types

| Component | Type | Features |
|-----------|------|----------|
| `InputText` | text | `bind:value`, onchange, placeholder, maxlength, minlength, pattern |
| `InputNumber` | number | `bind:value`, min, max, step |
| `InputEmail` | email | `bind:value`, autocomplete |
| `InputPassword` | password | `bind:value`, autocomplete |
| `InputTel` | tel | `bind:value` |
| `InputUrl` | url | `bind:value` |
| `InputColor` | color | `bind:value` |
| `InputDate` | date | `bind:value`, min, max |
| `InputDateTime` | datetime-local | `bind:value` |
| `InputTime` | time | `bind:value` |
| `InputMonth` | month | `bind:value` |
| `InputWeek` | week | `bind:value` |
| `InputRange` | range | `bind:value`, min, max, step |
| `InputTextArea` | textarea | `bind:value`, rows, maxlength |
| `InputFile` | file | `bind:value`, accept, multiple |
| `InputCheckbox` | checkbox | `bind:value` (boolean) |
| `InputRadio` | radio | `bind:value`, options |
| `InputSelect` | select | Wraps `@rokkit/ui` `Select`, options, fields, placeholder |
| `InputSwitch` | switch | **BROKEN** — needs redesign (backlog #1) |

### 9.2 New Components Needed

| Component | Type | Purpose |
|-----------|------|---------|
| `InputToggle` | toggle | Option toggle group for enums or booleans |
| `InputMenu` | menu | Menu-based selection for enums |
| `FieldGroup` | group | Nested form section for `type: 'object'` |
| `ArrayEditor` | array | List editor for `type: 'array'` with add/remove |

### 9.3 InputSelect Integration

`InputSelect` bridges forms to `@rokkit/ui`:
- Wraps the `Select` component from `@rokkit/ui`
- Handles empty-option filtering (empty string → placeholder)
- Passes field mapping and options through
- Receives `options` from lookup system when configured

## 10. Master-Detail View

### 10.1 Overview

A two-column layout component for editing collections of records:

```
┌──────────────────────────────────────────────────────┐
│ SearchFilter                          [+ Add]        │
├─────────────────┬────────────────────────────────────┤
│                 │                                    │
│  List           │  Detail Form                       │
│  ├ Alice ◄──────│  Name: [Alice Smith    ]           │
│  ├ Bob          │  Age:  [28             ]           │
│  ├ Charlie      │  City: [Boston         ]           │
│  └ Dave         │                                    │
│                 │  [Save] [Delete] [Cancel]          │
│                 │                                    │
├─────────────────┴────────────────────────────────────┤
│ Showing 4 of 50                              Page 1  │
└──────────────────────────────────────────────────────┘
```

### 10.2 Requirements

- **Search**: `SearchFilter` component at top of list column
- **List**: Scrollable list with selection highlight
- **Detail**: `FormRenderer` showing selected record's fields
- **CRUD operations**:
  - **Add**: Button to create new record (empty form or with defaults from schema)
  - **Edit**: Click list item to edit in detail panel
  - **Delete**: Delete button with confirmation
  - **Save**: Save changes (calls `onsave` callback)
- **Dirty tracking**: Warn on navigation away with unsaved changes
- **Validation**: Validate before save, show `ValidationReport`
- **Pagination**: Optional pagination for large lists

### 10.3 Props

```typescript
interface MasterDetailProps {
  items: any[]                    // bindable — the collection
  schema?: object                 // JSON Schema for items
  layout?: object                 // Layout for detail form
  fields?: object                 // Field mapping for list display
  value?: any                     // bindable — currently selected item

  // CRUD callbacks
  onsave?: (item: any, isNew: boolean) => Promise<void>
  ondelete?: (item: any) => Promise<void>
  onadd?: () => any               // returns default item for new record

  // Configuration
  searchable?: boolean            // show search filter (default: true)
  editable?: boolean              // allow editing (default: true)
  addable?: boolean               // show add button (default: true)
  deletable?: boolean             // show delete button (default: true)

  // Pagination
  pageSize?: number
  onloadmore?: (params) => Promise<{ hasMore }>

  // Lookups and renderers
  lookups?: object
  renderers?: object

  // Snippets
  listItem?: Snippet
  detail?: Snippet
  toolbar?: Snippet
}
```

### 10.4 Column Metadata for Audit/System Fields

Some fields in a record are not user-editable:

| Metadata Flag | Behavior |
|---------------|----------|
| `audit: true` | Display as read-only in detail, exclude from add form (e.g., `created_at`, `updated_by`) |
| `generated: true` | Display as read-only, exclude from add form (e.g., `id`, `uuid`) |
| `hidden: true` | Not shown in form at all |

Schema example:
```json
{
  "properties": {
    "id": { "type": "integer", "generated": true },
    "name": { "type": "string", "required": true },
    "created_at": { "type": "string", "format": "datetime", "audit": true },
    "updated_by": { "type": "string", "audit": true }
  }
}
```

## 11. Semantic Command Input

### 11.1 Overview

A natural-language-like command input where users type intentions and the system interprets them into data operations:

```
┌─────────────────────────────────────────────────────┐
│ > find customers by name john doe                    │
├─────────────────────────────────────────────────────┤
│ Name        │ City    │ Status  │ Actions            │
│ John Doe    │ Boston  │ Active  │ [Edit] [Delete]    │
│ John Doe Jr │ Seattle │ Pending │ [Edit] [Delete]    │
├─────────────────────────────────────────────────────┤
│ > edit row 1                                         │
├─────────────────────────────────────────────────────┤
│ Name: [John Doe       ]                              │
│ City: [Boston          ]                             │
│ Status: [Active  ▼]                                  │
│ [Save] [Cancel]                                      │
└─────────────────────────────────────────────────────┘
```

### 11.2 Command Grammar

```
<command> ::= <query> | <action>

<query>   ::= "find" <entity> ["by" <field> <value>]
            | "show" <entity> ["where" <filter>]
            | "list" <entity> [<filter>]

<action>  ::= "edit" ["row"] <index>
            | "add" <entity>
            | "delete" ["row"] <index>
            | "save"
            | "cancel"

<filter>  ::= <field> <operator> <value> [<filter>]
```

### 11.3 Components

```
CommandInput
├── Text input with command parsing
├── Autocomplete/suggestions based on entity metadata
├── Command history (up/down arrow)
└── Emits structured command objects

CommandInterpreter
├── Receives command objects
├── Translates to data operations:
│   ├── query → fetch + filter → render Table
│   ├── edit → select row → render FormRenderer
│   ├── add → create empty → render FormRenderer
│   ├── delete → confirm + remove
│   └── save → validate + persist
└── Manages view state (table, form, loading)
```

### 11.4 Requirements

- **Entity metadata**: Know available entities, their fields, and data types
- **Backend hooks**: `onfetch`, `onsave`, `ondelete` callbacks for data operations
- **Schema awareness**: Auto-derive form from entity schema
- **Audit columns**: `id`, `created_at`, `updated_by` handled automatically
- **View transitions**: Smooth transitions between table view and edit form
- **Command suggestions**: Autocomplete entity names, field names, operators
- **Error handling**: Friendly message with suggestions for invalid commands

### 11.5 Scope

This is a **future phase** component that builds on:
1. `FormRenderer` (for edit/add forms)
2. `Table` component (for query results)
3. `SearchFilter` / `parseFilters` (for query parsing — already handles filter syntax)
4. `ValidationReport` (for save validation)
5. Entity metadata schema

## 12. FormRenderer Component

### 12.1 Props

| Prop | Type | Bindable | Description |
|------|------|----------|-------------|
| `data` | `Object` | Yes | Form data |
| `schema` | `Object` | No | JSON Schema |
| `layout` | `Object` | No | Layout definition |
| `renderers` | `Record<string, Component>` | No | Custom type renderer registry |
| `lookups` | `Record<string, LookupConfig>` | No | Lookup configurations |
| `validateOn` | `'blur' \| 'change' \| 'submit'` | No | Validation trigger (default: `'blur'`) |
| `onupdate` | callback | No | Fires on any field change |
| `onvalidate` | callback | No | Async validation hook |
| `onsubmit` | callback | No | Form submission handler |
| `className` | `string` | No | CSS class |
| `child` | Snippet | No | Custom rendering for override elements |

### 12.2 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-form-root` | root `<div>` | Form container |
| `data-form-separator` | `<div>` | Visual separator |
| `data-form-field` | `<div>` | Field wrapper |
| `data-scope` | field `<div>` | Field JSON Pointer path |
| `data-field-root` | InputField | Individual field container |
| `data-field-state` | InputField | Validation state |
| `data-field-type` | InputField | Input type |
| `data-field-required` | InputField | Required flag |
| `data-field-disabled` | InputField | Disabled flag |
| `data-field-empty` | InputField | Empty value |
| `data-field-dirty` | InputField | Modified from initial value |
| `data-has-icon` | InputField | Has icon |
| `data-input-root` | Input wrapper | Input container (non-checkbox) |
| `data-field-info` | InfoField | Read-only display |
| `data-validation-report-root` | ValidationReport | Report container |
| `data-validation-item` | ValidationReport item | Individual message |
| `data-status` | ValidationReport item | Message severity |

## 13. Dirty Tracking

### 13.1 Requirements

- Track which fields have been modified from their initial values
- `isDirty` property on `FormBuilder` — true if any field changed
- `dirtyFields` property — set of modified field paths
- `data-field-dirty` attribute on modified fields for styling
- `onDirtyChange` callback when dirty state changes
- `reset()` resets to initial values and clears dirty state

### 13.2 Usage

```svelte
<script>
  let builder = new FormBuilder(data, schema, layout)
</script>

{#if builder.isDirty}
  <div data-unsaved-warning>You have unsaved changes</div>
{/if}

<FormRenderer {builder} />

<button disabled={!builder.isDirty || !builder.isValid}>Save</button>
```

## 14. Form Submission

### 14.1 Requirements

- Optional `onsubmit` callback: `(data, { isValid, errors }) => Promise<void>`
- Validates all fields before submitting
- If validation fails, show errors and focus first error field
- Loading state while submit is in progress
- Success/error feedback after submission

### 14.2 Optional Submit/Reset Buttons

When `onsubmit` is provided, optionally render submit and reset buttons:
- Submit: disabled when form is invalid or not dirty
- Reset: restores initial values
- Custom button rendering via `actions` snippet

## 15. Dependencies

### Current system

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/data` | `typeOf` | Type inference for schema derivation |
| `@rokkit/core` | `isObject`, `toHyphenCase`, `defaultStateIcons` | Type checking, name conversion, validation icons |
| `@rokkit/ui` | `Select`, `List`, `Tree`, `SearchFilter` | InputSelect, MasterDetail, NestedEditor |
| `@rokkit/data` | `parseFilters`, `filterData` | MasterDetail search/filter |
| `ramda` | `pick`, `omit`, `isNil` | Object utilities |

### New dependencies needed

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/ui` | `Table` | Semantic command results display |
| `@rokkit/ui` | `ValidationReport` | Validation error summary |

## 16. Gaps Summary

| # | Gap | Priority | Status |
|---|-----|----------|--------|
| 1 | FormBuilder recreated on every render | High | Identified, design proposed |
| 2 | Validation not wired into FormRenderer | High | Utilities exist, need integration |
| 3 | Legacy components not migrated | High | Blocks nested form editing |
| 4 | Value binding bug in inputs | High | See backlog #7 |
| 5 | Custom type renderer registry | Medium | No registry, hardcoded type map |
| 6 | Cascading lookup integration | Medium | Lookup exists but not in FormRenderer |
| 7 | InputSwitch broken | Medium | See backlog #1 |
| 8 | InputToggle component missing | Medium | No option-set toggle component |
| 9 | ValidationReport not migrated | Medium | Archived, needs migration |
| 10 | Async validation | Medium | Manual workaround exists |
| 11 | Dirty tracking | Medium | Not implemented |
| 12 | Nested form rendering (object/array) | Medium | Legacy only |
| 13 | Form submission handling | Low | Consumer handles externally |
| 14 | Master-detail view | Low | Legacy ListEditor, needs rewrite |
| 15 | Semantic command input | Future | Not started, depends on Table + Form |
| 16 | ramda dependency | Low | Could be removed |

## 17. Non-Goals (Future Phases)

- Drag-and-drop form builder (visual form designer)
- Multi-step wizard forms
- Conditional field visibility (show/hide based on other field values) — could be added to layout
- File upload with preview
- Rich text editor integration
