# Theming and Styling

Rokkit components are unstyled by default, providing data-attribute hooks for complete styling freedom. The theme/layout CSS separation architecture allows components to conform to any application's visual design while maintaining consistent behavior.

## Features

### Unstyled Components with Data Attributes

Components expose semantic data attributes for styling.

```gherkin
Feature: Data Attribute Hooks

  Scenario: Component renders with data attributes
    Given a Rokkit component in the application
    When the component renders
    Then it includes data attributes like 'data-list', 'data-list-item'
    And attributes reflect component type and state
    And CSS can target these attributes for styling

  Scenario: State reflected in attributes
    Given a component with selection state
    When an item is selected
    Then 'data-selected' attribute is added
    And CSS can style the selected state
```

### Theme/Layout Separation

Theming is separated from component logic.

```gherkin
Feature: Theme Layout Separation

  Scenario: Components work without theme
    Given a bare application without theme
    When rendering Rokkit components
    Then components render with no styling
    And data attributes are present for styling

  Scenario: Theme applies to all components
    Given a theme is applied to the application
    When any Rokkit component renders
    Then it inherits the theme's design tokens
    And colors, spacing, and typography match the theme

  Scenario: Theme switching works
    Given the application has a theme
    When switching to a different theme
    Then all components update to new theme
    And no component changes are required
```

### CSS Variable Integration

Design tokens use CSS variables for dynamic theming.

```gherkin
Feature: CSS Variable Theming

  Scenario: Colors use CSS variables
    Given a themed application
    When components render
    Then colors reference CSS variables like 'var(--color-primary-500)'
    And theme changes update all components instantly

  Scenario: Dark mode via CSS variables
    Given a theme with dark mode support
    When the application switches to dark mode
    Then components use dark color variables
    And no JavaScript theme switching is needed
```

### Custom Styling via CSS

Developers can override any component style.

```gherkin
Feature: Custom Component Styling

  Scenario: Override component styles
    Given a Rokkit component
    When writing custom CSS targeting data attributes
    Then the custom styles apply to the component
    And component behavior remains unchanged

  Scenario: Component adapts to app design system
    Given an application with design tokens
    When the tokens are mapped to CSS variables
    Then Rokkit components match the design system
    And the app looks cohesive
```
