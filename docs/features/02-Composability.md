# Composability

Every component in Rokkit can be extended without modification. Snippets replace any part of the default rendering — a single item, a section header, an empty state — while the component continues to handle selection, navigation, and state. Developers get full control over visuals without giving up built-in behavior.

## Features

### Custom Item Rendering

The default item render can be replaced with any markup. The snippet receives the item's data, so custom renders have full access to every field.

```gherkin
Feature: Custom Item Rendering

  Scenario: Snippet replaces default item layout
    Given a List component with an itemContent snippet
    When the list renders
    Then each item uses the custom snippet
    And the component's selection and keyboard behavior is unchanged

  Scenario: Snippet receives item data
    Given an itemContent snippet
    When the snippet renders for an item
    Then it receives the item's data
    And can access any field by name
    And can call proxy methods for mapped field access
```

### Named Snippets for Mixed Item Types

A list can contain items of different visual types. Each item names the snippet it should use, and the component dispatches rendering accordingly.

```gherkin
Feature: Named Snippets

  Scenario: Items route to different snippets
    Given a list where items have a 'snippet' field set to 'card', 'header', or 'divider'
    When the list renders
    Then each item is rendered by its matching named snippet
    And items without a snippet field use the default itemContent snippet

  Scenario: Fallback to default when snippet name is absent
    Given a list mixing named and unnamed items
    When rendering
    Then unnamed items fall back to the default snippet
    And no errors occur for items with unknown snippet names
```

### Partial Snippet Overrides

Snippets target specific parts of a component. Replacing one part does not affect others. Developers replace only what they need to customize.

```gherkin
Feature: Partial Snippet Overrides

  Scenario: Override only item triggers in Tabs
    Given a Tabs component with a tabItem snippet
    When the component renders
    Then only the tab trigger uses the custom snippet
    And panel content uses the default rendering

  Scenario: Override only panel content in Tabs
    Given a Tabs component with a tabPanel snippet
    When the component renders
    Then only the panel body uses the custom snippet
    And tab triggers use the default rendering

  Scenario: Override group headers in a grouped list
    Given a List with grouped items and a groupHeader snippet
    When the component renders
    Then group headings use the custom snippet
    And individual items use their own snippet or the default
```

### Empty State Snippets

When a component has no items to display, a custom snippet can provide meaningful feedback — an illustration, a message, or an action to add the first item.

```gherkin
Feature: Empty State Rendering

  Scenario: Component renders custom empty state
    Given a component with no items and an empty snippet
    When the component renders
    Then the empty snippet is displayed
    And the default empty behavior is suppressed

  Scenario: Empty state includes a call to action
    Given an empty snippet with an "Add item" button
    When the user clicks the button
    Then the application can respond with custom logic
    And the component provides no interference
```

### Snippet Data Access via Proxy

Snippets receive a ProxyItem that abstracts field mapping. Custom renders work with mapped values without needing to know the underlying field names.

```gherkin
Feature: Snippet Data Access

  Scenario: Proxy exposes mapped fields
    Given a snippet rendering a list item
    When the snippet accesses proxy.label
    Then it gets the value of whichever field is mapped to text
    When it accesses proxy.value
    Then it gets the value of whichever field is mapped to value

  Scenario: Proxy supports arbitrary field access
    Given a snippet that needs a custom field
    When the snippet calls proxy.get('rating')
    Then it receives the item's 'rating' field value
    When it calls proxy.has('badge')
    Then it receives true or false depending on field presence

  Scenario: Proxy receives the field configuration
    Given a snippet in a component with custom fields
    When the snippet renders
    Then it has access to the fields config
    And can use it to drive custom conditional logic
```

### Icon Overrides

The icon displayed alongside items can be replaced with any custom icon set. This allows the library to conform to an application's branding without component changes.

```gherkin
Feature: Icon Overrides

  Scenario: Replace default icons with custom icons
    Given an application with its own icon system
    When an icon snippet is provided to the component
    Then all icons render using the custom snippet
    And the default icon rendering is fully replaced

  Scenario: Icon varies per item
    Given items with different icon values
    When the custom icon snippet renders
    Then it receives the item's icon value
    And can resolve it to the correct custom icon
```

## Status

| Feature | Status |
|---------|--------|
| Custom item rendering via snippets | ✅ Implemented |
| Named snippets for mixed item types | ✅ Implemented |
| Partial snippet overrides | ✅ Implemented |
| Empty state snippets | ✅ Implemented |
| Snippet data access via ProxyItem | ✅ Implemented |
| Icon overrides | ✅ Implemented |
