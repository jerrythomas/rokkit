# State Management

The @rokkit/states package provides state management primitives that help manage complex component state. These are used internally by components but can also be used directly for custom implementations.

## Features

### ProxyItem

A proxy wrapper that provides a consistent interface for accessing item data.

```gherkin
Feature: ProxyItem

  Scenario: Access fields consistently
    Given an item with various field names
    When creating a ProxyItem wrapper
    Then field access works via proxy.get('field')
    And the proxy handles field mapping internally

  Scenario: Proxy provides computed properties
    Given a ProxyItem wrapping an item
    Then proxy.label returns the display text
    And proxy.value returns the selection value
    And proxy.icon returns the icon class
```

### Wrapper State Management

Components use Wrapper to manage selection, focus, and data state.

```gherkin
Feature: Wrapper State

  Scenario: Selection state management
    Given a Wrapper with items
    When the user selects an item
    Then the Wrapper updates the selected value
    And the selection is available reactively

  Scenario: Focus tracking
    Given a Wrapper managing a list
    When keyboard navigation occurs
    Then the Wrapper tracks the focused index
    And focus state is available for rendering
```

### Controller Pattern

ListController and NestedController manage complex list behaviors.

```gherkin
Feature: List Controller

  Scenario: Managing flat list state
    Given a list of items
    When using ListController
    Then selection, focus, and navigation are handled
    And the controller provides reactive state

  Scenario: Managing nested/hierarchical state
    Given a tree structure with nested items
    When using NestedController
    Then expand/collapse state is managed
    And parent/child relationships are tracked
```

### Reactive Data Flow

State changes propagate reactively.

```gherkin
Feature: Reactive State Updates

  Scenario: Selection updates trigger reactivity
    Given a component with bound value
    When selection changes
    Then the bound value updates
    And the UI reflects the new state

  Scenario: Data changes trigger re-render
    Given a component with items prop
    When the items array changes
    Then the component re-renders with new data
```
