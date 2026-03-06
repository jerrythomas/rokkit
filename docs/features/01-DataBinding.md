# Data Binding

Components should work with data the way it arrives — from an API, a database, or local state. Rokkit's data binding layer means developers never write transformation code just to feed a component. Field mapping, nested resolution, and a consistent API across all selection components are the foundation everything else builds on.

## Features

### Default Field Conventions

Components have sensible defaults that match the most common data patterns. For simple cases no configuration is needed at all.

```gherkin
Feature: Default Field Conventions

  Scenario: Component renders with standard field names
    Given an array of objects with fields named 'text' and 'value'
    When passed to any Rokkit selection component
    Then items render without any configuration
    And 'text' is used as the display label
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
    When the component is configured with fields = { text: 'fullName', value: 'userId' }
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
    When fields = { text: 'profile.name' } is configured
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

| Feature | Status |
|---------|--------|
| Default field conventions (`text`, `value`, `icon`, `children`) | ✅ Implemented |
| Custom field mapping | ✅ Implemented |
| Nested field access via dot paths | ✅ Implemented |
| Per-item field overrides | ✅ Implemented |
| No data transformation required | ✅ Implemented |
| Consistent component API | ✅ Implemented |
