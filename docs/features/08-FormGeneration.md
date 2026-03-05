# Schema-Driven Forms

The @rokkit/forms package generates complete forms from JSON schemas. This simplifies building forms for variety of cases without writing repetitive form logic.

## Features

### JSON Schema to Form

Generate forms automatically from schema.

```gherkin
Feature: Schema-Driven Form Generation

  Scenario: Generate form from JSON schema
    Given a JSON schema describing form fields
    When the form component renders
    Then appropriate input components are generated
    And each field maps to schema properties

  Scenario: Form validates against schema
    Given a form generated from schema
    When user submits invalid data
    Then validation errors display
    And submission is blocked until valid
```

### Field Types

Support for various form field types.

```gherkin
Feature: Form Field Types

  Scenario: Text input from string schema
    Given a schema property with type 'string'
    When the form renders
    Then a text input is generated

  Scenario: Number input from integer schema
    Given a schema property with type 'integer'
    When the form renders
    Then a number input is generated

  Scenario: Checkbox from boolean schema
    Given a schema property with type 'boolean'
    When the form renders
    Then a checkbox is generated

  Scenario: Select from enum schema
    Given a schema property with enum values
    When the form renders
    Then a select dropdown is generated

  Scenario: Array of objects renders as list
    Given a schema property with array of objects
    When the form renders
    Then a repeatable list field is generated
```

### Nested Structures

Support for complex nested form structures.

```gherkin
Feature: Nested Form Structures

  Scenario: Object properties render as sections
    Given a schema with nested objects
    When the form renders
    Then each nested object is a fieldset
    And fields are organized under the section

  Scenario: Array items are repeatable
    Given a schema with array items
    When the form renders
    Then add/remove controls appear
    And users can add multiple instances
```

### Custom Field Rendering

Override default field components.

```gherkin
Feature: Custom Field Rendering

  Scenario: Custom component for field type
    Given a schema with custom field configuration
    When the form renders
    Then the custom component is used
    And the field value binds to the component

  Scenario: Custom component for specific field
    Given a schema property with custom renderer
    When the form renders that field
    Then the custom component receives the field config
    And renders according to custom logic
```

### Form State Management

Built-in handling of form state.

```gherkin
Feature: Form State Management

  Scenario: Form tracks dirty state
    Given a form with initial values
    When user modifies any field
    Then the form is marked as dirty
    And can be reset to original values

  Scenario: Form tracks validation state
    Given a form with validation rules
    When fields are modified
    Then validation runs
    And errors update reactively

  Scenario: Form submission with data
    Given a valid form
    When submitted
    Then the form data is available
    And can be sent to backend
```

### Integration with Components

Forms use Rokkit UI components.

```gherkin
Feature: Form Uses UI Components

  Scenario: Form renders using UI library
    Given a form is generated
    Then it uses Select, CheckBox, Input components
    And keyboard navigation works throughout
    And theming applies consistently
```
