# Developer Utilities

Rokkit exposes the primitives it uses internally so developers can build their own components on top of the same foundation. State management, keyboard navigation, and interaction behaviors are all available as standalone packages. This makes it straightforward to create custom components that feel native to the library without reproducing its internals.

## Features

### ProxyItem — Field Access Abstraction

ProxyItem wraps any data item and provides a consistent interface for reading mapped fields. Custom components and snippets use it to access display values without knowing the underlying field names.

```gherkin
Feature: ProxyItem

  Scenario: Access mapped fields by semantic name
    Given an item and a field mapping configuration
    When a ProxyItem wraps the item
    Then proxy.label returns the value of the label field
    And proxy.value returns the value of the value field
    And proxy.icon returns the value of the icon field

  Scenario: Access any field by name
    Given a ProxyItem wrapping an item
    When proxy.get('rating') is called
    Then the value of the 'rating' field is returned
    And nested paths are resolved automatically

  Scenario: Check field presence
    Given a ProxyItem
    When proxy.has('badge') is called
    Then true is returned if the field exists and is non-null
    And false is returned if the field is absent or null
```

### List Controller

ListController manages selection, focus, and keyboard navigation state for flat lists. It provides a reactive state object that components and custom implementations can drive from.

```gherkin
Feature: List Controller

  Scenario: Controller tracks selection state
    Given a ListController initialized with items
    When an item is selected
    Then the controller's value state updates
    And the previously selected item is deselected

  Scenario: Controller tracks focused item
    Given a ListController with items
    When focus moves to an item
    Then the controller's focused index updates
    And the focused item can be activated

  Scenario: Controller supports multi-selection
    Given a ListController in multi-select mode
    When multiple items are activated
    Then all activated items are tracked in the selection state
    And individual items can be removed from the selection
```

### Nested Controller

NestedController extends ListController for hierarchical data. It manages expand/collapse state, parent-child relationships, and tree-specific navigation behaviors.

```gherkin
Feature: Nested Controller

  Scenario: Controller manages expand and collapse state
    Given a NestedController with a tree of items
    When a node is expanded
    Then its children become navigable
    When the node is collapsed
    Then its children are removed from navigation order

  Scenario: Navigation moves between visible nodes only
    Given a tree with some nodes collapsed
    When arrow key navigation occurs
    Then focus skips over items inside collapsed nodes
    And only currently visible items are reachable

  Scenario: Expanding a node moves focus into children
    Given a collapsed node with keyboard focus
    When ArrowRight is pressed to expand it
    Then the node expands
    And focus moves to the first child
```

### Navigator Action

The navigator action is a Svelte action that turns any container into a keyboard-navigable component. Components in the library use it internally, and it is available for custom components too.

```gherkin
Feature: Navigator Action

  Scenario: Container becomes keyboard navigable
    Given a custom container with focusable children
    When the navigator action is applied
    Then arrow keys move focus between children that have a data-path attribute
    And Enter or Space activates the focused child

  Scenario: Orientation configures navigation direction
    Given a container with navigator applied
    When orientation is set to 'vertical'
    Then Up/Down arrows navigate between children
    When orientation is set to 'horizontal'
    Then Left/Right arrows navigate between children

  Scenario: Non-focusable items are skipped
    Given a list with separator and spacer elements
    When navigating with arrow keys
    Then elements without a data-path attribute are skipped
    And focus moves directly to the next navigable item

  Scenario: Navigator emits selection events
    Given a container with navigator action
    When an item is activated via keyboard or click
    Then a selection event is dispatched with the item's path data
    And the host component can handle the event
```

### Interaction Actions

A collection of Svelte actions that add polished interaction behaviors to any element. These are independent of component selection or navigation logic.

```gherkin
Feature: Ripple Action

  Scenario: Ripple emits from click point
    Given an element with the ripple action applied
    When the user clicks the element
    Then a circular ripple animation expands from the click coordinates
    And fades out as it reaches the element boundary

  Scenario: Ripple works on keyboard activation
    Given an element with the ripple action
    When the user activates the element via Enter or Space
    Then the ripple animates from the center of the element
```

```gherkin
Feature: Hover Lift Action

  Scenario: Element lifts on hover
    Given an element with the hoverLift action
    When the cursor hovers over the element
    Then the element elevates with a shadow and slight scale
    And returns smoothly to its resting state on cursor leave
```

```gherkin
Feature: Magnetic Action

  Scenario: Element is attracted toward the cursor
    Given an element with the magnetic action
    When the cursor moves within the element's proximity zone
    Then the element shifts toward the cursor position
    And returns to its original position when the cursor leaves
```

```gherkin
Feature: Action Composition

  Scenario: Multiple actions on one element work independently
    Given an element with both ripple and hoverLift actions applied
    When the user hovers and then clicks
    Then the lift effect and ripple both respond correctly
    And neither action interferes with the other
```

### Custom Component Primitives

Rokkit's internal building blocks — controllers, navigator, proxy — are composable enough to build entirely custom components that integrate naturally into a Rokkit application.

```gherkin
Feature: Custom Component Authoring

  Scenario: Custom component uses ListController for state
    Given a developer building a custom card grid selector
    When they initialize a ListController with the grid's items
    Then selection, focus, and keyboard navigation are handled by the controller
    And the developer only writes the rendering layer

  Scenario: Custom component uses navigator for keyboard support
    Given a custom component with interactive items
    When the navigator action is applied to the container
    Then keyboard navigation works without additional event handling
    And the component passes accessibility requirements

  Scenario: Custom component uses ProxyItem for field access
    Given a custom component that receives items and a fields prop
    When rendering each item
    Then wrapping items in ProxyItem provides consistent field access
    And field mapping from the consumer is respected automatically
```

## Status

| Feature | Status |
|---------|--------|
| ProxyItem — field access abstraction | ✅ Implemented |
| ListController | ✅ Implemented |
| NestedController | ✅ Implemented |
| Navigator action | ✅ Implemented |
| Ripple action | ✅ Implemented |
| Hover lift action | ✅ Implemented |
| Magnetic action | ✅ Implemented |
| Action composition | ✅ Implemented |
| Custom component primitives (documented patterns) | 🔲 Planned |
