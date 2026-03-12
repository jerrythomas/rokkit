# Forms

Building forms is one of the most repetitive tasks in application development. The Rokkit forms system eliminates that repetition: describe a form as a JSON schema and get a fully rendered, validated, keyboard-navigable form using the same UI components as the rest of the library. Dynamic lookups, conditional fields, and multi-step flows are first-class concerns.

## Features

### Schema-Driven Form Generation

A JSON schema is the single source of truth for a form's structure, field types, and validation rules. No template authoring, no manual binding.

```gherkin
Feature: Schema-Driven Form Generation

  Scenario: Form renders from a JSON schema
    Given a JSON schema describing a set of form fields
    When the FormRenderer component receives the schema
    Then appropriate input components are generated for each field
    And field labels, types, and constraints are derived from the schema

  Scenario: Schema changes update the form
    Given a rendered form
    When the schema is updated at runtime
    Then the form re-renders to reflect the new structure
    And existing valid field values are preserved where possible
```

### Field Types

The form system maps JSON schema types to the most appropriate UI controls. Each field type integrates with Rokkit's component library.

```gherkin
Feature: Form Field Types

  Scenario: String field renders as text input
    Given a schema property with type 'string'
    When the form renders
    Then a text input is generated

  Scenario: Number or integer field renders as number input
    Given a schema property with type 'number' or 'integer'
    When the form renders
    Then a numeric input is generated with min/max from the schema

  Scenario: Boolean field renders as a checkbox or toggle
    Given a schema property with type 'boolean'
    When the form renders
    Then a checkbox or toggle is generated

  Scenario: Enum field renders as a select
    Given a schema property with an enum constraint
    When the form renders
    Then a select dropdown is generated with the enum values as options

  Scenario: Multi-select from array of enums
    Given a schema property typed as array with enum items
    When the form renders
    Then a multi-select component is generated

  Scenario: Textarea for long text
    Given a schema property annotated for multiline input
    When the form renders
    Then a textarea input is generated
```

### Nested Structures and Sections

Object properties become grouped sections. Array properties become repeatable field groups. Complex forms are structured without extra configuration.

```gherkin
Feature: Nested Form Structures

  Scenario: Object properties render as a labeled section
    Given a schema with a nested object property
    When the form renders
    Then the object's fields are grouped in a labeled fieldset
    And the section can be expanded or collapsed

  Scenario: Array property renders as a repeatable group
    Given a schema property with type 'array' of objects
    When the form renders
    Then a repeatable group is generated
    And the user can add, remove, and reorder instances

  Scenario: Deep nesting is supported
    Given a schema with multiple levels of object nesting
    When the form renders
    Then each level creates a corresponding section hierarchy
    And indentation reflects the schema structure
```

### Validation

Validation rules are derived directly from the schema. Errors are shown inline, submission is blocked when invalid, and validation runs progressively as the user fills in the form.

```gherkin
Feature: Form Validation

  Scenario: Required fields block submission when empty
    Given a schema with required fields
    When the user attempts to submit with required fields empty
    Then validation errors appear inline next to each empty field
    And submission does not proceed

  Scenario: Type and format constraints are validated
    Given a schema with type constraints (email, url, min, max, pattern)
    When the user enters a value that violates a constraint
    Then an inline error message describes the violation
    And the error clears when the value becomes valid

  Scenario: Validation runs progressively
    Given a form the user is filling in
    When focus leaves a field with an invalid value
    Then that field's error appears immediately
    And the user does not need to submit to discover errors

  Scenario: Custom validation messages from schema
    Given a schema with custom error message annotations
    When a validation error occurs
    Then the custom message from the schema is shown
    And not a generic fallback message
```

### Dynamic Lookups

Fields whose options come from remote data sources are declared in the schema. The forms system fetches the options, manages loading and disabled states, and refreshes dependent fields when upstream values change.

```gherkin
Feature: Dynamic Lookups

  Scenario: Field options are loaded from a URL
    Given a schema field with a URL-based lookup
    When the form initializes
    Then the field's options are fetched from the URL
    And the field is disabled until the fetch completes

  Scenario: Dependent lookup refreshes when upstream changes
    Given a 'city' field that depends on a 'country' field
    When the user selects a country
    Then the city lookup fetches options for that country
    And the city field value is cleared before re-fetch

  Scenario: Lookup is disabled until dependencies are met
    Given a field with dependencies that are not yet filled
    Then the field is disabled and shows a placeholder
    When all dependencies are satisfied
    Then the field enables and its lookup fetches options

  Scenario: Client-side filtering from a local source
    Given a schema field with a local array as its lookup source
    When the user types in the field
    Then options are filtered client-side
    And no network request is made
```

### Form State Management

The forms system tracks the full lifecycle of a form: initial values, user edits, dirty state, and submission readiness.

```gherkin
Feature: Form State Management

  Scenario: Form tracks dirty state per field
    Given a form with initial values
    When the user modifies a field
    Then that field is marked as dirty
    And the form as a whole is marked as dirty

  Scenario: Form can be reset to initial values
    Given a dirty form
    When the user triggers a reset
    Then all field values return to their initial values
    And dirty state is cleared

  Scenario: Submission provides the complete form data
    Given a valid form
    When the user submits
    Then the onsubmit callback receives the current form data
    And the data matches the schema's structure

  Scenario: Form tracks submission state
    Given a form in the process of being submitted
    Then the form exposes a submitting state
    And submit controls can be disabled during submission
```

### Custom Field Rendering

Any field in the schema can be rendered by a custom component. The custom component receives the field configuration and participates in form state like any built-in field.

```gherkin
Feature: Custom Field Rendering

  Scenario: Custom component for a specific field
    Given a schema field annotated with a custom component name
    When the form renders that field
    Then the named custom component is used
    And it receives the field config, current value, and an update callback

  Scenario: Custom component integrates with validation
    Given a custom field component
    When it updates its value via the provided callback
    Then form validation re-runs
    And the field participates in the form's dirty and valid state

  Scenario: Custom component for all fields of a type
    Given a global override registered for type 'date'
    When any date field renders
    Then the custom date picker component is used
    And no per-field annotation is needed
```

### Conditional Fields

Fields can be shown, hidden, or disabled based on the values of other fields. Conditions are expressed in the schema.

```gherkin
Feature: Conditional Fields

  Scenario: Field is hidden when condition is not met
    Given a schema with a conditional field tied to another field's value
    When the controlling field has a value that does not satisfy the condition
    Then the conditional field is not rendered

  Scenario: Field appears when condition is met
    Given the controlling field changes to a value that satisfies the condition
    When the form evaluates the condition
    Then the conditional field becomes visible
    And its value is initialized to the schema default

  Scenario: Hidden field values are excluded from submission
    Given a form with hidden conditional fields
    When the form is submitted
    Then excluded field values are not present in the submitted data
```

### Multi-Step Forms

Complex forms can be broken into sequential steps. Each step validates before advancing, and the user can navigate back to review previous steps.

```gherkin
Feature: Multi-Step Forms

  Scenario: Form renders in step-by-step mode
    Given a schema organized into step groups
    When the FormRenderer is configured for multi-step mode
    Then only the current step's fields are visible
    And a step indicator shows progress

  Scenario: Step advances only when current step is valid
    Given the user on an intermediate step
    When the user attempts to advance to the next step
    Then validation runs for the current step's fields only
    And advancement is blocked if any field is invalid

  Scenario: User navigates back to a previous step
    Given the user on step three of four
    When the user navigates back
    Then the previous step's fields are shown with their current values
    And those values are preserved

  Scenario: Final step submission collects all step data
    Given all steps completed and valid
    When the user submits on the final step
    Then all step data is combined and provided to the onsubmit callback
```

## Status

| Feature                                          | Status         |
| ------------------------------------------------ | -------------- |
| JSON schema to form                              | ✅ Implemented |
| Field types (text, number, boolean, enum, array) | ✅ Implemented |
| Nested structures and object sections            | ✅ Implemented |
| Validation                                       | ✅ Implemented |
| Dynamic lookups                                  | ✅ Implemented |
| Form state management (dirty, reset, submit)     | ✅ Implemented |
| Custom field rendering                           | ✅ Implemented |
| Conditional fields                               | 🔲 Planned     |
| Multi-step forms                                 | 🔲 Planned     |
