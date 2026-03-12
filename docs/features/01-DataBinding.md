# Data Binding

Components should work with data the way it arrives — from an API, a database, or local state. Rokkit's data binding layer means developers never write transformation code just to feed a component. Field mapping, nested resolution, and a consistent API across all selection components are the foundation everything else builds on.

## Features

### Default Field Conventions

Components have sensible defaults that match the most common data patterns. For simple cases no configuration is needed at all.

```gherkin
Feature: Default Field Conventions

  Scenario: Component renders with standard field names
    Given an array of objects with fields named 'label' and 'value'
    When passed to any Rokkit selection component
    Then items render without any configuration
    And 'label' is used as the display label
    And 'value' is used as the selection identifier

  Scenario: Icon and children fields work by default
    Given data with 'icon' or 'children' fields
    When passed to a component that supports icons or nesting
    Then icons display and nested items expand
    Without any explicit field mapping
```

### Custom Field Mapping

When data uses different field names, a `fields` prop maps semantic roles to actual field names. The data is never modified.

```gherkin
Feature: Custom Field Mapping

  Scenario: Developer maps display and value fields
    Given items with fields 'fullName' and 'userId'
    When the component is configured with fields = { label: 'fullName', value: 'userId' }
    Then 'fullName' is used as the display label
    And 'userId' is used as the selection identifier

  Scenario: Icon field mapped to a custom field
    Given items with an 'avatarUrl' field
    When fields = { icon: 'avatarUrl' } is configured
    Then the component displays the avatar as the item icon

  Scenario: Original data is preserved
    Given a component with custom field mapping
    When the user selects an item
    Then the full original item is returned in the selection event
    And field mapping only affects display, not data shape
```

### Nested Field Access

Field paths can traverse nested objects using dot notation. No need to flatten data before passing it to a component.

```gherkin
Feature: Nested Field Access

  Scenario: Dot path resolves nested value
    Given items with a nested field like { profile: { name: 'Alice' } }
    When fields = { label: 'profile.name' } is configured
    Then the component displays 'Alice' as the label

  Scenario: Multiple levels of nesting
    Given data nested several levels deep
    When the field path reflects the full depth
    Then the value is resolved correctly at any depth

  Scenario: Missing nested field is handled gracefully
    Given an item where the nested path does not exist
    When the component renders
    Then the field renders empty without errors
```

### Computed Field Mapping

Field values can be functions instead of strings. This enables on-the-fly transformations — combining fields, formatting numbers, deriving display text from any logic — without a preprocessing step or a separate view-model layer.

```gherkin
Feature: Computed Field Mapping

  Scenario: Function combines multiple source fields into one display value
    Given items with 'firstName' and 'lastName' fields
    When fields = { text: (item) => `${item.firstName} ${item.lastName}` }
    Then the component displays the full name as a single label
    And no data transformation is needed before passing items

  Scenario: Function applies a format from the data package
    Given items with a 'price' field containing numeric values
    When fields = { text: (item) => formatCurrency(item.price, 'USD') }
    Then items display formatted currency strings
    And the raw numeric value is preserved for selection and events

  Scenario: Function derives a transformed identifier
    Given items with a 'slug' field
    When fields = { value: (item) => `doc:${item.slug}` }
    Then the selection value uses the prefixed form
    And the original item is still returned in selection events

  Scenario: String and function mappings coexist
    Given a fields object mixing string paths and functions
    When { text: (item) => item.title.toUpperCase(), value: 'id' }
    Then function fields are called per item
    And string fields resolve by path as usual
    And both work identically from the snippet's perspective

  Scenario: Proxy normalises all field definitions to the same interface
    Given any field definition — string path or function
    When accessed via proxy.label or proxy.get('field')
    Then the call site does not need to distinguish between types
    And the result is always the resolved value
```

### Per-Item Field Overrides

Individual items can specify alternative rendering by including a field that names a snippet or provides a different display value. This enables mixed-type lists without multiple components.

```gherkin
Feature: Per-Item Field Overrides

  Scenario: Item opts into a named snippet
    Given a list where some items have a 'snippet' field
    When the component renders
    Then items with a snippet field use that named snippet
    And items without use the default rendering

  Scenario: Mixed item types in one list
    Given a list mixing headers, items, and dividers
    When each item's 'snippet' field identifies its type
    Then each type renders differently in the same component
```

### Consistent Component API

All selection components share the same props and callback conventions. Learning one component transfers directly to all others.

```gherkin
Feature: Consistent Component API

  Scenario: Standard props work the same across components
    Given any selection component — List, Select, Tree, MultiSelect
    Then it accepts an 'items' prop for the data array
    And a 'bind:value' prop for two-way selection binding
    And a 'fields' prop for field mapping
    And an 'onchange' callback for selection events

  Scenario: Selection events return consistent data
    Given any selection component
    When the user selects an item
    Then the event provides the selected item
    And the event provides the resolved display value
    And the event provides the raw underlying value

  Scenario: Empty and loading states are uniform
    Given any component with no items
    Then an empty state can be provided via snippet
    And the component renders gracefully with zero items
```

## Status

| Feature                                                         | Status         |
| --------------------------------------------------------------- | -------------- |
| Default field conventions (`text`, `value`, `icon`, `children`) | ✅ Implemented |
| Custom field mapping                                            | ✅ Implemented |
| Nested field access via dot paths                               | ✅ Implemented |
| Computed field mapping (function values)                        | 🔲 Planned     |
| Per-item field overrides                                        | ✅ Implemented |
| No data transformation required                                 | ✅ Implemented |
| Consistent component API                                        | ✅ Implemented |
