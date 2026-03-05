# Data-Driven Components

Rokkit components are designed around the principle that **data should drive the interface**. Rather than adapting data to fit component requirements, components adapt to any data structure through field mapping. This eliminates the need for data transformation before rendering.

## Features

### Data Adapts to Components

Components receive data as-is and map fields internally.

```gherkin
Feature: Data-Driven Rendering

  Scenario: Component renders with minimal data
    Given the component receives data with default field names
    When the component renders
    Then it displays the data without transformation
    And uses 'text' for labels, 'value' for identifiers

  Scenario: Component adapts to custom field names
    Given the developer provides a fields mapping
    When the component renders
    Then it reads from the mapped fields in the data
    And renders the interface using those values
```

### Consistent API Pattern

All selection components share a standard API pattern.

```gherkin
Feature: Consistent Component API

  Scenario: Standard props across components
    Given any selection component from the library
    When implementing the component
    Then the component accepts 'options' or 'items' prop
    And supports 'bind:value' for two-way binding
    And accepts 'fields' for field mapping
    And supports 'onchange' callback

  Scenario: Selection components have uniform behavior
    Given List, Select, Tree, and Toggle components
    When the user interacts with any of them
    Then selection works consistently across all
    And keyboard navigation follows the same patterns
```

### No Data Transformation Required

Developers pass data directly without preprocessing.

```gherkin
Feature: Direct Data Usage

  Scenario: Data passed without transformation
    Given an API response with backend field names
    When passing data to a Rokkit component
    Then the data is used directly
    And field mapping adapts the interface

  Scenario: Array of objects rendered
    Given data from various sources (API, local state, static)
    When the component receives the array
    Then each item is rendered according to field mapping
    And no iteration or mapping logic is needed in the component
```
