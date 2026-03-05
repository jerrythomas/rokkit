# Field Mapping

The field mapping system allows components to adapt to any data structure without modifying the source data. Developers map semantic roles (label, value, icon) to their data's field names.

## Features

### Default Field Conventions

Components use sensible defaults that match common data patterns.

```gherkin
Feature: Default Field Conventions

  Scenario: Component uses default field names
    Given data with standard field names
    When the component renders
    Then it uses 'text' for display labels
    And uses 'value' for selection identifiers
    And uses 'icon' for icons
    And uses 'children' for nested items
```

### Custom Field Mapping

Override defaults with any field names from the data.

```gherkin
Feature: Custom Field Mapping

  Scenario: Developer maps custom fields
    Given data with fields 'userName', 'userId', 'avatarUrl'
    When configuring the component with fields mapping
    Then the component reads 'userName' for labels
    And reads 'userId' for values
    And reads 'avatarUrl' for icons

  Scenario: Mapping preserves original data
    Given field mapping is applied
    When the component emits selection events
    Then the callback receives the original item
    And field mapping only affects display, not data
```

### Nested Field Access

Access deeply nested properties in data structures.

```gherkin
Feature: Nested Field Access

  Scenario: Access nested fields
    Given data with nested objects like 'profile.name'
    When field mapping points to nested path
    Then the component resolves the nested value
    And renders using that value
```

### Per-Item Field Overrides

Different items can use different field mappings.

```gherkin
Feature: Per-Item Field Mapping

  Scenario: Mixed data sources with consistent display
    Given items from different sources with different field names
    When using the fields property
    Then each item is mapped according to its type
    And the component renders uniformly
```
