# Component Library

Rokkit provides a large, cohesive set of pre-built components covering selection, navigation, input, overlay, layout, and display needs. Every component follows the same API conventions, works with field mapping, supports snippets, and inherits theming automatically. Picking up a new component from the library requires minimal learning.

## Features

### Selection Components

Components for presenting lists of data and capturing user selection. All support field mapping, keyboard navigation, and snippet-based customization.

```gherkin
Feature: Selection Components

  Scenario: List renders items and captures selection
    Given a List component with an items array
    When the user clicks or keyboards to an item
    Then the item is selected and the value binding updates

  Scenario: Select renders as a dropdown
    Given a Select component
    When the user opens the dropdown and picks an item
    Then the dropdown closes and the selected value is bound

  Scenario: MultiSelect captures multiple selections
    Given a MultiSelect component
    When the user picks multiple items
    Then all selected values are maintained in an array binding
    And each selection can be individually removed

  Scenario: Tree renders hierarchical data
    Given a Tree component with nested items
    When the user expands a node
    Then child items become visible
    And the node's expanded state is tracked

  Scenario: Toggle renders a set of exclusive options
    Given a Toggle component with options
    When the user activates an option
    Then that option is selected exclusively
    And the previous selection is cleared
```

### Navigation Components

Components for moving between views, sections, and actions within an application.

```gherkin
Feature: Navigation Components

  Scenario: Tabs switch between panels
    Given a Tabs component with labeled panels
    When the user clicks a tab or navigates with arrow keys
    Then the corresponding panel becomes active
    And inactive panels are hidden

  Scenario: Menu presents a list of actions
    Given a Menu component triggered by a button
    When the user opens the menu and selects an item
    Then the action associated with that item fires
    And the menu closes

  Scenario: Toolbar arranges a row of actions
    Given a Toolbar component with action items
    When the user navigates with arrow keys
    Then focus moves between toolbar items
    And activating an item triggers its action

  Scenario: Breadcrumb shows navigation path
    Given a Breadcrumb component with a path array
    When rendered
    Then each path segment is a navigable link
    And the current location is indicated
```

### Input Components

Primitive input controls that participate in form bindings and follow accessible patterns.

```gherkin
Feature: Input Components

  Scenario: Text Input captures freeform text
    Given an Input component
    When the user types
    Then the value binding updates on each keystroke or on blur

  Scenario: Checkbox captures boolean state
    Given a Checkbox component
    When the user clicks or presses Space
    Then the checked state toggles

  Scenario: Toggle Switch captures on/off state
    Given a Switch component
    When the user activates it
    Then the on/off state flips and the binding updates

  Scenario: Input supports validation feedback
    Given an Input with a validation state
    When the state is 'error'
    Then the input renders with error styling and an error message
    When the state is 'success'
    Then the input renders with success styling
```

### Overlay Components

Components that layer content above the page — dropdowns, popovers, and dialogs. All manage focus trapping, escape key handling, and click-outside dismissal.

```gherkin
Feature: Overlay Components

  Scenario: Dropdown positions content relative to a trigger
    Given a Dropdown component with a trigger element
    When the trigger is activated
    Then the dropdown panel opens adjacent to the trigger
    And closes on Escape or click outside

  Scenario: Popover shows contextual content
    Given a Popover component
    When the user triggers it
    Then a floating panel appears with arbitrary content
    And focus moves into the popover

  Scenario: Overlay placement adapts to available space
    Given an overlay that would overflow the viewport
    When the overlay opens
    Then its position flips or shifts to remain fully visible
```

### Card Components

Cards present grouped content with a consistent visual container. They support interactive states for clickable cards and can host any content via snippets.

```gherkin
Feature: Card Components

  Scenario: Card displays grouped content
    Given a Card component with content
    When rendered
    Then the content is visually contained within the card surface

  Scenario: Interactive card responds to selection
    Given a Card component that is selectable
    When the user clicks or presses Enter on the card
    Then the card enters a selected state
    And the selection event fires

  Scenario: Card content is customized via snippets
    Given a Card component with a custom snippet
    When rendered
    Then the snippet defines the card's internal layout
    And the card's container, elevation, and state styling are preserved
```

### Layout Components

Structural components for organizing content on the page. They provide responsive, consistent spatial arrangements without prescribing visual style.

```gherkin
Feature: Layout Components

  Scenario: Stack arranges children vertically or horizontally
    Given a Stack component with child elements
    When rendered
    Then children are arranged with consistent spacing
    And the orientation and gap are configurable

  Scenario: Grid arranges children in a responsive grid
    Given a Grid component with child elements
    When the viewport changes
    Then the column count adjusts to available width
    And items reflow without layout breakage

  Scenario: Divider separates content sections
    Given a Divider component between content sections
    When rendered
    Then a visual separator appears
    And can be oriented horizontally or vertically
```

### Consistent API Across Components

Every component in the library shares the same foundational props and callback conventions. Developers familiar with one component can adopt any other with minimal ramp-up.

```gherkin
Feature: Consistent Component API

  Scenario: Selection props are uniform
    Given any selection component
    Then it accepts 'items' for data, 'bind:value' for selection, 'fields' for mapping, and 'onchange' for events

  Scenario: Theming applies without configuration
    Given any component in a themed application
    When rendered
    Then it inherits the active theme
    And requires no per-component theme setup

  Scenario: Snippets are available on all components
    Given any component
    Then it accepts snippets for customizing relevant parts of its rendering
    And custom snippets do not affect the component's behavior
```

## Status

| Feature                        | Status         |
| ------------------------------ | -------------- |
| Selection: List                | ✅ Implemented |
| Selection: Select              | ✅ Implemented |
| Selection: MultiSelect         | ✅ Implemented |
| Selection: Tree                | ✅ Implemented |
| Selection: Toggle              | ✅ Implemented |
| Navigation: Tabs               | ✅ Implemented |
| Navigation: Menu               | ✅ Implemented |
| Navigation: Toolbar            | ✅ Implemented |
| Navigation: Breadcrumb         | 🔲 Planned     |
| Input: Text Input              | ✅ Implemented |
| Input: Checkbox                | ✅ Implemented |
| Input: Toggle Switch           | ✅ Implemented |
| Overlay: Dropdown              | ✅ Implemented |
| Overlay: Popover               | ✅ Implemented |
| Cards                          | 🚧 In Progress |
| Layout: Stack / Grid / Divider | 🔲 Planned     |
| Data Table                     | 🔲 Planned     |
