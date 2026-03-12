# Theming & Design

Rokkit components are unstyled at their core. The design system sits entirely in CSS — data-attribute hooks, CSS variables, and separate theme/layout files — so components adapt to any visual environment without code changes. The first-party theme collection provides a complete, production-ready starting point with full support for color modes, semantic palettes, typography, and density.

## Features

### Data-Attribute Styling Hooks

Components annotate their DOM with semantic data attributes. These attributes are the contract between component structure and visual styling. Any CSS that targets them will apply correctly now and across upgrades.

```gherkin
Feature: Data-Attribute Hooks

  Scenario: Component structure is annotated
    Given a rendered List component
    Then the root element has a 'data-list' attribute
    And each item has a 'data-list-item' attribute
    And CSS can target [data-list] and [data-list-item] to style the component

  Scenario: State is reflected in attributes
    Given a list item that becomes selected
    Then the item element gains a 'data-selected' attribute
    And CSS can style the selected state without JavaScript

  Scenario: Interactive states are exposed
    Given a component receiving user interaction
    Then focus, disabled, expanded, and active states appear as data attributes
    And hover and focus styles can be applied purely in CSS
```

### Theme and Layout CSS Separation

Theme styles (colors, typography, elevation) and layout styles (spacing, sizing, structure) are authored in separate files. Replacing a theme does not disturb layout, and adjusting layout does not require touching color tokens.

```gherkin
Feature: Theme and Layout Separation

  Scenario: Components work without any theme
    Given an application with no theme applied
    When Rokkit components render
    Then they are functional and structurally correct
    And visually unstyled, ready for custom CSS

  Scenario: Theme applies uniformly across all components
    Given a theme imported into the application
    When any component renders
    Then it inherits colors, typography, and elevation from the theme
    And no per-component theme configuration is needed

  Scenario: Switching themes requires no component changes
    Given an application with an active theme
    When the import is changed to a different theme
    Then all components reflect the new visual design
    And behavior and accessibility are unaffected

  Scenario: Layout adjustments are independent of theme
    Given a custom layout CSS override
    When applied alongside a theme
    Then spacing and sizing are modified
    And theme colors and typography are unchanged
```

### CSS Variable Integration

Design tokens are expressed as CSS custom properties. This makes them dynamically changeable at runtime and scoped to any element in the DOM tree.

```gherkin
Feature: CSS Variable Theming

  Scenario: Colors reference CSS variables
    Given a themed application
    When components render
    Then colors like primary, surface, and accent reference CSS custom properties
    And updating a variable immediately reflects across all components

  Scenario: Dark mode via CSS variables
    Given a theme with dark mode definitions
    When the prefers-color-scheme media query activates
    Or when a data attribute switches the color mode
    Then component colors switch to dark variants
    And no JavaScript is needed to update individual components

  Scenario: Variables are scopeable
    Given a section of the application with a different color context
    When CSS variables are overridden on that section's root element
    Then only components inside that section reflect the override
    And the rest of the application is unaffected
```

### Semantic Color Palettes (Skins)

A skin is a named set of semantic color roles: surface, primary, secondary, accent. Applying a skin changes the color personality of the interface without touching the component markup.

```gherkin
Feature: Semantic Color Palettes

  Scenario: Skin maps semantic roles to color values
    Given a skin defining surface, primary, secondary, and accent colors
    When the skin is applied to the application
    Then all Rokkit components use those semantic colors
    And no per-component color configuration is needed

  Scenario: Multiple skins can coexist in one application
    Given an application with different sections
    When different skins are applied to different sections
    Then each section uses its own color palette
    And components in each section render consistently with their skin

  Scenario: Custom skin replaces a first-party skin
    Given an organization with brand colors
    When a custom skin is authored using the skin format
    Then it can be used in place of any first-party skin
    And the result is a fully whitelabeled interface
```

### Component Variants

Components support visual variants that affect their appearance without changing behavior. Variants are expressed as props and map to data attributes in the DOM.

```gherkin
Feature: Component Variants

  Scenario: Component renders a named variant
    Given a Button component with variant='ghost'
    When it renders
    Then the element has a 'data-variant="ghost"' attribute
    And the ghost style from the theme is applied

  Scenario: Variant does not change component behavior
    Given a component with a different variant
    When the user interacts with it
    Then keyboard navigation, selection, and events work identically
    And only the visual presentation changes
```

### Typography Scale

Typography is managed through a scale of named text styles — heading, body, label, caption — mapped to CSS variables. Applications can supply their own type scale by redefining the variables.

```gherkin
Feature: Typography Scale

  Scenario: Components use named text styles
    Given a themed application
    When components render text
    Then font size, weight, and line-height are resolved from the type scale
    And not hardcoded in component styles

  Scenario: Custom type scale replaces defaults
    Given an application with a custom font and scale
    When the CSS variable values are overridden
    Then all component text reflects the custom typography
    And no component modifications are required
```

### Data-Density Controls

Components adapt to density preferences — compact, default, and comfortable — affecting spacing and element sizes while preserving all functionality.

```gherkin
Feature: Data-Density Controls

  Scenario: Component adapts to compact density
    Given a List component in a data-heavy dashboard
    When density is set to 'compact'
    Then items render with reduced padding and smaller text
    And all items remain selectable and keyboard navigable

  Scenario: Component adapts to comfortable density
    Given a List component in a consumer-facing UI
    When density is set to 'comfortable'
    Then items render with more generous spacing
    And the visual hierarchy is more prominent

  Scenario: Density is inherited from application context
    Given a density setting applied at the application root
    When components render anywhere in the tree
    Then they inherit and apply the density setting
    And do not require individual density props
```

### Whitelabeling

The full visual layer — colors, typography, icons, density, component shapes — can be replaced. Organizations can ship Rokkit-powered applications that carry their own brand identity with no visible Rokkit defaults.

```gherkin
Feature: Whitelabeling

  Scenario: Organization ships under their own brand
    Given a custom skin, typography scale, and icon set
    When applied to an application built on Rokkit
    Then no first-party Rokkit visual defaults are visible
    And the application appears entirely branded to the organization

  Scenario: Component shapes and radii are customizable
    Given CSS variables for border-radius and shape tokens
    When overridden for an organization's design language
    Then all components adopt the custom shape system
    And first-party themes are not required
```

## Status

| Feature                         | Status         |
| ------------------------------- | -------------- |
| Data-attribute styling hooks    | ✅ Implemented |
| Theme/layout CSS separation     | ✅ Implemented |
| CSS variable integration        | ✅ Implemented |
| Dark / light / system mode      | ✅ Implemented |
| Semantic color palettes (skins) | ✅ Implemented |
| Component variants              | ✅ Implemented |
| Typography scale                | ✅ Implemented |
| Data-density controls           | 🔲 Planned     |
| Whitelabeling                   | 🔲 Planned     |
