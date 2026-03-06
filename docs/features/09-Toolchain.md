# Toolchain

Adopting a component library should be fast. Rokkit's toolchain handles the ceremony: adding the library to a project, upgrading versions, configuring themes, and setting up icon sets. For teams with specific branding requirements, the toolchain also provides the tools to author custom skins and theme styles from scratch.

## Features

### CLI — Add Rokkit to a Project

A single command sets up Rokkit in an existing project: installs packages, configures the build, and imports a starter theme.

```gherkin
Feature: CLI Project Setup

  Scenario: Developer adds Rokkit to an existing project
    Given an existing Svelte application
    When the developer runs 'rokkit add'
    Then the required packages are installed
    And the build configuration is updated for Rokkit compatibility
    And a starter theme is imported into the application entry point

  Scenario: CLI detects existing configuration
    Given a project that already has Rokkit partially configured
    When 'rokkit add' is run again
    Then the CLI identifies what is already set up
    And only applies the missing configuration steps
    And does not overwrite user customizations
```

### CLI — Upgrade Rokkit

Upgrading to a new version of Rokkit is a single command. The CLI applies any migration steps needed for the version being installed.

```gherkin
Feature: CLI Project Upgrade

  Scenario: Developer upgrades Rokkit to a new version
    Given a project using an older version of Rokkit
    When the developer runs 'rokkit upgrade'
    Then packages are updated to the target version
    And any required migration transformations are applied
    And breaking changes are reported with instructions if manual steps are needed

  Scenario: Upgrade is idempotent
    Given a project already on the latest version
    When 'rokkit upgrade' is run
    Then no changes are made
    And the CLI confirms the project is up to date
```

### Icon Sets

Rokkit ships curated icon sets that align with the library's component vocabulary. Icons cover the common needs of application UI — navigation, status, actions, and objects — and are tree-shaken so only used icons are bundled.

```gherkin
Feature: Icon Sets

  Scenario: Icons are available for common UI needs
    Given the Rokkit icon set
    Then icons exist for navigation (arrow, chevron, close, menu)
    And for status (success, warning, error, info)
    And for actions (edit, delete, add, search, filter)
    And for common objects (user, file, folder, calendar)

  Scenario: Only used icons are included in the bundle
    Given an application that imports specific icons
    When the application is built
    Then only the imported icons are included in the output
    And unused icons contribute no bytes to the bundle

  Scenario: Icons are sized and colored via CSS
    Given an icon from the Rokkit set
    When rendered
    Then its size and color respond to CSS values
    And no inline attributes or JavaScript are required to style it
```

### Custom Icon Override

The icon rendering used by components can be replaced globally with any icon system — Lucide, Heroicons, a custom SVG set — through a single configuration point.

```gherkin
Feature: Custom Icon Override

  Scenario: Replace component icons with a custom icon system
    Given an application with its own icon library
    When a global icon snippet is registered
    Then all components render icons using the custom snippet
    And the default Rokkit icons are not used

  Scenario: Custom icon receives the icon identifier from data
    Given a component with items that have an 'icon' field
    When the custom icon snippet renders
    Then it receives the icon identifier from the item's icon field
    And can resolve it to the correct icon in the custom system
```

### Skin Customization via CLI

The CLI can generate a custom skin file pre-populated with the full set of semantic color tokens. Developers fill in their brand colors without needing to understand the full token structure.

```gherkin
Feature: Skin Customization

  Scenario: CLI generates a custom skin template
    Given a developer wanting to apply brand colors
    When they run 'rokkit skin create --name my-brand'
    Then a skin file is generated with all semantic token slots
    And each token is annotated with its role and usage
    And the skin is wired into the application configuration

  Scenario: Custom skin hot-reloads in development
    Given a developer editing a skin file
    When a color value is changed
    Then the development server reflects the change immediately
    And all components update without a full page reload
```

### Custom Theme Style Authoring

Developers who need full control over component styling can author theme styles from scratch. A scaffold provides the correct data-attribute selectors and token references as a starting point.

```gherkin
Feature: Custom Theme Style Authoring

  Scenario: CLI generates a theme style scaffold
    Given a developer building a fully custom theme
    When they run 'rokkit theme create --name my-theme'
    Then a CSS file is generated with selectors for every component
    And token references are in place using the CSS variable system
    And the theme is importable immediately

  Scenario: Custom theme coexists with a custom skin
    Given a custom theme style file and a custom skin
    When both are applied to the application
    Then the skin's color tokens are consumed by the theme's component styles
    And swapping the skin changes colors without touching the theme file
```

## Status

| Feature | Status |
|---------|--------|
| CLI: add Rokkit to a project | 🔲 Planned |
| CLI: upgrade Rokkit | 🔲 Planned |
| Curated icon sets | 🔲 Planned |
| Tree-shaken icon imports | 🔲 Planned |
| Custom icon override (global snippet) | 🔲 Planned |
| CLI: generate custom skin | 🔲 Planned |
| CLI: generate custom theme scaffold | 🔲 Planned |
