# Composable Snippets

Rokkit components are extensible through snippets without modifying component source code. Any part of the UI can be replaced with custom rendering while preserving the underlying behavior.

## Features

### Per-Item Custom Rendering

Override how individual items appear in any component.

```gherkin
Feature: Per-Item Snippets

  Scenario: Custom item content
    Given a list component with items
    When providing an itemContent snippet
    Then each item renders using the custom snippet
    And the snippet receives the item data and helpers

  Scenario: Item uses proxy for field access
    Given an item in a custom snippet
    When accessing item properties
    Then the snippet receives a ProxyItem
    And can call proxy.get('field') for any field
```

### Named Snippets

Different items can use different rendering patterns.

```gherkin
Feature: Named Snippets

  Scenario: Items specify snippet by name
    Given items with different types
    When each item has a 'snippet' field
    Then the matching named snippet renders
    And mixed item types display differently

  Scenario: Fallback to default snippet
    Given an item without a snippet field
    When rendering
    Then the default itemContent snippet is used
```

### Partial Snippet Overrides

Replace only specific parts of a component.

```gherkin
Feature: Partial Snippet Overrides

  Scenario: Override only item rendering
    Given a component like Tabs
    When providing a tabItem snippet
    Then only the trigger rendering changes
    And panel content uses default rendering

  Scenario: Override only panel content
    Given a Tabs component
    When providing a tabPanel snippet
    Then only the panel rendering changes
    And triggers use default rendering
```

### Snippet Data Access

Snippets receive comprehensive data and helpers.

```gherkin
Feature: Snippet Data Access

  Scenario: Snippet receives proxy with methods
    Given an item in a snippet
    When the snippet renders
    Then it receives proxy.label for display text
    And proxy.value for the item value
    And proxy.get('fieldName') for any field
    And proxy.has('fieldName') to check field existence

  Scenario: Snippet receives field mapping
    Given a component with custom fields
    When the snippet renders
    Then it receives the fields configuration
    And can use them for custom rendering logic
```

### Empty State Snippets

Custom rendering when no data is present.

```gherkin
Feature: Empty State Rendering

  Scenario: Component shows empty state
    Given a component with no items
    When rendering
    Then an empty snippet can be rendered
    And shows meaningful message to user

  Scenario: Empty state with action
    Given an empty component with empty snippet
    When the snippet renders
    Then it can include action buttons
    And users can add items
```
