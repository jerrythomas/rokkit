# Accessibility & Internationalization

Every Rokkit component is keyboard operable and screen reader compatible out of the box. Developers do not wire up event handlers or add ARIA attributes manually — the library handles it. The same philosophy extends to internationalization: text, labels, and date formats should adapt to the user's language and locale without per-component configuration.

## Features

### Keyboard Navigation

All interactive components respond to keyboard input following established patterns. Users who navigate by keyboard get a first-class experience without any developer configuration.

```gherkin
Feature: Keyboard Navigation

  Scenario: Arrow keys navigate between items
    Given a List, Select, or Tree component with focus
    When the user presses ArrowDown
    Then focus moves to the next item
    When the user presses ArrowUp
    Then focus moves to the previous item

  Scenario: Home and End jump to bounds
    Given a component with keyboard focus
    When the user presses Home
    Then focus moves to the first item
    When the user presses End
    Then focus moves to the last item

  Scenario: Horizontal navigation for toolbars and tabs
    Given a Toolbar or Tabs component
    When the user presses ArrowRight
    Then focus moves to the next item
    When the user presses ArrowLeft
    Then focus moves to the previous item

  Scenario: Tree node expansion and collapse
    Given a Tree component with collapsible nodes
    When the user focuses a collapsed node and presses ArrowRight
    Then the node expands and focus moves to the first child
    When the user presses ArrowLeft on a child item
    Then focus returns to the parent node
    When the user presses ArrowLeft on an expanded node
    Then the node collapses
```

### Selection via Keyboard

Items are selected or activated using keyboard shortcuts consistent with WAI-ARIA patterns.

```gherkin
Feature: Keyboard Selection

  Scenario: Enter or Space activates the focused item
    Given an item with keyboard focus in a List or Select
    When the user presses Enter or Space
    Then the item is selected
    And the selection event fires with the item data

  Scenario: Toggle components respond to Space
    Given a Toggle, Checkbox, or Switch with focus
    When the user presses Space
    Then the state toggles between on and off

  Scenario: Multi-select with keyboard
    Given a MultiSelect component
    When the user navigates and presses Space on multiple items
    Then each pressed item is added to the selection
    And selections accumulate until cleared
```

### Focus Management

Components manage focus so that keyboard users always have a clear, logical path through the interface.

```gherkin
Feature: Focus Management

  Scenario: Focus enters a component at the right position
    Given a List component receiving focus for the first time
    Then focus lands on the first item or the previously selected item
    And the component is immediately operable

  Scenario: Focus is trapped inside open overlays
    Given a dropdown or popover that is open
    When the user presses Tab
    Then focus stays within the overlay
    And does not escape to the page behind it

  Scenario: Escape closes an overlay and returns focus
    Given an open dropdown or modal
    When the user presses Escape
    Then the overlay closes
    And focus returns to the element that triggered it

  Scenario: Focus is not lost after list updates
    Given a list with keyboard focus on an item
    When the item list updates (filter applied, item removed)
    Then focus moves to the nearest available item
    And keyboard navigation continues without interruption
```

### ARIA Attributes

Components expose the correct ARIA roles, states, and properties for each interaction model. Screen readers receive complete and accurate semantic information.

```gherkin
Feature: ARIA Attributes

  Scenario: List announces as a listbox
    Given a List component
    Then the root element has role="listbox"
    And each item has role="option"

  Scenario: Selected state is communicated
    Given an item that is selected
    Then it has aria-selected="true"
    And screen readers announce the selection change

  Scenario: Expanded and collapsed state is communicated
    Given a Tree node or expandable group
    When the node is expanded
    Then aria-expanded="true" is set
    When the node is collapsed
    Then aria-expanded="false" is set

  Scenario: Disabled items are announced correctly
    Given an item that is disabled
    Then it has aria-disabled="true"
    And it is not activatable by keyboard
    And screen readers announce it as unavailable

  Scenario: Combobox pattern for Select and MultiSelect
    Given a Select or MultiSelect component
    Then the trigger has role="combobox"
    And aria-haspopup and aria-expanded reflect the dropdown state
    And the selected value is announced on change
```

### Screen Reader Support

Components provide accessible names and descriptions so screen reader users understand the purpose and state of each component without visual context.

```gherkin
Feature: Screen Reader Support

  Scenario: Component has an accessible name
    Given any interactive component
    Then it has aria-label, aria-labelledby, or a visible label associated with it
    And screen readers announce the component's purpose when it receives focus

  Scenario: Live regions announce dynamic updates
    Given a component that updates its content dynamically
    When items are filtered, loaded, or changed
    Then an appropriate live region announces the update
    And screen reader users are informed without losing focus

  Scenario: Icon-only controls are labeled
    Given a button or control that shows only an icon
    Then an accessible label describes its action
    And the icon alone is not the only means of identification
```

### Tooltips

Interactive elements that benefit from additional context can display tooltips. Tooltips are keyboard accessible and do not rely on hover alone.

```gherkin
Feature: Tooltips

  Scenario: Tooltip appears on hover
    Given an element with a tooltip configured
    When the user hovers over the element
    Then the tooltip appears after a brief delay
    And disappears when the cursor moves away

  Scenario: Tooltip appears on focus
    Given an element with a tooltip configured
    When the user focuses the element via keyboard
    Then the tooltip appears
    And disappears when focus moves away

  Scenario: Tooltip content is accessible
    Given a tooltip associated with an element
    Then the tooltip content is linked via aria-describedby
    And screen readers announce the tooltip when the element is focused
```

### Internationalization (i18n)

User-facing text, number formats, date formats, and right-to-left layout adapt to the user's locale. Components expose all strings through a configurable provider so applications can supply their own translations.

```gherkin
Feature: Internationalization

  Scenario: Built-in strings are translatable
    Given a Select component that shows "No items found" in its empty state
    When a translation is provided for the application's locale
    Then the translated string is displayed instead
    And no component source changes are needed

  Scenario: Date and number formatting uses locale
    Given a component displaying dates or numbers
    When the application locale is set to a non-English locale
    Then values are formatted according to locale conventions
    And no manual formatting logic is required in the application

  Scenario: Right-to-left layout is supported
    Given an application locale with RTL text direction
    When the direction is set on the document root
    Then component layouts mirror correctly
    And keyboard navigation direction adapts accordingly
```

## Status

| Feature | Status |
|---------|--------|
| Keyboard navigation | ✅ Implemented |
| Keyboard selection | ✅ Implemented |
| Focus management and trapping | ✅ Implemented |
| ARIA attributes | ✅ Implemented |
| Screen reader support | ✅ Implemented |
| Tooltips | 🔲 Planned |
| Internationalization (i18n) | 🔲 Planned |
