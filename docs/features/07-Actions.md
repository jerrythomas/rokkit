# Actions

The @rokkit/actions package provides Svelte actions that simplify common interactions. Actions are reusable behaviors that can be attached to elements.

## Features

### Navigator Action

Provides keyboard navigation for any list-like element.

```gherkin
Feature: Navigator Action

  Scenario: Enable keyboard navigation on element
    Given a container with focusable items
    When applying the navigator action
    Then arrow keys navigate between items
    And Enter/Space activates the focused item

  Scenario: Configure navigation direction
    Given an element with navigator action
    When setting orientation to 'vertical'
    Then Up/Down arrows navigate
    When setting orientation to 'horizontal'
    Then Left/Right arrows navigate
```

### Hover Lift Action

Adds hover effects with lift animation.

```gherkin
Feature: Hover Lift Action

  Scenario: Element lifts on hover
    Given an element with hoverLift action
    When the mouse hovers over the element
    Then the element lifts with shadow
    And returns to normal on mouse leave
```

### Magnetic Action

Elements magnetically attract toward the cursor.

```gherkin
Feature: Magnetic Action

  Scenario: Element follows cursor
    Given an element with magnetic action
    When the cursor approaches
    Then the element moves toward the cursor
    And returns to original position when cursor leaves
```

### Ripple Action

Adds material-style ripple effect on click.

```gherkin
Feature: Ripple Action

  Scenario: Ripple on click
    Given an element with ripple action
    When the element is clicked
    Then a ripple animation expands from click point
    And fades out after completion
```

### Action Composition

Actions can be combined on a single element.

```gherkin
Feature: Action Composition

  Scenario: Multiple actions on one element
    Given an element requiring multiple behaviors
    When applying multiple actions
    Then each action operates independently
    And combined behaviors work together
```
