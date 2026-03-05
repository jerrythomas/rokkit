# Accessibility

Rokkit components provide built-in keyboard navigation and ARIA support. Components follow WAI-ARIA patterns, making them accessible without additional configuration.

## Features

### Keyboard Navigation

All interactive components support keyboard interaction.

```gherkin
Feature: Keyboard Navigation

  Scenario: Arrow key navigation in list
    Given a List component with focus
    When pressing ArrowDown
    Then focus moves to the next item

  Scenario: Arrow key navigation in tree
    Given a Tree component with focus
    When pressing ArrowRight on a collapsed node
    Then the node expands
    And focus moves to first child

  Scenario: Home and End keys
    Given a component with keyboard focus
    When pressing Home
    Then focus moves to first item
    When pressing End
    Then focus moves to last item
```

### Selection via Keyboard

Items can be selected using keyboard.

```gherkin
Feature: Keyboard Selection

  Scenario: Select with Enter or Space
    Given an item has keyboard focus
    When pressing Enter or Space
    Then the item is selected
    And selection events fire

  Scenario: Toggle with keyboard
    Given a Toggle or Switch component
    When pressing Enter or Space
    Then the selection toggles
```

### Focus Management

Components manage focus appropriately.

```gherkin
Feature: Focus Management

  Scenario: Focus moves to component on mount
    Given a component receives focus
    Then focus is set to the appropriate element
    And the component is ready for keyboard interaction

  Scenario: Focus trapped in overlays
    Given a dropdown or modal is open
    When tabbing through focusable elements
    Then focus stays within the overlay
    And pressing Escape closes the overlay
```

### ARIA Attributes

Components expose appropriate ARIA attributes.

```gherkin
Feature: ARIA Attributes

  Scenario: List announces as listbox
    Given a List component
    Then it has role="listbox"
    And items have role="option"

  Scenario: Selected state is announced
    Given an item is selected
    Then aria-selected="true" is set
    And screen readers announce the selection

  Scenario: Expanded state is announced
    Given a collapsible section or tree node
    When expanded
    Then aria-expanded="true" is set
    And screen readers announce the state change
```

### Screen Reader Support

Components provide appropriate labels and descriptions.

```gherkin
Feature: Screen Reader Support

  Scenario: Component has accessible name
    Given a component
    Then it has aria-label or aria-labelledby
    And screen readers announce the component purpose

  Scenario: Disabled state is announced
    Given a disabled item
    Then aria-disabled="true" is set
    And screen readers indicate the item is disabled
```
